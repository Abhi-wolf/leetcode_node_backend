import express from "express";
import healthRouter from "./health.router";
import instanceRouter from "./instance.router";

const v1Router = express.Router();

v1Router.use("/api-gateway", instanceRouter);

v1Router.use("/health", healthRouter);

export default v1Router;
