import { OutboxEvent } from '@prisma/client';
import { emailService } from '../../email/email.service.js';
import { outboxService } from '../outbox.service.js';

export async function handleIdentityEmailEvents(event: OutboxEvent): Promise<void> {
  const payload = event.payload as any;

  switch (event.eventType) {
    case 'identity.email_verification_requested': {
      if (payload.email && payload.rawToken) {
        const name = payload.firstName || 'Member';
        await emailService.sendVerificationEmail(payload.email, name, payload.rawToken);
      }
      break;
    }

    case 'identity.password_reset_requested': {
      if (payload.email && payload.rawToken) {
        const name = payload.firstName || 'Member';
        await emailService.sendPasswordResetEmail(payload.email, name, payload.rawToken);
      }
      break;
    }

    case 'identity.staff_user_created': {
      if (payload.email) {
        const name = payload.firstName || 'Staff Member';
        await emailService.sendStaffWelcomeEmail(
          payload.email,
          name,
          payload.role,
          payload.setupToken
        );
      }
      break;
    }

    default:
      // Other events are handled by audit/metrics or no-op
      break;
  }
}

// Register email handlers
outboxService.registerHandler('identity.email_verification_requested', handleIdentityEmailEvents);
outboxService.registerHandler('identity.password_reset_requested', handleIdentityEmailEvents);
outboxService.registerHandler('identity.staff_user_created', handleIdentityEmailEvents);
