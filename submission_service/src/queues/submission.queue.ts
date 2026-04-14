import { Queue } from "bullmq";
import { createNewRedisConnection } from "../config/redis.config";
import logger from "../config/logger.config";
import { serverConfig } from "../config";

export const submissionQueue = new Queue(serverConfig.SUBMISSION_QUEUE_NAME, {
  connection: createNewRedisConnection(),
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

submissionQueue.on("waiting", (jobId) => {
  logger.info(`Job ${jobId} is waiting to be processed`);
});
