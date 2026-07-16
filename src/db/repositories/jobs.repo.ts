import { query } from '../pool';
import { JobRecord, JobStatus, JobType } from '../../types/job.types';
import { ConflictError } from '../../utils/errors';

export class JobsRepository {
  async create(input: { type: JobType; priority: number; payload: Record<string, unknown>; maxRetries: number; delayUntil: Date | null; idempotencyKey?: string; status?: JobStatus }): Promise<JobRecord> {
    try {
      const { rows } = await query<JobRecord>(
        `
        INSERT INTO jobs (type, priority, payload, max_retries, delay_until, idempotency_key, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
        [input.type, input.priority, JSON.stringify(input.payload), input.maxRetries, input.delayUntil ?? null, input.idempotencyKey ?? null, input.status ?? 'QUEUED'],
      );
      return rows[0];
    } catch (err: any) {
      // Unique violation on idempotency_key -> translate to a ConflictError with meaningful message
      if (err && err.code === '23505' && err.constraint === 'jobs_idempotency_key_key' && input.idempotencyKey) {
        throw new ConflictError(`Job with idempotency key "${input.idempotencyKey}" already exists`);
      }
      throw err;
    }
  }

  async getById(id: string): Promise<JobRecord | null> {
    const { rows } = await query<JobRecord>('SELECT * FROM jobs WHERE id = $1', [id]);
    return rows[0] ?? null;
  }

  async list(status?: JobStatus, page = 1, pageSize = 20): Promise<{ rows: JobRecord[]; total: number }> {
    const offset = (page - 1) * pageSize;
    const countRes = await query('SELECT COUNT(*)::int AS count FROM jobs' + (status ? ' WHERE status = $1' : ''), status ? [status] : []);
    const { rows } = await query<JobRecord>(
      `SELECT * FROM jobs${status ? ' WHERE status = $1' : ''} ORDER BY created_at DESC LIMIT $${status ? 2 : 1} OFFSET $${status ? 3 : 2}`,
      status ? [status, pageSize, offset] : [pageSize, offset],
    );
    const total = Number((countRes.rows[0] as { count?: string | number } | undefined)?.count ?? 0);
    return { rows, total };
  }

  async claimNextJob(workerId: string, startedAt: Date): Promise<JobRecord | null> {
    const { rows } = await query<JobRecord>(
      `
        UPDATE jobs
        SET status = 'PROCESSING', started_at = $1, updated_at = NOW()
        WHERE id = (
          SELECT id FROM jobs
          WHERE status = 'QUEUED'
            AND (delay_until IS NULL OR delay_until <= NOW())
          ORDER BY created_at ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *
      `,
      [startedAt],
    );

    return rows[0] ?? null;
  }

  async markProcessing(id: string, startedAt: Date): Promise<void> {
    await query('UPDATE jobs SET status = $1, started_at = $2, updated_at = NOW() WHERE id = $3', ['PROCESSING', startedAt, id]);
  }

  async markCompleted(id: string, result: unknown): Promise<void> {
    await query('UPDATE jobs SET status = $1, result = $2, completed_at = NOW(), updated_at = NOW() WHERE id = $3', ['COMPLETED', JSON.stringify(result), id]);
  }

  async markFailed(id: string, error: string): Promise<void> {
    await query('UPDATE jobs SET status = $1, last_error = $2, completed_at = NOW(), updated_at = NOW() WHERE id = $3', ['FAILED', error, id]);
  }

  async scheduleRetry(id: string, error: string, retryCount: number, delayMs: number): Promise<void> {
    await query('UPDATE jobs SET status = $1, retry_count = $2, last_error = $3, delay_until = NOW() + ($4 || " milliseconds")::interval, updated_at = NOW() WHERE id = $5', ['QUEUED', retryCount, error, delayMs, id]);
  }

  async cancel(id: string): Promise<void> {
    await query('UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2 AND status = $3', ['CANCELLED', id, 'QUEUED']);
  }
}
