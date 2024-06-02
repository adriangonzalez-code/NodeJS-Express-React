(function () {
    const lat = 19.8144803;
    const lng = -90.5367896;
    const mapa = L.map('mapa-inicio').setView([lat, lng], 13);
    let markers = new L.FeatureGroup().addTo(mapa);
    let propiedades = [];

    const filtros = {
        categoria: '',
        precio: ''
    };

    const categoriasSelect = document.querySelector('#categorias');
    const preciosSelect = document.querySelector('#precios');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // Filtrado de categorias y precios
    categoriasSelect.addEventListener('change', e => {
        filtros.categoria = +e.target.value;
        filtrarPropiedades();
    });

    preciosSelect.addEventListener('change', e => {
        filtros.precio = +e.target.value;
        filtrarPropiedades();
    });

    const obtenerPropiedasdes = async () => {
        try {
            const url = '/api/propiedades';
            const respuesta = await fetch(url);
            propiedades = await respuesta.json();

            mostrarPropiedades(propiedades);

        } catch (error) {
            console.log(error);
        }
    };

    const mostrarPropiedades = proiedades => {
        proiedades.forEach((propiedad) => {
            //Agregar pines
            const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
                autoPan: true
            }).addTo(mapa).bindPopup(`
                <p class="text-indigo-600 font-bold">${propiedad.categoria.nombre}</p>
                <h1 class="text-sm font-extrabold uppercase my-2">${propiedad?.titulo}</h1>
                <img src="/uploads/${propiedad.imagen}" alt="${propiedad.titulo}">
                <p class="text-gray-600 font-bold">${propiedad.precio.nombre}</p>
                <a href="/propiedad/${propiedad.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercase text-white">Ver Propiedad</a>
            `);

            markers.addLayer(marker);
        });
    };

    const filtrarPropiedades = () => {
        const resultado = propiedades.filter(filtrarCategoria).filter(filtrarPrecio);

        console.log(resultado);
    };

    const filtrarCategoria = propiedad => filtros.categoria ? propiedad.categoria_id === filtros.categoria : propiedad;

    const filtrarPrecio = propiedades => filtros.precio ? propiedad.precio_id === filtros.precio : propiedad;

    obtenerPropiedasdes();
})();