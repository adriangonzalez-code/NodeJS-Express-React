const express = require('express');
const router = require('./routes/index');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

require('dotenv').config({path: 'variables.env'});

const app = express();

// Habilitar EJS como template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Ubicación vistas
app.set('views', path.join(__dirname, './views'));

// Archivos estáticos
app.use(express.static('public'));

// Middleware (usuario logueado, flash messages, fecha actual)
app.use((req, res, next) => {
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});

// Routing
app.use('/', router());

// Agregar el puesto
app.listen(process.env.PORT, () => {
    console.log('El servidor está funcionando');
});