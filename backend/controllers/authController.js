import Team from "../models/Team.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginTeam = async (req, res) => {
  try {
    const { name, code } = req.body;
    const team = await Team.findOne({ name });

    if (!team) return res.status(404).json({ error: "Team not found" });
    if (team.code !== code) return res.status(401).json({ error: "Invalid code" });

    res.json({
      team: {
        _id: team._id,
        name: team.name,
        score: team.score,
        completedQuestions: team.completedQuestions
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const loginUser = async (req, res) => {
    try {
        const { name, password } = req.body;
        const user = await User.findOne({ name });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "12h" }
        );

        res.json({ 
            token, 
            user: { id: user._id, name: user.name, role: user.role, teamId: user.teamId } 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const createTeam = async (req, res) => {
    try {
        const { name, code } = req.body;
        if (!name || !code) return res.status(400).json({ error: "Team name and code are required" });

        const existingTeam = await Team.findOne({ name });
        if (existingTeam) return res.status(400).json({ error: "Team already exists" });

        const team = await Team.create({ name, code });
        res.status(201).json({ message: "Team created successfully", team });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: "Name and password are required" });
    }

    const existingAdmin = await User.findOne({ name, role: "admin" });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin with this name already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // salt rounds = 10

    const admin = await User.create({
      name,
      password: hashedPassword,
      role: "admin",
      score: 0
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};