import { validationResult } from "express-validator";
import { Precio, Categoria } from "../models/index.js";
import Propiedad from "../models/Propiedad.js";

const admin = (req, res) => {
    res.render('propiedades/admin', {
        pagina: 'Mis Propiedades',
        barra: true
    });
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
        barra: true,
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
            barra: true,
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        });
    }

    // Crear Registro
    const { titulo, descripcion, habitaciones, estacionamiento, wc, lat, lng, categoria: categoria_id, precio : precio_id, calle } = req.body;

    const imagen= 'imagen';

    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            lat,
            lng,
            precio_id,
            categoria_id,
            calle,
            imagen
        });
    } catch (error) {
        console.log(error);
    }
};

export {
    admin,
    crear,
    guardar
}