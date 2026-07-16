export const REDIS_KEYS = {
  queued: 'jobs:queued',
  delayed: 'jobs:delayed',
  processing: 'jobs:processing',
  counters: 'jobs:counters',
  paused: 'queue:paused',
  lock: (jobId: string) => `jobs:lock:${jobId}`,
};
