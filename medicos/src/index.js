import express from 'express';
import dotenv from 'dotenv'; // Importar dotenv
import { medicosRoutes } from './routes/index.js';

dotenv.config(); // Cargar las variables de entorno desde .env

const app = express();
const port = process.env.PORT || 402; // Usar el puerto definido en .env o un valor por defecto

app.use(express.json());

app.get("/", (req, res) => {
    res.send("productos corriendo " + port);
});

app.use("/medicos", medicosRoutes);

app.listen(port, () => {
    console.log("Mi primer Servicio de Productos!", port);
});