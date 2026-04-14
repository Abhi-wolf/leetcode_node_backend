import { Request, Response } from "express";
import { IProblemService } from "../services/problem.service";
import { ProblemDifficultyLevel } from "../models/problem.model";

export class ProblemController {
  private problemService: IProblemService;

  /*
    Constructor to initialize the ProblemController with a ProblemService instance
   */
  constructor(problemService: IProblemService) {
    this.problemService = problemService;
  }

  /**
   * Creates a new problem
   * @param {Request} req - The request object containing the problem data in the body
   * @param {Response} res - The response object to send the response
   */
  createProblem = async (req: Request, res: Response): Promise<void> => {
    const problem = await this.problemService.createProblem(req.body);

    res.status(201).json({
      success: true,
      message: "Problem created successfully",
      data: problem,
    });
  };

  /**
   * Finds a problem by its ID
   * @param {Request} req - The request object containing the problem ID in the params
   * @param {Response} res - The response object to send the response
   */
  getProblemById = async (req: Request, res: Response): Promise<void> => {
    const problem = await this.problemService.getProblemById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Problem fetched successfully",
      data: problem,
    });
  };

  /**
   * Updates a problem by its ID
   * @param {Request} req - The request object containing the problem ID in the params and the update data in the body
   * @param {Response} res - The response object to send the response
   */
  updateProblem = async (req: Request, res: Response): Promise<void> => {
    const problem = await this.problemService.updateProblem(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      data: problem,
    });
  };

  /**
   * Deletes a problem by its ID
   * @param {Request} req - The request object containing the problem ID in the params
   * @param {Response} res - The response object to send the response
   */
  deleteProblem = async (req: Request, res: Response): Promise<void> => {
    await this.problemService.deleteProblem(req.params.id);

    res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
    });
  };

  /**
   * Finds all problems by their difficulty level
   * @param {Request} req - The request object containing the search query in the query parameters
   * @param {Response} res - The response object to send the response
   */
  searchProblems = async (req: Request, res: Response): Promise<void> => {
    const query = req.query.q as string;

    // Parse limit and offset from query parameters (base 10),
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;
    const page = req.query.page
      ? parseInt(req.query.page as string, 10)
      : undefined;

    const difficulty = req.query.difficulty as
      | ProblemDifficultyLevel
      | undefined;

    const tags = req.query.tags as string[] | undefined;

    const problems = await this.problemService.searchProblems(
      limit,
      page,
      query,
      difficulty,
      tags,
    );

    res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      data: problems,
    });
  };
}
