import os from 'os';
import { config } from './config';
import { logger } from './services/logger.service';
import { JobsRepository } from './db/repositories/jobs.repo';
import { WorkersRepository } from './db/repositories/workers.repo';

const jobsRepo = new JobsRepository();
const workersRepo = new WorkersRepository();
const workerId = `${os.hostname()}-${process.pid}`;

function simulateProcessing(jobPayload: Record<string, unknown>): void {
  logger.info({ payload: jobPayload }, 'Simulating job processing');
  if (jobPayload && typeof jobPayload === 'object' && 'simulateFailure' in jobPayload) {
    throw new Error('Simulated processing failure');
  }
}

async function main() {
  const workerRowId = await workersRepo.register(os.hostname(), process.pid);
  logger.info({ workerId, workerRowId }, 'Worker registered');

  setInterval(async () => {
    await workersRepo.heartbeat(workerRowId);
  }, config.HEARTBEAT_INTERVAL_MS);

  while (true) {
    const job = await jobsRepo.claimNextJob(workerId, new Date());
    if (!job) {
      await new Promise((resolve) => setTimeout(resolve, config.WORKER_IDLE_MS));
      continue;
    }

    try {
      simulateProcessing(job.payload);
      await jobsRepo.markCompleted(job.id, { processedAt: new Date().toISOString() });
      logger.info({ jobId: job.id }, 'Job completed successfully');
    } catch (error: any) {
      const failureMessage = error?.message ?? 'Unknown error';
      const nextRetryCount = job.retry_count + 1;

      if (nextRetryCount <= job.max_retries) {
        const delayMs = Math.min(config.BACKOFF_MAX_MS, config.BACKOFF_BASE_MS * nextRetryCount);
        await jobsRepo.scheduleRetry(job.id, failureMessage, nextRetryCount, delayMs);
        logger.warn({ jobId: job.id, retryCount: nextRetryCount, error: failureMessage }, 'Job failed and scheduled for retry');
      } else {
        await jobsRepo.markFailed(job.id, failureMessage);
        logger.error({ jobId: job.id, error: failureMessage }, 'Job failed and reached max retries');
      }
    }
  }
}

main().catch((error) => logger.error(error, 'Worker failed'));
