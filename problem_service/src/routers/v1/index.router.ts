import express from "express";
import problemRouter from "./problem.router";
import healthRouter from "./health.router";

const v1Router = express.Router();

v1Router.use("/problems", problemRouter);

v1Router.use("/health", healthRouter);

export default v1Router;
