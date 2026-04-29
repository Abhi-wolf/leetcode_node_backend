import logger from "../config/logger.config";

export interface ServiceInstance {
  instanceId: string;
  host: string;
  port: number;
  lastHeartbeat: Date;
}

export class RegistryRepository {
  private registry: Map<string, ServiceInstance[]> = new Map();

  register(
    serviceName: string,
    instanceId: string,
    host: string,
    port: number,
    lastHeartbeat: Date,
  ) {
    const serviceInstances = this.registry.get(serviceName) || [];
    serviceInstances.push({ instanceId, host, port, lastHeartbeat });
    this.registry.set(serviceName, serviceInstances);

    logger.info(`Registered ${serviceName} with instance ${instanceId}`);
    console.log(this.registry);
    return this.registry.get(serviceName);
  }

  getAllServices() {
    // return Array.from(this.registry.entries());
    return this.registry;
  }

  getServiceInstances(serviceName: string) {
    return this.registry.get(serviceName) || [];
  }

  updateServiceInstanceHeartbeat(
    serviceName: string,
    instanceId: string,
    date: Date,
  ) {
    const serviceInstances = this.registry.get(serviceName);

    if (serviceInstances) {
      const instance = serviceInstances.find(
        (instance) => instance.instanceId === instanceId,
      );
      if (instance) {
        instance.lastHeartbeat = date;
      }
    }
  }

  removeServiceInstance(serviceName: string, instanceId: string) {
    const serviceInstances = this.registry.get(serviceName);

    if (serviceInstances) {
      const instanceIndex = serviceInstances.findIndex(
        (instance) => instance.instanceId === instanceId,
      );
      if (instanceIndex !== -1) {
        serviceInstances.splice(instanceIndex, 1);
        this.registry.set(serviceName, serviceInstances);
      }
    }
  }
}
