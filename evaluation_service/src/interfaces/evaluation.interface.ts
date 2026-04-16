export interface TestCase {
  id: string;
  input: string;
  output: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  diffculty: string;
  editorial?: string;
  testcases: TestCase[];
  createdAt: string;
  updatedAt: string;
}
export interface EvaluationJob {
  submissionId: string;
  code: string;
  language: "python" | "cpp";
  problem: Problem;
  correlationId:string
}

export interface EvaluationResult {
  status: string;
  output: string | undefined;
}
