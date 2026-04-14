import {
  IProblem,
  Problem,
  ProblemDifficultyLevel,
} from "../models/problem.model";

export interface IProblemRepository {
  createProblem(problem: Partial<IProblem>): Promise<IProblem>;
  getProblemById(id: string): Promise<IProblem | null>;
  updateProblem(
    id: string,
    updateData: Partial<IProblem>,
  ): Promise<IProblem | null>;
  deleteProblem(id: string): Promise<boolean>;
  searchProblems(
    limit: number,
    page: number,
    searchQuery?: string,
    filters?: {
      difficulty?: ProblemDifficultyLevel;
      tags?: string[];
    },
  ): Promise<{ problems: IProblem[]; total: number }>;
}

export class ProblemRepository implements IProblemRepository {
  /**
   * Creates a new problem in the database
   * @param {Partial<IProblem>} problem - The problem data to create
   * @returns {Promise<IProblem>} The created problem document
   */
  async createProblem(problem: Partial<IProblem>): Promise<IProblem> {
    const newProblem = new Problem(problem);
    return await newProblem.save();
  }

  /**
   * Finds a problem by its ID
   * @param {string} id - The ID of the problem to find
   * @returns {Promise<IProblem | null>} The found problem document or null if not found
   */
  async getProblemById(id: string): Promise<IProblem | null> {
    return await Problem.findById(id);
  }

  /**
   * Updates a problem by its ID
   * @param {string} id - The ID of the problem to update
   * @param {Partial<IProblem>} updateData - The data to update the problem with
   * @returns {Promise<IProblem | null>} The updated problem document or null if not found
   */
  async updateProblem(
    id: string,
    updateData: Partial<IProblem>,
  ): Promise<IProblem | null> {
    // by default, findByIdAndUpdate returns the old document
    // so we set new: true to get the updated document
    return await Problem.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * Deletes a problem by its ID
   * @param {string} id - The ID of the problem to delete
   * @returns {Promise<boolean>} True if the problem was deleted, false otherwise
   */
  async deleteProblem(id: string): Promise<boolean> {
    const result = await Problem.findByIdAndDelete(id);
    return result !== null;
  }

  /**
   * Finds all problems by their difficulty level and search query
   * @param {number} limit - The maximum number of problems to return
   * @param {number} page - The page number for pagination (1-based index)
   * @param {string} query - The search query to find problems for (optional)
   * @param {object} filters - The filters to apply to the search (optional)
   * @param {ProblemDifficultyLevel} filters.difficulty - The difficulty level to filter by (optional)
   * @param {string[]} filters.tags - The tags to filter by (optional)
   * @returns {Promise<{ problems: IProblem[]; total: number; skipped: number }>} An array of found problems, the total count and the number of skipped problems
   */
  async searchProblems(
    limit: number,
    page: number,
    searchQuery?: string,
    filters?: {
      difficulty?: ProblemDifficultyLevel;
      tags?: string[];
    },
  ): Promise<{ problems: IProblem[]; total: number }> {
    const query: any = {};

    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ];
    }

    if (filters?.difficulty) {
      query.difficulty = filters.difficulty;
    }

    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    const [problems, total] = await Promise.all([
      Problem.find(query).skip(page).limit(limit),
      Problem.countDocuments(query),
    ]);
    return { problems, total };
  }
}
