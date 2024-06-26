const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

configuracionMulter = {
    limits: {
        fileSize: 100000
    },
    storage: fileStorage = multer.diskStorage({
        destination: (req, res, next) => {
            next(null, __dirname + '/../public/uploads/grupos/');
        },
        filename: (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, next) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            // El formato es válido
            next(null, true);
        } else {
            // El formato no es válido
            next(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

// Sube imagen en el servidor
exports.subirImagen = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande');
                } else {
                    req.flash('error', error.message);
                }
            } else if (error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            next();
        }
    });
};

exports.formNuevoGrupo = async (req, res) => {

    const categorias = await Categorias.findAll();

    return res.render('nuevo-grupo', {
        nombrePagina: 'Crear un nuevo grupo',
        categorias
    });
};

// Almacena los grupos en la BD
exports.crearGrupo = async (req, res) => {
    // Sanitizar
    req.sanitizeBody('nombre');
    req.sanitizeBody('url');

    const grupo = req.body;

    // Almacena el usuario autenticado como el creador del grupo
    grupo.usuarioId = req.user.id;

    // Leer la imagen
    if (req.file) {
        grupo.imagen = req.file.filename;
    }

    try {
        // Almacenar en la BD
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el Grupo correctamente');
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);

        // Extraer el messahe de los errores
        const erroresSequelize = error.errors.map(err => err.message);

        req.flash('error', erroresSequelize);

        req.flash('error', error);
        res.redirect('/nuevo-grupo');
    }
};

exports.formEditarGrupo = async (req, res) => {
    const consultas = [];

    consultas.push(Grupos.findByPk(req.params.grupoId));
    consultas.push(Categorias.findAll());

    // Promise con await
    const [grupo, categorias] = await Promise.all(consultas);

    return res.render('editar-grupo', {
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    });
};

// Guardar los cambios en la BD
exports.editarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    // Si no existe el grupo o no es el creador
    if (!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // Todo bien, leer los valores
    const { nombre, descripcion, categoriaId, url } = req.body;

    // Asignar los valores
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    // Guardar en la BD
    await grupo.save();

    req.flash('exito', 'Se ha editado el grupo correctamente');
    res.redirect('/administracion');
};

// Muestra el formulario para editar la imagen de grupo
exports.formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    /*if (!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }*/

    return res.render('imagen-grupo', {
        nombrePagina: `Editar imagen del grupo: ${grupo.nombre}`,
        grupo
    });
};

// Modifica la imagen en la BD y elimina la anterior
exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    // El grupo existe y es válido para el usuario autenticado
    if (!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/iniciar-sesion');
        return next();
    }

    // Si hay imagen anterior y nueva, significa que hay vamos a borrar la anterior
    if (req.file && grupo.imagen) {
       const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

       // Eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
            }

            return;
        });
    }

    // Si hay una imagen nueva, la guardamos
    if (req.file) {
        grupo.imagen = req.file.filename;
    }

    // Guardar en la BD
    await grupo.save();

    req.flash('exito', 'Se ha editado la imagen del grupo correctamente');
    res.redirect('/administracion');
};

// Muestra el formulario para eliminar un grupo
exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    if (!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // Todo bien, ejecutar la vista
    return res.render('eliminar-grupo', {
        nombrePagina: `Eliminar Grupo: ${grupo.nombre}`,
        grupo
    });
};

// Elimina el grupo e imagen de la BD
exports.eliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    if (!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // Si hay una imagen eliminarla
    if (grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
            }

            return;
        });
    }

    // Eliminar el grupo de la BD
    await Grupos.destroy({
        where: {
            id: req.params.grupoId
        }
    });

    // Redireccionar al usuario
    req.flash('exito', 'Se ha eliminado el grupo correctamente');
    res.redirect('/administracion');
};