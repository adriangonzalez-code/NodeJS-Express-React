import React, { Fragment, useState } from "react";
import clienteAxios from "../../config/axios";
import Swal from "sweetalert2";
import { withRouter } from "react-router-dom";

function NuevoProducto(props) {

    // producto = state, guardarProducto = función para guardar el state
    const [producto, guardarProducto] = useState({
        nombre: '',
        precio: ''
    });

    // archivo = state, guardarArchivo = función para guardar el state
    const [archivo, guardarArchivo] = useState('');

    // Leer los datos del formulario
    const leerInformacionProducto = e => {
        guardarProducto({
            // Obtener una copia del state actual
           ...producto,
            [e.target.name]: e.target.value
        });
    }

    // coloca la imagen en el state
    const leerArchivo = e => {
        guardarArchivo(e.target.files[0]);
    }

    // Almacena el nuevo producto en la Base de datos
    const agregarProducto = async e => {
        e.preventDefault();

        // Crear un formdata
        const formData = new FormData();
        formData.append('nombre', producto.nombre);
        formData.append('precio', producto.precio);
        formData.append('imagen', archivo);

        // Almacenarlo en la BD
        try {
            const res = await clienteAxios.post('/productos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Lanzar alerta
            if (res.status === 200) {
                Swal.fire(
                    'Correcto!',
                    'Producto agregado correctamente.',
                   'success'
                );
            }

            //redireccionar
            props.history.push('/productos');
        } catch (error) {
            console.error(error);
            // Lanzar alerta
            Swal.fire({
                type: 'error',
                title: 'Error al agregar el producto',
                text: 'Intenta nuevamente'
            })
        }
    }

    return(
        <Fragment>
            <h2>Nuevo Producto</h2>

            <form onSubmit={agregarProducto}>
                <legend>Llena todos los campos</legend>

                <div className="campo">
                    <label>Nombre:</label>
                    <input onChange={leerInformacionProducto} type="text" placeholder="Nombre Producto" name="nombre"/>
                </div>

                <div className="campo">
                    <label>Precio:</label>
                    <input onChange={leerInformacionProducto} type="number" name="precio" min="0.00" step="0.01" placeholder="Precio"/>
                </div>

                <div className="campo">
                    <label>Imagen:</label>
                    <input onChange={leerArchivo} type="file" name="imagen"/>
                </div>

                <div className="enviar">
                    <input type="submit" className="btn btn-azul" value="Agregar Producto"/>
                </div>
            </form>
        </Fragment>
    )
}

export default withRouter(NuevoProducto);