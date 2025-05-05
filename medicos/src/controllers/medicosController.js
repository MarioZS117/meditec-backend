import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import initializeDatabase from '../models/sqlConnection.js'; // Importar la función de inicialización

// Configuración de conexión a la base de datos usando variables de entorno
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Doctores'
};

// Método para el login de médicos
export const loginMedico = async (req, res) => {
    const { correoElectronico, contrasena } = req.body;

    try {
        // Validar que los campos estén presentes
        if (!correoElectronico || !contrasena) {
            return res.status(400).json({ msg: 'Correo electrónico y contraseña son requeridos' });
        }

        // Validar errores de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Conectar a la base de datos
        const connection = await mysql.createConnection(dbConfig);

        // Verificar si el médico existe
        const [rows] = await connection.query(
            'SELECT * FROM Medicos WHERE correoElectronico = ?',
            [correoElectronico]
        );
        if (rows.length === 0) {
            await connection.end();
            return res.status(404).json({ msg: 'El médico no existe' });
        }

        const medico = rows[0];

        // Verificar contraseña
        if (!medico.Contrasena) {
            await connection.end();
            return res.status(500).json({ msg: 'Error en el servidor: Contraseña no encontrada' });
        }

        const isMatch = await bcrypt.compare(contrasena, medico.Contrasena);
        if (!isMatch) {
            await connection.end();
            return res.status(401).json({ msg: 'Credenciales incorrectas' });
        }

        await connection.end();

        res.json({
            medico: {
                id: medico.id,
                nombre: medico.Nombre,
                apellidos: medico.Apellidos,
                correoElectronico: medico.CorreoElectronico,
                nombreConsultorio: medico.NombreConsultorio,
                direccionConsultorio: medico.DireccionConsultorio,
                especialidad: medico.Especialidad,
                cedulaProfesional: medico.CedulaProfesional
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

// Método para el registro de médicos
export const registroMedico = async (req, res) => {
    const { 
        nombre, 
        apellidos, 
        correoElectronico, 
        contrasena, 
        nombreConsultorio, 
        direccionConsultorio, 
        especialidad, 
        cedulaProfesional 
    } = req.body;

    try {
        // Validar errores de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Inicializar la base de datos y crear la tabla si no existe
        await initializeDatabase();

        // Conectar a la base de datos
        const connection = await mysql.createConnection(dbConfig);

        // Verificar si el médico ya está registrado
        const [rows] = await connection.query(
            'SELECT * FROM Medicos WHERE CorreoElectronico = ?',
            [correoElectronico]
        );
        if (rows.length > 0) {
            await connection.end();
            return res.status(400).json({ msg: 'El médico ya está registrado' });
        }

        // Hashear la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        // Insertar el nuevo médico en la base de datos
        const [result] = await connection.query(
            `INSERT INTO Medicos 
            (Nombre, Apellidos, CorreoElectronico, Contrasena, NombreConsultorio, DireccionConsultorio, Especialidad, CedulaProfesional) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, apellidos, correoElectronico, hashedPassword, nombreConsultorio, direccionConsultorio, especialidad, cedulaProfesional]
        );

        await connection.end();

        res.status(201).json({
            medico: {
                id: result.insertId,
                nombre,
                apellidos,
                correoElectronico,
                nombreConsultorio,
                direccionConsultorio,
                especialidad,
                cedulaProfesional
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};