import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    score: { type: Number, default: 0 },
    completedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }]
});

export default mongoose.model("Team", TeamSchema);
