import express from "express";
import { RegistryFactory } from "../../factories/registry.factory";
import { verifyHAMCSignature } from "../../middlewares/verifyHMACSingnature";

const registeryRouter = express.Router();

const registryController = RegistryFactory.getRegistryController();

registeryRouter.post("/",verifyHAMCSignature, registryController.registerService);
registeryRouter.get("/discover", registryController.getAllServices);
registeryRouter.post("/discover/:serviceName",verifyHAMCSignature, registryController.getServiceInstances);
registeryRouter.put("/heartbeat", verifyHAMCSignature,registryController.updateServiceInstanceHeartbeat);

export default registeryRouter;
