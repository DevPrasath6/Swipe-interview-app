import express from 'express';
import { parse, parseUpload } from '../controllers/resume.controller.js';

const router = express.Router();

router.post('/parse', parseUpload, parse);

export default router;
