// This file contains all the basic configuration logic for the app server to work
import dotenv from "dotenv";

type ServerConfig = {
  PORT: number;
  NODE_ENV: string;
  SERVICE_NAME: string;
  REGISTRY_HMAC_SHARED_SECRET: string;
};

function loadEnv() {
  dotenv.config();
  console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
  PORT: Number(process.env.PORT) || 3001,
  SERVICE_NAME: process.env.SERVICE_NAME || "registry_service",
  NODE_ENV: process.env.NODE_ENV || "development",
  REGISTRY_HMAC_SHARED_SECRET:
    process.env.REGISTRY_HMAC_SHARED_SECRET || "kfsKE(@#*$oweiKOQWID23984",
};
