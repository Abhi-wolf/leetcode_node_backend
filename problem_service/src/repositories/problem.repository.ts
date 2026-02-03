import { IProblem, Problem } from "../models/problem.model";

export interface IProblemRepository {
  createProblem(problem: Partial<IProblem>): Promise<IProblem>;
  getProblemById(id: string): Promise<IProblem | null>;
  getAllProblems(): Promise<{ problems: IProblem[]; total: number }>;
  updateProblem(
    id: string,
    updateData: Partial<IProblem>,
  ): Promise<IProblem | null>;
  deleteProblem(id: string): Promise<boolean>;
  findProblemsByDifficulty(
    difficulty: "easy" | "medium" | "hard",
  ): Promise<IProblem[]>;
  searchProblems(query: string): Promise<IProblem[]>;
}

export class ProblemRepository implements IProblemRepository {
  async createProblem(problem: Partial<IProblem>): Promise<IProblem> {
    const newProblem = new Problem(problem);
    return await newProblem.save();
  }

  async getProblemById(id: string): Promise<IProblem | null> {
    return await Problem.findById(id);
  }

  async getAllProblems(): Promise<{ problems: IProblem[]; total: number }> {
    const problems = await Problem.find();
    const total = await Problem.countDocuments();
    return { problems, total };
  }

  async updateProblem(
    id: string,
    updateData: Partial<IProblem>,
  ): Promise<IProblem | null> {
    // by default, findByIdAndUpdate returns the old document
    // so we set new: true to get the updated document
    return await Problem.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteProblem(id: string): Promise<boolean> {
    const result = await Problem.findByIdAndDelete(id);
    return result !== null;
  }

  async findProblemsByDifficulty(
    difficulty: "easy" | "medium" | "hard",
  ): Promise<IProblem[]> {
    return await Problem.find({ difficulty });
  }

  async searchProblems(query: string): Promise<IProblem[]> {
    return await Problem.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });
  }
}
