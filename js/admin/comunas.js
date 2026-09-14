document.addEventListener("DOMContentLoaded", () => {
    const comunas = [
        { id: 1, nombre: "Comuna 1", color: "#1f3a8a" }, // azul oscuro
        { id: 2, nombre: "Comuna 2", color: "#5c4033" }, // marrón
        { id: 3, nombre: "Comuna 3", color: "#374151" }, // gris oscuro
        { id: 4, nombre: "Comuna 4", color: "#166534" }, // verde oscuro
        { id: 5, nombre: "Comuna 5", color: "#1d4ed8" }, // azul
        { id: 6, nombre: "Comuna 6", color: "#14532d" }, // verde
    ];

const contenedor = document.getElementById("lista-comunas");
const inputBuscar = document.getElementById("input-buscar-comuna");

function iniciales(nombre) {
    // "Comuna 1" -> "C1"
    const partes = nombre.trim().split(" ");
    return (partes[0][0] + (partes[1] || "")).toUpperCase();
}

function renderComunas(lista) {
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `<div class="tabla-comunas-vacio">No se encontraron comunas.</div>`;
        return;
    }

    lista.forEach(comuna => {
        const fila = document.createElement("div");
        fila.className = "tabla-comunas-fila";
        fila.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <div class="comuna-avatar-dash" style="background-color: ${comuna.color};">
                    ${iniciales(comuna.nombre)}
                </div>
                <div>
                    <div class="comuna-nombre-dash">${comuna.nombre.toUpperCase()}</div>
                    <div class="comuna-sub-dash">División territorial</div>
                </div>
            </div>
            <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn-accion-dash btn-ver-dash" data-id="${comuna.id}" title="Ver">
                   <i class="bi bi-eye"></i>
                </button>
                <button type="button" class="btn-accion-dash btn-editar-dash" data-id="${comuna.id}" title="Editar">
                <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="btn-accion-dash btn-eliminar-dash" data-id="${comuna.id}" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(fila);
    });
}

renderComunas(comunas);

// Filtro de búsqueda en vivo
inputBuscar.addEventListener("input", () => {
    const termino = inputBuscar.value.trim().toLowerCase();
    const filtradas = comunas.filter(c => c.nombre.toLowerCase().includes(termino));
    renderComunas(filtradas);
});

});