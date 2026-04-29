import logger from "../config/logger.config";
import { KNOWN_SERVICES } from "../config/serviceInfos";
import { RegistryRepository } from "../repositories/registry.repository";
import { BadRequestError } from "../utils/errors/app.error";

export class RegistryService {
  private readonly HEARTBEAT_TIMEOUT = 60_000; // 60 seconds
  constructor(private registryRepository: RegistryRepository) {}

  private isFromKnownService(serviceName: string) {
    const isKnownService = Object.values(KNOWN_SERVICES).some(
      (service) => service.serviceName === serviceName,
    );
    return isKnownService;
  }

  cleanupStaleInstances() {
    const now = Date.now();

    const allServices = this.registryRepository.getAllServices();

    for (const [serviceName, instances] of allServices.entries()) {
      const inActiveInstances = instances.filter(
        (instance) =>
          now - new Date(instance.lastHeartbeat).getTime() >
          this.HEARTBEAT_TIMEOUT,
      );

      for (const instance of inActiveInstances) {
        this.registryRepository.removeServiceInstance(
          serviceName,
          instance.instanceId,
        );
      }

      logger.debug(
        `Refreshed ${serviceName}: ${inActiveInstances.length} inactive instances removed`,
      );
    }
  }

  registerService(
    serviceName: string,
    instanceId: string,
    host: string,
    port: number,
  ) {
    if (!this.isFromKnownService(serviceName)) {
      throw new BadRequestError("Invalid service name provided");
    }

    const serviceInstances =
      this.registryRepository.getServiceInstances(serviceName);

    const isAlreadyPresent = serviceInstances?.some(
      (instance) => instance.instanceId === instanceId,
    );

    if (isAlreadyPresent) {
      this.registryRepository.updateServiceInstanceHeartbeat(
        serviceName,
        instanceId,
        new Date(),
      );

      return;
    }

    const lastHeartbeat = new Date();

    const result = this.registryRepository.register(
      serviceName,
      instanceId,
      host,
      port,
      lastHeartbeat,
    );

    return result;
  }

  getAllServices() {
    const result = this.registryRepository.getAllServices();

    const services: Record<string, any> = {};

    result.forEach((value, key) => {
      services[key] = value;
    });

    return services;
  }

  getServiceInstances(serviceName: string) {
    if (!this.isFromKnownService(serviceName)) {
      throw new BadRequestError("Invalid service name provided");
    }

    const result = this.registryRepository.getServiceInstances(serviceName);

    return result || [];
  }

  updateServiceInstanceHeartbeat(
    serviceName: string,
    instanceId: string,
    host: string,
    port: number,
  ) {
    if (!this.isFromKnownService(serviceName)) {
      throw new BadRequestError("Invalid service name provided");
    }

    const serviceInstances =
      this.registryRepository.getServiceInstances(serviceName);


    const instanceIndex = serviceInstances?.find(
      (instance) => instance.instanceId === instanceId,
    );


    const lastHeartbeat = new Date();

    // found the instance
    if (instanceIndex) {
      this.registryRepository.updateServiceInstanceHeartbeat(
        serviceName,
        instanceId,
        lastHeartbeat,
      );

      logger.debug(`Updated heartbeat for ${serviceName}:${instanceId}`);

    } else {
      this.registryRepository.register(
        serviceName,
        instanceId,
        host,
        port,
        lastHeartbeat,
      );

      logger.debug(`Registered new instance ${serviceName}:${instanceId}`);
    }
  }
}
