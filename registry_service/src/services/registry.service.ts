import logger from "../config/logger.config";
import { RegistryRepository } from "../repositories/registry.repository";
import { BadRequestError } from "../utils/errors/app.error";

export class RegistryService {
  private readonly HEARTBEAT_TIMEOUT = 60_000; // 60 seconds
  constructor(private registryRepository: RegistryRepository) {}

  private verifyServiceSignature() {
    return true;
  }

  cleanupStaleInstances() {
    const now = Date.now();

    const allServices = this.registryRepository.getAllServices();

    for (const [serviceName, instances] of allServices.entries()) {
      const inActiveInstances = instances.filter(
        (instance) =>
          now - new Date(instance.lastHeartbeat).getTime() <
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
    const isSignatureValid = this.verifyServiceSignature();

    if (!isSignatureValid) {
      throw new BadRequestError("Invalid service signature");
    }

    const serviceInstances =
      this.registryRepository.getServiceInstances(serviceName);

    const isAlreadyPresent = serviceInstances?.some(
      (instance) => instance.instanceId === instanceId,
    );

    if (isAlreadyPresent) {
      console.log("INSTANCE ALREADY PRESENT");
      throw new BadRequestError("Service Instance already registered");
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
    const result = this.registryRepository.getServiceInstances(serviceName);

    return result || [];
  }

  updateServiceInstanceHeartbeat(
    serviceName: string,
    instanceId: string,
    host: string,
    port: number,
  ) {

    const serviceInstances=this.registryRepository.getServiceInstances(serviceName);


     const instanceIndex = serviceInstances?.findIndex(
        (instance) => instance.instanceId === instanceId,
      );

      const lastHeartbeat = new Date();

    // found the instance
    if (instanceIndex !== -1) {
      this.registryRepository.updateServiceInstanceHeartbeat(
        serviceName,
        instanceId,
        lastHeartbeat
      );

      logger.debug(`Updated heartbeat for ${serviceName}:${instanceId}`);
    }else {
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
