import express from 'express';
const router = express.Router();
import { addCompleteData } from '../controllers/notaController.js';
router.post('/add-complete-data', addCompleteData);

export default router;