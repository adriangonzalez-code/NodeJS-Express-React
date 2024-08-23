const Pedidos = require('../models/Pedidos');

// Agrega un nuevo pedido
exports.nuevoPedido = async (req, res, next) => {
    const pedido = new Pedidos(req.body);

    try {
        await pedido.save();
        res.json({ mensaje: 'Se agregó un nuevo pedido' });
    } catch (error) {
        console.error(error);
        next();
    }
};

// Muestra todos los pedidos
exports.mostrarPedidos = async (req, res, next) => {
    try {
        const pedidos = await Pedidos.find({}).populate('cliente').populate({
            path: 'pedido.producto',
            model: 'Productos'
        });
        res.json(pedidos);
    } catch (error) {
        console.error(error);
        next();
    }
}

// Muestra un pedido por ID
exports.mostrarPedido = async (req, res, next) => {
    try {
        const pedido = await Pedidos.findById(req.params.idPedido).populate('cliente').populate({
            path: 'pedido.producto',
            model: 'Productos'
        });

        if (!pedido) {
            res.json({ mensaje: 'Pedido no encontrado' });
            return next();
        }

        res.json(pedido);
    } catch (error) {
        console.error(error);
        next();
    }
};

// Actualiza un pedido vía ID
exports.actualizarPedido = async (req, res, next) => {
    try {
        let pedido = await Pedidos.findOneAndUpdate(
            { _id: req.params.idPedido },
            req.body,
            { new: true }
        ).populate('cliente').populate({
            path: 'pedido.producto',
            model: 'Productos'
        });

        res.json(pedido);
    } catch (error) {
        console.error(error);
        next();
    }
};

// Elimina un pedido vía ID
exports.eliminarPedido = async (req, res, next) => {
    try {
        await Pedidos.findByIdAndDelete(req.params.idPedido);
        res.json({ mensaje: 'Pedido eliminado' });
    } catch (error) {
        console.error(error);
        next();
    }
};