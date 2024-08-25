const express = require('express');
const router = express.Router();

const clienteController = require('../controllers/clienteController');
const productosController = require('../controllers/productosController');
const pedidosController = require('../controllers/pedidosController');

module.exports = function () {

    // Agrega nuecos clientes via POST
    router.post('/clientes', clienteController.nuevoCliente);

    // Obtener todos los clientes
    router.get('/clientes', clienteController.mostrarClientes);

    // Muestra un cliente en específico
    router.get('/clientes/:idCliente', clienteController.mostrarCliente);

    // Actualizar Cliente
    router.put('/clientes/:idCliente', clienteController.actualizarCliente);

    // Eliminar Cliente
    router.delete('/clientes/:idCliente', clienteController.eliminarCliente);

    /* PRODUCTOS */
    router.post('/productos', productosController.subirArchivo, productosController.nuevoProducto);

    // Muestra todos los productos
    router.get('/productos', productosController.mostrarProductos);

    // Muestra un producto en específico por ID
    router.get('/productos/:idProducto', productosController.mostrarProducto);

    // Actualizar Producto
    router.put('/productos/:idProducto', productosController.subirArchivo, productosController.actualizarProducto);

    // Busqueda de productos
    router.post('/productos/busqueda/:query', productosController.buscarProducto);

    // Eliminar Producto
    router.delete('/productos/:idProducto', productosController.eliminarProducto);

    /* PEDIDOS */

    // Agrega pedidos
    router.post('/pedidos/nuevo/:idUsuario', pedidosController.nuevoPedido);

    // Mostrar todos los pedidos
    router.get('/pedidos', pedidosController.mostrarPedidos);

    // Mostrar un pedido en específico por ID
    router.get('/pedidos/:idPedido', pedidosController.mostrarPedido);

    // Actualizar Pedido
    router.put('/pedidos/:idPedido', pedidosController.actualizarPedido);

    // Eliminar Pedido
    router.delete('/pedidos/:idPedido', pedidosController.eliminarPedido);

    return router;
}