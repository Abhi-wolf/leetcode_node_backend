import express from "express";
import submissionRouter from "./submission.router";

const v1Router = express.Router();

v1Router.use("/submissions", submissionRouter);

v1Router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default v1Router;
