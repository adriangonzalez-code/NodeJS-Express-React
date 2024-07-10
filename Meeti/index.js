const express = require('express');
const router = require('./routes/index');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const passport = require('./config/passport');

// Configuración y Modelos DB
const db = require('./config/db');
db.sync().then(() => console.log('Database Connected')).catch((err) => console.log(err));
require('./models/Usuarios');
require('./models/Categorias');
require('./models/Grupos');
require('./models/Meeti');

// Variables de Desarrollo
require('dotenv').config({path: 'variables.env'});

// Aplicación Principal
const app = express();

// Body Parser, leer formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Express validator (validación con bastantes funciones)
app.use(expressValidator());

// Habilitar EJS como template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Ubicación vistas
app.set('views', path.join(__dirname, './views'));

// Archivos estáticos
app.use(express.static('public'));

// Habilitar cookie parser
app.use(cookieParser());

// Crear la sesión
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

// Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// Agrega flash messages
app.use(flash());

// Middleware (usuario logueado, flash messages, fecha actual)
app.use((req, res, next) => {
    res.locals.usuario = {...req.user} || null;
    res.locals.mensajes = req.flash();
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