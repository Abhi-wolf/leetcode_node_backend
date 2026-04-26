import express from "express";
import submissionRouter from "./submission.router";
import healthRouter from "./health.router";

const v1Router = express.Router();

v1Router.use("/submissions", submissionRouter);

v1Router.use("/health", healthRouter);

export default v1Router;
