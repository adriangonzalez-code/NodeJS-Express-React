const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Autorización por el header
    const authHeader = req.get('authorization');

    if (!authHeader) {
        const error = new Error('No hay token en la petición');
        error.statusCode = 401;
        throw error;
    }

    // Obtener el token y verificarlo
    const token = authHeader.split(' ')[1];
    let revisarToken;

    try {
        revisarToken = jwt.verify(token, 'LLAVESECRETA');
    } catch (error) {
        error.statusCode = 500;
        throw error;
    }

    // Si es un token válido, pero hay algun error
    if (!revisarToken) {
        const error = new Error('No auténticado');
        error.statusCode = 403;
        throw error;
    }

    next();
};