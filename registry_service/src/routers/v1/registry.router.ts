import express from "express";
import { RegistryFactory } from "../../factories/registry.factory";

const registeryRouter = express.Router();

const registryController = RegistryFactory.getRegistryController();

registeryRouter.post("/", registryController.registerService);
registeryRouter.get("/", registryController.getAllServices);

export default registeryRouter;
