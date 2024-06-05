import express from 'express';
import { inicio, categoria, buscador, noEncontrado } from "../controllers/appController.js";

const router = express.Router();

// Página de inicio
router.get('/', inicio);

// Página Categorias
router.get('/categorias/:id', categoria);

// Página 404
router.get('/404', noEncontrado);

// Buscador
router.post('/buscador', buscador);

export default router;