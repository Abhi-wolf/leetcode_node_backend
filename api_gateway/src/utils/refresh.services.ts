import axios from "axios";
import { serverConfig } from "../config";
import logger from "../config/logger.config";
import { KNOWN_SERVICES } from "../config/services";
import { InstanceFactory } from "../factories/instance.factory";

const CACHE_REFRESH_INTERVAL_MS = 15000;

const instanceService = InstanceFactory.getInstanceService();

const refreshServices = async (serviceName: string) => {
  try {
    const res = await axios.get(
      `${serverConfig.REGISTRY_SERVICE_URL}/service-registry/discover/${serviceName}`,
      { timeout: 5000 },
    );

    logger.info(`Refreshed service: ${serviceName}`);

    if (res.data.success) {
      instanceService.addServiceInstanceToCache(serviceName, res.data.data);
    }

    return res.data;
  } catch (error: any) {
    console.error("refreshServices = ", error.message);
    logger.error(`Failed to refresh service: ${serviceName}`);
  }
};

export const refreshAllServices = async () => {
  return Promise.all(
    Object.values(KNOWN_SERVICES).map((service) =>
      refreshServices(service.serviceName),
    ),
  );
};

setInterval(() => {
  refreshAllServices();
}, CACHE_REFRESH_INTERVAL_MS);
