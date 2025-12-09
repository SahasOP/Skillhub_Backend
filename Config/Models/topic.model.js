import { Schema, model } from "mongoose";

// Question schema supporting descriptive and MCQ types
const questionSchema = new Schema({
  type: {
    type: String,
    enum: ["descriptive", "mcq"],
    default: "descriptive",
  },
  problem: { type: String, required: true },
  practice: { type: String, required: true },
  difficulty: { type: String, required: true },
  // For MCQ type:
  options: [{ type: String }],
  correctAnswer: { type: String },
  // Optional: timeComplexity, spaceComplexity, category, etc
}, { timestamps: true });

// Topic schema: nested inside category
const topicSchema = new Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  color: { type: String, required: true },
  questions: [questionSchema],
}, { timestamps: true });

// Category schema with nested topics
const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  topics: [topicSchema],
}, { timestamps: true });

const Category = model("Category", categorySchema);
const Topic = model("Topic", topicSchema); // In case you need separate access — optional

export { Category, Topic };
