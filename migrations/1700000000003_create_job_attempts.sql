CREATE TABLE IF NOT EXISTS job_attempts (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  attempt_no INT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ NULL,
  outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('SUCCESS','FAILED')),
  error TEXT NULL,
  duration_ms INT NULL
);

CREATE INDEX IF NOT EXISTS idx_job_attempts_job_id ON job_attempts(job_id, attempt_no);
