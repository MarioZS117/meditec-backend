import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import expressions from "docxtemplater/expressions.js"; // <<--- Agregado
import { getConnection } from "../models/connectionMongo.js"; 
import { ObjectId } from "mongodb";

export const getResumenHistoriaClinica = async (req, res) => {
  try {
    // Obtener el ID del paciente desde los parámetros
    const { pacienteId } = req.params;

    // Validar que se haya proporcionado un ID
    if (!pacienteId) {
      return res.status(400).json({ message: "El ID del paciente es requerido" });
    }

    const database = await getConnection();

    // Buscar los datos en las colecciones correspondientes
    const paciente = await database.collection('pacientes').findOne({ _id: new ObjectId(pacienteId) });
    const antecedentes = await database.collection('antecedentes').findOne({ pacienteId: new ObjectId(pacienteId) });
    const exploracionFisica = await database.collection('exploracionFisica').findOne({ pacienteId: new ObjectId(pacienteId) });
    const diagnostico = await database.collection('diagnosticos').findOne({ pacienteId: new ObjectId(pacienteId) });
    const tratamiento = await database.collection('tratamientos').findOne({ pacienteId: new ObjectId(pacienteId) });
    const notasEvolucion = await database.collection('notasEvolucion').findOne({ pacienteId: new ObjectId(pacienteId) });

    // Validar que el paciente exista
    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    // Crear el resumen de la historia clínica
    const resumen = {
      datosPaciente: {
        nombre: paciente.nombre || "N/A",
        edad: paciente.edad || "N/A",
        sexo: paciente.sexo || "N/A",
        estadoCivil: paciente.estadoCivil || "N/A",
        ocupacion: paciente.ocupacion || "N/A",
        domicilio: paciente.domicilio || "N/A",
        telefono: paciente.telefono || "N/A",
        fechaNacimiento: paciente.fechaNacimiento || "N/A",
        lugarNacimiento: paciente.lugarNacimiento || "N/A"
      },
      antecedentes: {
        patologicos: antecedentes?.patologicos || "N/A",
        alergicos: antecedentes?.alergicos || "N/A",
        quirurgicos: antecedentes?.quirurgicos || "N/A",
        traumatismos: antecedentes?.traumatismos || "N/A",
        transfusionales: antecedentes?.transfusionales || "N/A",
        familiares: antecedentes?.familiares || "N/A"
      },
      exploracionFisica: {
        general: exploracionFisica?.general || "N/A",
        cabeza: exploracionFisica?.cabeza || "N/A",
        cuello: exploracionFisica?.cuello || "N/A",
        torax: exploracionFisica?.torax || "N/A",
        abdomen: exploracionFisica?.abdomen || "N/A",
        extremidades: exploracionFisica?.extremidades || "N/A"
      },
      diagnostico: diagnostico?.descripcion || "N/A",
      tratamiento: tratamiento?.indicaciones || "N/A",
      notasEvolucion: notasEvolucion?.descripcion || "N/A"
    };

    // Enviar el resumen como respuesta
    res.status(200).json({ message: "Resumen de la historia clínica obtenido correctamente", resumen });
  } catch (error) {
    console.error("Error en getResumenHistoriaClinica", error);
    res.status(500).json({ message: "Error al obtener el resumen de la historia clínica", error: error.message });
  }
};

// Función para sanear nombres de archivo
const sanitizeFileName = (name) => {
  return name
    .normalize('NFD') 
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
};

// Función para formatear fecha dd/mm/yyyy
const getFormattedDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
};

//import { getConnection } from "../models/connectionMongo.js";
//import { ObjectId } from "mongodb";

// Ruta para agregar datos del paciente
export const addPaciente = async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);

    const paciente = req.body;
    const database = await getConnection();
    const result = await database.collection('pacientes').insertOne(paciente);
    console.log("Paciente agregado", result);
    res.status(201).json({ message: "Paciente agregado correctamente", result });
  } catch (error) {
    console.error("Error en addPacientes", error);
    res.status(500).json({ message: "Error al agregar paciente", error: error.message });
  }
};

// Ruta para agregar antecedentes
export const addAntecedentes = async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);

    const antecedentes = req.body;
    const database = await getConnection();
    const result = await database.collection('antecedentes').insertOne(antecedentes);
    console.log("Antecedentes agregados", result);
    res.status(201).json({ message: "Antecedentes agregados correctamente", result });
  } catch (error) {
    console.error("Error en addAntecedentes", error);
    res.status(500).json({ message: "Error al agregar antecedentes", error: error.message });
  }
};

// Ruta para agregar exploración física
export const addExploracionFisica = async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);

    const exploracionFisica = req.body;
    const database = await getConnection();
    const result = await database.collection('exploracionFisica').insertOne(exploracionFisica);
    console.log("Exploración física agregada", result);
    res.status(201).json({ message: "Exploración física agregada correctamente", result });
  } catch (error) {
    console.error("Error en addExploracionFisica", error);
    res.status(500).json({ message: "Error al agregar exploración física", error: error.message });
  }
};

// Ruta para agregar diagnóstico
export const addDiagnostico = async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);

    const diagnostico = req.body;
    const database = await getConnection();
    const result = await database.collection('diagnosticos').insertOne(diagnostico);
    console.log("Diagnóstico agregado", result);
    res.status(201).json({ message: "Diagnóstico agregado correctamente", result });
  } catch (error) {
    console.error("Error en addDiagnostico", error);
    res.status(500).json({ message: "Error al agregar diagnóstico", error: error.message });
  }
};

// Ruta para agregar tratamiento
export const addTratamiento = async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);

    const tratamiento = req.body;
    const database = await getConnection();
    const result = await database.collection('tratamientos').insertOne(tratamiento);
    console.log("Tratamiento agregado", result);
    res.status(201).json({ message: "Tratamiento agregado correctamente", result });
  } catch (error) {
    console.error("Error en addTratamiento", error);
    res.status(500).json({ message: "Error al agregar tratamiento", error: error.message });
  }
};

// Ruta para agregar notas de evolución
export const addNotasEvolucion = async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);

    const notasEvolucion = req.body;
    const database = await getConnection();
    const result = await database.collection('notasEvolucion').insertOne(notasEvolucion);
    console.log("Notas de evolución agregadas", result);
    res.status(201).json({ message: "Notas de evolución agregadas correctamente", result });
  } catch (error) {
    console.error("Error en addNotasEvolucion", error);
    res.status(500).json({ message: "Error al agregar notas de evolución", error: error.message });
  }
};

// Ruta para agregar datos del médico
export const addMedico = async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);

    const medico = req.body;
    const database = await getConnection();
    const result = await database.collection('medicos').insertOne(medico);
    console.log("Datos del médico agregados", result);
    res.status(201).json({ message: "Datos del médico agregados correctamente", result });
  } catch (error) {
    console.error("Error en addMedico", error);
    res.status(500).json({ message: "Error al agregar datos del médico", error: error.message });
  }
};
export const createWordDocument = async (req, res) => {
  try {
    // Obtener el ID del paciente desde los parámetros o el cuerpo de la solicitud
    const { pacienteId } = req.params;

    // Validar que se haya proporcionado un ID
    if (!pacienteId) {
      return res.status(400).json({ message: "El ID del paciente es requerido" });
    }

    const database = await getConnection();
    const paciente = await database.collection('pacientes').findOne({ _id: new ObjectId(pacienteId) });
    const antecedentes = await database.collection('antecedentes').findOne({ pacienteId: new ObjectId(pacienteId) });
    const exploracionFisica = await database.collection('exploracionFisica').findOne({ pacienteId: new ObjectId(pacienteId) });
    const diagnostico = await database.collection('diagnosticos').findOne({ pacienteId: new ObjectId(pacienteId) });
    const tratamiento = await database.collection('tratamientos').findOne({ pacienteId: new ObjectId(pacienteId) });
    const notasEvolucion = await database.collection('notasEvolucion').findOne({ pacienteId: new ObjectId(pacienteId) });
    const medico = await database.collection('medicos').findOne({ pacienteId: new ObjectId(pacienteId) });

    // Validar que el paciente exista
    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    // Ruta de la plantilla
    const templatePath = path.join(process.cwd(), "templates", "template.docx");
    if (!fs.existsSync(templatePath)) {
      throw new Error("Plantilla no encontrada");
    }

    // Cargar plantilla
    const templateContent = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(templateContent);

    // Crear el documento con parser de expresiones
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      parser: expressions
    });

    // Datos dinámicos del paciente
    const data = {
      encabezado: {
        institucion: "CLÍNICA EJEMPLO S.A. DE C.V.",
        direccion: "Av. Revolución 123, CDMX",
        telefono: "55 1234 5678"
      },
      datosPaciente: {
        nombre: paciente.nombre || "N/A",
        diaNacimiento: paciente.edad || "N/A",
        genero: paciente.genero || "N/A",
        ocupacion: paciente.ocupacion || "N/A",
        telefono: paciente.telefono || "N/A",
        email: paciente.email || "N/A",
        direccion: paciente.direccion || "N/A",
        contactoEmergencia: paciente.contactoEmergencia || "N/A",
      },
      antecedentes:  {
        patologicos: antecedentes.patologicos || "N/A",
        alergicos: antecedentes.alergicos || "N/A",
        quirurgicos: antecedentes.quirurgicos || "N/A",
        traumatismos: antecedentes.traumatismos ||"N/A",
        transfusionales: antecedentes.transfusionales ||"N/A",
        familiares: antecedentes.familiares ||"N/A"
      },
      exploracionFisica: {
        general: exploracionFisica.general ||"N/A",
        cabeza: exploracionFisica.cabeza ||"N/A",
        cuello: exploracionFisica.cuello||"N/A",
        torax:exploracionFisica.torax||"N/A",
        abdomen: exploracionFisica.abdomen|| "N/A",
        extremidades: exploracionFisica.extremidades || "N/A"
      },
      diagnostico: diagnostico?.descripcion || "N/A", 
      tratamiento: tratamiento?.indicaciones || "N/A", 
      notasEvolucion: notasEvolucion?.descripcion || "N/A",
      medico: {
        nombre: medico.nombre || "N/A",
        cedula: medico.cedula|| "N/A",
        contacto: medico.contacto || "N/A"
      }
    };

    // Cargar los datos en la plantilla
    doc.setData(data);

    // Renderizar el documento
    doc.render();

    // Validar que no queden etiquetas sin reemplazar
    const fullText = doc.getFullText();
    if (fullText.includes('undefined')) {
      const missingTags = fullText.match(/{[^}]+}/g) || [];
      throw new Error(`Tags no remplazados: ${missingTags.join(', ')}`);
    }

    // Generar el buffer
    const buffer = doc.getZip().generate({ type: "nodebuffer" });

    // Crear carpeta si no existe
    const outputDir = path.join(process.cwd(), "historiales");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generar nombre seguro de archivo
    const safePatientName = sanitizeFileName(data.datosPaciente.nombre);
    const fileName = `Historial_${safePatientName}_${new Date().toISOString().split('T')[0]}.docx`;
    const outputPath = path.join(outputDir, fileName);

    // Guardar archivo
    fs.writeFileSync(outputPath, buffer);

    // Descargar archivo
    res.download(outputPath, fileName, (err) => {
      if (err) {
        console.error("Error al descargar:", err);
        res.status(500).json({
          message: "Error al enviar el documento",
          error: err.message
        });
      }
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Error generando historial clínico",
      details: {
        errorType: error.name,
        errorMessage: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack })
      }
    });
  }
};
