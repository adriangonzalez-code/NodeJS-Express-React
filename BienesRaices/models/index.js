import Propiedad from "./Propiedad.js";
import Categoria from "./Categoria.js";
import Precio from "./Precio.js";
import Usuario from "./Usuario.js";

Propiedad.belongsTo(Precio, { foreignKey: 'precio_id' });
Propiedad.belongsTo(Categoria, { foreignKey: 'categoria_id' });
Propiedad.belongsTo(Usuario, { foreignKey: 'usuario_id' });

export {
    Precio,
    Categoria,
    Propiedad,
    Usuario
}