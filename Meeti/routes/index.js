const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuarioController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

module.exports = function () {
    router.get('/', homeController.home);

    // Crear y confirmar cuenta
    router.get('/crear-cuenta', usuariosController.formCresrCuenta);
    router.post('/crear-cuenta', usuariosController.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo', usuariosController.confirmarCuenta);

    // Iniciar Sesión
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    // Panel de administración
    router.get('/administracion', authController.usuarioAutenticado, adminController.panelAdministracion);

    return router;
}