import { Schema, model } from "mongoose";

const marksSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  name:{type:String},
  email:{type:String},
  prn:{type:String},
  test_id: { type: Schema.Types.ObjectId, ref: "Test" },
  marks_obtained: { type: Number },
  question_appeared: [
    {
      your_answer: { type: String },
      correct_answer: { type: String },
      mark: { type: Number },
    },
  ],
});

const Marks = model("Marks", marksSchema);
export default Marks;
