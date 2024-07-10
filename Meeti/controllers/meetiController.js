const Grupos = require('../models/grupos');
const Meeti = require('../models/meeti');
const uuid = require('uuid').v4;

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

    meeti.id = uuid();

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

// Muestra el formulario para editar un Meeti
exports.formEditarMeeti = async (req, res, next) => {

    const consultas = [];
    consultas.push(Grupos.findAll({ where: { usuarioId: req.user.id } }));
    consultas.push(Meeti.findByPk(req.params.id));

    const [grupos, meeti] = await Promise.all(consultas);

    if (!grupos || !meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('editar-meeti', {
        nombrePagina: `Editar Meeti : ${meeti.titulo}`,
        meeti,
        grupos
    });
};

// Almacena los cambios en el Meeti (DB)
exports.editarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });

    if (!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // Obtener los datos del formulario
    const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng } = req.body;

    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.estado = estado;
    meeti.pais = pais;

    // Almacena la ubicación con un point
    const point = { type: 'Point', coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)] };
    meeti.ubicacion = point;

    // Almacena los cambios en la BD
    try {
        await meeti.save();
        req.flash('exito', 'Se ha editado el Meeti correctamente.');
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);

        // Extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);

        req.flash('error', erroresSequelize);
        res.redirect(`/editar-meeti/${meeti.id}`);
    }
};

// Mustra el formulario para eliminar un Meeti
exports.formEliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });

    if (!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // Mostrar la vista
    res.render('eliminar-meeti', {
        nombrePagina: `Eliminar Meeti : ${meeti.titulo}`
    });
};

// Elimina un Meeti de la BD
exports.eliminarMeeti = async (req, res) => {
    await Meeti.destroy({ where: { id: req.params.id } });

    req.flash('exito', 'Se ha eliminado el Meeti correctamente.');
    res.redirect('/administracion');
};