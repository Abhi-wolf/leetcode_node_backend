import axios, { AxiosResponse } from "axios";
import { serverConfig } from "../config";
import { InternalServerError } from "../utils/errors/app.error";
import logger from "../config/logger.config";

export interface ITestCase {
  input: string;
  output: string;
  id: string;
}

export interface IProblemDetails {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  editorial?: string;
  testcases: ITestCase[];
}

export interface IProblemResponse {
  data: IProblemDetails;
  message: string;
  success: boolean;
}

export async function getProblemById(
  problemId: string,
): Promise<IProblemDetails | null> {
  // TODO:improve the axios api error handling
  try {
    const response: AxiosResponse<IProblemResponse> = await axios.get(
      `${serverConfig.PROBLEM_SERVICE_URL}/problems/${problemId}`,
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new InternalServerError(
      `Failed to fetch problem with id ${problemId}`,
    );
  } catch (error) {
    logger.error(`Error fetching problem with id ${problemId}: ${error}`);
    return null;
  }

  return null;
}
