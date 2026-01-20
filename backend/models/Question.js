import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  title: String,
  description: String,
  flag: String,
  points: Number,
  attachments: [{ type: String }],
  category: { type: String, default: "General" }
});

export default mongoose.model("Question", QuestionSchema);
