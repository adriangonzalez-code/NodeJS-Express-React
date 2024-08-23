const Clientes = require('../models/Clientes');

exports.nuevoCliente = async (req, res, next) => {

    const cliente = new Clientes(req.body);

    try {
        // Almacenar el registro
        await cliente.save();
        res.json({ mensaje: 'Se agregó un nuevo cliente' });
    } catch (error) {
        // Si hay error, console.log y next
        console.error(error);
        next();
    }
};

// Muestra todos los clientes
exports.mostrarClientes = async (req, res, next) => {
    try {
        const clientes = await Clientes.find({});
        res.json(clientes);
    } catch (error) {
        console.error(error);
        next();
    }
};

// Muestra un cliente por ID
exports.mostrarCliente = async (req, res, next) => {
    try {
        const cliente = await Clientes.findById(req.params.idCliente);

        if (!cliente) {
            res.json({ mensaje: 'Cliente no encontrado' });
        }

        res.json(cliente);
    } catch (error) {
        console.error(error);
        next();
    }
};

// Actualiza un cliente por ID
exports.actualizarCliente = async (req, res, next) => {
    try {
        const cliente = await Clientes.findOneAndUpdate( {_id : req.params.idCliente }, req.body, { new: true });

        if (!cliente) {
            res.json({ mensaje: 'Cliente no encontrado' });
        }

        res.json(cliente);
    } catch (error) {
        console.error(error);
        next();
    }
};

// Elimina un cliente por ID
exports.eliminarCliente = async (req, res, next) => {
    try {
        const cliente = await Clientes.findByIdAndDelete({_id: req.params.idCliente});

        if (!cliente) {
            res.json({ mensaje: 'Cliente no encontrado' });
        }

        res.json({ mensaje: 'Cliente se ha eliminado' });
    } catch (error) {
        console.error(error);
        next();
    }
};