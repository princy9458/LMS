import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * SaaS Background Job System
 * Handles async tasks like certificate generation and analytics.
 */
export const lmsQueue = new Queue('lms-jobs', { connection: redisConnection });

export const addJob = async (name: string, data: any): Promise<void> => {
  await lmsQueue.add(name, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  });
};

// Example Worker (to be expanded in specific services)
const worker = new Worker('lms-jobs', async (job: Job) => {
  console.log(`[JOB] Processing ${job.name}:`, job.data);
  
  if (job.name === 'generate_certificate') {
    // Call certificateService
  }
  
  if (job.name === 'sync_analytics') {
    // Aggregate data
  }
}, { connection: redisConnection });

worker.on('completed', (job: Job) => console.log(`[JOB] ${job.id} done`));
worker.on('failed', (job: Job | undefined, err: Error) => console.error(`[JOB] ${job ? job.id : 'unknown'} failed:`, err));

export { redisConnection };
