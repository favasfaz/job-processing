import { JobsRepository } from '../db/repositories/jobs.repo';
import { DlqRepository } from '../db/repositories/dlq.repo';
import { CreateJobInput, JobRecord, JobStatus } from '../types/job.types';
import { calculateBackoff } from '../utils/backoff';
import { ConflictError, NotFoundError } from '../utils/errors';
import { generateId } from '../utils/id';
import { config } from '../config';

export class JobsService {
  constructor(
    private readonly jobsRepo = new JobsRepository(),
    private readonly dlqRepo = new DlqRepository(),
  ) {}

  async createJob(input: CreateJobInput): Promise<{ jobId: string; status: string }> {
    const id = generateId();
    const priority = this.mapPriority(input.priority ?? 'normal');
    const delayUntil = this.resolveDelay(input.delay, input.runAt);
    const maxRetries = input.maxRetries ?? config.MAX_RETRIES;
    const job = await this.jobsRepo.create({
      type: input.type,
      priority,
      payload: input.payload,
      maxRetries,
      delayUntil,
      idempotencyKey: input.idempotencyKey,
    });
    return { jobId: job.id, status: 'queued' };
  }

  async getJob(id: string): Promise<JobRecord> {
    const job = await this.jobsRepo.getById(id);
    if (!job) throw new NotFoundError('Job not found');
    return job;
  }

  async listJobs(status?: JobStatus, page = 1, pageSize = 20): Promise<{ data: JobRecord[]; meta: { page: number; pageSize: number; total: number; totalPages: number } }> {
    const { rows, total } = await this.jobsRepo.list(status, page, pageSize);
    return {
      data: rows,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  async cancelJob(id: string): Promise<void> {
    const job = await this.jobsRepo.getById(id);
    if (!job) throw new NotFoundError('Job not found');
    if (job.status !== 'QUEUED') throw new ConflictError('Only queued jobs can be cancelled');
    await this.jobsRepo.cancel(id);
  }

  async markCompleted(id: string, result: unknown): Promise<void> {
    await this.jobsRepo.markCompleted(id, result);
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.jobsRepo.markFailed(id, error);
  }

  async scheduleRetry(id: string, error: string, retryCount: number): Promise<number> {
    const delayMs = calculateBackoff(retryCount, config.BACKOFF_BASE_MS, config.BACKOFF_MAX_MS);
    await this.jobsRepo.scheduleRetry(id, error, retryCount, delayMs);
    return delayMs;
  }

  async deadLetter(id: string, error: string, payload: Record<string, unknown>, retryCount: number, type: string): Promise<void> {
    await this.dlqRepo.insert({ originalJobId: id, type, payload, failureReason: error, retryCount });
    await this.jobsRepo.markFailed(id, error);
  }

  private mapPriority(priority?: string): number {
    switch (priority) {
      case 'high':
        return 1;
      case 'low':
        return 10;
      default:
        return 5;
    }
  }

  private resolveDelay(delay?: number, runAt?: string): Date | null {
    if (delay && runAt) {
      return null;
    }
    if (typeof delay === 'number' && delay > 0) {
      return new Date(Date.now() + delay);
    }
    if (runAt) {
      return new Date(runAt);
    }
    return null;
  }
}
