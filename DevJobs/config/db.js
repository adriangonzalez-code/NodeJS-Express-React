const mongoose = require("mongoose");
require('dotenv').config({ path: 'variables.env' });

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true
});

mongoose.connection.on("error", (error) => {
    console.log(error);
});

// Importar
require('../models/Vacantes');
require('../models/Usuarios');