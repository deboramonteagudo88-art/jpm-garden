
const TELEFONO_EMPRESA = "5491141702978";

document.getElementById("formulario-contacto").addEventListener("submit", function(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const celular = document.getElementById("celular").value.trim();
    const email = document.getElementById("gmail").value.trim();
    const zona = document.getElementById("zona").value.trim();
    const consulta = document.getElementById("mensaje").value.trim();

    if (!nombre || !celular || !email || !zona) {
        alert("Por favor, completá todos los campos obligatorios.");
        return;
    }

    const mensaje =
        "Hola JPM Garden, quiero realizar una consulta desde la página web.\n\n" +
        "Nombre: " + nombre + "\n" +
        "Celular: " + celular + "\n" +
        "Correo: " + email + "\n" +
        "Zona: " + zona + "\n\n" +
        "Consulta: " + (consulta || "Quisiera recibir información sobre sus servicios.");

    const url =
        "https://wa.me/" + TELEFONO_EMPRESA +
        "?text=" + encodeURIComponent(mensaje);

    window.location.href = url;
});
