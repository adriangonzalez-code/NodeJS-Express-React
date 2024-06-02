import express from 'express';
import { inicio, categoria, buscador, noEncontrado } from "../controllers/appController.js";

const router = express.Router();

// Página de inicio
router.get('/', inicio);

// Página Categorias
router.get('/categoria/:id', categoria);

// Página 404
router.get('/404', noEncontrado);

// Buscador
router.get('/buscador', buscador);

export default router;