import express from 'express';
const router = express.Router();
import { admin, crear, guardar } from "../controllers/propiedadController.js";
import { body } from "express-validator";

router.get('/mis-propiedades', admin);
router.get('/propiedades/crear', crear);
router.post('/propiedades/crear',
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

export default router;