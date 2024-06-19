const Vacante = require("../models/Vacantes");
const multer = require('multer');
const shortid = require('shortid');

exports.formularioNuevaVacante = async (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    });
};

// Agregar vacantes a la Base de Datos
exports.agregarVacante = async (req, res) => {

    const vacante = new Vacante(req.body);

    // Usuario autor de la vacante
    vacante.autor = req.user._id;

    // Crear arreglo de habilidades (skills)
    vacante.skills = req.body.skills.split(',');

    // Almacenar en la Base de Datos
    const nuevaVacante = await vacante.save();

    // redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);
};

// Muestra una vacante
exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url}).populate('autor').lean();

    if (!vacante) return next();

    return res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true,
        imagen: req.user.imagen
    });
};

exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({
        url: req.params.url
    }).lean();

    if (!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
    });
};

exports.editarVacante = async (req, res, next) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, {
        new: true,
        runValidators: true
    });

    return res.redirect(`/vacantes/${vacante.url}`);
};

// Validar y Sanitizare los campos de las nuevas vacantes
exports.validarVacante = (req, res, next) => {

    // Sanitizar los campos
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();

    // Validar
    req.checkBody('titulo', 'Agregar un Titulo a la Vacante').notEmpty();
    req.checkBody('empresa', 'Agregar una Empresa').notEmpty();
    req.checkBody('ubicacion', 'Agregar una Ubicación').notEmpty();
    req.checkBody('contrato', 'Selecciona el Tipo de Contrato').notEmpty();
    req.checkBody('skills', 'Agrega al menos una habiilidad').notEmpty()

    const errores = req.validationErrors();

    if (errores) {
        // Recargar la vista
        req.flash('error', errores.map(error => error.msg));

        return res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash(),
            imagen: req.user.imagen
        });
    }

    next();
};

// Eliminar Vacantes
exports.eliminarVacante = async (req, res) => {
    const {id} = req.params;

    const vacante = await Vacante.findById(id);

    if (!vacante) {
        return res.status(404).send('Vacante no encontrada');
    }

    if (verificarAutor(vacante, req.user)) {
        // Todo bien, si es el usuario, eliminar
        await vacante.deleteOne();
        return res.status(200).send('Vacante eliminada correctamente');
    } else {
        // No permitido
        return res.status(403).send('Error');
    }
};

const verificarAutor = (vacante = {}, usuario = {}) => {
    if (!vacante.autor.equals(usuario._id)) {
        return false;
    }

    return true;
};

// Subir archivos en PDF
exports.subirCV = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            if (error instanceof multer.MulterError) {

                if (error.core === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande Máximo: 100kb');
                } else {
                    req.flash('error', error.message);
                }

                return next();
            } else {
                req.flash('error', error.message);
            }

            return res.redirect('back');
        }

        return next();
    });
};

// Opciones de Multer
const configuracionMulter = {
    limitss: { fileSize: 1 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../public/uploads/cv')
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'application/pdf') {

            //El callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
        } else {
            cb(new Error('Formato no válido'));
        }
    }
};

const upload = multer(configuracionMulter).single('cv');

// Almacenar los candidatos en la BD
exports.contactar = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url : req.params.url });

    // Si no existe la vacante
    if (!vacante) return next();

    // Todo bien
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }

    // Almacenar la vacante
    vacante.candidatos.push(nuevoCandidato);

    await vacante.save();

    // Mensaje falsh y redirección
    req.flash('correcto', 'Se envió su Curriculum correctamente');
    res.redirect('/');
};

exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id).lean();

    if (vacante.autor != req.user._id.toString()) return next();

    res.render('candidatos', {
        nombrePagina: `Candidatos - Vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    });
};

// Buscador de Vacantes
exports.buscarVacantes = async (req, res) => {
    const vacantes = await Vacante.find({
        $text: {
            $search : req.body.q
        }
    }).lean();

    // Mostrar las vacantes
    res.render('home', {
        nombrePagina: `Resultados para la búsqueda: ${req.body.q}`,
        barra: true,
        vacantes
    });
};