import os from 'os';
import { config } from './config';
import { redis } from './redis/client';
import { logger } from './services/logger.service';
import { JobsRepository } from './db/repositories/jobs.repo';
import { WorkersRepository } from './db/repositories/workers.repo';
import { createApp } from './app';

const jobsRepo = new JobsRepository();
const workersRepo = new WorkersRepository();
const workerId = `${os.hostname()}-${process.pid}`;

async function main() {
  const workerRowId = await workersRepo.register(os.hostname(), process.pid);
  logger.info({ workerId, workerRowId }, 'Worker registered');

  setInterval(async () => {
    await workersRepo.heartbeat(workerRowId);
  }, config.HEARTBEAT_INTERVAL_MS);

  while (true) {
    const jobId = await redis.lindex('jobs:queued', 0);
    if (jobId) {
      const job = await jobsRepo.getById(jobId);
      if (job && job.status === 'QUEUED') {
        await jobsRepo.markProcessing(jobId, new Date());
        await redis.lrem('jobs:queued', 0, jobId);
        logger.info({ jobId }, 'Processed job');
      }
    }
    await new Promise((resolve) => setTimeout(resolve, config.WORKER_IDLE_MS));
  }
}

main().catch((error) => logger.error(error, 'Worker failed'));
