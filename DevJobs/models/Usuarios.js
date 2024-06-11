const mongoose = require('mongoose');
const slug = require('slug');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const req = require("express/lib/request");

const usuariosSchemas = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expira: Date
});

// Método para hashear los passwords
usuariosSchemas.pre('save', async function (next) {
    // si el password ya esta hasheado

    if (!this.isModified('password')) {
        return next();
    }

    // Si no está hasheado
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

// Enviar alerta cuando un usuario ya está registrado
usuariosSchemas.post('save', function (error, doc, next) {
    if (error && error.code === 11000) {
        next('Ese correo ya está registrado');
    } else {
        next(error);
    }
});

// Autenticar Usuarios
usuariosSchemas.methods = {
    compararPassword: function (password) {
        return bcrypt.compareSync(password, this.password);
    }
};

module.exports = mongoose.model('Usuarios', usuariosSchemas);