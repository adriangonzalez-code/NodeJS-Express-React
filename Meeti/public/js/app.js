import { OpenStreetMapProvider } from 'leaflet-geosearch';
import asistencia from './asistencia';
import eliminarComentario from './eliminarComentario';

// Obtener valores de la Base de Datos
const lat = document.querySelector('#lat').value || 20.666332695977;
const lng = document.querySelector('#lng').value || -103.3921777456999;
const direccion = document.querySelector('#direccion').value || '';
const map = L.map('map').setView([lat, lng], 15);
const geocodeService = L.esri.Geocoding.geocodeService();

let markers = new L.FeatureGroup().addTo(map);
let marker;

// Colocar el pin en Edición

if (lat && lng) {
// Agregar el pin
    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    }).addTo(map).bindPopup(direccion).openPopup();

    // Asignar al contenedor markers
    markers.addLayer(marker);

    // Detectar movimiento del marker
    marker.on('moveend', function (e) {
        marker = e.target;
        const posicion = marker.getLatLng();
        map.panTo(new L.LatLng(posicion.lat, posicion.lng));

        // Reverse geocoding cuando el usuario reubica el pin
        geocodeService.reverse().latlng(posicion, 15).run(function (error, result) {
            llenarInputs(result);

            // Asigna los valores al popup del marker
            marker.bindPopup(result.address.LongLabel);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Buscar la dirección
    const buscador = document.getElementById('formbuscador');
    buscador.addEventListener('input', buscarDireccion);
});

function buscarDireccion(e) {
    if (e.target.value.length > 8) {
        // Si existe un pin anterior, lo eliminamos
        markers.clearLayers();

        // Utilizar el provider y GeoCoder
        const provider = new OpenStreetMapProvider();

        provider.search({ query: e.target.value }).then(resultado => {
              geocodeService.reverse().latlng(resultado[0].bounds[0], 15).run(function(error, result) {

                  llenarInputs(result);

                  // Mostrar el resultado en el mapa
                  map.setView(resultado[0].bounds[0], 15);

                  // Agregar el pin
                  marker = new L.marker(resultado[0].bounds[0], {
                      draggable: true,
                      autoPan: true
                  }).addTo(map).bindPopup(resultado[0].label).openPopup();

                  // Detectar movimiento del marker
                  marker.on('moveend', function (e) {
                      marker = e.target;
                      const posicion = marker.getLatLng();
                      map.panTo(new L.LatLng(posicion.lat, posicion.lng));

                      // Reverse geocoding cuando el usuario reubica el pin
                      geocodeService.reverse().latlng(posicion, 15).run(function (error, result) {
                          llenarInputs(result);

                          // Asigna los valores al popup del marker
                          marker.bindPopup(result.address.LongLabel);
                      });
                  });
              });
            }).catch(error => console.log(error));
    }
};

function llenarInputs(resultado) {
    document.querySelector('#direccion').value = resultado?.address?.Address?? '';
    document.querySelector('#ciudad').value = resultado?.address?.City?? '';
    document.querySelector('#estado').value = resultado?.address?.Region?? '';
    document.querySelector('#pais').value = resultado?.address?.CountryCode?? '';
    document.querySelector('#lat').value = resultado?.latlng?.lat?? '';
    document.querySelector('#lng').value = resultado?.latlng?.lng?? '';
}