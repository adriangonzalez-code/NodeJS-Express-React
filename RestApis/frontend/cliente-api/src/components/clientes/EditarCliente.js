import React, { Fragment, useState, useEffect } from 'react';
import Swal from "sweetalert2";
import { withRouter } from'react-router-dom';
import clienteAxios from '../../config/axios';

function EditarCliente(props) {

    const { id } = props.match.params;

    // cliente = state, guardarCliente = función para guardar el state
    const [cliente, datosCliente] = useState({
        nombre: '',
        apellido: '',
        empresa: '',
        email: '',
        telefono: ''
    });

    // leer los datos del formulario
    const actualizarState = (e) => {
        // Almacenar lo que el usuario escriba en el state
        datosCliente({
            // obtener una copia del state actual
           ...cliente,
            [e.target.name]: e.target.value
        });
    }

    // Validar el formulario
    const validarCliente = () => {
        // Destructuring
        const { nombre, apellido, empresa, email, telefono } = cliente;

        let valido = !nombre.length || !apellido.length || !empresa.length || !email.length || !telefono.length;

        return valido;
    }

    // Query a ala API
    const consultarAPI = async () => {
        const clienteConsulta = await clienteAxios.get(`/clientes/${id}`);

        datosCliente(clienteConsulta.data);
    }

    // useEffect, cuando el componente carga
    useEffect(() => {
        consultarAPI();
    }, []);

    // Enviar una petición por axios para editar un cliente
    const actualizarCliente = async (e) => {
        e.preventDefault();

        await clienteAxios.put(`/clientes/${id}`, cliente)
            .then((res) => {
                if (res.data.code === 11000) {
                    console.log('Error de duplicado de Mongo');
                    Swal.fire('Error', 'El email ya existe en la base de datos', 'error');
                } else {
                    console.log(res.data);
                    Swal.fire('Correcto', 'Cliente editado correctamente','success');
                }
            });

        // Redireccionar
        props.history.push('/');
    }

    return(
        <Fragment>
            <h2>Editar Cliente</h2>

            <form onSubmit={actualizarCliente}>
                <legend>Llena todos los campos</legend>

                <div className="campo">
                    <label>Nombre:</label>
                    <input onChange={actualizarState} type="text" placeholder="Nombre Cliente" name="nombre" value={cliente.nombre} />
                </div>

                <div className="campo">
                    <label>Apellido:</label>
                    <input onChange={actualizarState} type="text" placeholder="Apellido Cliente" name="apellido" value={cliente.apellido} />
                </div>

                <div className="campo">
                    <label>Empresa:</label>
                    <input onChange={actualizarState} type="text" placeholder="Empresa Cliente" name="empresa" value={cliente.empresa} />
                </div>

                <div className="campo">
                    <label>Email:</label>
                    <input onChange={actualizarState} type="email" placeholder="Email Cliente" name="email" value={cliente.email} />
                </div>

                <div className="campo">
                    <label>Teléfono:</label>
                    <input onChange={actualizarState} type="telefono" placeholder="Teléfono Cliente" name="telefono" value={cliente.telefono} />
                </div>

                <div className="enviar">
                    <input type="submit" className="btn btn-azul" value="Guardar Cambios" disabled={ validarCliente() }/>
                </div>
            </form>
        </Fragment>
    )
}

// HOC es una función que recibe un componente y devuelve un nuevo componente
export default withRouter(EditarCliente);