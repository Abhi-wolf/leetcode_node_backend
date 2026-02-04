import Redis from "ioredis";
import logger from "./logger.config";

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
};

export const redis = new Redis(redisConfig);

redis.on("connect", () => {
  logger.info("Connected to Redis server");
});

redis.on("error", (err) => {
  logger.error("Redis connection error:", err);
});

redis.on("end", () => {
  logger.info("Redis connection closed");
});

export const createNewRedisConnection = () => {
  return new Redis(redisConfig);
};
