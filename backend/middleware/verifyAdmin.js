// middleware/verifyAdmin.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "No token provided" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user || user.role !== "admin") return res.status(403).json({ error: "Admin access only" });

        req.userId = user._id;
        req.role = user.role;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};
