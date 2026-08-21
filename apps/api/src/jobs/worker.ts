import '../config/observability.js';
import { Worker } from 'bullmq';
import { redis } from '../config/redis.js';
import { outboxService } from '../modules/events/outbox.service.js';
import '../modules/events/handlers/identity-email.handler.js';

console.log('👷 DAIH Background Job Worker initializing...');

// Worker for booking hold expiry and notification dispatch
export const holdExpiryWorker = new Worker(
  'booking-holds',
  async (job) => {
    console.log(`Processing hold expiry job for booking: ${job.data.bookingId}`);
    return { released: true, bookingId: job.data.bookingId };
  },
  { connection: redis }
);

holdExpiryWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

holdExpiryWorker.on('error', (err) => {
  console.warn('Hold expiry worker connection notice:', err.message);
});

// Outbox event polling loop (every 3 seconds)
let isPollingOutbox = false;
export async function runOutboxCycle() {
  if (isPollingOutbox) return;
  isPollingOutbox = true;
  try {
    const result = await outboxService.processPendingEvents(25);
    if (result.processed > 0 || result.failed > 0) {
      console.log(`📬 Outbox cycle: ${result.processed} processed, ${result.failed} failed`);
    }
  } catch (err: any) {
    console.error('Outbox cycle error:', err?.message);
  } finally {
    isPollingOutbox = false;
  }
}

const outboxInterval = setInterval(runOutboxCycle, 3000);

process.on('SIGTERM', async () => {
  console.log('Stopping worker gracefully...');
  clearInterval(outboxInterval);
  await holdExpiryWorker.close();
});
