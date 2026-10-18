// ============================================================
// SCRIPT.JS — PANEL ADMIN
// ============================================================
// 01. CARGA DINÁMICA DEL SIDEBAR (fetch de sidebar.html)
// 02. RESALTAR LINK ACTIVO DEL SIDEBAR
// 03. HORA / FECHA DINÁMICA
// ============================================================

// [SECCIÓN 01] CARGA DINÁMICA DEL SIDEBAR ---------------------------
// Cada página del admin (index.html, usuarios.html, etc.) debe tener
// en su body: <div id="sidebar-placeholder"></div>
// Ese div se rellena aquí con el contenido de sidebar.html, así el
// sidebar existe UNA sola vez como archivo y se reutiliza en todas
// las páginas, en vez de estar copiado y pegado en cada una.
async function cargarSidebar() {
    const contenedor = document.getElementById("sidebar-placeholder");
    if (!contenedor) return; // esta página no usa sidebar compartido
    
    try {
        const respuesta = await fetch("sidebar.html");
        if (!respuesta.ok) throw new Error("No se pudo cargar sidebar.html");
        contenedor.innerHTML = await respuesta.text();
    } catch (error) {
        console.error("Error cargando el sidebar:", error);
        return;
    }

    // El sidebar recién se insertó en el DOM, así que hasta ahora
    // podemos buscar sus links y activar el resaltado.
    marcarLinkActivo();
}

// [SECCIÓN 02] RESALTAR LINK ACTIVO DEL SIDEBAR ---------------------
function marcarLinkActivo() {
    const linksMenu = document.querySelectorAll(".menu-dash a");
    const paginaActual = window.location.pathname.split("/").pop() || "index.html";

    linksMenu.forEach((link) => {
        // Marca como activo el link cuya href coincide con el archivo actual
        const href = link.getAttribute("href");
        if (href === paginaActual) {
            link.classList.add("active");
        }

        // Mantiene tu comportamiento original: al hacer click, ese
        // link pasa a ser el activo visualmente al instante (sin
        // esperar la recarga de página).
        link.addEventListener("click", () => {
            linksMenu.forEach((otroLink) => {
                otroLink.classList.remove("active");
            });
            link.classList.add("active");
        });
    });
}

// [SECCIÓN 03] HORA / FECHA DINÁMICA --------------------------------
// Solo corre en las páginas que tengan los elementos #fecha-actual y
// #hora-actual (por ahora, el dashboard). En páginas que no los
// tengan (como usuarios.html) simplemente no hace nada.
function iniciarRelojDashboard() {
    const fechaSpan = document.getElementById("fecha-actual");
    const horaSpan = document.getElementById("hora-actual");

    if (!fechaSpan || !horaSpan) return;

    function actualizarFechaHora() {
        const ahora = new Date();

        const opcionesFecha = { day: "numeric", month: "long", year: "numeric" };
        const fechaTexto = ahora.toLocaleDateString("es-ES", opcionesFecha);

        const opcionesHora = { hour: "2-digit", minute: "2-digit", second: "2-digit" };
        const horaTexto = ahora.toLocaleTimeString("es-ES", opcionesHora);

        fechaSpan.textContent = fechaTexto;
        horaSpan.textContent = horaTexto;
    }

    actualizarFechaHora(); // pinta la hora inmediatamente al cargar
    setInterval(actualizarFechaHora, 1000); // y la repite cada segundo
}

// ------------------------------------------------------------------
// Arranque: se ejecuta en cuanto el HTML de la página está listo
// (el sidebar se inyecta aparte, de forma asíncrona, un instante después)
// ------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    cargarSidebar();
    iniciarRelojDashboard();
});
