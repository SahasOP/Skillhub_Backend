import { Schema, model } from "mongoose";

const questionSchema = new Schema({
  type: {
    type: String,
    enum: ["mcq", "directAnswer"],
    required: true,
    default: "mcq",
  },
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
    }
  ],
  correctAnswer: {
    type: String,
    required: true,
  },
  marks: {
    type: String,
    default: 0,
  },
});

const testSchema = new Schema({
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  teacherName: {
    type: String,
  },
  Students_appeared: [
    {
      student: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      email: String,
      prn: String,
      marks_obtained: Number,
      dateofgiving: String,
    },
  ],
  average_score: {
    type: Number,
    default: 0,
  },
  Students_alloted: [
    {
      student: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    }
  ],
  subject: {
    type: String,
  },
  testName: {
    type: String,
    required: true,
  },
  testDate: {
    type: String,
    required: true,
  },
  testTime: {
    type: String,
    required: true,
  },
  testCreationDate: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  instructions: {
    type: String,
    required: true,
  },
  questions: [questionSchema],
  passingMarks: {
    type: Number,
    default: 0,
  },
  marksPerQuestion: {
    type: Number,
    default: 0,
  },
  totalMarks: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps automatically
});

const Test = model("Test", testSchema);

export default Test;
