CREATE TABLE IF NOT EXISTS dead_letter_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_job_id UUID NOT NULL,
  type VARCHAR(64) NOT NULL,
  payload JSONB NOT NULL,
  failure_reason TEXT NOT NULL,
  retry_count INT NOT NULL DEFAULT 0,
  failed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
