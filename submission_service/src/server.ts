import express, { Request, Response } from "express";
import { serverConfig } from "./config";
import v1Router from "./routers/v1/index.router";
import {
  appErrorHandler,
  genericErrorHandler,
} from "./middlewares/error.middleware";
import logger from "./config/logger.config";
import { attachCorrelationIdMiddleware } from "./middlewares/correlation.middleware";
import morganMiddleware from "./middlewares/morgan.middleware";
import { startStatusUpdateWorkers, stopStatusUpdateWorkers } from "./workers/status-update.worker";
import { mongoConnection } from "./config/db.config";
import { redisConnection } from "./config/redis.config";
import os from "os";
import { registerServiceInstance, startHeartbeat } from "./apis/register-service-instance.api";

const systemHost = os.hostname();
const app = express();

app.use(express.json());

/**
 * Registering all the routers and their corresponding routes with out app server object.
 */

app.use(attachCorrelationIdMiddleware);
app.use(morganMiddleware);

app.use("/api/v1", v1Router);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

const serviceInstance = {
  serviceName: "submission-service",
  instanceId: `submission-service-${systemHost}`,
  host: systemHost,
  port: serverConfig.PORT,
};

/**
 * Add the error handler middleware
 */
app.use(appErrorHandler);
app.use(genericErrorHandler);

async function initializeConnection() {
  try {
    await mongoConnection.connect();
    await redisConnection.connect();
    await startStatusUpdateWorkers();
    logger.info("All connections initialized successfully");
  } catch (error) {
    logger.error("Error initializing connection:", error);
    throw error;
  }
}

async function startServer() {
  try {
    await initializeConnection();

    const server = app.listen(serverConfig.PORT, async() => {
      logger.info(`Submission service is running on PORT ${serverConfig.PORT}`);
      // Registering service instance with registry service
      await registerServiceInstance(serviceInstance);
      // Start heartbeat
      startHeartbeat(serviceInstance);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received - starting graceful shutdown`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await mongoConnection.disconnect();
          await stopStatusUpdateWorkers();
          await redisConnection.disconnect();
          logger.info("All connections closed successfully");
          process.exit(0);
        } catch (error) {
          logger.error("Error during shutdown:", error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown("unhandledRejection");
    });
  } catch (error) {
    logger.error("Error starting server:", error);
    process.exit(1);
  }
}

startServer();
