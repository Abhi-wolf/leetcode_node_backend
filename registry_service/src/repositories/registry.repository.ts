import logger from "../config/logger.config";

export interface ServiceInstance {
    instanceId: string;
    host: string;
    port: number;
    lastHeartbeat: Date;
}


export class RegistryRepository {
    private registry: Map<string, ServiceInstance[]> = new Map();
   
    register(serviceName: string, instanceId: string,host: string, port: number,lastHeartbeat: Date) {
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
        return this.registry.get(serviceName);
    }
}

