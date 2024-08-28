import React, { Fragment, useState, useEffect } from "react";
import clienteAxios from "../../config/axios";
import Swal from "sweetalert2";
import { withRouter } from "react-router-dom";
import Spinner from "../layout/Spinner";

function EditarProducto(props) {

    // Obtener el id
    const { id } = props.match.params;

    // producto = state, guardarProducto = función para guardar el state
    const [producto, guardarProducto] = useState({
        nombre: '',
        precio: '',
        imagen: ''
    });

    // archivo = state, guardarArchivo = función para guardar el state
    const [archivo, guardarArchivo] = useState('');

    // Cuando el componente carga
    useEffect(() => {
        //Consultar la api para traer el producto a editar
        const consultarAPI = async () => {
            const productoConsulta = await clienteAxios.get(`/productos/${id}`);
            guardarProducto(productoConsulta.data);
        }

        consultarAPI();
    }, []);

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

    // Extraer los valores el state
    const { nombre, precio, imagen } = producto;

    // Editar un producto en la Base de datos
    const editarProducto = async (e) => {
        e.preventDefault();

        // Crear un formdata
        const formData = new FormData();
        formData.append('nombre', producto.nombre);
        formData.append('precio', producto.precio);
        formData.append('imagen', archivo);

        // Almacenarlo en la BD
        try {
            const res = await clienteAxios.put(`/productos/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Lanzar alerta
            if (res.status === 200) {
                Swal.fire(
                    'Correcto!',
                    'Producto actualizado correctamente.',
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
                title: 'Error al actualizar el producto',
                text: 'Intenta nuevamente'
            })
        }
    };

    if (!nombre) return <Spinner />

    return(
        <Fragment>
            <h2>Editar Producto</h2>

            <form onSubmit={editarProducto}>
                <legend>Llena todos los campos</legend>

                <div className="campo">
                    <label>Nombre:</label>
                    <input onChange={leerInformacionProducto} type="text" placeholder="Nombre Producto" name="nombre" defaultValue={nombre}/>
                </div>

                <div className="campo">
                    <label>Precio:</label>
                    <input onChange={leerInformacionProducto} type="number" name="precio" min="0.00" step="0.01" placeholder="Precio" defaultValue={precio}/>
                </div>

                <div className="campo">
                    <label>Imagen:</label>
                    { imagen ? (<img src={`${process.env.REACT_APP_BACKND_URL}/${imagen}`} alt="imagen" width="300"/>) : null }
                    <input onChange={leerArchivo} type="file" name="imagen"/>
                </div>

                <div className="enviar">
                    <input type="submit" className="btn btn-azul" value="Agregar Producto"/>
                </div>
            </form>
        </Fragment>
    )
}

export default withRouter(EditarProducto);