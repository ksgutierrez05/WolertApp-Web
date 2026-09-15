document.addEventListener("DOMContentLoaded", () => {

    // ===== DATOS INICIALES =====
    const comunas = [
        { id: 1, nombre: "Comuna 1", color: "#1f3a8a" },
        { id: 2, nombre: "Comuna 2", color: "#5c4033" },
        { id: 3, nombre: "Comuna 3", color: "#374151" },
        { id: 4, nombre: "Comuna 4", color: "#166534" },
        { id: 5, nombre: "Comuna 5", color: "#1d4ed8" },
        { id: 6, nombre: "Comuna 6", color: "#14532d" },
    ];

    const contenedor = document.getElementById("lista-comunas");
    const inputBuscar = document.getElementById("input-buscar-comuna");


    // ===== GENERAR INICIALES PARA EL AVATAR =====
    function iniciales(nombre) {
        const partes = nombre.trim().split(" ");
        return (partes[0][0] + (partes[1] || "")).toUpperCase();
    }


    // ===== RENDERIZAR LA LISTA DE COMUNAS =====
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

        conectarBotonesEliminar();
        actualizarKPIs();
    }


    // ===== ELIMINAR COMUNA =====
    function conectarBotonesEliminar() {
        document.querySelectorAll(".btn-eliminar-dash").forEach(boton => {
            boton.addEventListener("click", () => {
                const id = Number(boton.getAttribute("data-id"));
                const indice = comunas.findIndex(c => c.id === id);

                if (indice !== -1) {
                    comunas.splice(indice, 1);
                    renderComunas(comunas);
                }
            });
        });
    }


    // ===== ACTUALIZAR CONTADORES (KPIs) =====
    function actualizarKPIs() {
        document.getElementById("kpi-total-comunas").textContent = comunas.length;
        document.getElementById("kpi-comunas-activas").textContent = comunas.length;
    }


    // ===== REGISTRAR NUEVA COMUNA =====
    const formComuna = document.getElementById("form-comuna");

    formComuna.addEventListener("submit", (e) => {
        e.preventDefault();

        const nuevaComuna = {
            id: comunas.length > 0 ? Math.max(...comunas.map(c => c.id)) + 1 : 1,
            nombre: document.getElementById("nombre-comuna").value,
            color: document.getElementById("color-comuna").value
        };

        comunas.push(nuevaComuna);
        renderComunas(comunas);

        formComuna.reset();
        bootstrap.Modal.getInstance(document.getElementById("modalComuna")).hide();
    });


    // ===== FILTRO DE BÚSQUEDA EN VIVO =====
    inputBuscar.addEventListener("input", () => {
        const termino = inputBuscar.value.trim().toLowerCase();
        const filtradas = comunas.filter(c => c.nombre.toLowerCase().includes(termino));
        renderComunas(filtradas);
    });


    // ===== INICIALIZACIÓN =====
    renderComunas(comunas);

});