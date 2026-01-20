import express from "express";
import { loginTeam, createTeam, loginUser, createAdmin} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginTeam);
router.post("/create-team", createTeam);
router.post("/login-user", loginUser);
router.post("/create-admin", createAdmin);

export default router;
