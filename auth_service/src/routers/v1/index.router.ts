import express from "express";
import authRouter from "./auth.router";

const v1Router = express.Router();

v1Router.use("/auth", authRouter);

v1Router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default v1Router;
