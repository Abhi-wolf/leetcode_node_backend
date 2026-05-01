import express from "express";
import { validateQueryParams, validateRequestBody } from "../../validators";
import {
  updateProblemSchema,
  createProblemSchema,
  searchProblemsSchema,
} from "../../validators/problem.validator";
import { ProblemFactory } from "../../factories/problem.factory";
import { verifyHAMCSignature } from "../../middlewares/verifyHMACSignature";

// Create a new router instance
const problemRouter = express.Router();

// Get problem controller instance from factory
const problemController = ProblemFactory.getProblemController();

// POST /problems - Create a new problem
problemRouter.post(
  "/",
  verifyHAMCSignature,
  validateRequestBody(createProblemSchema),
  problemController.createProblem,
);

// GET /problems/search?q=query - Search problems by query
// /api/v1/problems/search?difficulty=easy&q=square
// /api/v1/problems/search?difficulty=easy&q=square&tags=array&tags=math
// we can also add filters in query params like difficulty and tags and to get all problems
problemRouter.get(
  "/search",
  verifyHAMCSignature,
  validateQueryParams(searchProblemsSchema),
  problemController.searchProblems,
);

// TODO: Add HMAC signature verification to get problem by ID (first fix the submission from where this endpoint is being called)
// GET /problems/:id - Get problem by ID
problemRouter.get("/:id", problemController.getProblemById);

// PUT /problems/:id - Update problem by ID
problemRouter.put(
  "/:id",
  verifyHAMCSignature,
  validateRequestBody(updateProblemSchema),
  problemController.updateProblem,
);

// DELETE /problems/:id - Delete problem by ID
problemRouter.delete("/:id",verifyHAMCSignature, problemController.deleteProblem);

export default problemRouter;
