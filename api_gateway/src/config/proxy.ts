import { createProxyMiddleware } from "http-proxy-middleware";
import { InstanceFactory } from "../factories/instance.factory";
import logger from "./logger.config";

const instanceService = InstanceFactory.getInstanceService();

const getNextInstance = (serviceName: string) => {
  const nextInstance = instanceService.getNextRoundRobinInstance(serviceName);
  return `http://${nextInstance.host}:${nextInstance.port}`;
};

export const createProxy = (serviceDetail: {
  name: string;
  serviceName: string;
}) => {
  return createProxyMiddleware({
    changeOrigin: true,

    router: () => {
      try {
        const instance= getNextInstance(serviceDetail.serviceName);
        logger.debug(`Redirecting request to ${instance} instance of ${serviceDetail.serviceName}`)
        return instance;
      } catch (error) {
        console.error("Error getting next instance:", error);
        throw new Error("Failed to get next instance");
      }
    },

    // pathRewrite: (path) => {
    //   return path.replace(
    //     new RegExp(`^/api/${serviceDetail.name}`),
    //     `/api/v1/${serviceDetail.name}`,
    //   );
    // },

    pathRewrite: { "^/": `/api/v1/${serviceDetail.name}/` },

    proxyTimeout: 5000,
    timeout: 5000,

    on: {
      proxyReq: (proxyReq, req) => {
        // logger.debug(
        //   `Original request: ${req.url} -> Transformed to: ${proxyReq.path}`,
        // );

        const expressReq = req as any;
        logger.debug(
          `Original request: ${expressReq.originalUrl} -> Transformed to: ${proxyReq.path}`,
        );
      },

      error: (err) => {
        logger.error(
          `Proxy error for ${serviceDetail.serviceName}: ${err.message}`,
        );
      },
    },
  });
};
