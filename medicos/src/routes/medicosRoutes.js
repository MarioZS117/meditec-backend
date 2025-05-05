import express from 'express';
import { loginMedico, registroMedico } from '../controllers/medicosController.js';

const router = express.Router();

// Ruta para obtener todos los médicos
router.post('/login', loginMedico)

// Ruta para obtener un médico por ID
//router.get('/:id', medicosController.getMedicoById);

// Ruta para crear un nuevo médico
router.post('/registro', registroMedico);

// Ruta para actualizar un médico por ID
// router.put('/:id', medicosController.updateMedico);

// Ruta para eliminar un médico por ID
// router.delete('/:id', medicosController.deleteMedico);

export default router;