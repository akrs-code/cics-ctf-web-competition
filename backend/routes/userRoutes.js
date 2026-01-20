import express from 'express';
import { createUser, getUsersByTeam, getUserById } from '../controllers/userController.js';

const router = express.Router();

router.post("/create", createUser);
router.get("/by-team", getUsersByTeam);
router.get("/by-id/:userid", getUserById);


export default router;