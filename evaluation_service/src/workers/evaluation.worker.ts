import { Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/constants";
import logger from "../config/logger.config";
import { createNewRedisConnection } from "../config/redis.config";

async function setupEvaluationWorker() {
  const worker = new Worker(
    SUBMISSION_QUEUE,
    async (job) => {
      logger.info(`Processing job ${job.id}`);
    },
    {
      connection: createNewRedisConnection(),
    },
  );

  worker.on("error", (error) => {
    logger.error("Evaluation Worker Error:", error);
  });

  worker.on("completed", (job) => {
    logger.info(`Evaluation job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    logger.error(`Evaluation job ${job?.id} failed: ${error.message}`);
  });
}

export async function startWorkers() {
  await setupEvaluationWorker();
}
