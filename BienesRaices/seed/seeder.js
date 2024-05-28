import { exit } from 'node:process';
import db from '../config/db.js';
import categorias from "./categorias.js";
import precios from "./precios.js";
import { Categoria, Precio } from "../models/index.js";

const importarDatos = async () => {
    try {
        // Autenticar
        await db.authenticate();

        // Generar las Columnas
        await db.sync();

        // Insertar los datos
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios)
        ]);

        console.log('Datos insertados correctamente');
        exit(0);

    } catch (error) {
        console.log(error);
        exit(1);
    }
};

const eliminarDatos = async () => {
    try {
        await Promise.all([
            Categoria.destroy({where: {}, truncate: true}),
            Precio.destroy({where: {}, truncate: true})
        ]);
        console.log('Datos eliminados correctamente');
        exit(0);
    } catch (error) {
        console.log(error);
        exit(1);
    }
};

if (process.argv[2] === "-i") {
    importarDatos();
}

if (process.argv[2] === "-e") {
    eliminarDatos();
}