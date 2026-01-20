import express from 'express';
import { submitFlag, getLeaderboard, getAllSubmissions } from '../controllers/submissionsController.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import { verifyTeamUser } from '../middleware/verifyTeamUser.js';

const router = express.Router();

router.post('/submit', verifyTeamUser, submitFlag); 
router.get("/leaderboard", verifyAdmin, getLeaderboard);
router.get("/allsubmissions", verifyAdmin, getAllSubmissions);

export default router;
