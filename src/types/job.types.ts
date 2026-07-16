export type JobType = 'email' | 'sms' | 'image' | 'webhook' | 'custom';
export type JobPriority = 'high' | 'normal' | 'low';
export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface JobRecord {
  id: string;
  type: JobType;
  priority: number;
  payload: Record<string, unknown>;
  status: JobStatus;
  retry_count: number;
  max_retries: number;
  delay_until: string | null;
  idempotency_key: string | null;
  result: unknown;
  last_error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

export interface CreateJobInput {
  type: JobType;
  priority?: JobPriority;
  payload: Record<string, unknown>;
  delay?: number;
  runAt?: string;
  maxRetries?: number;
  idempotencyKey?: string;
}
