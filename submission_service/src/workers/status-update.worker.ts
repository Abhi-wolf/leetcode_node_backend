import { Worker } from "bullmq";
import { serverConfig } from "../config";
import { asyncLocalStorage } from "../utils/helpers/request.helpers";
import logger from "../config/logger.config";
import { createNewRedisConnection } from "../config/redis.config";
import { SubmissionFactory } from "../factories/submission.factory";

const submissionService = SubmissionFactory.getSubmissionService();

async function setupStatusUpdateWorker() {
  const worker = new Worker(
    serverConfig.STATUS_UPDATE_QUEUE_NAME,
    async (job) => {
      return asyncLocalStorage.run(
        { correlationId: job.data.correlationId },
        async () => {
          // Only process status update jobs in this worker
          if (job.name === serverConfig.STATUS_UPDATE_JOB_NAME) {
            logger.info(
              `Processing status update job ${job.id} for submission ID: ${job.data.submissionId}`,
            );
            const data = job.data;

            try {
              await submissionService.updateSubmissionStatus(
                data.submissionId,
                data.status,
                data.output,
              );

              logger.info(
                `Status update job ${job.id} processed successfully for submission ID: ${data.submissionId}`,
              );
            } catch (error) {
              logger.error(`Error processing job ${job.id}:`, error);
              throw error;
            }
          }
        },
      );
    },
    {
      connection: createNewRedisConnection(),
      concurrency: 10,
    },
  );

  worker.on("error", (error) => {
    logger.error("Worker Error:", error);
  });

  worker.on("failed", (job, error) => {
    logger.error(`Job ${job?.id} failed with error:`, error);
  });
}

export async function startStatusUpdateWorkers() {
  await setupStatusUpdateWorker();
}
