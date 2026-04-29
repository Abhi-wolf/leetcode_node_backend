import express from "express";
import healthRouter from "./health.router";
import registryRouter from "./registry.router";

const v1Router = express.Router();

v1Router.use("/service-registry/health", healthRouter);
v1Router.use("/service-registry", registryRouter);


export default v1Router;
