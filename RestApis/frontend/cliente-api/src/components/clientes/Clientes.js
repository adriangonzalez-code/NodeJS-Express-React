import React, {useEffect, useState, Fragment, useContext} from 'react';

// Importar clientes axios
import clienteAxios from '../../config/axios';

import Cliente from './Cliente';

import { Link, withRouter } from'react-router-dom';
import Spinner from "../layout/Spinner";
import { CRMContext } from "../../context/CRMContext";

function Clientes(props) {

    // Trabajar con el state
    // cliente = state, guardarClientes = funcion para guardar el state
    const [clientes, guardarClientes] = useState([]);

    // utilizar valores del context
    const [auth, guardarAuth] = useContext(CRMContext);

    // useEffect es similar a componentDidMount y willUnmount
    useEffect(() => {

        if (auth.token !== '') {
            // Query a la api
            const consultarAPI = async () => {
                try {
                    const clienteConsulta = await clienteAxios.get('/clientes', {
                        headers: {
                            'Authorization': `Bearer ${auth.token}`
                        }
                    });

                    // coloca el resultado en el state
                    guardarClientes(clienteConsulta.data);
                } catch (error) {
                    // Error con autorización
                    if (error.response.status === 500) {
                        props.history.push('/iniciar-sesion');
                    }
                }
            }

            consultarAPI();
        } else {
            props.history.push('/iniciar-sesion');
        }
    }, [clientes]);


    // Si el state está como false
    if (!auth.auth) {
        props.history.push('/iniciar-sesion');
    }

    if (!clientes.length) return <Spinner />

    return(
        <Fragment>
            <h2>Clientes</h2>

            <Link to={"/clientes/nuevo"} className="btn btn-verde nvo-cliente">
                Nuevo Cliente
            </Link>

            <ul className="listado-clientes">
                {clientes.map(cliente => (
                    <Cliente key={cliente._id} cliente={cliente}/>
                ))}
            </ul>
        </Fragment>
    )
}

export default withRouter(Clientes);