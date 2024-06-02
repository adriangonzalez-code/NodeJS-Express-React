import {Categoria, Precio, Propiedad} from "../models/index.js";


const propiedades = async(req, res) => {

    const propiedades = await Propiedad.findAll({
        include: [
            {model: Precio, as: 'precio'},
            {model: Categoria, as: 'categoria'}
        ]
    });

    return res.json(propiedades);
};

export {
    propiedades,
}