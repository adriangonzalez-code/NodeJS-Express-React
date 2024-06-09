const Vacante = require("../models/Vacantes");

exports.formularioNuevaVacante = async (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante'
    });
};

// Agregar vacantes a la Base de Datos
exports.agregarVacante = async (req, res) => {

    const vacante = new Vacante(req.body);

    // Crear arreglo de habilidades (skills)
    vacante.skills = req.body.skills.split(',');

    // Almacenar en la Base de Datos
    const nuevaVacante = await vacante.save();

    // redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);
};

// Muestra una vacante
exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url : req.params.url }).lean();

    if (!vacante) return next();

    return res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true
    });
};

exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({
        url : req.params.url
    }).lean();

    if (!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`
    });
};

exports.editarVacante = async (req, res, next) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({url : req.params.url} , vacanteActualizada, {
        new: true,
        runValidators: true
    });

    return res.redirect(`/vacantes/${vacante.url}`);
};