import { validationResult } from "express-validator";
import { Precio, Categoria, Propiedad, Mensaje, Usuario } from "../models/index.js";
import { unlink } from 'node:fs/promises';
import { esVendedor, formatearFecha } from "../helper/index.js";

const admin = async (req, res) => {

    // Leer QueryString
    const {pagina: paginaActual} = req.query;

    const expresion = /^[1-9]$/;

    if (!expresion.test(paginaActual)) {
        return res.redirect('/mis-propiedades?pagina=1');
    }

    try {
        const {id} = req.usuario;

        // Limites y Offset para el paginador
        const limit = 3;
        const offset = ((paginaActual * limit) - limit);

        const [propiedades, total] = await Promise.all([
            await Propiedad.findAll({
                limit,
                offset,
                where: {
                    usuario_id: id
                },
                include: [
                    {model: Categoria, as: "categoria"},
                    {model: Precio, as: "precio"},
                    {model: Mensaje, as: "mensajes"}
                ]
            }),
            Propiedad.count({
                where: {
                    usuario_id: id
                }
            })]
        );

        res.render('propiedades/admin', {
            pagina: 'Mis Propiedades',
            propiedades,
            csrfToken: req.csrfToken(),
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit
        });
    } catch (error) {
        console.log(error);
    }
}

// Formulario para crear una nueva propiedad
const crear = async (req, res) => {
    // Consultar Modelo de Precio y Categoria
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);

    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    });
};

const guardar = async (req, res) => {

    // Validación
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        });
    }

    // Crear Registro
    const {
        titulo,
        descripcion,
        habitaciones,
        estacionamiento,
        wc,
        lat,
        lng,
        categoria: categoria_id,
        precio: precio_id,
        calle
    } = req.body;
    const {id: usuario_id} = req.usuario;

    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precio_id,
            categoria_id,
            usuario_id,
            imagen: '',
        });

        const {id} = propiedadGuardada;

        res.redirect(`/propiedades/agregar-imagen/${id}`);
    } catch (error) {
        console.log(error);
    }
};

const agregarImagen = async (req, res) => {

    const {id} = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad no esté publicada
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertecene a quien visita la página

    if (req.usuario.id.toString() !== propiedad.usuario_id.toString()) {
        return res.redirect('/mis-propiedades');
    }

    res.render('propiedades/agregar-imagen', {
        pagina: `Agregar Imagen ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
    })
};

const almacenarImagen = async (req, res, next) => {
    const {id} = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad no esté publicada
    if (propiedad.publicado) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertecene a quien visita la página
    if (req.usuario.id.toString() !== propiedad.usuario_id.toString()) {
        return res.redirect('/mis-propiedades');
    }

    try {
        console.log(req.file);
        // Almacenar la imagen y publicar propiedad
        propiedad.imagen = req.file.filename;
        propiedad.publicado = 1;

        await propiedad.save();

        next();

    } catch (error) {
        console.log(error);
    }
};

const editar = async (req, res) => {
    const {id} = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Revisar que quien visita la URL, es quien creó la propiedad
    if (propiedad.usuario_id.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }

    // Consultar Modelo de Precio y Categoria
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);

    res.render('propiedades/editar', {

        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    });
};

const guardarCambios = async (req, res) => {

    // Validación
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        res.render('propiedades/editar', {

            pagina: 'Editar Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            datos: req.body,
            errores: resultado.array()
        });
    }

    const {id} = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Validar que la propiedad pertecene a quien visita la página
    if (req.usuario.id.toString() !== propiedad.usuario_id.toString()) {
        return res.redirect('/mis-propiedades');
    }

    // Reescribir el objeto
    try {
        const {
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            lat,
            lng,
            categoria: categoria_id,
            precio: precio_id,
            calle
        } = req.body;

        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            lat,
            lng,
            categoria_id,
            precio_id,
            calle
        });

        await propiedad.save();

        res.redirect('/mis-propiedades');
    } catch (error) {
        console.log(error);
    }
};

const eliminar = async (req, res) => {
    const {id} = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Revisar que quien visita la URL, es quien creó la propiedad
    if (propiedad.usuario_id.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }

    // Eliminar imagen
    await unlink(`public/uploads/${propiedad.imagen}`);

    // Eliminar la propiedad
    await propiedad.destroy();

    res.redirect('/mis-propiedades');
};

// Muestra una propiedad
const mostrarPropiedad = async (req, res) => {

    const {id} = req.params;

    // Comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {model: Precio, as: "precio"},
            {model: Categoria, as: "categoria"}
        ]
    });

    if (!propiedad || !propiedad.publicado) {
        res.redirect('/404');
    }

    res.render('propiedades/mostrar', {
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuario_id)
    });
};

const enviarMensaje = async (req, res) => {
    const {id} = req.params;

    // Comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {model: Precio, as: "precio"},
            {model: Categoria, as: "categoria"}
        ]
    });

    if (!propiedad) {
        res.redirect('/404');
    }

    // Renderizar los errores
    // Validación
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.render('propiedades/mostrar', {
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuario_id),
            errores: resultado.array()
        });
    }

    const { mensaje } = req.body;
    const { id: propiedad_id } = req.params;
    const { id: usuario_id } = req.usuario;

    // Almacenar el mensaje
    await Mensaje.create({
        mensaje,
        propiedad_id,
        usuario_id
    });

    return res.redirect('/');
};

// Leer mensajes recibidos
const verMensajes = async (req, res) => {
    const {id} = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {model: Mensaje, as: "mensajes", include: [{model: Usuario.scope('eliminarPassword'), as: "usuario"}]}
        ]
    });

    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Revisar que quien visita la URL, es quien creó la propiedad
    if (propiedad.usuario_id.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }

    res.render('propiedades/mensajes', {
        pagina: 'Mensajes',
        mensajes: propiedad.mensajes,
        formatearFecha
    });
};

// Modifica el estado de la propiedad
const cambiarEstado = async (req, res) => {
    const {id} = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect('/mis-propiedades');
    }

    // Revisar que quien visita la URL, es quien creó la propiedad
    if (propiedad.usuario_id.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades');
    }

    // Actualizar
    propiedad.publicado = !propiedad.publicado;

    await propiedad.save();

    res.json({
        resultado: true,
    });
};

export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes,
    cambiarEstado
}