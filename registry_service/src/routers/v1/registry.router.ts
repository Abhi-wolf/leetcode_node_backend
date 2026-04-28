import express from "express";
import { RegistryFactory } from "../../factories/registry.factory";

const registeryRouter = express.Router();

const registryController = RegistryFactory.getRegistryController();

registeryRouter.post("/", registryController.registerService);
registeryRouter.get("/discover", registryController.getAllServices);
registeryRouter.get("/discover/:serviceName", registryController.getServiceInstances);
registeryRouter.put("/heartbeat", registryController.updateServiceInstanceHeartbeat);

export default registeryRouter;
