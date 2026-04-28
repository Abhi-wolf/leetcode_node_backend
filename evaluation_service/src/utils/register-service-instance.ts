import axios, { AxiosError } from "axios";
import logger from "../config/logger.config";
import { ServiceInstance } from "../interfaces/registry-service.interface";
import { serverConfig } from "../config";

const MAX_RETRIES = 5;
const BASE_DELAY = 200; //in milliseconds
const MAX_DELAY = 5000; //in milliseconds

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Calculate exponential backoff delay with jitter
const getBackoffDelay = (attempt: number) => {
  const delay = Math.min(BASE_DELAY * Math.pow(2, attempt), MAX_DELAY);
  const jitter = Math.random() * 100;
  return delay + jitter;
};

const isRetryableError = (error: AxiosError) => {
  // Retry on:
  // - network errors
  // - timeout
  // - 5xx server errors

  if (!error.response) return true; // network error

  const status = error.response.status;

  return status >= 500; // retry only server errors
};

export const registerServiceInstance = async (data: ServiceInstance) => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        `${serverConfig.REGISTRY_SERVICE_URL}/service-registry`,
        data,
        {
          timeout: 3000,
        },
      );

      if (response.data?.success) {
        logger.info("Service registered successfully", {
          service: data.serviceName,
          instanceId: data.instanceId,
          attempt: attempt + 1,
        });
        return response.data;
      }

      // Logical failure → don't retry
      logger.warn("Service registration failed (logical)", {
        response: response.data,
      });
      return null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        const retryable = isRetryableError(axiosError);

        logger.error("Service registration attempt failed", {
          attempt: attempt + 1,
          retryable,
          message: axiosError.message,
          status: axiosError.response?.status,
          code: axiosError.code,
        });

        if (!retryable) {
          // Don't want to retry client errors (4xx)
          break;
        }
      } else {
        logger.error("Unexpected error", {
          message: (error as Error)?.message,
        });
        break;
      }

      // wait before retrying
      const delay = getBackoffDelay(attempt);
      logger.info(`Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  logger.error("Service registration failed after max retries", {
    service: data.serviceName,
    instanceId: data.instanceId,
  });

  return null;
};
