const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/emails');

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

    try {
        await Usuarios.create(usuario);

        // Generar URL de confirmación
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        // Enviar email de confirmación
        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        });

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
};

// Formulario para iniciar sesión
exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión'
    });
};


// Confirma la suscripción del usuario
exports.confirmarCuenta = async(req, res, next) => {
    // Verificar que el usuario existe
    const usuario = await Usuarios.findOne({ where: { email : req.params.correo }});

    // Si no existe, redireccionar
    if (!usuario) {
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    // Si existe, confirmar suscripcion y redireccionar
    usuario.activo = 1;
    await usuario.save();

    req.flash('exito', 'La cuenta se ha confirmado, ya puedes iniciar sesión');
    res.redirect('/iniciar-sesion');
};