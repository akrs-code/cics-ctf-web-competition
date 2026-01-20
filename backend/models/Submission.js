import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  submittedFlag: { type: String, required: true },
  correct: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Submission", SubmissionSchema);
