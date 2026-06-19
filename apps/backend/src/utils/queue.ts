import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { getRedisConfig } from './env';
import { logger } from './logger';

const { REDIS_URL } = getRedisConfig();

// Instantiate Redis connection client
export const redisConnection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
    }
});

redisConnection.on('connect', () => {
    logger.info('[Redis] Connected to Redis server successfully');
});

redisConnection.on('error', (error) => {
    logger.error({ err: error }, '[Redis] Error occurred in Redis connection');
});

// Configure Queue name constants
export const QUEUE_NAMES = {
    NOTIFICATIONS: 'notifications',
    RECRUITMENT_CYCLE: 'recruitment-cycle'
} as const;

// Create BullMQ queue instance
export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATIONS, {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3, // Retry up to 3 times
        backoff: {
            type: 'exponential',
            delay: 1000 // 1s, 2s, 4s, etc.
        },
        removeOnComplete: true, // Clean up completed jobs
        removeOnFail: false // Keep failed jobs for debugging
    }
});

export const recruitmentCycleQueue = new Queue(QUEUE_NAMES.RECRUITMENT_CYCLE, {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 1, // Don't retry automatically for critical DB tasks
        removeOnComplete: true,
        removeOnFail: false
    }
});

logger.info('[Queue] Notification and Recruitment Cycle Queues initialized');
