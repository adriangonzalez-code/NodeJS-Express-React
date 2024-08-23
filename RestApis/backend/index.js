const express = require('express');
const routes = require('./routes/index');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Cors permite qye un cliente se conecte a otro servicor para el intercambio de recursos
const cors = require('cors');

// Conectar a MongoDB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/restapis', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Conectado...')).catch((err) => console.log(err))

// Crear el servidor
const app = express();

// Habilitar BodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Habilitar CORS
app.use(cors());

// Rutas de la app
app.use('/', routes());

// puerto
app.listen(5000);