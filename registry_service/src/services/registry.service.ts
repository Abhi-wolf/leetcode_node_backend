import { RegistryRepository } from "../repositories/registry.repository";
import { BadRequestError } from "../utils/errors/app.error";

export class RegistryService {
  constructor(private registryRepository: RegistryRepository) {}

  private verifyServiceSignature() {
    return true;
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
}
