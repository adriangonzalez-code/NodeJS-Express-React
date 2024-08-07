const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const Caterorias = require('../../models/Categorias');
const moment = require('moment');
const Sequelize = require('sequelize');

exports.mostrarMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({ where: { slug: req.params.slug }, include: [{ model: Grupos}, { model: Usuarios, attributes: ['id', 'nombre', 'imagen']}] });

    // Si no existe
    if (!meeti) {
        res.redirect('/');
    }

    // Mostrar la vista
    res.render('mostrar-meeti', {
        nombrePagina: meeti.titulo,
        meeti,
        moment
    });
};

// Confirma o cancela si el usuario asistirá al Meeti
exports.confirmarAsistencia = async (req, res) => {

    const { accion } = req.body;

    if (accion === 'confirmar') {
        // Agregar el usuario
        Meeti.update(
            { 'interesados': Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id) },
            { where : { 'slug' : req.params.slug } }
        );
        res.send('Has confirmado tu asistencia al Meeti');
    } else {
        // Cancelar la asistencia
        Meeti.update(
            { 'interesados': Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id) },
            { where : { 'slug' : req.params.slug } }
        );
        res.send('Has cancelado tu asistencia al Meeti');
    }
};

// Muestra el listado de asistentes al Meeti
exports.mostrarAsistentes = async (req, res) => {
    const meeti = await Meeti.findOne({ where: { slug: req.params.slug }, attributes: ['interesados']});

    // Extraer interesados
    const { interesados } = meeti;
    const asistentes = await Usuarios.findAll({ where: { id: interesados }, attributes: ['nombre', 'imagen'] });

    // Crear la vista y pasar datos
    res.render('asistentes-meeti', {
        nombrePagina: 'Listado de Asistentes',
        asistentes
    });
};

// Muestra los meetis agrupaddos por categoría
exports.mostrarCategoria = async (req, res, next) => {
    const categoria = await Caterorias.findOne({ where: { slug: req.params.categoria }, attributes: ['id', 'nombre']});

    if (!categoria) {
        next();
        return;
    }

    const meetis = await Meeti.findAll({
        order: [['fecha', 'ASC'], ['hora', 'ASC']],
        include: [{ model: Grupos, where: { categoriaId: categoria.id } }, { model : Usuarios }]
    });

    res.render('categoria', {
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    });
};