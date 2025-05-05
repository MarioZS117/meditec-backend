import mysql from 'mysql2/promise';

async function initializeDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
    });

    // Crear la base de datos si no existe
    await connection.query(`CREATE DATABASE IF NOT EXISTS Doctores`);
    await connection.query(`USE Doctores`);

    // Crear la tabla de medicos si no existe
    await connection.query(`
        CREATE TABLE IF NOT EXISTS Medicos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            Nombre VARCHAR(255) NOT NULL,
            Apellidos VARCHAR(255) NOT NULL,
            CorreoElectronico VARCHAR(255) NOT NULL UNIQUE,
            Contrasena VARCHAR(255) NOT NULL,
            NombreConsultorio VARCHAR(255) NOT NULL,
            DireccionConsultorio VARCHAR(255) NOT NULL,
            Especialidad VARCHAR(255) NOT NULL,
            CedulaProfesional VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('Base de datos y tabla inicializadas correctamente.');
    await connection.end();
}

// Exportar la función en lugar de ejecutarla directamente
export default initializeDatabase;