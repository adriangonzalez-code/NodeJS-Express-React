import React, { Fragment, useEffect, useState, useContext } from "react";
import { Link, withRouter } from "react-router-dom";
import clienteAxios from "../../config/axios";
import Producto from "./Producto";
import Spinner from "../layout/Spinner";
import { CRMContext } from "../../context/CRMContext";
import header from "../layout/Header";

function Productos(props) {

    // Producto = state, gurdarProducto = funcion para guardar el state
    const [productos, guardarProductos] = useState([]);

    const [clientes, guardarClientes] = useState([]);

    // utilizar valores del context
    const [auth, guardarAuth] = useContext(CRMContext);

    // useEffect para consultar la API
    useEffect(() => {

        if (auth.token !== '') {
            // Query a la api
            const consultarAPI = async () => {
                try {
                    const productosConsulta = await clienteAxios.get('/productos', {
                        headers: {
                            'Authorization': `Bearer ${auth.token}`
                        }
                    });

                    guardarProductos(productosConsulta.data);
                } catch (error) {
                    // Error con autorización
                    if (error.response.status === 500) {
                        props.history.push('/iniciar-sesion');
                    }
                }
            }
            // llamado a la api
            consultarAPI();
        } else {
            props.history.push('/iniciar-sesion');
        }
    }, [productos]);

    // Si el state está como false
    if (!auth.auth) {
        props.history.push('/iniciar-sesion');
    }

    // spinner de carga
    if (!productos.length) return <Spinner />

    return(
        <Fragment>
            <h2>Productos</h2>

            <Link to={"/productos/nuevo"} className="btn btn-verde nvo-cliente"> <i className="fas fa-plus-circle"></i>
                Nuevo Producto
            </Link>

            <ul className="listado-productos">
                { productos.map(producto => (
                    <Producto key={producto._id} producto={producto} />
                )) }
            </ul>
        </Fragment>
    )
}

export default withRouter(Productos);