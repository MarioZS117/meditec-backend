import axios from "axios";
import { getConnection } from "../models/connectionMongo.js"; 
export const getPacienteIdByName = async (req, res) => {
  try {
    const { nombre } = req.params;

    if (!nombre) {
      return res.status(400).json({ message: "El nombre del paciente es requerido" });
    }

    const database = await getConnection();

    // Buscar el paciente por nombre en la colección 'pacientes'
    const paciente = await database.collection('pacientes').findOne({ nombre });

    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    res.status(200).json({ pacienteId: paciente._id });
  } catch (error) {
    console.error("Error en getPacienteIdByName", error);
    res.status(500).json({ message: "Error al obtener el ID del paciente", error: error.message });
  }
};

export const addCompleteData = async (req, res) => {
  try {
    const { 
      nombrePaciente, 
      fechaLugar, 
      motivoConsulta, 
      examenFisico, 
      diagnostico, 
      tratamiento, 
      recomendaciones 
    } = req.body;

    // Validar que el nombre del paciente esté presente
    if (!nombrePaciente) {
      return res.status(400).json({ message: "El nombre del paciente es requerido" });
    }

    const database = await getConnection();

    // Obtener el ID del paciente utilizando el nombre
    const paciente = await database.collection('pacientes').findOne({ nombre: nombrePaciente });

    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    // Recuperar datos de la historia clínica desde el microservicio de historiales
    const historialUrl = `http://localhost:3001/historiales/resumen/${paciente._id}`;
    let historiaClinica;

    try {
      const response = await axios.get(historialUrl);
      historiaClinica = response.data;
    } catch (error) {
      console.error("Error al recuperar la historia clínica", error);
      return res.status(500).json({ message: "Error al recuperar la historia clínica", error: error.message });
    }

    // Combinar todos los datos en un solo objeto
    const notaCompleta = {
      pacienteId: paciente._id, // Agregar el ID del paciente
      datosPaciente: {
        nombre: nombrePaciente,
        ...historiaClinica.datosPaciente // Datos adicionales del historial
      },
      fechaLugar: fechaLugar || {
        fecha: new Date(),
        lugar: null
      },
      motivoConsulta,
      historiaClinica: historiaClinica || {
        antecedentesPersonales: null,
        antecedentesFamiliares: null,
        otros: null
      },
      examenFisico: examenFisico || {
        general: null,
        cabeza: null,
        cuello: null,
        torax: null,
        abdomen: null,
        extremidades: null
      },
      diagnostico: diagnostico || null,
      tratamiento: tratamiento || null,
      recomendaciones: recomendaciones || null,
      fechaCreacion: new Date() // Agregar una marca de tiempo
    };

    // Insertar el documento completo en la colección 'notas-medicas'
    const result = await database.collection('notas-medicas').insertOne(notaCompleta);

    res.status(201).json({ message: "Nota médica agregada correctamente", notaId: result.insertedId });
  } catch (error) {
    console.error("Error en addCompleteData", error);
    res.status(500).json({ message: "Error al agregar la nota médica", error: error.message });
  }
};