import express from "express";
import problemRouter from "./problem.router";

const v1Router = express.Router();

v1Router.use("/problems", problemRouter);

v1Router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default v1Router;
