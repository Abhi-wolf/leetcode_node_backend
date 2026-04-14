import { IProblem, ProblemDifficultyLevel } from "../models/problem.model";
import { IProblemRepository } from "../repositories/problem.repository";
import { NotFoundError } from "../utils/errors/app.error";
import { sanitizeMarkdown } from "../utils/markdown.sanitizer";
import {
  CreateProblemDto,
  UpdateProblemDto,
} from "../validators/problem.validator";

export interface IProblemService {
  createProblem(problem: CreateProblemDto): Promise<IProblem>;
  getProblemById(id: string): Promise<IProblem | null>;
  updateProblem(
    id: string,
    updateData: UpdateProblemDto,
  ): Promise<IProblem | null>;
  deleteProblem(id: string): Promise<boolean>;
  searchProblems(
    limit?: number,
    page?: number,
    query?: string,
    difficulty?: ProblemDifficultyLevel,
    tags?: string[],
  ): Promise<{ problems: IProblem[]; total: number; skipped: number }>;
}

export class ProblemService implements IProblemService {
  private problemRepository: IProblemRepository;

  /*
    Constructor to initialize the ProblemService with a ProblemRepository instance
   */
  constructor(problemRepository: IProblemRepository) {
    this.problemRepository = problemRepository;
  }

  /**
   * Sanitizes the problem data before creating or updating a problem
   * @param {Partial<IProblem>} problem - The problem data to sanitize
   * @returns {Promise<Partial<IProblem>>} The problem created or updated with sanitized description and editorial
   */
  // we will store data in markdown format, markdown can have html and js codes also
  // so we need to sanitize it before storing it in db to avoid xss attacks
  async createProblem(problem: CreateProblemDto): Promise<IProblem> {
    const sanitizedPayload = {
      ...problem,
      description: await sanitizeMarkdown(problem.description),
      editorial:
        problem.editorial && (await sanitizeMarkdown(problem.editorial)),
    };

    console.log("Sanitized payload:", sanitizedPayload);

    return await this.problemRepository.createProblem(sanitizedPayload);
  }

  /**
   * Finds a problem by its ID and throws an error if it doesn't exist
   * @param {string} id - The ID of the problem to find
   * @returns {Promise<IProblem | null>} The found problem document or null if not found
   */
  async getProblemById(id: string): Promise<IProblem | null> {
    const problem = await this.problemRepository.getProblemById(id);

    if (!problem) {
      throw new NotFoundError("Problem not found");
    }

    return problem;
  }

  /**
   * Updates a problem by its ID and throws an error if it doesn't exist
   * @param {string} id - The ID of the problem to update
   * @param {Partial<IProblem>} updateData - The data to update the problem with
   * @returns {Promise<IProblem | null>} The updated problem document or null if not found
   */
  async updateProblem(
    id: string,
    updateData: UpdateProblemDto,
  ): Promise<IProblem | null> {
    const problem = await this.problemRepository.getProblemById(id);

    if (!problem) {
      throw new NotFoundError("Problem not found");
    }

    const sanitizedPayload: Partial<IProblem> = {
      ...updateData,
    };

    if (updateData.description) {
      sanitizedPayload.description = await sanitizeMarkdown(
        updateData.description,
      );
    }

    if (updateData.editorial) {
      sanitizedPayload.editorial = await sanitizeMarkdown(updateData.editorial);
    }

    return await this.problemRepository.updateProblem(id, sanitizedPayload);
  }

  /**
   * Deletes a problem by its ID and throws an error if it doesn't exist
   * @param {string} id - The ID of the problem to delete
   * @returns {Promise<boolean>} True if the problem was deleted, false otherwise
   */
  async deleteProblem(id: string): Promise<boolean> {
    const problem = await this.problemRepository.getProblemById(id);

    if (!problem) {
      throw new NotFoundError("Problem not found");
    }

    return await this.problemRepository.deleteProblem(id);
  }

  /**
   * Finds all problems by their difficulty level
   * @param {string} query - The search query to find problems for
   * @param {object} filters - The filters to apply to the search (optional)
   * @param {ProblemDifficultyLevel} filters.difficulty - The difficulty level to filter by (optional)
   * @param {string[]} filters.tags - The tags to filter by (optional)
   * @returns {Promise<{ problems: IProblem[]; total: number , skipped: number }>} An array of found problems, the total count and the number of skipped problems
   */
  async searchProblems(
    limit: number = 10,
    page: number = 1,
    query?: string,
    difficulty?: ProblemDifficultyLevel,
    tags?: string[],
  ): Promise<{ problems: IProblem[]; total: number; skipped: number }> {
    const filters: {
      difficulty?: ProblemDifficultyLevel;
      tags?: string[];
    } = {};

    if (difficulty) {
      filters.difficulty = difficulty;
    }

    if (tags) {
      filters.tags = Array.isArray(tags) ? tags : [tags as string];
    }

    // ensures page is never < 1
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * limit;

    const searchResult = await this.problemRepository.searchProblems(
      limit,
      skip,
      query,
      filters,
    );

    return {
      problems: searchResult.problems,
      total: searchResult.total,
      skipped: skip,
    };
  }
}
