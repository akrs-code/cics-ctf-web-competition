import Submission from "../models/Submission.js";
import Team from "../models/Team.js";
import User from "../models/User.js";
import Question from "../models/Question.js";
import { io, adminSockets } from "../server.js";

export const submitFlag = async (req, res) => {
  try {
    const userId = req.userId;
    const teamId = req.teamId;
    const { questionId, submittedFlag } = req.body;

    if (!questionId || !submittedFlag) {
      return res.status(400).json({ error: "questionId and submittedFlag are required" });
    }
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    if (team.completedQuestions.some(q => q.toString() === questionId)) {
      return res.status(400).json({ error: "Question already solved by your team" });
    }
    const isCorrect =
      String(submittedFlag).trim() === String(question.flag).trim();

    const points = isCorrect ? question.points : 0;
    await Submission.create({
      userId,
      teamId,
      questionId,
      submittedFlag,
      correct: isCorrect,
      pointsEarned: points
    });

    if (isCorrect) {
      team.score += points;
      team.completedQuestions.push(questionId);
      await team.save();

      await User.findByIdAndUpdate(userId, {
        $inc: { score: points }
      });

      io.to(`team_${teamId}`).emit("questionSolved", {
        questionId,
        userId,
        points,
        teamScore: team.score
      });

      const teamLeaderboard = await Team.find({})
        .select("name score")
        .sort({ score: -1 });

      const userLeaderboard = await User.find({})
        .select("name score teamId")
        .sort({ score: -1 });

      const latestSubmission = await Submission.findOne({})
        .sort({ createdAt: -1 })
        .populate("userId", "name")
        .populate("teamId", "name")
        .populate("questionId", "title");

      adminSockets.forEach(socketId => {
        io.to(socketId).emit("leaderboardUpdate", {
          teams: teamLeaderboard,
          users: userLeaderboard,
          latestSubmission
        });
      });

      return res.status(200).json({
        message: "Correct flag! Points awarded.",
        pointsEarned: points
      });
    }
    return res.status(200).json({
      message: "Incorrect flag. Try again!",
      pointsEarned: 0
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




export const getAllSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({})
            .populate("userId", "name")
            .populate("teamId", "name")
            .populate("questionId", "title")
            .sort({ createdAt: -1 });
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getLeaderboard = async (req, res) => {
    try {
        const teams = await Team.find({})
            .select("name score completedQuestions")
            .sort({ score: -1 });

        const users = await User.find({})
            .select("name score teamId")
            .populate("teamId", "name")
            .sort({ score: -1 });

        res.json({ teams, users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
