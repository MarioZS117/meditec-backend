import express from 'express';
const router = express.Router();
import { createWordDocument,  addPaciente, getResumenHistoriaClinica} from '../controllers/histoController.js';

router.post("/addPaciente",addPaciente)
router.get('/create-word/:pacienteId', createWordDocument);
router.get('/resumen/:pacienteId', getResumenHistoriaClinica);


export default router;