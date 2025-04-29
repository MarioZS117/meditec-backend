const express = require('express');
const histoController = require('../controllers/histoController');

const router = express.Router();

// Define routes and connect them to the controller
router.get('/', histoController.getAllHistoriales);
router.get('/:id', histoController.getHistorialById);
router.post('/', histoController.createHistorial);
router.put('/:id', histoController.updateHistorial);
router.delete('/:id', histoController.deleteHistorial);

module.exports = router;