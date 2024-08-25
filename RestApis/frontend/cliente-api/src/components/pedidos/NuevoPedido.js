import React, { Fragment, useState, useEffect } from 'react';
import clientAxios from '../../config/axios';
import Swal from "sweetalert2";
import { withRouter } from'react-router-dom';

import FormBuscarProducto from './FormBuscarProducto';
import FormCantidadProducto from './FormCantidadProducto';
import pedidos from "./Pedidos";

function NuevoPedido(props) {

    // Exraer ID del cliente
    const { id } = props.match.params;

    // state
    const [ cliente, guardarCliente ] = useState({});
    const [ busqueda, guardarBusqueda ] = useState('');
    const [ productos, guardarProductos ] = useState([]);
    const [ total, guardarTotal ] = useState(0);

    useEffect(() => {
        // Obtener el cliente
        const consultarAPI = async () => {
            // Consultar el cliente actual
            const resultado = await clientAxios.get(`/clientes/${id}`);
            guardarCliente(resultado.data);
        };

        // consultar API
        consultarAPI();

        // Actualizar el total
        actualizarTotal();
    }, [productos]);

    const buscarProducto = async (e) => {
        e.preventDefault();

        // Obtener los productos de la busqueda
        const resultadoBusqueda = await clientAxios.post(`/productos/busqueda/${busqueda}`);

        // Si no hay resultados, mostrar una alerta, contrario agregar al state

        if (resultadoBusqueda.data[0]) {
            let productoResultado = resultadoBusqueda.data[0];

            // Agregar la llave "producto" (copia el id)
            productoResultado.producto = resultadoBusqueda.data[0]._id;
            productoResultado.cantidad = 0;

            // Ponerlo en el state
            guardarProductos([...productos, productoResultado]);
        } else {
            // No hay resultados
            Swal.fire('No hay resultados', 'No se encontraron productos con ese nombre', 'error');
        }
    }

    // Almacenar la busqueda en el state
    const leerDatosBusqueda = (e) => {
        guardarBusqueda(e.target.value);
    }

    // Actualizar la cantidad del producto
    const restarProducto = (i) => {
        console.log('uno menos...', i);

        // Copiar el arreglo original de productos
        const todosProductos = [...productos];

        // Validar si está en 0, no puede si mas allá
        if (todosProductos[i].cantidad === 0) return;

        // decremento
        todosProductos[i].cantidad--;

        // Almacenar en el state
        guardarProductos(todosProductos);
    }

    const aumentarProducto = (i) => {
        console.log('uno mas...', i);

        // Copiar el arreglo para no mutar el original
        const todosProductos = [...productos];

        // Incremento
        todosProductos[i].cantidad++;

        // Almacenar en el state
        guardarProductos(todosProductos);
    }

    // Eliminar un producto del state
    const eliminarProductoPedido = (id) => {
        const todosProductos = productos.filter(producto => producto.producto !== id);

        guardarProductos(todosProductos);
    }

    // Actualizar el total a pagar
    const actualizarTotal = () => {
        // Si el arreglo de producto es a 0: el total es 0
        if (productos.length === 0) {
            guardarTotal(0)
            return;
        }

        // Calcular el nuevo total
        let nuevoTotal = 0;

        // Recorrer todos los productos, sus cantidades y precios
        productos.map(producto => nuevoTotal += (producto.cantidad * producto.precio));

        // Almacenar el nuevo total
        guardarTotal(nuevoTotal);
    };

    // Almacena el pedido en la base de datos
    const realizarPedido = async e => {
        e.preventDefault();

        // Extraer el ID
        const { id } = props.match.params;

        const pedido = {
            cliente: id,
            pedido: productos,
            total
        };

        // Almacenarlo en la BD
        const resultado = await clientAxios.post(`/pedidos/nuevo/${id}`, pedido);

        if (resultado.status === 200) {
            // Alerta de todo bien
            Swal.fire('Pedido realizado', 'El pedido ha sido realizado correctamente','success');
        } else {
            // Alerta de error
            Swal.fire('Error', 'Hubo un error al realizar el pedido', 'error');
        }

        // redireccionar
        props.history.push('/pedidos');
    };

    return(
        <Fragment>
            <h2>Nuevo Pedido</h2>

            <div className="ficha-cliente">
                <h3>Datos de Cliente</h3>
                <p>Nombre: { cliente.nombre } { cliente.apellido }</p>
                <p>Teléfono: { cliente.telefono }</p>
            </div>

            <FormBuscarProducto buscarProducto={buscarProducto} leerDatosBusqueda={leerDatosBusqueda} />

            <ul className="resumen">
                { productos.map((producto, index) => (
                    <FormCantidadProducto key={producto.producto} producto={producto} restarProducto={restarProducto} aumentarProducto={aumentarProducto} index={index} eliminarProductoPedido={eliminarProductoPedido} />
                )) }
            </ul>

            <div className="campo">
                <p className="total">Total a pagar <span>$ {total}</span></p>
            </div>

            { total > 0 ? (
                <form onSubmit={realizarPedido}>
                    <input type="submit" className="btn btn-verde btn-block" value="Realizar Pedido"/>
                </form>
            ) : null }
        </Fragment>
    )
}

export default withRouter(NuevoPedido);