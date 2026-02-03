import { ITestCase } from "../models/problem.model";

export interface CreateProblemDto {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  testCases: ITestCase[];
  tags?: string[];
  editorial?: string;
}

export interface UpdateProblemDto {
  title?: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
  testCases?: ITestCase[];
  tags?: string[];
  editorial?: string;
}
