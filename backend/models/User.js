import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },

  password: {
    type: String,
    required: function () {
      return this.role === "admin";
    }
  },

  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  score: { type: Number, default: 0 },
  role: { type: String, enum: ["player", "admin"], default: "player" }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
