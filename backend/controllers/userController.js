import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const createUser = async (req, res) => {
  try {
    const { name, teamId } = req.body;

    if (!name || !teamId) {
      return res.status(400).json({ error: "Name and teamId are required" });
    }

    let user = await User.findOne({ name, teamId });

    if (user) {
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
      );

      return res.status(200).json({
        message: "User reconnected",
        token,
        user: {
          id: user._id,
          name: user.name,
          teamId: user.teamId,
          role: user.role,
          score: user.score
        }
      });
    }

    const teamUsersCount = await User.countDocuments({ teamId });
    if (teamUsersCount >= 4) {
      return res.status(400).json({ error: "Team is full" });
    }

    user = await User.create({
      name,
      teamId,
      role: "player",
      score: 0
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.status(201).json({
      message: "User created and logged in",
      token,
      user: {
        id: user._id,
        name: user.name,
        teamId: user.teamId,
        role: user.role,
        score: user.score
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getUsersByTeam = async (req, res) => {
    try {
        const { teamId } = req.query;
        const users = await User.find({ teamId });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


export const getUserById = async (req, res) => {
    try {
        const { userid } = req.params;
        const user = await User.findById(userid);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}