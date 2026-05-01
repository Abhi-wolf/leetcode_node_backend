// This file contains all the basic configuration logic for the app server to work
import dotenv from "dotenv";

type ServerConfig = {
  PORT: number;
  DB_URI: string;
  SERVICE_NAME: string;
  NODE_ENV: string;
  REGISTRY_SERVICE_URL: string;
  REGISTRY_HMAC_SHARED_SECRET: string;
  API_GATEWAY_HMAC_SHARED_SECRET: string;
};

function loadEnv() {
  dotenv.config();
  console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3010,
  SERVICE_NAME: process.env.SERVICE_NAME || "problem-service",
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_URI:
    process.env.DB_URI || "mongodb://localhost:27017/leetcode_problem_service",

  REGISTRY_SERVICE_URL:
    process.env.REGISTRY_SERVICE_URL || "http://localhost:3001/api/v1",

  REGISTRY_HMAC_SHARED_SECRET:
    process.env.REGISTRY_HMAC_SHARED_SECRET || "kfsKE(@#*oweiKOQWID23984",

  API_GATEWAY_HMAC_SHARED_SECRET:
    process.env.API_GATEWAY_HMAC_SHARED_SECRET || "3049sKKJDIWEO2983023909234",
};
