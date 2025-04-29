import express from 'express';
const router = express.Router();
import { createWordDocument, addCompleteData } from '../controllers/histoController.js';
router.post('/add-complete-data', addCompleteData);
router.get('/create-word/:pacienteId', createWordDocument);

export default router;