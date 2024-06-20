const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuarioController');

module.exports = function () {
    router.get('/', homeController.home);

    router.get('/crear-cuenta', usuariosController.formCresrCuenta);
    router.post('/crear-cuenta', usuariosController.crearNuevaCuenta);

    // Iniciar Sesión
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);

    return router;
}