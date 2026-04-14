import { Worker } from "bullmq";
import logger from "../config/logger.config";
import { createNewRedisConnection } from "../config/redis.config";
import {
  EvaluationJob,
  EvaluationResult,
  TestCase,
} from "../interfaces/evaluation.interface";
import { runCode } from "../utils/containers/codeRunner.util";
import { LANGUAGE_CONFIG } from "../config/language.config";
import { updateSubmission } from "../api/submission.api";
import { serverConfig } from "../config";

function matchTestCasesWithResults(
  testCases: TestCase[],
  results: EvaluationResult[],
) {
  const output: Record<string, string> = {};

  if (results.length !== testCases.length) {
    logger.error("Number of results does not match number of test cases");
    return output;
  }

  testCases?.map((testCase, index) => {
    let retval = "";

    if (results[index].status === "time_limit_exceeded") {
      retval = "TLE";
    } else if (results[index].status === "failed") {
      retval = "ERROR";
    } else {
      if (results[index].output === testCase.output) {
        retval = "AC";
      } else {
        retval = "WA";
      }
    }
    output[testCase.id] = retval;
  });

  return output;
}

async function setupEvaluationWorker() {
  const worker = new Worker(
    serverConfig.SUBMISSION_QUEUE_NAME,
    async (job) => {
      // Only process evaluation jobs in this worker
      if (job.name === serverConfig.EVALUATION_JOB_NAME) {
        logger.info(`Processing job ${job.id}`);
        const data: EvaluationJob = job.data;

        console.log("Evaluation job data", data.problem.testcases[0]);

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

          const testCasesRunnerResults: EvaluationResult[] = await Promise.all(
            testCasesRunnerPormises,
          );

          console.log("testCasesRunnerResults", testCasesRunnerResults);

          const output = matchTestCasesWithResults(
            data.problem.testcases,
            testCasesRunnerResults,
          );

          console.log("output", output);
          await updateSubmission(data.submissionId, "completed", output || {});
        } catch (error) {
          logger.error(`Error processing job ${job.id}:`, error);
          return;
        }
      }
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
