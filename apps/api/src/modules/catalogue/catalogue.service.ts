import { catalogueRepository, CatalogueRepository } from './catalogue.repository.js';
import {
  CreateResourceInput,
  UpdateResourceInput,
  CreatePricingPlanInput,
  UpdatePricingPlanInput,
  CreateBlackoutInput,
  UpsertSchedulesInput,
} from './catalogue.schema.js';
import { prisma } from '../../db/client.js';
import { outboxService } from '../events/outbox.service.js';

export class CatalogueService {
  constructor(private repo: CatalogueRepository = catalogueRepository) {}

  private formatResource(resource: any) {
    if (!resource) return null;
    return {
      ...resource,
      pricing: resource.pricing?.map((p: any) => ({
        ...p,
        price: Number(p.price),
      })) || [],
      blackouts: resource.blackouts?.map((b: any) => ({
        ...b,
        startDate: b.startDate instanceof Date ? b.startDate.toISOString() : b.startDate,
        endDate: b.endDate instanceof Date ? b.endDate.toISOString() : b.endDate,
      })) || [],
      schedules: resource.schedules || [],
      dailyRate: resource.pricing?.find((p: any) => p.durationDays === 1)?.price
        ? Number(resource.pricing.find((p: any) => p.durationDays === 1).price)
        : undefined,
      hourlyRate: resource.pricing?.find((p: any) => p.durationHours === 1)?.price
        ? Number(resource.pricing.find((p: any) => p.durationHours === 1).price)
        : undefined,
      monthlyRate: resource.pricing?.find((p: any) => p.durationMonths === 1)?.price
        ? Number(resource.pricing.find((p: any) => p.durationMonths === 1).price)
        : undefined,
    };
  }

  async getActiveResources() {
    const resources = await this.repo.findActiveResources();
    return resources.map((r) => this.formatResource(r));
  }

  async getResourceBySlug(slug: string) {
    let resource = await this.repo.findResourceBySlug(slug);
    if (!resource) {
      resource = await this.repo.findResourceById(slug);
    }
    if (!resource) return null;
    return this.formatResource(resource);
  }

  async getAdminResources() {
    const resources = await this.repo.findAllAdminResources();
    return resources.map((r) => {
      const formatted = this.formatResource(r);
      return {
        ...formatted,
        totalBookings: r._count?.bookings ?? 0,
      };
    });
  }

  async getResourceById(id: string) {
    const resource = await this.repo.findResourceById(id);
    if (!resource) return null;
    return this.formatResource(resource);
  }

  async createResource(input: CreateResourceInput, actorUserId?: string, ipAddress?: string) {
    // Verify unique slug
    const existing = await this.repo.findResourceBySlug(input.slug);
    if (existing) {
      const error: any = new Error(`Resource with slug '${input.slug}' already exists`);
      error.statusCode = 409;
      error.code = 'RESOURCE_SLUG_CONFLICT';
      throw error;
    }

    const resource = await this.repo.createResource(input);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: actorUserId,
        action: 'CATALOGUE_RESOURCE_CREATED',
        entityType: 'FacilityResource',
        entityId: resource.id,
        metadata: { name: resource.name, slug: resource.slug, category: resource.category },
        ipAddress,
      },
    });

    // Outbox event
    await outboxService.recordEvent({
      eventType: 'catalogue.resource_created',
      aggregateType: 'FacilityResource',
      aggregateId: resource.id,
      payload: { resourceId: resource.id, name: resource.name, slug: resource.slug },
    });

    return this.formatResource(resource);
  }

  async updateResource(id: string, input: UpdateResourceInput, actorUserId?: string, ipAddress?: string) {
    const existing = await this.repo.findResourceById(id);
    if (!existing) {
      const error: any = new Error(`Resource '${id}' not found`);
      error.statusCode = 404;
      error.code = 'RESOURCE_NOT_FOUND';
      throw error;
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugConflict = await this.repo.findResourceBySlug(input.slug);
      if (slugConflict && slugConflict.id !== id) {
        const error: any = new Error(`Resource with slug '${input.slug}' already exists`);
        error.statusCode = 409;
        error.code = 'RESOURCE_SLUG_CONFLICT';
        throw error;
      }
    }

    const updated = await this.repo.updateResource(id, input);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: actorUserId,
        action: 'CATALOGUE_RESOURCE_UPDATED',
        entityType: 'FacilityResource',
        entityId: id,
        metadata: { changes: input },
        ipAddress,
      },
    });

    // Outbox event
    await outboxService.recordEvent({
      eventType: 'catalogue.resource_updated',
      aggregateType: 'FacilityResource',
      aggregateId: id,
      payload: { resourceId: id, changes: input },
    });

    return this.formatResource(updated);
  }

  async deleteResource(id: string, actorUserId?: string, ipAddress?: string) {
    const existing = await this.repo.findResourceById(id);
    if (!existing) {
      const error: any = new Error(`Resource '${id}' not found`);
      error.statusCode = 404;
      error.code = 'RESOURCE_NOT_FOUND';
      throw error;
    }

    const updated = await this.repo.deleteResource(id);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: actorUserId,
        action: 'CATALOGUE_RESOURCE_DEACTIVATED',
        entityType: 'FacilityResource',
        entityId: id,
        metadata: { name: existing.name },
        ipAddress,
      },
    });

    return this.formatResource(updated);
  }

  async createPricingPlan(resourceId: string, input: CreatePricingPlanInput, actorUserId?: string, ipAddress?: string) {
    const resource = await this.repo.findResourceById(resourceId);
    if (!resource) {
      const error: any = new Error(`Resource '${resourceId}' not found`);
      error.statusCode = 404;
      error.code = 'RESOURCE_NOT_FOUND';
      throw error;
    }

    const plan = await this.repo.createPricingPlan(resourceId, input);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: actorUserId,
        action: 'CATALOGUE_PRICING_CREATED',
        entityType: 'ResourcePricing',
        entityId: plan.id,
        metadata: { resourceId, planName: plan.planName, price: Number(plan.price) },
        ipAddress,
      },
    });

    // Outbox event
    await outboxService.recordEvent({
      eventType: 'catalogue.pricing_created',
      aggregateType: 'ResourcePricing',
      aggregateId: plan.id,
      payload: { resourceId, planId: plan.id, price: Number(plan.price) },
    });

    return {
      ...plan,
      price: Number(plan.price),
    };
  }

  async updatePricingPlan(planId: string, input: UpdatePricingPlanInput, actorUserId?: string, ipAddress?: string) {
    const plan = await this.repo.findPricingPlanById(planId);
    if (!plan) {
      const error: any = new Error(`Pricing plan '${planId}' not found`);
      error.statusCode = 404;
      error.code = 'PRICING_PLAN_NOT_FOUND';
      throw error;
    }

    const updated = await this.repo.updatePricingPlan(planId, input);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: actorUserId,
        action: 'CATALOGUE_PRICING_UPDATED',
        entityType: 'ResourcePricing',
        entityId: planId,
        metadata: { previousPrice: Number(plan.price), updatedPrice: Number(updated.price), changes: input },
        ipAddress,
      },
    });

    // Outbox event
    await outboxService.recordEvent({
      eventType: 'catalogue.pricing_updated',
      aggregateType: 'ResourcePricing',
      aggregateId: planId,
      payload: { planId, resourceId: updated.resourceId, price: Number(updated.price) },
    });

    return {
      ...updated,
      price: Number(updated.price),
    };
  }

  async deletePricingPlan(planId: string, actorUserId?: string, ipAddress?: string) {
    const plan = await this.repo.findPricingPlanById(planId);
    if (!plan) {
      const error: any = new Error(`Pricing plan '${planId}' not found`);
      error.statusCode = 404;
      error.code = 'PRICING_PLAN_NOT_FOUND';
      throw error;
    }

    await this.repo.deletePricingPlan(planId);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: actorUserId,
        action: 'CATALOGUE_PRICING_DELETED',
        entityType: 'ResourcePricing',
        entityId: planId,
        metadata: { resourceId: plan.resourceId, planName: plan.planName },
        ipAddress,
      },
    });

    return { success: true, message: `Pricing plan '${plan.planName}' deleted successfully` };
  }

  async createBlackout(resourceId: string, input: CreateBlackoutInput, actorUserId?: string, ipAddress?: string) {
    const resource = await this.repo.findResourceById(resourceId);
    if (!resource) {
      const error: any = new Error(`Resource '${resourceId}' not found`);
      error.statusCode = 404;
      error.code = 'RESOURCE_NOT_FOUND';
      throw error;
    }

    const blackout = await this.repo.createBlackout(resourceId, input, actorUserId);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: actorUserId,
        action: 'CATALOGUE_BLACKOUT_CREATED',
        entityType: 'ResourceBlackout',
        entityId: blackout.id,
        metadata: { resourceId, reason: blackout.reason, startDate: blackout.startDate, endDate: blackout.endDate },
        ipAddress,
      },
    });

    return blackout;
  }

  async deleteBlackout(blackoutId: string, actorUserId?: string, ipAddress?: string) {
    await this.repo.deleteBlackout(blackoutId);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: actorUserId,
        action: 'CATALOGUE_BLACKOUT_DELETED',
        entityType: 'ResourceBlackout',
        entityId: blackoutId,
        ipAddress,
      },
    });

    return { success: true, message: 'Blackout schedule deleted successfully' };
  }

  async updateSchedules(resourceId: string, input: UpsertSchedulesInput, actorUserId?: string, ipAddress?: string) {
    const resource = await this.repo.findResourceById(resourceId);
    if (!resource) {
      const error: any = new Error(`Resource '${resourceId}' not found`);
      error.statusCode = 404;
      error.code = 'RESOURCE_NOT_FOUND';
      throw error;
    }

    const schedules = await this.repo.upsertSchedules(resourceId, input);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: actorUserId,
        action: 'CATALOGUE_SCHEDULES_UPDATED',
        entityType: 'ResourceSchedule',
        entityId: resourceId,
        metadata: { count: schedules.length },
        ipAddress,
      },
    });

    return schedules;
  }
}

export const catalogueService = new CatalogueService();