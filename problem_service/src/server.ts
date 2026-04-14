import express, { Request, Response } from "express";
import { serverConfig } from "./config";
import v1Router from "./routers/v1/index.router";
import {
  appErrorHandler,
  genericErrorHandler,
} from "./middlewares/error.middleware";
import logger from "./config/logger.config";
import { attachCorrelationIdMiddleware } from "./middlewares/correlation.middleware";
import { connectDB } from "./config/db.config";
import morganMiddleware from "./middlewares/morgan.middleware";
const app = express();

app.use(express.json());

/**
 * Registering all the routers and their corresponding routes with out app server object.
 */

app.use(attachCorrelationIdMiddleware);
app.use(morganMiddleware);

app.use("/api/v1", v1Router);

/**
 * Add the error handler middleware
 */

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.use(appErrorHandler);
app.use(genericErrorHandler);

app.listen(serverConfig.PORT, async () => {
  logger.info(
    `Problem service is running on http://localhost:${serverConfig.PORT}`,
  );
  logger.info(`Press Ctrl+C to stop the server.`);

  await connectDB();
});
