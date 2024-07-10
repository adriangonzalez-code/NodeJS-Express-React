const passport = require('passport');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

// Revisa si el usuario está autenticado o no
exports.usuarioAutenticado = (req, res, next) => {
    // Si el usuario está autenticado, adelante
    if (req.isAuthenticated()) {
        return next();
    }

    // Si no está autenticado
    return res.redirect('/iniciar-sesion');
}

// Cierra la sesión del usuario
exports.cerrarSesion = (req, res) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }

        req.flash('exito', 'Cerraste Sesión correctamente');
        return res.redirect('/iniciar-sesion');
    });
};