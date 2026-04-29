import { InstanceFactory } from "../factories/instance.factory";

const instanceService = InstanceFactory.getInstanceService();

export function startCacheRefresher() {
  setInterval(() => {
    instanceService.cleanupStaleInstances();
  }, 300000); // every 5 minutes
}
