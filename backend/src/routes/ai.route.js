import express from 'express';
import { generate, grade, generateSummary } from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/generate', generate);
router.post('/grade', grade);
router.post('/summary', generateSummary);

export default router;
