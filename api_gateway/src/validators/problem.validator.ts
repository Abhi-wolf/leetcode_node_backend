import { z } from "zod";
import { ProblemDifficultyLevel } from "../models/problem.model";

export const createProblemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).optional(),
  editorial: z.string().optional(),
  difficulty: z.nativeEnum(ProblemDifficultyLevel),
  testcases: z.array(
    z.object({
      input: z
        .string()
        .min(1, "Input is required")
        .max(5000, "Input cannot exceed 5000 characters"),
      output: z
        .string()
        .min(1, "Output is required")
        .max(5000, "Output cannot exceed 5000 characters"),
    }),
  ),
});

export const updateProblemSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  tags: z.array(z.string()).optional(),
  editorial: z.string().optional(),
  difficulty: z.nativeEnum(ProblemDifficultyLevel),
  testcases: z
    .array(
      z.object({
        input: z
          .string()
          .min(1, "Input is required")
          .max(5000, "Input cannot exceed 5000 characters"),
        output: z
          .string()
          .min(1, "Output is required")
          .max(5000, "Output cannot exceed 5000 characters"),
      }),
    )
    .optional(),
});

export const searchProblemsSchema = z.object({
  limit: z.number().optional(),
  page: z.number().optional(),
  q: z.string().optional(),
  difficulty: z.nativeEnum(ProblemDifficultyLevel).optional(),
  tags: z
    .union([
      z.array(z.string()), // ✅ handles ?tags=a&tags=b (express parses as array)
      z.string().transform((val) => val.split(",")), // ✅ handles ?tags=a,b,c
    ])
    .optional(),
});

export type CreateProblemDto = z.infer<typeof createProblemSchema>;
export type UpdateProblemDto = z.infer<typeof updateProblemSchema>;
