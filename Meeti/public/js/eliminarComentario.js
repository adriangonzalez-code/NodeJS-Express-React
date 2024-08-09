import axios from "axios";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", () => {
    const formsEliminar = document.querySelectorAll(".eliminar-comentario");

    // REvisar que existan los formularios
    if (formsEliminar.length > 0) {
        formsEliminar.forEach(form => {
            form.addEventListener("submit", eliminarComentario);

        });
    }
});

function eliminarComentario(e) {
    e.preventDefault();

    Swal.fire({
        title: "Eliminar Comentario?",
        text: "Un comentario será eliminado permanentemente. ¿Estás seguro?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Si, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.value) {

            // Tomar el id del comentario
            const comentarioId = this.children[0].value;

            // Crear el objeto
            const datos = {
                comentarioId
            };

            // Ejecutar axios y pasar los datos
            axios.post(this.action, datos)
                .then(respuesta => {
                    Swal.fire({
                        title: "Eliminado!",
                        text: respuesta.data,
                        icon: "success"
                    });

                    // Eliminar del DOM
                    this.parentElement.parentElement.remove();
                }).catch(error => {
                    if (error.response.status === 403 || error.response.status === 404) {
                        Swal.fire({
                            title: "Error",
                            text: error.response.data,
                            icon: "error"
                        });
                    }
            });
        }
    });
}