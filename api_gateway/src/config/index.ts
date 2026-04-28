// This file contains all the basic configuration logic for the app server to work
import dotenv from "dotenv";

type ServerConfig = {
  PORT: number;
  NODE_ENV: string;
  SERVICE_NAME: string;
  REGISTRY_SERVICE_URL: string;
};

function loadEnv() {
  dotenv.config();
  console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3000,
  SERVICE_NAME: process.env.SERVICE_NAME || "api_gateway_service",
  NODE_ENV: process.env.NODE_ENV || "development",
  REGISTRY_SERVICE_URL:
    process.env.REGISTRY_SERVICE_URL ||
    "http://localhost:3001/api/v1/service-registry",
};
