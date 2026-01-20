import Question from "../models/Question.js";
import fs from "fs";
import path from "path";

export const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({});
    res.json({questions});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { title, description, flag, points, category, attachmentsFolder } = req.body;

    if (!title || !description || !flag || !points) {
      return res.status(400).json({ error: "title, description, flag, and points are required" });
    }

    let attachments = [];

    if (attachmentsFolder) {
      const folderPath = path.join(process.cwd(), "attachments", attachmentsFolder);
      if (fs.existsSync(folderPath)) {
        attachments = fs.readdirSync(folderPath).map(
          (file) => `attachments/${attachmentsFolder}/${file}`
        );
      }
    }

    const question = await Question.create({
      title,
      description,
      flag,
      points,
      attachments,
      category: category || "General",
    });

      req.io.to("players").emit("newQuestion", question);

    res.status(201).json({ message: "Question created successfully", question });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
