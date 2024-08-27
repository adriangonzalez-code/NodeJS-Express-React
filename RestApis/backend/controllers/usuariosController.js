const Usuarios = require('../models/Usuarios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.registrarUsuario = async (req, res) => {

    // Leer los datos del usuario y colocarlos en Usuarios
    const usuario = new Usuarios(req.body);
    usuario.password = await bcrypt.hash(req.body.password, 10);

    try {
        await usuario.save();

        // Generar el token
        //const token = jwt.sign({ id: usuario._id }, process.env.SECRETA, { expiresIn: '24h' });

        res.json({ mensaje: 'Usuario registrado correctamente' });
    } catch (error) {
        console.log(error);
        res.json({mensaje: 'Error al registrar el usuario'});
    }
}

exports.autenticarUsuario = async (req, res, next) => {
    // Buscar el usuario
    const { email, password } = req.body;
    const usuario = await Usuarios.findOne({ email });

    if (!usuario) {
        // Usuario no existe
        await res.status(401).json({ mensaje: 'Ese usuario no existe' });
        next();
    } else {
        // Usuario existe, verificar si el password es correcto o incorrecto

        if (!bcrypt.compareSync(password, usuario.password)) {
            // Password incorrecto
            await res.status(401).json({ mensaje: 'Password incorrecto' });
            next();
        } else {
            // Password correcto, firmar token
            const token = jwt.sign({
                email: usuario.email,
                nombre: usuario.nombre,
                _id: usuario._id
            }, 'LLAVESECRETA' ,{ expiresIn: '1h' });


            // retornar el token
            res.json({ token });
        }
    }
}