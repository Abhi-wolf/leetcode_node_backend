import { getProblemById } from "../apis/problem.api";
import logger from "../config/logger.config";
import {
  ISubmission,
  ISubmissionData,
  SubmissionStatus,
} from "../models/submission.model";
import { addSubmissionJob } from "../producers/submission.producer";
import { ISubmissionRepository } from "../repositories/submission.repository";
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/errors/app.error";

export interface ISubmissionService {
  createSubmission(submissionData: Partial<ISubmission>): Promise<ISubmission>;
  getSubmissionById(id: string): Promise<ISubmission | null>;
  updateSubmissionStatus(
    id: string,
    status: SubmissionStatus,
    submissionData?: ISubmissionData,
  ): Promise<ISubmission | null>;
  getSubmissionsByProblemId(problemId: string): Promise<ISubmission[]>;
  deleteSubmissionById(id: string): Promise<boolean>;
}

export class SubmissionService implements ISubmissionService {
  private submissionRepository: ISubmissionRepository;

  constructor(submissionRepository: ISubmissionRepository) {
    this.submissionRepository = submissionRepository;
  }

  async createSubmission(
    submissionData: Partial<ISubmission>,
  ): Promise<ISubmission> {
    // check if the problem exists
    if (!submissionData.problemId) {
      throw new BadRequestError(`Problem ID is required`);
    }
    if (!submissionData.code) {
      throw new BadRequestError(`Code is required`);
    }
    if (!submissionData.language) {
      throw new BadRequestError(`Language is required`);
    }

    // get problem details from problem service
    const problem = await getProblemById(submissionData.problemId);

    logger.info(`fetched problem from problem service with id ${problem?.id}`);

    if (!problem) {
      throw new NotFoundError(
        `Problem with id ${submissionData.problemId} not found`,
      );
    }

    //   add the submission payload to the database
    const submission = await this.submissionRepository.create(submissionData);

    //   submission to redis queue for processing
    const jobId = await addSubmissionJob({
      submissionId: submission.id.toString(),
      problem,
      code: submissionData.code,
      language: submissionData.language,
    });

    //  if job is not added to queue, throw an error
    if (jobId) {
      logger.info(`Submission job added to queue with job ID: ${jobId}`);
    } else {
      logger.error(
        `Failed to add submission job for submission ID: ${submission.id}`,
      );

      // mark the submission as failed
      await this.submissionRepository.updateStatus(
        submission.id.toString(),
        SubmissionStatus.FAILED
      );
      
      throw new InternalServerError(
        `Failed to add submission job for submission ID: ${submission.id}`,
      );
    }

    return submission;
  }

  async getSubmissionById(id: string): Promise<ISubmission | null> {
    const submission = await this.submissionRepository.findById(id);

    if (!submission) {
      throw new NotFoundError(`Submission with id ${id} not found`);
    }
    return submission;
  }

  async updateSubmissionStatus(
    id: string,
    status: SubmissionStatus,
    submissionData: ISubmissionData,
  ): Promise<ISubmission | null> {
    const submission = await this.submissionRepository.updateStatus(
      id,
      status,
      submissionData,
    );
    if (!submission) {
      throw new NotFoundError("Submission not found");
    }
    return submission;
  }

  async getSubmissionsByProblemId(problemId: string): Promise<ISubmission[]> {
    return this.submissionRepository.findByProblemId(problemId);
  }

  async deleteSubmissionById(id: string): Promise<boolean> {
    const submission = await this.submissionRepository.findById(id);

    if (!submission) {
      throw new NotFoundError(`Submission with id ${id} not found`);
    }

    return this.submissionRepository.deleteById(id);
  }
}
