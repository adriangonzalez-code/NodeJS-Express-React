import React, { Fragment, useEffect, useState } from "react";
import clientAxios from '../../config/axios';

import DetallesPedido from './DetallesPedido';

function Pedidos() {

    const [pedidos, guardarPedidos] = useState([]);

    useEffect(() => {
        const consultarAPI = async () => {
            const resultado = await clientAxios.get('/pedidos');
            guardarPedidos(resultado.data);
        };

        consultarAPI();
    }, []);

    return(
        <Fragment>
            <h2>Pedidos</h2>

            <ul className="listado-pedidos">
                { pedidos.map( pedido => (
                    <DetallesPedido key={pedido._id} pedido={pedido} />
                )) }
            </ul>
        </Fragment>
    )
}

export default Pedidos;