import React, { useEffect, useState, Fragment } from 'react';

// Importar clientes axios
import clienteAxios from '../../config/axios';

import Cliente from './Cliente';

import { Link } from'react-router-dom';

function Clientes() {

    // Trabajar con el state
    // cliente = state, guardarClientes = funcion para guardar el state
    const [clientes, guardarClientes] = useState([]);

    // Query a la api
    const consultarAPI = async () => {
        const clienteConsulta = await clienteAxios.get('/clientes');

        // coloca el resultado en el state
        guardarClientes(clienteConsulta.data);
    }

    // useEffect es similar a componentDidMount y willUnmount
    useEffect(() => {
        consultarAPI();
    }, [clientes]);

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

export default Clientes;