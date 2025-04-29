const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HistorialSchema = new Schema({
    encabezado: {
        institucion: String,
        direccion: String,
        telefono: String
    },
    datosPaciente: {
        nombre: String,
        edad: Number,
        sexo: String,
        estadoCivil: String,
        ocupacion: String,
        domicilio: String,
        telefono: String,
        fechaNacimiento: Date,
        lugarNacimiento: String
    },
    signosVitales: {
        fecha: Date,
        presionArterial: String,
        frecuenciaCardiaca: String,
        frecuenciaRespiratoria: String,
        temperatura: String,
        peso: String,
        talla: String,
        imc: String
    },
    antecedentes: {
        patologicos: String,
        alergicos: String,
        quirurgicos: String,
        traumatismos: String,
        transfusionales: String,
        familiares: String
    },
    exploracionFisica: {
        general: String,
        cabeza: String,
        cuello: String,
        torax: String,
        abdomen: String,
        extremidades: String
    },
    diagnostico: String,
    tratamiento: String,
    notasEvolucion: String,
    medico: {
        nombre: String,
        cedula: String,
        contacto: String
    }
});

module.exports = Historial =  mongoose.model("historial", HistorialSchema) 