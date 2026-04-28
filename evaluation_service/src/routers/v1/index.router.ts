import express from "express";
import healthRouter from "./health.router";

const v1Router = express.Router();

v1Router.use("/health", healthRouter);

// TODO: remove this (this is only for testing)
v1Router.get("/evaluate", (req, res) => {
  res.status(200).json({ message: "Evaluate endpoint" });
});

export default v1Router;
