import React, { Fragment, useContext } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import clienteAxios from '../../config/axios';
import { CRMContext } from "../../context/CRMContext";

function Producto({ producto }) {

    // Elimina un producto
    const eliminarProducto = id => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción no se puede deshacer. Se eliminará el producto",
            icon: "warning",
            showCancelButton: true,
            cancelButtonColor: "#3085d6",
            confirmButtonColor: "#d33",
            confirmButtonText: "Si, eliminiar",
            cancelButtonText: "No, Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                clienteAxios.delete(`/productos/${id}`)
                    .then(res => {
                        if (res.status === 200) {
                            Swal.fire({
                                title: "¡Eliminado!",
                                text: res.data.mensaje,
                                icon: "success"
                            });
                        }
                    });
            }
        });
    };

    const {_id, nombre, precio, imagen} = producto;

    return(

        <Fragment>
            <h2>Producto</h2>

            <li className="producto">
                <div className="info-producto">
                    <p className="nombre">{ nombre }</p>
                    <p className="precio">${ precio }</p>

                    { imagen ? (
                        <img src={`${process.env.REACT_APP_BACKND_URL}/${imagen}`} alt="imagen"/>
                    ) : null}
                </div>
                <div className="acciones">
                    <Link to={`/productos/editar/${_id}`} className="btn btn-azul">
                        <i className="fas fa-pen-alt"></i>
                        Editar Producto
                    </Link>

                    <button onClick={() => eliminarProducto(_id)} type="button" className="btn btn-rojo btn-eliminar">
                        <i className="fas fa-times"></i>
                        Eliminar Producto
                    </button>
                </div>
            </li>
        </Fragment>

    )
}

export default Producto;