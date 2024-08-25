const Productos = require('../models/Productos');
const multer = require('multer');
const shortid = require('shortid');

const configuracionMulter = {
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname + '../../uploads/');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            // El formato es válido
            cb(null, true);
        } else {
            // El formato no es válido
            cb(new Error('Formato no válido'));
        }
    }
};

// Pasar la configuración y el campo
const upload = multer(configuracionMulter).single('imagen');

// Sube el archivo al directorio uploads
exports.subirArchivo = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            res.json({ mensaje: error.message });
        }
        return next();
    });
};

// Agregar un nuevo producto
exports.nuevoProducto = async (req, res, next) => {
    const producto = new Productos(req.body);

    try {
        if (req.file.filename) {
            producto.imagen = req.file.filename;
        }

        await producto.save();
        res.json({ mensaje: 'Se agregó un nuevo producto' });
    } catch (error) {
        console.error(error);
        next();
    }
};

// Muestra todos los productos
exports.mostrarProductos = async (req, res, next) => {
    try {
        const productos = await Productos.find({});
        res.json(productos);
    } catch (error) {
        console.error(error);
        next();
    }
};

// Muestra un producto en específico por ID
exports.mostrarProducto = async (req, res, next) => {
    try {
        const producto = await Productos.findById(req.params.idProducto);

        if (!producto) {
            res.json({ mensaje: 'Este producto no existe' });
            return next();
        }

        res.json(producto);
    } catch (error) {
        console.error(error);
        next();
    }
};

// Actualizar un producto via ID
exports.actualizarProducto = async (req, res, next) => {
    try {

        // construir el nuevo producto
        let nuevoProducto = req.body;

        // Verificar si se subió un nuevo archivo
        if (req.file.filename) {
            nuevoProducto.imagen = req.file.filename;
        } else {
            let productoAnterior = await Productos.findById(req.params.idProducto);
            nuevoProducto.imagen = productoAnterior.imagen;
        }

        let producto = await Productos.findOneAndUpdate({_id: req.params.idProducto}, nuevoProducto, {new: true});

        res.json({mensaje: 'Se actualizó el producto'});
    } catch (error) {
        console.error(error);
        next();
    }
}

// Eliminar un producto via ID
exports.eliminarProducto = async (req, res, next) => {
    try {
        await Productos.findByIdAndDelete({ _id : req.params.idProducto});

        res.json({mensaje: 'El producto se ha eliminado'});
    } catch (error) {
        console.error(error);
        next();
    }
}

exports.buscarProducto = async (req, res, next) => {
    try {
        // Obtener el query
        const { query } = req.params;

        const productos = await Productos.find({ nombre: new RegExp(query, 'i')  });

        res.json(productos);
    } catch (error) {
        console.error(error);
        next();
    }
}