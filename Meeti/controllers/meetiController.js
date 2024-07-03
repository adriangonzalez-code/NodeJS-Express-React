const Grupos = require('../models/grupos');
const Meeti = require('../models/meeti');

// Muestra formulario para nuevos Meeti
exports.formNuevoMeeti = async (req, res) => {

    const grupos = await Grupos.findAll({ where: { usuarioId: req.user.id } });

    res.render('nuevo-meeti', {
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    });
};

// Inserta nuevos Meeti en la BD
exports.crearMeeti = async (req, res) => {
    // Obtener los datos del formulario
    const meeti = req.body;

    // Asignar el Usuario al Meeti
    meeti.usuarioId = req.user.id;

    // Almacena la ubicación con un point

    const point = { type: 'Point', coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)] };

    meeti.ubicacion = point;

    // Cupo opcional
    if (req.body.cupo === '') {
        meeti.cupo = 0;
    }

    // Almacena el Meeti en la BD
    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Se ha creado el Meeti correctamente.');
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);

        // Extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);

        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }
};

// Sanitiza los Meeti
exports.sanitizarMeeti = (req, res, next) => {
    // Sanitizar los campos
    req.sanitizeBody('titulo');
    req.sanitizeBody('invitado');
    req.sanitizeBody('cupo');
    req.sanitizeBody('fecha');
    req.sanitizeBody('hora');
    req.sanitizeBody('direccion');
    req.sanitizeBody('ciudad');
    req.sanitizeBody('estado');
    req.sanitizeBody('pais');
    req.sanitizeBody('lat');
    req.sanitizeBody('lng');
    req.sanitizeBody('grupoId');

    next();
};