import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyTeamUser = async (req, res, next) => {
  try {
  
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }


    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

  
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

   
    if (!user.teamId) {
      return res.status(403).json({ error: "User is not assigned to a team" });
    }

    req.user = user;
    req.userId = user._id;
    req.teamId = user.teamId;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
