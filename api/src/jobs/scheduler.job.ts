import { runExpirationJob } from './expiration.job';
import { RESERVATION_TTL_SECONDS } from '../config/constants';

const INTERVAL_MS = Math.min(RESERVATION_TTL_SECONDS * 1000, 60_000);

let timer: ReturnType<typeof setInterval> | null = null;

export const startScheduler = (): void => {
  if (timer) return;

  console.log(`[scheduler] Expiration job running every ${INTERVAL_MS / 1000}s`);

  timer = setInterval(async () => {
    try {
      await runExpirationJob();
    } catch (err) {
      console.error('[scheduler] Expiration job threw unexpectedly:', err);
    }
  }, INTERVAL_MS);

  // Prevent the interval from keeping the process alive if everything else shuts down
  if (timer.unref) timer.unref();
};

export const stopScheduler = (): void => {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  console.log('[scheduler] Stopped');
};