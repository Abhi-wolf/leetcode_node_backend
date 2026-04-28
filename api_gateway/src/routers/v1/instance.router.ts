import express from "express";
import { InstanceFactory } from "../../factories/instance.factory";

const instanceRouter = express.Router();

const instanceController = InstanceFactory.getInstanceController();

// instanceRouter.post("/", instanceController.addServiceInstance);
instanceRouter.get("/", instanceController.getAllServices);

export default instanceRouter;
