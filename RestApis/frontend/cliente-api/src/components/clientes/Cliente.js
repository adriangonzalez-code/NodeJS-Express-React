import React from 'react';
import { Link } from'react-router-dom';
import Swal from "sweetalert2";
import clienteAxios from '../../config/axios';

function Cliente({ cliente } ) {

    // Extraer los valores
    const { _id, nombre, apellido, empresa, email, telefono } = cliente;

    // Función para eliminar un cliente
    const eliminarCliente = idCliente => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción no se puede deshacer. Se eliminará el cliente",
            icon: "warning",
            showCancelButton: true,
            cancelButtonColor: "#3085d6",
            confirmButtonColor: "#d33",
            confirmButtonText: "Si, eliminiar"
        }).then((result) => {
            if (result.isConfirmed) {
                clienteAxios.delete(`/clientes/${idCliente}`)
                    .then(res => {
                        Swal.fire({
                            title: "¡Eliminado!",
                            text: res.data.mensaje,
                            icon: "success"
                        });
                    });


            }
        });
    }

    return (
        <li className="cliente">
            <div className="info-cliente">
                <p className="nombre">{ nombre } { apellido }</p>
                <p className="empresa">{ empresa }</p>
                <p>{ email }</p>
                <p>Tel: { telefono }</p>
            </div>
            <div className="acciones">
                <Link to={`/clientes/editar/${_id}`} className="btn btn-azul">
                    Editar Cliente
                </Link>
                <button type="button" className="btn btn-rojo btn-eliminar" onClick={ () => eliminarCliente(_id) }>
                    Eliminar Cliente
                </button>
            </div>
        </li>
    )
}

export default Cliente;