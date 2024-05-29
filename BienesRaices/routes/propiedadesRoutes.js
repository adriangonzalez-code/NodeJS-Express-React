import express from 'express';
const router = express.Router();
import { admin, crear, guardar, agregarImagen, almacenarImagen } from "../controllers/propiedadController.js";
import { body } from "express-validator";
import protegerRuta from "../middlewares/protegerRuta.js";
import upload from "../middlewares/subirImagen.js";

router.get('/mis-propiedades', protegerRuta, admin);
router.get('/propiedades/crear', protegerRuta, crear);
router.post('/propiedades/crear',protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del anuncio es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción no puede ser vacía')
        .isLength({ max: 200 }).withMessage('La descripción es demasiado larga'),
    body('categoria').notEmpty().withMessage('Selecciona una categoria'),
    body('precio').notEmpty().withMessage('Selecciona un rango de precios'),
    body('habitaciones').notEmpty().withMessage('Seleccione la cantidad de habitaciones'),
    body('estacionamiento').notEmpty().withMessage('Seleccione la cantidad de estacionamientos'),
    body('wc').notEmpty().withMessage('Seleccione la cantidad de baños'),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardar);

router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen);

router.post('/propiedades/agregar-imagen/:id', protegerRuta, upload.single('imagen'), almacenarImagen);

export default router;