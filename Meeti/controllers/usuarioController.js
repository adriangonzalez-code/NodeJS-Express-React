const Usuarios = require('../models/Usuarios');

exports.formCresrCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu Cuenta'
    });
};

exports.crearNuevaCuenta = async (req, res) => {
    const usuario = req.body;

    req.checkBody('confirmar', 'Repetir Contraseña no puede ir vacío').notEmpty();
    req.checkBody('confirmar', 'La Contraseña es diferente').equals(req.body.password);

    // Leer los errores de express
    const erroresExpress = req.validationErrors();

    if (erroresExpress) {
        // Si hay errores de validación, redirige a la página de registro con los errores mostrados
        const errExp = erroresExpress.map(err => err.msg)
        req.flash("error", errExp);
        res.redirect("/crear-cuenta");
    } else {

        try {

            const nuevoUsuario = await Usuarios.create(usuario);

            req.flash('exito', 'Hemos enviado un e-mail, confirma tu cuenta');
            res.redirect('/iniciar-sesion');
        } catch (error) {
            console.log(error);

            // Extraer el messahe de los errores
            const erroresSequelize = error.errors.map(err => err.message);

            // Extraer unicamente el msg de los errores
            const errExp = erroresExpress.map(err => err.msg);

            // Unirlos
            const listaErrores = [...erroresSequelize, ...errExp];

            req.flash('error', listaErrores);
            res.redirect('/crear-cuenta');
        }
    }
};

// Formulario para iniciar sesión
exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión'
    });
};
