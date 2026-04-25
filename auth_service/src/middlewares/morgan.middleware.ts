import morgan from "morgan";
import logger from "../config/logger.config";

const morganMiddleware = morgan(
  (tokens, req, res) => {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      responseTime: `${tokens["response-time"](req, res)}ms`,
      //   userAgent: tokens["user-agent"](req, res),
    });
  },
  {
    stream: {
      write: (message) => {
        try {
          const parsed = JSON.parse(message.trim());
          logger.info("Incoming request", parsed);
        } catch {
          logger.info("Incoming request", message.trim());
        }
      },
    },
  },
);
export default morganMiddleware;
