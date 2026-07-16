import { query } from '../pool';

export class DlqRepository {
  async insert(input: { originalJobId: string; type: string; payload: Record<string, unknown>; failureReason: string; retryCount: number }): Promise<void> {
    await query(
      `INSERT INTO dead_letter_jobs (original_job_id, type, payload, failure_reason, retry_count) VALUES ($1, $2, $3, $4, $5)`,
      [input.originalJobId, input.type, JSON.stringify(input.payload), input.failureReason, input.retryCount],
    );
  }

  async list(): Promise<unknown[]> {
    const { rows } = await query('SELECT * FROM dead_letter_jobs ORDER BY failed_at DESC');
    return rows;
  }
}
