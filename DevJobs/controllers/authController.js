const passport = require("passport");
const Vacante = require('../models/Vacantes');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

// Revisar si el usuario está autenticado o no
exports.verificarUsuario = (req, res, next) => {

    // Reivsar el usuario
    if (req.isAuthenticated()) {
        return next(); // están autenticados
    }

    res.redirect('/iniciar-sesion');
};

exports.mostrarPanel = async (req, res) => {

    // Consultar el usuario autenticado
    const vacantes = await Vacante.find({ autor: req.user._id}).lean();

    return res.render('administracion', {
        nombrePagina: ' Panel de Administración',
        tagline: 'Crea y administra tus vacantes desde aquí',
        cerrarSesion: true,
        nombre: req.user.nombre,
        vacantes
    });
};

exports.cerrarSesion = (req, res) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }

        req.flash('correcto', 'Cerraste Sesión correctamente');
        return res.redirect('/iniciar-sesion');
    });
};