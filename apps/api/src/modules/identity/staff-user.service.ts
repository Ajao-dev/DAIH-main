import { UserRole } from "@daih/types";
import { identityRepository } from "./identity.repository.js";
import { passwordService } from "./password.service.js";
import { clientIdService } from "./client-id.service.js";
import { CreateStaffUserDTO, UserSummaryDTO } from "./identity.types.js";

export class StaffUserService {
  /**
   * Creates a new staff/admin user. (Privileged action for Super Admins).
   */
  async createStaffUser(dto: CreateStaffUserDTO): Promise<UserSummaryDTO> {
    const existing = await identityRepository.findByEmail(dto.email);
    if (existing) {
      const error: any = new Error("An account with this email already exists");
      error.code = "EMAIL_ALREADY_EXISTS";
      error.statusCode = 409;
      throw error;
    }

    const rawPassword = dto.password || passwordService.generateSecureToken(8);
    const passwordHash = await passwordService.hashPassword(rawPassword);
    const clientId = await clientIdService.generateNextClientId();

    const user = await identityRepository.createStaffUser({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      role: dto.role as any,
      passwordHash,
      clientId,
      isVerified: true,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      clientId: user.clientId,
      role: user.role as UserRole,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }

  /**
   * Retrieves all registered staff users.
   */
  async getStaffUsers(): Promise<UserSummaryDTO[]> {
    const users = await identityRepository.listStaffUsers();
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber ?? undefined,
      clientId: user.clientId,
      role: user.role as UserRole,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    }));
  }
}

export const staffUserService = new StaffUserService();
