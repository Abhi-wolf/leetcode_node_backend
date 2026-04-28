import { InstanceFactory } from "../factories/instance.factory";

const instanceService = InstanceFactory.getInstanceService();

export function startCacheRefresher() {
  setInterval(() => {
    instanceService.cleanupStaleInstances();
  }, 40_000); // every 40s
}
