import React from 'react';

function FormCantidadProducto(props) {

    const { producto, restarProducto, aumentarProducto, index, eliminarProductoPedido } = props;

    return (
        <li>
            <div className="texto-producto">
                <p className="nombre">{ producto.nombre }</p>
                <p className="precio">$ { producto.precio }</p>
            </div>
            <div className="acciones">
                <div className="contenedor-cantidad">
                    <i className="fas fa-minus" onClick={() => restarProducto(index)}></i>
                    <p>{ producto.cantidad }</p>
                    <i className="fas fa-plus" onClick={() => aumentarProducto(index)}></i>
                </div>
                <button onClick={() => eliminarProductoPedido(producto.producto)} type="button" className="btn btn-rojo">
                    <i className="fas fa-minus-circle"></i>
                    Eliminar Producto
                </button>
            </div>
        </li>
    );
}

export default FormCantidadProducto;