import { z } from "zod";

export const createProblemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).optional(),
  editorial: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  testcases: z.array(
    z.object({
      input: z.string(),
      output: z.string(),
    }),
  ),
});

export const updateProblemSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  tags: z.array(z.string()).optional(),
  editorial: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  testcases: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
      }),
    )
    .optional(),
});

export const findByDifficultySchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]),
});

export type CreateProblemDto = z.infer<typeof createProblemSchema>;
export type UpdateProblemDto = z.infer<typeof updateProblemSchema>;
