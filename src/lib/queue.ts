import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const queueName = process.env.BULLMQ_QUEUE_NAME || 'defaultQueue';


export const synthesisQueue = new Queue(queueName, {
  connection: redisConnection,
});