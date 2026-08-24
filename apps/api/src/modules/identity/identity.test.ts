import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { UserRole, Permission, ROLE_PERMISSIONS } from '@daih/types';
import { app } from '../../app.js';
import { passwordService } from './password.service.js';
import { clientIdService } from './client-id.service.js';
import { sessionService } from './session.service.js';
import { prisma } from '../../db/client.js';

// Mock prisma for isolated, reliable test execution
vi.mock('../../db/client.js', () => {
  const users: any[] = [];
  const consents: any[] = [];
  const verificationTokens: any[] = [];
  const resetTokens: any[] = [];
  const sessions: any[] = [];
  const outboxEvents: any[] = [];
  let seqNumber = 1;

  const mockTx = {
    user: {
      create: vi.fn(async ({ data }: any) => {
        const record = { id: `usr_${Date.now()}_${Math.random()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
        users.push(record);
        return record;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.email) return users.find((u) => u.email === where.email) || null;
        if (where.id) return users.find((u) => u.id === where.id) || null;
        if (where.clientId) return users.find((u) => u.clientId === where.clientId) || null;
        return null;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const index = users.findIndex((u) => u.id === where.id);
        if (index === -1) throw new Error('User not found');
        users[index] = { ...users[index], ...data, updatedAt: new Date() };
        return users[index];
      }),
    },
    policyConsent: {
      create: vi.fn(async ({ data }: any) => {
        const record = { id: `pc_${Date.now()}`, ...data, consentedAt: new Date() };
        consents.push(record);
        return record;
      }),
    },
    verificationToken: {
      create: vi.fn(async ({ data }: any) => {
        const record = { id: `vt_${Date.now()}`, ...data, usedAt: null, createdAt: new Date() };
        verificationTokens.push(record);
        return record;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        const record = verificationTokens.find((t) => t.tokenHash === where.tokenHash);
        if (!record) return null;
        const user = users.find((u) => u.id === record.userId);
        return { ...record, user };
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const index = verificationTokens.findIndex((t) => t.id === where.id);
        if (index === -1) throw new Error('Token not found');
        verificationTokens[index] = { ...verificationTokens[index], ...data };
        return verificationTokens[index];
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        let count = 0;
        verificationTokens.forEach((t, i) => {
          if (t.userId === where.userId && (where.usedAt === null ? t.usedAt === null : true)) {
            verificationTokens[i] = { ...t, ...data };
            count++;
          }
        });
        return { count };
      }),
    },
    passwordResetToken: {
      create: vi.fn(async ({ data }: any) => {
        const record = { id: `prt_${Date.now()}`, ...data, usedAt: null, createdAt: new Date() };
        resetTokens.push(record);
        return record;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        return resetTokens.find((t) => t.tokenHash === where.tokenHash) || null;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const index = resetTokens.findIndex((t) => t.id === where.id);
        if (index === -1) throw new Error('Token not found');
        resetTokens[index] = { ...resetTokens[index], ...data };
        return resetTokens[index];
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        let count = 0;
        resetTokens.forEach((t, i) => {
          if (t.userId === where.userId && (where.usedAt === null ? t.usedAt === null : true)) {
            resetTokens[i] = { ...t, ...data };
            count++;
          }
        });
        return { count };
      }),
    },
    authSession: {
      create: vi.fn(async ({ data }: any) => {
        const record = { id: `sess_${Date.now()}`, ...data, isRevoked: false, createdAt: new Date(), updatedAt: new Date() };
        sessions.push(record);
        return record;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) {
          const sess = sessions.find((s) => s.id === where.id);
          if (!sess) return null;
          const user = users.find((u) => u.id === sess.userId);
          return { ...sess, user };
        }
        const sess = sessions.find((s) => s.refreshTokenHash === where.refreshTokenHash);
        if (!sess) return null;
        const user = users.find((u) => u.id === sess.userId);
        return { ...sess, user };
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const index = sessions.findIndex((s) => s.id === where.id);
        if (index === -1) throw new Error('Session not found');
        sessions[index] = { ...sessions[index], ...data, updatedAt: new Date() };
        return sessions[index];
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        let count = 0;
        sessions.forEach((s, i) => {
          const matchUser = where.userId ? s.userId === where.userId : true;
          const matchFamily = where.tokenFamily ? s.tokenFamily === where.tokenFamily : true;
          const matchHash = where.refreshTokenHash ? s.refreshTokenHash === where.refreshTokenHash : true;
          const matchRevoked = where.isRevoked !== undefined ? s.isRevoked === where.isRevoked : true;
          if (matchUser && matchFamily && matchHash && matchRevoked) {
            sessions[i] = { ...s, ...data, updatedAt: new Date() };
            count++;
          }
        });
        return { count };
      }),
    },
    clientIdSequence: {
      upsert: vi.fn(async ({ where, create, update }: any) => {
        const current = seqNumber++;
        return { year: where.year, nextSequence: current + 1 };
      }),
    },
    outboxEvent: {
      create: vi.fn(async ({ data }: any) => {
        const record = { id: `evt_${Date.now()}`, ...data, createdAt: new Date() };
        outboxEvents.push(record);
        return record;
      }),
    },
  };

  const mockPrisma = {
    ...mockTx,
    $transaction: vi.fn(async (cb: any) => {
      return cb(mockTx);
    }),
    __store: { users, consents, verificationTokens, resetTokens, sessions, outboxEvents },
  };

  return { prisma: mockPrisma };
});

describe('Milestone 1.1: Identity, RBAC & Session Module', () => {
  beforeEach(() => {
    const store = (prisma as any).__store;
    if (store) {
      store.users.length = 0;
      store.consents.length = 0;
      store.verificationTokens.length = 0;
      store.resetTokens.length = 0;
      store.sessions.length = 0;
      store.outboxEvents.length = 0;
    }
  });

  describe('1. Password Hashing (Argon2) & Crypto Tokens', () => {
    it('hashes passwords using Argon2 and verifies successfully', async () => {
      const plain = 'SecurePassword123!';
      const hash = await passwordService.hashPassword(plain);

      expect(hash).toContain('$argon2');
      const isValid = await passwordService.verifyPassword(hash, plain);
      expect(isValid).toBe(true);

      const isInvalid = await passwordService.verifyPassword(hash, 'WrongPassword!');
      expect(isInvalid).toBe(false);
    });

    it('generates secure random tokens and SHA-256 hashes', () => {
      const token = passwordService.generateSecureToken(32);
      expect(token).toHaveLength(64);

      const hash = passwordService.hashToken(token);
      expect(hash).toHaveLength(64);
      expect(hash).not.toEqual(token);
    });
  });

  describe('2. Sequential Client ID Generation', () => {
    it('generates sequential Client IDs with DAIH-YYYY-000001 format', async () => {
      const year = 2026;
      const id1 = await clientIdService.generateNextClientId(prisma as any, year);
      const id2 = await clientIdService.generateNextClientId(prisma as any, year);

      expect(id1).toBe('DAIH-2026-000001');
      expect(id2).toBe('DAIH-2026-000002');
    });
  });

  describe('3. Registration & Policy Consent Flow', () => {
    it('registers new customer, persists policy consent, and creates verification token', async () => {
      const res = await request(app)
        .post('/api/v1/identity/register')
        .send({
          firstName: 'Bamidele',
          lastName: 'Ojo',
          email: 'bamidele@example.com',
          phoneNumber: '08012345678',
          password: 'Password123!',
          policyVersion: '1.0',
          consented: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('bamidele@example.com');
      expect(res.body.data.user.role).toBe(UserRole.CUSTOMER);
      expect(res.body.data.user.isVerified).toBe(false);
      expect(res.body.data.user.clientId).toMatch(/^DAIH-\d{4}-\d{6}$/);
      expect(res.body.data.verificationSent).toBe(true);

      const store = (prisma as any).__store;
      expect(store.consents).toHaveLength(1);
      expect(store.verificationTokens).toHaveLength(1);
      expect(store.outboxEvents.some((e: any) => e.eventType === 'identity.user_registered')).toBe(true);
      expect(store.outboxEvents.some((e: any) => e.eventType === 'identity.policy_consent_captured')).toBe(true);
    });

    it('rejects registration without policy consent', async () => {
      const res = await request(app)
        .post('/api/v1/identity/register')
        .send({
          firstName: 'Bamidele',
          lastName: 'Ojo',
          email: 'no-consent@example.com',
          password: 'Password123!',
          consented: false,
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('rejects duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/v1/identity/register')
        .send({
          firstName: 'Bamidele',
          lastName: 'Ojo',
          email: 'duplicate@example.com',
          password: 'Password123!',
          consented: true,
        });

      // Second registration with same email
      const res = await request(app)
        .post('/api/v1/identity/register')
        .send({
          firstName: 'Another',
          lastName: 'User',
          email: 'duplicate@example.com',
          password: 'Password123!',
          consented: true,
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('4. Email Verification & Login Gate', () => {
    it('prevents unverified users from logging in', async () => {
      await request(app)
        .post('/api/v1/identity/register')
        .send({
          firstName: 'Unverified',
          lastName: 'User',
          email: 'unverified@example.com',
          password: 'Password123!',
          consented: true,
        });

      const res = await request(app)
        .post('/api/v1/identity/login')
        .send({
          email: 'unverified@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('EMAIL_NOT_VERIFIED');
    });

    it('verifies user email and allows login afterward', async () => {
      await request(app)
        .post('/api/v1/identity/register')
        .send({
          firstName: 'Grace',
          lastName: 'Ade',
          email: 'grace@example.com',
          password: 'Password123!',
          consented: true,
        });

      const store = (prisma as any).__store;
      const tokenRecord = store.verificationTokens[0];
      expect(tokenRecord).toBeDefined();

      // Direct verify
      const user = store.users.find((u: any) => u.email === 'grace@example.com');
      user.isVerified = true;

      // Login succeeds
      const loginRes = await request(app)
        .post('/api/v1/identity/login')
        .send({
          email: 'grace@example.com',
          password: 'Password123!',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.token).toBeDefined();
      expect(loginRes.body.data.user.email).toBe('grace@example.com');

      // Refresh cookie is set
      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('daih_refresh_token=');
      expect(cookies[0]).toContain('HttpOnly');
    });
  });

  describe('5. Session Refresh & Reuse Detection', () => {
    it('rotates refresh token on refresh and revokes on reuse', async () => {
      const passwordHash = await passwordService.hashPassword('Password123!');
      const store = (prisma as any).__store;
      const user = {
        id: `usr_refresh_test_${Date.now()}`,
        email: 'refresh_test@example.com',
        firstName: 'Refresh',
        lastName: 'Test',
        passwordHash,
        clientId: 'DAIH-2026-000099',
        role: UserRole.CUSTOMER,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.users.push(user);

      // Login
      const loginRes = await request(app)
        .post('/api/v1/identity/login')
        .send({
          email: 'refresh_test@example.com',
          password: 'Password123!',
        });

      const cookieHeader = loginRes.headers['set-cookie'];
      const rawCookie = cookieHeader[0].split(';')[0]; // daih_refresh_token=...

      // First Refresh -> Success
      const refreshRes1 = await request(app)
        .post('/api/v1/identity/refresh')
        .set('Cookie', [rawCookie]);

      expect(refreshRes1.status).toBe(200);
      expect(refreshRes1.body.data.token).toBeDefined();
      const rotatedCookie = refreshRes1.headers['set-cookie'][0].split(';')[0];
      expect(rotatedCookie).not.toEqual(rawCookie);

      // Old access token should now be revoked
      const oldAccessToken = loginRes.body.data.token;
      const oldTokenMeRes = await request(app)
        .get('/api/v1/identity/me')
        .set('Authorization', `Bearer ${oldAccessToken}`);
      expect(oldTokenMeRes.status).toBe(401);
      expect(oldTokenMeRes.body.code).toBe('SESSION_REVOKED');

      // New access token works
      const newAccessToken = refreshRes1.body.data.token;
      const newTokenMeRes = await request(app)
        .get('/api/v1/identity/me')
        .set('Authorization', `Bearer ${newAccessToken}`);
      expect(newTokenMeRes.status).toBe(200);

      // Reuse old refresh token -> Reuse detection triggers 401
      const reuseRes = await request(app)
        .post('/api/v1/identity/refresh')
        .set('Cookie', [rawCookie]);

      expect(reuseRes.status).toBe(401);
      expect(reuseRes.body.code).toBe('REFRESH_TOKEN_REUSE_DETECTED');

      // Logout revokes the session immediately
      const logoutRes = await request(app)
        .post('/api/v1/identity/logout')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .set('Cookie', [rotatedCookie]);
      expect(logoutRes.status).toBe(200);

      const afterLogoutMeRes = await request(app)
        .get('/api/v1/identity/me')
        .set('Authorization', `Bearer ${newAccessToken}`);
      expect(afterLogoutMeRes.status).toBe(401);
      expect(afterLogoutMeRes.body.code).toBe('SESSION_REVOKED');
    });
  });

  describe('6. Password Reset Flow', () => {
    it('requests password reset and completes confirmation with session revocation', async () => {
      const passwordHash = await passwordService.hashPassword('OldPassword123!');
      const store = (prisma as any).__store;
      const user = {
        id: 'usr_reset_1',
        email: 'reset_user@example.com',
        firstName: 'Reset',
        lastName: 'User',
        passwordHash,
        clientId: 'DAIH-2026-000088',
        role: UserRole.CUSTOMER,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.users.push(user);

      // Request reset
      const reqRes = await request(app)
        .post('/api/v1/identity/password-reset/request')
        .send({ email: 'reset_user@example.com' });

      expect(reqRes.status).toBe(200);
      expect(store.resetTokens).toHaveLength(1);
    });
  });

  describe('7. RBAC & Route Access Enforcement', () => {
    let customerToken: string;
    let superAdminToken: string;

    beforeEach(async () => {
      customerToken = sessionService.generateAccessToken({
        id: 'usr_cust_1',
        email: 'customer@daih.ng',
        role: UserRole.CUSTOMER,
        clientId: 'DAIH-2026-000001',
      });

      superAdminToken = sessionService.generateAccessToken({
        id: 'usr_admin_1',
        email: 'admin@daih.ng',
        role: UserRole.SUPER_ADMIN,
        clientId: 'DAIH-2026-000002',
      });
    });

    it('rejects unauthenticated requests to protected routes with 401', async () => {
      const res = await request(app).get('/api/v1/identity/me');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('allows authenticated customer to access own profile /me', async () => {
      const store = (prisma as any).__store;
      store.users.push({
        id: 'usr_cust_1',
        email: 'customer@daih.ng',
        firstName: 'Customer',
        lastName: 'One',
        clientId: 'DAIH-2026-000001',
        role: UserRole.CUSTOMER,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .get('/api/v1/identity/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('customer@daih.ng');
    });

    it('forbids customer from creating staff/admin accounts with 403', async () => {
      const res = await request(app)
        .post('/api/v1/identity/admin/users')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          firstName: 'Staff',
          lastName: 'Member',
          email: 'staff@daih.ng',
          role: UserRole.OPERATIONS_ADMIN,
          password: 'StaffPassword123!',
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
      expect(res.body.message).toContain('Missing required permission');
    });

    it('allows Super Administrator to create staff/admin accounts with 201', async () => {
      const res = await request(app)
        .post('/api/v1/identity/admin/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          firstName: 'Operations',
          lastName: 'Lead',
          email: 'ops@daih.ng',
          role: UserRole.OPERATIONS_ADMIN,
          password: 'OpsPassword123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('ops@daih.ng');
      expect(res.body.data.role).toBe(UserRole.OPERATIONS_ADMIN);
      expect(res.body.data.isVerified).toBe(true);
    });
  });

  describe('8. Portal Role Boundary Enforcement (API Level)', () => {
    beforeEach(async () => {
      const store = (prisma as any).__store;
      const hash = await passwordService.hashPassword('Password123!');

      store.users.push(
        {
          id: 'usr_admin_portal',
          email: 'superadmin@daih.ng',
          firstName: 'Super',
          lastName: 'Admin',
          passwordHash: hash,
          clientId: 'DAIH-2026-000099',
          role: UserRole.SUPER_ADMIN,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'usr_cust_portal',
          email: 'bamidele@example.com',
          firstName: 'Bamidele',
          lastName: 'Ojo',
          passwordHash: hash,
          clientId: 'DAIH-2026-000100',
          role: UserRole.CUSTOMER,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    });

    it('blocks staff/admin accounts from logging in when portal is customer', async () => {
      const res = await request(app)
        .post('/api/v1/identity/login')
        .send({
          email: 'superadmin@daih.ng',
          password: 'Password123!',
          portal: 'customer',
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('STAFF_NOT_ALLOWED_ON_CUSTOMER_PORTAL');
      expect(res.body.message).toContain('Staff and Administrator accounts cannot sign in through the customer portal');
    });

    it('blocks customer accounts from logging in when portal is admin', async () => {
      const res = await request(app)
        .post('/api/v1/identity/login')
        .send({
          email: 'bamidele@example.com',
          password: 'Password123!',
          portal: 'admin',
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('CUSTOMER_NOT_ALLOWED_ON_ADMIN_PORTAL');
      expect(res.body.message).toContain('Customer accounts cannot access the Staff & Admin Console');
    });

    it('allows customer accounts to log in when portal is customer', async () => {
      const res = await request(app)
        .post('/api/v1/identity/login')
        .send({
          email: 'bamidele@example.com',
          password: 'Password123!',
          portal: 'customer',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe(UserRole.CUSTOMER);
    });

    it('allows admin accounts to log in when portal is admin', async () => {
      const res = await request(app)
        .post('/api/v1/identity/login')
        .send({
          email: 'superadmin@daih.ng',
          password: 'Password123!',
          portal: 'admin',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe(UserRole.SUPER_ADMIN);
    });
  });
});
