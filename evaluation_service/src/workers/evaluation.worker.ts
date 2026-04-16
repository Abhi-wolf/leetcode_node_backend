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
import { serverConfig } from "../config";
import { asyncLocalStorage } from "../utils/helpers/request.helpers";
import { addStatusUpdateJob } from "../producers/status-update.producer";


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
        status: EvaluationStatus.COMPILATION_ERROR,
        errorMessage: result.errorMessage || "Compilation error",
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

              // await updateSubmission(
              //   data.submissionId,
              //   "completed",
              //   output || {},
              // );

              await addStatusUpdateJob({
                submissionId: data.submissionId,
                status: "completed",
                output: output || {},
              });

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
      concurrency: 2, // Process 2 jobs concurrently
    },
  );

  worker.on("error", (error) => {
    logger.error("Evaluation Worker Error:", error);
  });

  worker.on("failed", (job, error) => {
    logger.error(`Evaluation job ${job?.id} failed: ${error.message}`);
  });
}

export async function startEvaluationWorkers() {
  await setupEvaluationWorker();
}
