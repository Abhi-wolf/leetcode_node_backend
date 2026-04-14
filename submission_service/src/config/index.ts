// This file contains all the basic configuration logic for the app server to work
import dotenv from "dotenv";

type ServerConfig = {
  PORT: number;
  DB_URI: string;
  SERVICE_NAME: string;
  NODE_ENV: string;
  PROBLEM_SERVICE_URL: string;
  EVALUATION_JOB_NAME: string;
  SUBMISSION_QUEUE_NAME: string;
};

function loadEnv() {
  dotenv.config();
  console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3002,
  SERVICE_NAME: process.env.SERVICE_NAME || "submission-service",
  NODE_ENV: process.env.NODE_ENV || "development",
  EVALUATION_JOB_NAME: process.env.EVALUATION_JOB_NAME || "evaluate-submission",
  SUBMISSION_QUEUE_NAME:
    process.env.SUBMISSION_QUEUE_NAME || "submission_queue",
  DB_URI:
    process.env.DB_URI ||
    "mongodb://localhost:27017/leetcode_submission_service",

  PROBLEM_SERVICE_URL:
    process.env.PROBLEM_SERVICE_URL || "http://localhost:3000/api/v1",
};
