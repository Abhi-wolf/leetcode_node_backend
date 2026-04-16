import axios from "axios";
import { serverConfig } from "../config";
import { InternalServerError } from "../utils/errors/app.error";
import logger from "../config/logger.config";
import { getCorrelationId } from "../utils/helpers/request.helpers";
import { ISubmissionData } from "../interfaces/evaluation.interface";

export async function updateSubmission(
  submissionId: string,
  status: string,
  output: Record<string, ISubmissionData>,
) {
  try {
    const correlationId = getCorrelationId();

    logger.info("Updating submission", { submissionId, status });

    const url = `${serverConfig.SUBMISSION_SERVICE_URL}/submissions/${submissionId}/status`;

    const response = await axios.patch(
      url,
      {
        status,
        submissionData: output,
      },
      {
        headers: {
          "x-correlation-id": correlationId,
        },
      },
    );

    if (response.status !== 200) {
      throw new InternalServerError("Failed to update submission");
    }
    return;
  } catch (error) {
    logger.error(`Failed to update submission: ${error}`);
    return null;
  }
}
