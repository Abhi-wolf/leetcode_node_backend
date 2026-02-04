// This file contains all the basic configuration logic for the app server to work
import dotenv from "dotenv";

type ServerConfig = {
  PORT: number;
  PROBLEM_SERVICE_URL: string;
};

function loadEnv() {
  dotenv.config();
  console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3002,

  PROBLEM_SERVICE_URL:
    process.env.PROBLEM_SERVICE_URL || "http://localhost:3001/api/v1",
};
