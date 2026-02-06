import Redis from "ioredis";
import logger from "./logger.config";

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
  retryStrategy(times: number) {
    if (times > 3) {
      logger.error(
        "Unable to connect to Redis server after multiple attempts.",
      );
      return null; // Stop retrying after 3 attempts
    }
    const delay = Math.min(times * 100, 3000); // Exponential backoff with a maximum delay of 3 seconds
    return delay;
  },
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
