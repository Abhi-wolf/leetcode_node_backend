import express from "express";

const v1Router = express.Router();

v1Router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default v1Router;
