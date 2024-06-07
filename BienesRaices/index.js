// const express = require('express');
import express from 'express';
import csrf from 'csurf';
import usuarioRoutes from './routes/usuarioRoutes.js';
import db from './config/db.js';
import cookieParser from "cookie-parser";
import propiedadesRoutes from "./routes/propiedadesRoutes.js";
import appRoutes from "./routes/appRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";

// Crear la app
const app = express();

// Habilitar lectura de datos de formulario
app.use(express.urlencoded({ extended: true }));

// Habilitar Cookie Parser
app.use(cookieParser());

// Habilitar CSRF
app.use(csrf({cookie: true}));

// Conexión a la BD
try {
    await db.authenticate();
    db.sync();
    console.log('Conexión Correcta a la Base de Datos');
} catch (error) {
    console.log(error);
}

// Habilitar Pug
app.set('views engine', 'pug');
app.set('views', './views');

// Carpeta Pública
app.use(express.static('public'));

// Routing
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesRoutes);
app.use('/', appRoutes);
app.use('/api', apiRoutes);

// Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});