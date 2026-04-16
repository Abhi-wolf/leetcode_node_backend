import { Queue } from "bullmq";
import { serverConfig } from "../config";
import { createNewRedisConnection } from "../config/redis.config";
import logger from "../config/logger.config";

export const statusUpdateQueue = new Queue(
  serverConfig.STATUS_UPDATE_QUEUE_NAME,
  {
    connection: createNewRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  },
);

statusUpdateQueue.on("error", (error) => {
  logger.error("Status Update Queue Error:", error);
});
