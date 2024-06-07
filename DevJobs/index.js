const express = require('express');
const router = require('./routes/index');
const exphbs = require('express-handlebars');
const path = require("node:path");
require('dotenv').config({ path: 'variables.env' });
const mongoose = require('mongoose');
require('./config/db');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

// Habilitar handlebars como views
app.engine('handlebars',exphbs.engine({defaultLayout:'layout'}));

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

app.use('/', router());

app.listen(process.env.PUERTO);