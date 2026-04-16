import { IProblemDetails } from "../apis/problem.api";
import { serverConfig } from "../config";
import logger from "../config/logger.config";
import { SubmissionLanguage } from "../models/submission.model";
import { submissionQueue } from "../queues/submission.queue";

export interface ISubmissionJob {
  submissionId: string;
  problem: IProblemDetails;
  code: string;
  language: SubmissionLanguage;
  correlationId:string
}

export async function addSubmissionJob(
  data: ISubmissionJob,
): Promise<string | null> {
  try {
    const job = await submissionQueue.add(
      serverConfig.EVALUATION_JOB_NAME,
      data,
    );

    logger.info(`Added submission job with ID: ${job.id}`);

    return job.id || null;
  } catch (error) {
    logger.error("Failed to add submission job", error);
    return null;
  }
}
