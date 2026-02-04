import { NextFunction, Request, Response } from "express";
import { ProblemService } from "../services/problem.service";
import { ProblemRepository } from "../repositories/problem.repository";

const problemRepository = new ProblemRepository();
const problemService = new ProblemService(problemRepository);

export const ProblemController = {
  async createProblem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const problem = await problemService.createProblem(req.body);

    res.status(201).json({
      success: true,
      message: "Problem created successfully",
      data: problem,
    });
  },

  async getProblemById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const problem = await problemService.getProblemById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Problem fetched successfully",
      data: problem,
    });
  },

  async getAllProblems(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { problems, total } = await problemService.getAllProblems();

    res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      data: { problems, total },
    });
  },

  async updateProblem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const problem = await problemService.updateProblem(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      data: problem,
    });
  },

  async deleteProblem(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    await problemService.deleteProblem(req.params.id);

    res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
    });
  },

  async findByDifficulty(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const difficulty = req.params.difficulty as "easy" | "medium" | "hard";
    const problems = await problemService.findByDifficulty(difficulty);

    res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      data: problems,
    });
  },

  async searchProblems(req: Request, res: Response): Promise<void> {
    const query = req.query.q as string;

    const problems = await problemService.searchProblems(query);

    res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      data: problems,
    });
  },
};
