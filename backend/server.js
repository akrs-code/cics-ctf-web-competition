import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import submissionsRoutes from "./routes/submissionRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: "https://cics-ctf-competition-frontend.onrender.com",
  credentials: true,
}));

const server = http.createServer(app);
export const io = new Server(server, { cors: { origin: "https://cics-ctf-competition-frontend.onrender.com", credentials: true }, transports: ["polling", "websocket"], });

export const adminSockets = new Set();

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/attachments", express.static(path.join(process.cwd(), "attachments")));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB error:", err.message));

io.on("connection", async (socket) => {
  const token = socket.handshake.auth?.token;

  try {
    if (!token) {
      console.log("No token provided. Disconnecting:", socket.id);
      return socket.disconnect();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log("User not found. Disconnecting:", socket.id);
      return socket.disconnect();
    }
    if (user.role === "admin") {
      adminSockets.add(socket.id);
      console.log("Admin connected:", socket.id);
    } else {
      console.log(`Player connected: ${user.name} (${socket.id})`);
      socket.join("players");
      socket.join(`team_${user.teamId}`);
      console.log(`Socket ${socket.id} joined rooms: players, team_${user.teamId}`);
    }


  } catch (err) {
    console.log("Invalid token. Disconnecting:", socket.id);
    return socket.disconnect();
  }

  socket.on("disconnect", () => {
    adminSockets.delete(socket.id);
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
