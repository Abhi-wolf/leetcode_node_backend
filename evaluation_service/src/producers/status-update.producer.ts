import { serverConfig } from "../config";
import logger from "../config/logger.config";
import { ISubmissionData } from "../types/evaluation.interface";
import { statusUpdateQueue } from "../queues/status-update.queue";
import { getCorrelationId } from "../utils/helpers/request.helpers";

interface IStatusUpdateProducer {
  submissionId: string;
  status: string;
  output: Record<string, ISubmissionData>;
}

export async function addStatusUpdateJob(
  data: IStatusUpdateProducer,
): Promise<string | null> {
  try {
    const correlationId = getCorrelationId();

    const jobData = {
      ...data,
      correlationId: correlationId,
    };

    const job = await statusUpdateQueue.add(
      serverConfig.STATUS_UPDATE_JOB_NAME,
      jobData,
    );

    logger.info(
      `Added status update job with ID: ${job.id} for submission ID: ${data.submissionId}`,
    );

    return job.id || null;
  } catch (error) {
    logger.error(
      `Failed to add status update job for submission ID: ${data.submissionId}`,
      error,
    );
    return null;
  }
}
