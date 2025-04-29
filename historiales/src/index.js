import express, { Router } from 'express';
import {histoRoutes} from './routes/index.js';
 
const app = express();
const port = process.env.PORT || 400;
app.use(express.json());


app.get("/",(req,res)=>{
    res.send("productos corriendo " + port);
});

app.use("/historiales",histoRoutes
);

app.listen(port,()=>{
  console.log("Mi primer Servicio de Productos!",port);
});