const Usuarios = require('../models/Usuarios');
const multer = require("multer");
const shortid = require('shortid');

exports.formCrearCuenta = (req, res) => {
    return res.render('crear-cuenta', {
        nombrePagina: 'Crea tu  cuenta en devJobs',
        tagline: 'Cominza a publicar tus vacantes  gratis, solo debes crear un cuenta',
    });
};

exports.validarRegistro = async (req, res, next) => {

    // Sanitizar
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();

    // Validar
    req.checkBody('nombre', 'El nombre es Obligatorio').notEmpty();
    req.checkBody('email', 'El email debe ser válido').isEmail();
    req.checkBody('password', 'El password no puede ir vacío').notEmpty();
    req.checkBody('confirmar', 'Confirmar password no puede ir vacío').notEmpty();
    req.checkBody('confirmar', 'El password es diferente').equals(req.body.password);

    const errores = req.validationErrors();

    if (errores) {
        // Si hay errores
        req.flash('error', errores.map(error => error.msg));

        return res.render('crear-cuenta', {
            nombrePagina: 'Crea tu  cuenta en devJobs',
            tagline: 'Cominza a publicar tus vacantes  gratis, solo debes crear un cuenta',
            mensajes: req.flash()
        });

    }

    // si toda la validación es correcta
    next();
};

exports.crearUsuario = async (req, res, next) => {

    // Crear usuario
    const usuario = new Usuarios(req.body);

    try {
        await usuario.save();

        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }
};

// Formulario para iniciar sesión
exports.formIniciarSesion = async (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión devJobs',
    });
};

// Form editar el perfil
exports.formEditarPerfil = (req, res) => {

    return res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil en devJobs',
        usuario: req.user,
        cerrarSesion: true,
        nombre: req.user.nombre
    });
};

// Guardar cambios editar perfil
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;

    if (req.body.password) {
        usuario.password = req.body.password;
    }

    if (req.file) {
        usuario.imagen = req.file.filename;
    }

    await usuario.save();

    req.flash('correcto', 'cambios guardados correctamente');

    return res.redirect('/administracion');
};

// Sanitizar y valiidaro el formulario de editar perfiles
exports.validarPerfil = (req, res, next) => {
    // Sanitizar
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();

    if (req.body.password) {
        req.sanitizeBody('password').escape();
    }

    // Validar
    req.checkBody('nombre', 'El nombre no puede ir vacio').notEmpty();
    req.checkBody('email', 'El correo no puede ir vacio').notEmpty();

    const errores = req.validationErrors();

    if (errores) {
        req.flash('error', errores.map(error => error.msg));

        return res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfil en devJobs',
            usuario: req.user,
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        });
    }

    next(); // Todo bien, siguiente middleware!
};

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if(error instanceof multer.MulterError){
            return next();
        }
    });
    next();
};

// Opciones de Multer
const configuracionMulter = {
    storage: fileStorage = multer.diskStorage({
        destination : (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/perfiles')
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){

            //El callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        }else {
            cb(null, false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');