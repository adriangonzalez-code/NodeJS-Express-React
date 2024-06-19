const express = require('express');
const router = require('./routes/index');
const exphbs = require('express-handlebars');
const path = require("node:path");
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');

require('dotenv').config({ path: 'variables.env' });
require('./config/db');
const req = require("express/lib/request");

const app = express();

// Habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Validación de campos
app.use(expressValidator());

// Habilitar handlebars como views
app.engine('handlebars',
    exphbs.engine({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars'),
    }));

app.set('view engine', 'handlebars');

// static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE
    })
}));

// Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// Alertas y flash message
app.use(flash());

// Crear nuestro middleware
app.use((req, res, next) => {
    res.locals.message = req.flash();
    next();
});

app.use('/', router());

// 404 Página no existente
app.use((req, res, next) => {
    next(createError(404, 'No encontrado'));
});

// Administración de los errores
app.use((error, req, res) => {
    res.locals.mensaje = error.message;

    const status = error.status || 500;

    res.locals.status = status;
    res.status(status);

    res.render('error')
});
// Dejar que Herokue asigne el puerto
const host = '0.0.0.0';
const port = process.env.PORT;


app.listen(port, host, () => {
    console.log("El servidor está funcionando");
});