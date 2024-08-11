const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const Caterorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.mostrarMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({ where: { slug: req.params.slug }, include: [{ model: Grupos}, { model: Usuarios, attributes: ['id', 'nombre', 'imagen']}] });

    // Si no existe
    if (!meeti) {
        res.redirect('/');
    }

    // Consultar por meetis cercanos

    const ubicacion = Sequelize.literal(`ST_GeomFromText('POINT(${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]})')`);

    // ST_DISTANCE_Sphere = Retorna una linea en metros
    const distancia = Sequelize.fn('ST_DistanceSphere', Sequelize.col('ubicacion'), ubicacion);

    // Consultar después de verificar que exista el meeti
    const comentarios = await Comentarios.findAll({ where: { meetiId: meeti.id }, include: [{ model: Usuarios, attributes: ['id', 'nombre', 'imagen'] }] });

    // Encontrar meetis cercanos
    const cercanos = await Meeti.findAll({
        order: distancia, // Los ordena del mas cercano al lejano
        where: Sequelize.where(distancia, { [Op.lte]: 2000  }), // 2000 metros o 2km
        limit: 3, // Máximo 3
        offset: 1,
        include: [{ model: Grupos }, { model: Usuarios, attributes: ['id', 'nombre', 'imagen'] }]
    });

    // Mostrar la vista
    res.render('mostrar-meeti', {
        nombrePagina: meeti.titulo,
        meeti,
        moment,
        cercanos,
        comentarios
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