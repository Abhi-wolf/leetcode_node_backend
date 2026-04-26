import express from "express";
import authRouter from "./auth.router";
import healthRouter from "./health.router";

const v1Router = express.Router();

v1Router.use("/auth", authRouter);

v1Router.use("/health", healthRouter);

export default v1Router;
