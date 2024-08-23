import React from'react';

/**  **/
import { Link } from'react-router-dom';

const Navegacion = () => {
    return (
        <aside className="sidebar col-3">
            <h2>Administración</h2>

            <nav className="navegacion">
                <Link to={"/"} className="">Clientes</Link>
                <Link to={"/productos"} className="">Productos</Link>
                <Link to={"/pedidos"} className="">Pedidos</Link>
            </nav>
        </aside>
    );
};

export default Navegacion;