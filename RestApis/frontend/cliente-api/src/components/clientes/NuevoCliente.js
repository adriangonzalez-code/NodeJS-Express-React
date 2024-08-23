import React, { Fragment, useState } from 'react';
import Swal from "sweetalert2";
import { withRouter } from'react-router-dom';
import clienteAxios from '../../config/axios';

function NuevoCliente({ history }) {

    // cliente = state, guardarCliente = función para guardar el state
    const [cliente, guardarCliente] = useState({
        nombre: '',
        apellido: '',
        empresa: '',
        email: '',
        telefono: ''
    });

    // leer los datos del formulario
    const actualizarState = (e) => {
        // Almacenar lo que el usuario escriba en el state
        guardarCliente({
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

    // Añade en la REST API el nuevo cliente
    const agregarCliente = (e) => {
        e.preventDefault();

        // enviar los datos al API
        clienteAxios.post('/clientes', cliente)
           .then(res => {

               if (res.data.code === 11000) {
                   console.log('Error de duplicado de Mongo');
                   Swal.fire('Error', 'El email ya existe en la base de datos', 'error');
               } else {
                   console.log(res.data);
                   Swal.fire('Correcto', 'Cliente agregado correctamente','success');
               }

               // Redireccionar
               history.push('/');
            })
           .catch(error => console.error(error));
    }

    return(
        <Fragment>
            <h2>Nuevo Cliente</h2>

            <form onSubmit={ agregarCliente }>
                <legend>Llena todos los campos</legend>

                <div className="campo">
                    <label>Nombre:</label>
                    <input onChange={actualizarState} type="text" placeholder="Nombre Cliente" name="nombre"/>
                </div>

                <div className="campo">
                    <label>Apellido:</label>
                    <input onChange={actualizarState} type="text" placeholder="Apellido Cliente" name="apellido"/>
                </div>

                <div className="campo">
                    <label>Empresa:</label>
                    <input onChange={actualizarState} type="text" placeholder="Empresa Cliente" name="empresa"/>
                </div>

                <div className="campo">
                    <label>Email:</label>
                    <input onChange={actualizarState} type="email" placeholder="Email Cliente" name="email"/>
                </div>

                <div className="campo">
                    <label>Teléfono:</label>
                    <input onChange={actualizarState} type="telefono" placeholder="Teléfono Cliente" name="telefono"/>
                </div>

                <div className="enviar">
                    <input type="submit" className="btn btn-azul" value="Agregar Cliente" disabled={ validarCliente() }/>
                </div>
            </form>
        </Fragment>
    )
}

// HOC es una función que recibe un componente y devuelve un nuevo componente
export default withRouter(NuevoCliente);