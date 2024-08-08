document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#ubicacion-meeti')) {
        mostrarMapa();
    }
});

function mostrarMapa() {
    // Obtener los valores de latitud y longitud de la ubicación
    const lat =  document.querySelector('#lat').value;
    const lng =  document.querySelector('#lng').value;
    const direccion =  document.querySelector('#direccion').value;

    var map = L.map('ubicacion-meeti').setView([lat, lng], 16);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([lat, lng]).addTo(map)
        .bindPopup(direccion)
        .openPopup();
}