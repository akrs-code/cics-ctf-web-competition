import express from 'express';
import { getQuestions, createQuestion } from '../controllers/questionController.js';

const router = express.Router();

router.post('/create', createQuestion); 
router.get("/", getQuestions);

export default router;