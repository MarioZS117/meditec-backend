import express from 'express';
import { createWordDocument } from "./controllers/histoController.js";
 
const app = express();
const port = process.env.PORT || 400;
app.use(express.json());


app.get("/",(req,res)=>{
    res.send("productos corriendo " + port);
});

app.use("/historiales",createWordDocument);

app.listen(port,()=>{
  console.log("Mi primer Servicio de Productos!",port);
});