import { check, validationResult } from "express-validator";
import Usuario from "../models/Usuario.js";
import { generarId, generarJWT } from "../helper/tokens.js";
import { emailRegistro, emailOlvidePassword } from '../helper/emails.js'
import bcrypt from "bcrypt";

const formularioLogin = (req, res) => {
    res.render('./auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    });
};

const autenticar = async (req, res) => {
    // Validación
    await check('email').isEmail().withMessage('El email es obligatorio').run(req);
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req);

    let resultado = validationResult(req);

    // Verificar que el resultado esté vacío
    if (!resultado.isEmpty()) {
        // Errores
        return res.render('./auth/login', {
            pagina: 'Inciar Sesión',
            errores: resultado.array(),
            csrfToken: req.csrfToken()
        });
    }

    const {email, password} = req.body;
    // Comprobar si el usuario existe

    const usuario = await Usuario.findOne({
        where: {
            email
        }
    });

    if (!usuario) {
        return res.render('./auth/login', {
            pagina: 'Inciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario no existe'}]
        });
    }

    // Comprobar si el usuario está confirmado
    if (!usuario.confirmado) {
        return res.render('./auth/login', {
            pagina: 'Inciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Tu cuenta no ha sido confirmada'}]
        });
    }

    // Revisar el password
    if (!usuario.verificarPassword(password)) {
        return res.render('./auth/login', {
            pagina: 'Inciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El password es incorrecto'}]
        });
    }

    // Autenticar al Usuario
    const token = generarJWT({
        id: usuario.id,
        nombre: usuario.nombre
    });

    // Almacenar en un cookie
    return res.cookie('_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    }).redirect('/mis-propiedades');
};

const formularioRegistro = (req, res) => {

    res.render('./auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    });
};

const registrar = async (req, res) => {
    // Validación
    await check('nombre').notEmpty().withMessage('El nombre no puede ser vacío').run(req);
    await check('email').isEmail().withMessage('Eso no parece un email').run(req);
    await check('password').isLength({min: 6}).withMessage('El password debe ser al menos 6 caracteres').run(req);
    await check('repetir_password').equals(req.body.password).withMessage('Los password no son iguales').run(req);

    let resultado = validationResult(req);

    // Verificar que el resultado esté vacío
    if (!resultado.isEmpty()) {
        // Errores
        return res.render('./auth/registro', {
            pagina: 'Crear Cuenta',
            errores: resultado.array(),
            csrfToken: req.csrfToken(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email,
            }
        });
    }

    const {nombre, email, password} = req.body;

    // Verificar que el usuario no esté duplicado
    const existeUsuario = await Usuario.findOne({
        where: {email}
    });

    if (existeUsuario) {
        return res.render('./auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{
                msg: "El Usuario ya está registrado"
            }],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email,
            }
        });
    }

    // Almacenar un usuario
    const usuario = await Usuario.create(
        {
            nombre,
            email,
            password,
            token: generarId()
        }
    )

    // Envia emai lde confirmación
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    // Mostrar mensaje de confirmación
    res.render('./templates/mensaje', {
        pagina: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un Email de confirmación, presiona en el enlace'
    });
};

// Función que comprueba la cuenta
const confirmar = async (req, res, next) => {

    const {token} = req.params;

    // Verificar si el token es válido
    const usuario = await Usuario.findOne({
        where: {token}
    });

    if (!usuario) {
        return res.render('./auth/confirmar-cuenta', {
            pagina: 'Error al confirmar cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        });
    }

    // Confirmar la cuenta
    usuario.token = null;
    usuario.confirmado = true;

    await usuario.save();

    return res.render('./auth/confirmar-cuenta', {
        pagina: 'Cuenta confirmada',
        mensaje: 'La cuenta se confirmó correctamente'
    });
}

const formularioOlvidePassword = (req, res) => {
    res.render('./auth/olvide-password', {
        pagina: 'Recupera tu Accesso a Bienes Raices',
        csrfToken: req.csrfToken(),
    });
};

const resetPassword = async (req, res) => {
    // Validación
    await check('email').isEmail().withMessage('Eso no parece un email').run(req);

    let resultado = validationResult(req);

    // Verificar que el resultado esté vacío
    if (!resultado.isEmpty()) {
        // Errores
        return res.render('./auth/olvide-password', {
            pagina: 'Recupera tu Accesso a Bienes Raices',
            errores: resultado.array(),
            csrfToken: req.csrfToken()
        });
    }

    // Buscar el usuario
    const {email} = req.body;

    const usuario = await Usuario.findOne({
        where: {email}
    });

    if (!usuario) {
        return res.render('./auth/olvide-password', {
            pagina: 'Recupera tu Accesso a Bienes Raices',
            errores: [{msg: 'El correo no existe'}],
            csrfToken: req.csrfToken()
        });
    }

    // Generar un Token y enviar email
    usuario.token = generarId();
    await usuario.save();

    // Enviar un email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token

    });

    // Renderizar el mensaje
    res.render('./templates/mensaje', {
        pagina: 'Reestablece tu password',
        mensaje: 'Hemos enviado un Email con las instrucciones'
    });
};

const comprobarToken = async (req, res) => {
    const {token} = req.params;
    const usuario = await Usuario.findOne({
        where: {token}
    });

    if (!usuario) {
        return res.render('./auth/confirmar-cuenta', {
            pagina: 'Reestablecer tu password',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo.',
            error: true
        });
    }

    // Mostrar formulario para modificar el password
    return res.render('./auth/reset-password', {
        pagina: 'Reestablece tu password',
        csrfToken: req.csrfToken()
    });
};

const nuevoPassword = async (req, res, next) => {
    // Validar el password
    await check('password').isLength({min: 6}).withMessage('El password debe ser al menos 6 caracteres').run(req);

    let resultado = validationResult(req);

    // Verificar que el resultado esté vacío
    if (!resultado.isEmpty()) {
        // Errores
        return res.render('./auth/reset-password', {
            pagina: 'Reestablece tu password',
            errores: resultado.array(),
            csrfToken: req.csrfToken()
        });
    }

    const {token} = req.params;
    const {password} = req.body;

    // Identificar quien hace el cambio
    const usuario = await Usuario.findOne({
        where: {
            token
        }
    });

    // Hashear el nuevo password
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;

    await usuario.save();

    res.render('./auth/confirmar-cuenta', {
        pagina: 'Password Reestablecido',
        mensaje: 'El Password se guardó correctamente'
    });
};

const cerrarSesion = async (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login');
};

export {
    formularioLogin,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    autenticar,
    cerrarSesion
}