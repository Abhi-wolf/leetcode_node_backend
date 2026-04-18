import { Queue } from "bullmq";
import { serverConfig } from "../config";
import logger from "../config/logger.config";
import { redisConnection } from "../config/redis.config";

export const statusUpdateQueue = new Queue(
  serverConfig.STATUS_UPDATE_QUEUE_NAME,
  {
    connection: redisConnection.createNewRedisConnection(),
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
