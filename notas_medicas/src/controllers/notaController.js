import { getConnection } from "../models/connectionMongo.js"; 

export const addCompleteData = async (req, res) => {
    try {
      const { numNota, motivos, exploracionFisica, diagnostico, tratamiento } = req.body;
  
      // Validar que al menos los datos de la nota estén presentes
      if (!numNota || Object.keys(numNota).length === 0) {
        return res.status(400).json({ message: "El número de nota es requerido" });
      }
  
      const database = await getConnection();
  
      // Combinar todos los datos en un solo objeto
      const notaCompleta = {
        numNota,
        motivos: motivos?.motivos || null,
        exploracionFisica: exploracionFisica?.exploracionFisica || null,
        diagnostico: diagnostico?.diagnostico || null,
        tratamiento: tratamiento?.tratamiento || null,
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