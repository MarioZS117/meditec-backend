import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import expressions from "docxtemplater/expressions.js"; // <<--- Agregado

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

export const addPacientes = async (paciente) => {
  datosPaciente ={
    nombre: nombrePaciente,
    edad: "35 años",
    sexo: "Masculino",
    estadoCivil: "Casado",
    ocupacion: "Ingeniero",
    domicilio: "Calle Flores #45, Col. Centro",
    telefono: "55 8765 4321",
    fechaNacimiento: "15/03/1989",
    lugarNacimiento: "Ciudad de México",
  };
  try{
      const database  = await getConnection();
      const result = await database.collection('pacientes').insertOne(paciente);
      console.log("Paciente agregado", result);
      console.log(result);
  }
  catch(error){
      console.log("Error en addPacientes", error);
  }
}

export const createWordDocument = async (req, res) => {
  try {
    // Ruta de la plantilla
    const templatePath = path.join(process.cwd(), "templates", "template.docx");
    if (!fs.existsSync(templatePath)) {
      throw new Error("Plantilla no encontrada");
    }

    // Cargar plantilla
    const templateContent = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(templateContent);

    // Crear el documento con parser de expresiones (punto en objetos anidados)
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      parser: expressions // <<--- Importante
    });

    // Datos de ejemplo o dinámicos
    const paciente = "Paciente sin signos de dolor";
    const nombrePaciente = req.query.nombre || "Juan Pérez";

    
    const data = {        //Datos estaticos de ejemplo
      encabezado: {
        institucion: "CLÍNICA EJEMPLO S.A. DE C.V.",
        direccion: "Av. Revolución 123, CDMX",
        telefono: "55 1234 5678"
      },
      datosPaciente: {
        nombre: nombrePaciente,
        edad: "35 años",
        sexo: "Masculino",
        estadoCivil: "Casado",
        ocupacion: "Ingeniero",
        domicilio: "Calle Flores #45, Col. Centro",
        telefono: "55 8765 4321",
        fechaNacimiento: "15/03/1989",
        lugarNacimiento: "Ciudad de México"
      },
      signosVitales: {
        fecha: getFormattedDate(),
        presionArterial: "120/80 mmHg",
        frecuenciaCardiaca: "75 lpm",
        frecuenciaRespiratoria: "16 rpm",
        temperatura: "36.5 °C",
        peso: "75 kg",
        talla: "1.75 m",
        imc: "24.5"
      },
      antecedentes: {
        patologicos: "Hipertensión controlada",
        alergicos: "Penicilina",
        quirurgicos: "Apendicectomía (2010)",
        traumatismos: "Ninguno",
        transfusionales: "No aplica",
        familiares: "Diabetes mellitus en padre"
      },
      exploracionFisica: {
        general: "Paciente consciente, orientado, hidratado",
        cabeza: "Normocéfalo, sin alteraciones",
        cuello: "Móvil, sin adenomegalias",
        torax: "Simétrico, murmullo vesicular presente",
        abdomen: "Blando, depresible, no doloroso",
        extremidades: "Sin edema, pulsos presentes"
      },
      diagnostico: "Hipertensión arterial esencial controlada",
      tratamiento: `
        1. Mantener dieta baja en sodio
        2. Continuar con Losartán 50 mg cada 24 hrs
        3. Control mensual de presión arterial
        4. Ejercicio aeróbico 30 min/día
      `,
      notasEvolucion: paciente,
      medico: {
        nombre: "Dra. Ana María García López",
        cedula: "1234567",
        contacto: "55 1122 3344"
      }
    };

    // Cargar los datos
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
