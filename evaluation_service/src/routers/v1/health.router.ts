import express, { Request, Response } from "express";
import { serverConfig } from "../../config";
import { redisConnection } from "../../config/redis.config";

const healthRouter = express.Router();

healthRouter.get("/", async (req: Request, res: Response) => {
  const checks = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: formatUptime(process.uptime()),
    service: serverConfig.SERVICE_NAME || "submission-service",
  };

  const redisHealthy = await redisConnection.checkRedis();

  if (!redisHealthy) {
    res.status(503).json({
      ...checks,
      status: "unhealthy",
      dependencies: { redis: redisHealthy },
    });
    return;
  }

  res.status(200).json({
    ...checks,
    dependencies: { redis: true },
  });
});

export default healthRouter;

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
};
