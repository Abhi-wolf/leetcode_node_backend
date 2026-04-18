import { Queue } from "bullmq";
import logger from "../config/logger.config";
import { serverConfig } from "../config";
import { redisConnection } from "../config/redis.config";

export const submissionQueue = new Queue(serverConfig.SUBMISSION_QUEUE_NAME, {
  connection: redisConnection.createNewRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

submissionQueue.on("error", (error) => {
  logger.error("Submission Queue Error:", error);
});

// submissionQueue.on("waiting", (job) => {
//   logger.info(`Job ${job.id} is waiting to be processed`);
// });
