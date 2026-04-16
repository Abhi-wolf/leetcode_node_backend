import { Worker } from "bullmq";
import logger from "../config/logger.config";
import { createNewRedisConnection } from "../config/redis.config";
import {
  EvaluationJob,
  EvaluationResult,
  TestCase,
  EvaluationStatus,
  ISubmissionData,
} from "../interfaces/evaluation.interface";
import { runCode } from "../utils/containers/codeRunner.util";
import { LANGUAGE_CONFIG } from "../config/language.config";
import { updateSubmission } from "../api/submission.api";
import { serverConfig } from "../config";
import { asyncLocalStorage } from "../utils/helpers/request.helpers";

// function matchTestCasesWithResults(
//   testCases: TestCase[],
//   results: EvaluationResult[],
// ) {
//   const output: Record<string, string> = {};

//   if (results.length !== testCases.length) {
//     logger.error("Number of results does not match number of test cases");
//     return output;
//   }

//   testCases?.map((testCase, index) => {
//     let retval = "";

//     if (results[index].status === "time_limit_exceeded") {
//       retval = "TLE";
//     } else if (results[index].status === "failed") {
//       retval = "ERROR";
//     } else {
//       if (results[index].output === testCase.output) {
//         retval = "AC";
//       } else {
//         retval = "WA";
//       }
//     }
//     output[testCase.id] = retval;
//   });

//   return output;
// }

function matchTestCasesWithResults(
  testCases: TestCase[],
  results: EvaluationResult[],
) {
  const output: Record<string, ISubmissionData> = {};

  if (results.length !== testCases.length) {
    logger.error("Number of results does not match number of test cases");
    return output;
  }

  testCases?.map((testCase, index) => {
    const result = results[index];

    if (result.status === "time_limit_exceeded") {
      output[testCase.id] = {
        testCaseId: testCase.id,
        status: EvaluationStatus.TIME_LIMIT_EXCEEDED,
        errorMessage: "Time limit exceeded",
        actualOutput: result.output,
        expectedOutput: testCase.output,
        executionTime: result.executionTime || 0,
      };
    } else if (result.status === "failed") {
      output[testCase.id] = {
        testCaseId: testCase.id,
        status: EvaluationStatus.COMPILATION_ERROR, // Runtime Error
        errorMessage: result.errorMessage || "Runtime error",
        actualOutput: result.output,
        expectedOutput: testCase.output,
        executionTime: result.executionTime || 0,
      };
    } else {
      if (result.output === testCase.output) {
        output[testCase.id] = {
          testCaseId: testCase.id,
          status: EvaluationStatus.SUCCESS,
          actualOutput: result.output,
          expectedOutput: testCase.output,
          executionTime: result.executionTime || 0,
        };
      } else {
        output[testCase.id] = {
          testCaseId: testCase.id,
          status: EvaluationStatus.FAILED,
          errorMessage: "Wrong answer",
          actualOutput: result.output,
          expectedOutput: testCase.output,
          executionTime: result.executionTime || 0,
        };
      }
    }
  });

  return output;
}

async function setupEvaluationWorker() {
  const worker = new Worker(
    serverConfig.SUBMISSION_QUEUE_NAME,
    async (job) => {
      return asyncLocalStorage.run(
        { correlationId: job.data.correlationId },
        async () => {
          // Only process evaluation jobs in this worker
          if (job.name === serverConfig.EVALUATION_JOB_NAME) {
            logger.info(`Processing job ${job.id}`);
            const data: EvaluationJob = job.data;

            try {
              const testCasesRunnerPormises = data.problem.testcases.map(
                (testCase) => {
                  return runCode({
                    code: data.code,
                    language: data.language,
                    timeout: LANGUAGE_CONFIG[data.language].timeout,
                    imageName: LANGUAGE_CONFIG[data.language].imageName,
                    input: testCase.input,
                  });
                },
              );

              const testCasesRunnerResults: EvaluationResult[] =
                await Promise.all(testCasesRunnerPormises);

              const output = matchTestCasesWithResults(
                data.problem.testcases,
                testCasesRunnerResults,
              );

              await updateSubmission(
                data.submissionId,
                "completed",
                output || {},
              );
            } catch (error) {
              logger.error(`Error processing job ${job.id}:`, error);
              return;
            }
          }
        },
      );
    },
    {
      connection: createNewRedisConnection(),
    },
  );

  worker.on("error", (error) => {
    logger.error("Evaluation Worker Error:", error);
  });

  worker.on("failed", (job, error) => {
    logger.error(`Evaluation job ${job?.id} failed: ${error.message}`);
  });
}

export async function startWorkers() {
  await setupEvaluationWorker();
}
