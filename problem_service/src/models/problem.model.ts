import mongoose, { Document } from "mongoose";

export interface ITestCase {
  input: string;
  output: string;
}

export interface IProblem extends Document {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: Date;
  updatedAt: Date;
  testcases: ITestCase[];
  tags?: string[]; // dp, graph, tree, etc.
  editorial?: string;
}

const testCaseSchema = new mongoose.Schema<ITestCase>(
  {
    input: {
      type: String,
      required: [true, "Input is required"],
      trim: true,
    },
    output: {
      type: String,
      required: [true, "Output is required"],
      trim: true,
    },
  },
  {
    toJSON: {
      transform: (_, ret: any) => {
        delete ret.__v;
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
    // _id: false,   // if we don't want separate ids for test cases
  },
);

const problemSchema = new mongoose.Schema<IProblem>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxLength: [100, "Title cannot exceed 100 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: {
        values: ["easy", "medium", "hard"],
        message: "Invalid difficulty level",
      },
      required: [true, "Difficulty is required"],
    },
    editorial: {
      type: String,
      trim: true,
    },

    testcases: [testCaseSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, record) => {
        delete (record as any).__v;
        record.id = record._id;
        delete (record as any)._id;

        return record;
      },
    },
  },
);

problemSchema.index({ title: 1 }, { unique: true });
problemSchema.index({ difficulty: 1 });

export const Problem = mongoose.model<IProblem>("Problem", problemSchema);
