
const TELEFONO_EMPRESA = "5491141702978";
const CLAVE_CARRITO = "jpmGardenCarrito";

let carrito = [];

try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
    if (Array.isArray(guardado)) {
        carrito = guardado.filter(item =>
            typeof item.nombre === "string" &&
            Number.isFinite(item.precio) &&
            Number.isInteger(item.cantidad) &&
            item.cantidad > 0 &&
            item.precio >= 0
        );
    }
} catch (error) {
    carrito = [];
}

const lista = document.getElementById("lista-carrito");
const totalSpan = document.getElementById("total-precio");
const formulario = document.getElementById("formulario-pedido");

function guardarCarrito() {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

function formatoPrecio(numero) {
    return numero.toLocaleString("es-AR");
}

function actualizarVista() {
    lista.innerHTML = "";

    if (carrito.length === 0) {
        const mensaje = document.createElement("li");
        mensaje.className = "vacio";
        mensaje.textContent = "Todavía no agregaste productos ni servicios.";
        lista.appendChild(mensaje);
    }

    carrito.forEach((item, indice) => {
        const li = document.createElement("li");
        li.className = "item-carrito";

        const info = document.createElement("div");
        info.className = "item-info";

        const nombre = document.createElement("strong");
        nombre.textContent = item.nombre;

        const detalle = document.createElement("small");
        detalle.textContent = item.precio === 0
            ? "A cotizar"
            : "$" + formatoPrecio(item.precio) + " por unidad";

        info.append(nombre, detalle);

        const acciones = document.createElement("div");
        acciones.className = "item-acciones";

        if (item.precio > 0) {
            const menos = document.createElement("button");
            menos.type = "button";
            menos.textContent = "−";
            menos.setAttribute("aria-label", "Restar una unidad");
            menos.dataset.accion = "menos";
            menos.dataset.indice = indice;

            const cantidad = document.createElement("span");
            cantidad.textContent = item.cantidad;

            const mas = document.createElement("button");
            mas.type = "button";
            mas.textContent = "+";
            mas.setAttribute("aria-label", "Agregar una unidad");
            mas.dataset.accion = "mas";
            mas.dataset.indice = indice;

            acciones.append(menos, cantidad, mas);
        } else {
            const cantidad = document.createElement("span");
            cantidad.textContent = "Cantidad: " + item.cantidad;
            acciones.appendChild(cantidad);
        }

        const subtotal = document.createElement("strong");
        subtotal.textContent = item.precio === 0
            ? "A cotizar"
            : "$" + formatoPrecio(item.precio * item.cantidad);

        const eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.textContent = "Eliminar";
        eliminar.className = "btn-eliminar";
        eliminar.dataset.accion = "eliminar";
        eliminar.dataset.indice = indice;

        li.append(info, acciones, subtotal, eliminar);
        lista.appendChild(li);
    });

    const total = carrito.reduce(
        (suma, item) => suma + item.precio * item.cantidad,
        0
    );

    totalSpan.textContent = formatoPrecio(total);

    guardarCarrito();

    if (carrito.length === 0) {
        formulario.hidden = true;
    }
}

// Agregar productos o servicios
document.querySelectorAll("[data-nombre][data-precio]").forEach(boton => {
    boton.addEventListener("click", () => {
        const nombre = boton.dataset.nombre;
        const precio = Number(boton.dataset.precio);

        if (!nombre || !Number.isFinite(precio) || precio < 0) return;

        const existente = carrito.find(item =>
            item.nombre === nombre && item.precio === precio
        );

        if (existente) {
            existente.cantidad++;
        } else {
            carrito.push({
                nombre,
                precio,
                cantidad: 1
            });
        }

        actualizarVista();

        const textoOriginal = boton.textContent;
        boton.textContent = "¡Agregado!";
        setTimeout(() => {
            boton.textContent = textoOriginal;
        }, 1000);
    });
});

// Modificar cantidades y eliminar artículos
lista.addEventListener("click", event => {
    const boton = event.target.closest("button[data-accion]");
    if (!boton) return;

    const indice = Number(boton.dataset.indice);
    if (!Number.isInteger(indice) || !carrito[indice]) return;

    const item = carrito[indice];

    switch (boton.dataset.accion) {
        case "mas":
            item.cantidad++;
            break;

        case "menos":
            item.cantidad--;

            if (item.cantidad <= 0) {
                carrito.splice(indice, 1);
            }
            break;

        case "eliminar":
            carrito.splice(indice, 1);
            break;
    }

    actualizarVista();
});

// Vaciar carrito
document.getElementById("vaciar-carrito").addEventListener("click", () => {
    if (carrito.length === 0) return;

    if (confirm("¿Querés eliminar todos los productos del carrito?")) {
        carrito = [];
        formulario.reset();
        actualizarVista();
    }
});

// Mostrar formulario
document.getElementById("confirmar-pedido").addEventListener("click", () => {
    if (carrito.length === 0) {
        alert("Primero agregá algún producto o servicio.");
        return;
    }

    formulario.hidden = false;
    formulario.scrollIntoView({ behavior: "smooth", block: "center" });
});

// Enviar pedido por WhatsApp
formulario.addEventListener("submit", event => {
    event.preventDefault();

    if (carrito.length === 0) return;

    const nombre = document.getElementById("nombre-pedido").value.trim();
    const celular = document.getElementById("celular-pedido").value.trim();
    const zona = document.getElementById("zona-pedido").value.trim();

    if (!nombre || !celular || !zona) return;

    let detalle = "";

    carrito.forEach(item => {
        if (item.precio === 0) {
            detalle += `• ${item.nombre} x${item.cantidad} (A cotizar)\n`;
        } else {
            detalle += `• ${item.nombre} x${item.cantidad} - $${formatoPrecio(item.precio * item.cantidad)}\n`;
        }
    });

    const total = carrito.reduce(
        (suma, item) => suma + item.precio * item.cantidad,
        0
    );

    const mensaje =
        "Hola JPM Garden, quiero realizar un pedido desde la web.\n\n" +
        "Cliente: " + nombre + "\n" +
        "Celular: " + celular + "\n" +
        "Zona: " + zona + "\n\n" +
        "DETALLE DEL PEDIDO:\n" +
        detalle + "\n" +
        "Total estimado de productos: $" + formatoPrecio(total) +
        "\nLos servicios están sujetos a cotización.";

    window.location.href =
        "https://wa.me/" + TELEFONO_EMPRESA +
        "?text=" + encodeURIComponent(mensaje);
});

actualizarVista();
