import { collectDefaultMetrics, Counter, Gauge, Histogram, register } from 'prom-client';

collectDefaultMetrics({ register });

export const metrics = {
  jobsSubmitted: new Counter({
    name: 'jobs_submitted_total',
    help: 'Total jobs submitted',
    labelNames: ['type', 'priority'],
    registers: [register],
  }),
  jobsCompleted: new Counter({
    name: 'jobs_completed_total',
    help: 'Total jobs completed',
    labelNames: ['type'],
    registers: [register],
  }),
  jobsFailed: new Counter({
    name: 'jobs_failed_total',
    help: 'Total jobs failed',
    labelNames: ['type'],
    registers: [register],
  }),
  jobsRetried: new Counter({
    name: 'jobs_retried_total',
    help: 'Total jobs retried',
    labelNames: ['type'],
    registers: [register],
  }),
  jobsDeadLettered: new Counter({
    name: 'jobs_dead_lettered_total',
    help: 'Total jobs dead-lettered',
    labelNames: ['type'],
    registers: [register],
  }),
  queueQueued: new Gauge({
    name: 'queue_queued',
    help: 'Queued jobs metric',
    registers: [register],
  }),
  queueProcessing: new Gauge({
    name: 'queue_processing',
    help: 'Processing jobs metric',
    registers: [register],
  }),
  queueDelayed: new Gauge({
    name: 'queue_delayed',
    help: 'Delayed jobs metric',
    registers: [register],
  }),
  processingDuration: new Histogram({
    name: 'job_processing_duration_seconds',
    help: 'Job processing duration seconds',
    labelNames: ['type'],
    registers: [register],
  }),
};

export async function getMetricsText(): Promise<string> {
  return register.metrics();
}
