// This file contains all the basic configuration logic for the app server to work
import dotenv from "dotenv";

type ServerConfig = {
  PORT: number;
  DB_URI: string;
  SERVICE_NAME: string;
  NODE_ENV: string;
};

function loadEnv() {
  dotenv.config();
  console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3001,
  SERVICE_NAME: process.env.SERVICE_NAME || "problem-service",
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_URI:
    process.env.DB_URI || "mongodb://localhost:27017/leetcode_problem_service",
};
