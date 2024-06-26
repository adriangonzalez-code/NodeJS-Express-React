import express from "express";
import {
    formularioLogin,
    formularioRegistro,
    registrar,
    formularioOlvidePassword,
    confirmar,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    autenticar,
    cerrarSesion
} from "../controllers/usuarioController.js";

const router = express.Router();

// Routing
router.get('/login', formularioLogin);
router.post('/login', autenticar);

// Cerrar Sesión
router.post('/cerrar-sesion', cerrarSesion)

router.get('/registro', formularioRegistro);
router.post('/registro', registrar);

router.get('/confirmar/:token', confirmar);

router.get('/olvide-password', formularioOlvidePassword);
router.post('/olvide-password', resetPassword);

// Almacena el nuevo password
router.get('/olvide-password/:token', comprobarToken);
router.post('/olvide-password/:token', nuevoPassword);

/*router.post('/', (req, res) => {
    res.json({msg: 'Respuesta de tipo POST'});
});*/

/*router.route('/')
    .get((req, res) => {
        res.json({msg: 'Hola mundo en express'});
    })
    .post((req, res) => {
        res.json({msg: 'Hola mundo en express con POST'});
    });*/

export default router;