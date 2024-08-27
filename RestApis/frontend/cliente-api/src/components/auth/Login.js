import React, {Fragment, useContext, useState} from 'react';
import clienteAxios from '../../config/axios';
import Swal from "sweetalert2";
import { withRouter } from'react-router-dom';

// context
import { CRMContext } from "../../context/CRMContext";

function Login(props) {

    // Auth y token
    const [auth, guardarAuth] = useContext(CRMContext);

    // State con los datos del formulario
    const [credenciales, guardarCredenciales] = useState({});

    // Almacenar lo que el usuario escriba en el state
    const leerDatos = e => {
        guardarCredenciales({
           ...credenciales,
            [e.target.name]: e.target.value
        });
    }

    const iniciarSesion = async e => {
        e.preventDefault();

        // Autenticar al usuario
        try {
            const respuesta = await clienteAxios.post('/iniciar-sesion', credenciales);

            // Extraer el token y colocarlo en el local storage
            const { token } = respuesta.data;
            localStorage.setItem('token', token);

            // Colocarlo en el state
            guardarAuth({
                token,
                auth: true
            });

            // Alerta
            Swal.fire('Correcto', 'Has iniciado sesión correctamente','success');

            // Redireccionar
            props.history.push('/');
        } catch (error) {
            Swal.fire('Error', error.response.data.mensaje, 'error');
        }
    };

    return (
        <Fragment>
            <div className="login">
                <h2>Iniciar Sesión</h2>

                <div className="contenedor-formulario">
                    <form onSubmit={iniciarSesion}>
                        <div className="campo">
                            <label htmlFor="">Email</label>
                            <input type="text" name="email" placeholder="Email" required onChange={leerDatos}/>
                        </div>
                        <div className="campo">
                            <label htmlFor="">Password</label>
                            <input type="password" name="password" placeholder="Password" required
                                   onChange={leerDatos}/>
                        </div>

                        <input type="submit" value="Iniciar Sesion" className="btn btn-verde btn-block"/>
                    </form>
                </div>
            </div>
        </Fragment>
    )
}

export default withRouter(Login);