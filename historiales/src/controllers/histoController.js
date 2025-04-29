import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import expressions from "docxtemplater/expressions.js"; // <<--- Agregado
import { getConnection } from "../models/connectionMongo.js"; 
import { ObjectId } from "mongodb";

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

export const addCompleteData = async (req, res) => {
  try {
    const { paciente, signosVitales, antecedentes, exploracionFisica, diagnostico, tratamiento, notasEvolucion, medico } = req.body;

    // Validar que al menos los datos del paciente estén presentes
    if (!paciente || Object.keys(paciente).length === 0) {
      return res.status(400).json({ message: "Los datos del paciente son requeridos" });
    }

    const database = await getConnection();

    // Insertar los datos en sus respectivas colecciones
    const pacienteResult = await database.collection('pacientes').insertOne(paciente);
    const pacienteId = pacienteResult.insertedId; // Obtener el ID del paciente insertado

    if (signosVitales) {
      await database.collection('signosVitales').insertOne({ ...signosVitales, pacienteId });
    }

    if (antecedentes) {
      await database.collection('antecedentes').insertOne({ ...antecedentes, pacienteId });
    }

    if (exploracionFisica) {
      await database.collection('exploracionFisica').insertOne({ ...exploracionFisica, pacienteId });
    }

    if (diagnostico) {
      await database.collection('diagnosticos').insertOne({ ...diagnostico, pacienteId });
    }

    if (tratamiento) {
      await database.collection('tratamientos').insertOne({ ...tratamiento, pacienteId });
    }

    if (notasEvolucion) {
      await database.collection('notasEvolucion').insertOne({ ...notasEvolucion, pacienteId });
    }

    if (medico) {
      await database.collection('medicos').insertOne({ ...medico, pacienteId });
    }

    res.status(201).json({ message: "Datos completos agregados correctamente", pacienteId });
  } catch (error) {
    console.error("Error en addCompleteData", error);
    res.status(500).json({ message: "Error al agregar datos completos", error: error.message });
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
    const signosVitales = await database.collection('signosVitales').findOne({ pacienteId: new ObjectId(pacienteId) });
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
        edad: paciente.edad || "N/A",
        sexo: paciente.sexo || "N/A",
        estadoCivil: paciente.estadoCivil || "N/A",
        ocupacion: paciente.ocupacion || "N/A",
        domicilio: paciente.domicilio || "N/A",
        telefono: paciente.telefono || "N/A",
        fechaNacimiento: paciente.fechaNacimiento || "N/A",
        lugarNacimiento: paciente.lugarNacimiento || "N/A"
      },
      signosVitales:{
        fecha: getFormattedDate(),
        presionArterial: signosVitales.presionArterial || "N/A",
        frecuenciaCardiaca: signosVitales.frecuenciaCardiaca ||  "N/A",
        frecuenciaRespiratoria: signosVitales.frecuenciaRespiratoria|| "N/A",
        temperatura: signosVitales.temperatura|| "N/A",
        peso: signosVitales.peso || "N/A",
        talla: signosVitales.talla ||"N/A",
        imc: signosVitales.imc|| "N/A"
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
