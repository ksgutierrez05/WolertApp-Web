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
    const formComuna = document.getElementById("form-comuna");

    // Guarda el id de la comuna que se está editando (null = se está creando una nueva)
    let idComunaEnEdicion = null;


    // ===== GENERAR INICIALES PARA EL AVATAR =====
    function iniciales(nombre) {
        const partes = nombre.trim().split(" ");
        return (partes[0][0] + (partes[1] || "")).toUpperCase();
    }


    // ===== BUSCAR UNA COMUNA POR SU ID =====
    function buscarComunaPorId(id) {
        return comunas.find(c => c.id === id);
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

        conectarBotonesDeLaTabla();
        actualizarKPIs();
    }


    // ===== CONECTAR LOS 3 BOTONES DE CADA FILA (ver / editar / eliminar) =====
    function conectarBotonesDeLaTabla() {
        document.querySelectorAll(".btn-ver-dash").forEach(boton => {
            boton.addEventListener("click", () => {
                const id = Number(boton.getAttribute("data-id"));
                abrirModalVerComuna(id);
            });
        });

        document.querySelectorAll(".btn-editar-dash").forEach(boton => {
            boton.addEventListener("click", () => {
                const id = Number(boton.getAttribute("data-id"));
                abrirModalEditarComuna(id);
            });
        });

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


    // ===== ABRIR MODAL "VER COMUNA" =====
    function abrirModalVerComuna(id) {
        const comuna = buscarComunaPorId(id);
        if (!comuna) return;

        document.getElementById("ver-comuna-nombre").textContent = comuna.nombre;
        document.getElementById("ver-comuna-color-texto").textContent = comuna.color;
        document.getElementById("ver-comuna-color-muestra").style.backgroundColor = comuna.color;

        const modal = new bootstrap.Modal(document.getElementById("modalVerComuna"));
        modal.show();
    }


    // ===== ABRIR MODAL EN MODO "EDITAR" (reutiliza el mismo modal de crear) =====
    function abrirModalEditarComuna(id) {
        const comuna = buscarComunaPorId(id);
        if (!comuna) return;

        idComunaEnEdicion = id;

        document.getElementById("nombre-comuna").value = comuna.nombre;
        document.getElementById("color-comuna").value = comuna.color;

        document.querySelector("#modalComuna .modal-title").textContent = "Editar comuna";
        document.querySelector("#modalComuna button[type='submit']").textContent = "Guardar cambios";

        const modal = new bootstrap.Modal(document.getElementById("modalComuna"));
        modal.show();
    }


    // ===== VOLVER EL MODAL A SU MODO NORMAL: "CREAR" =====
    function restablecerModalComoCreacion() {
        idComunaEnEdicion = null;
        document.querySelector("#modalComuna .modal-title").textContent = "Nueva comuna";
        document.querySelector("#modalComuna button[type='submit']").textContent = "Registrar comuna";
        formComuna.reset();
    }


    // ===== ACTUALIZAR CONTADORES (KPIs) =====
    function actualizarKPIs() {
        document.getElementById("kpi-total-comunas").textContent = comunas.length;
        document.getElementById("kpi-comunas-activas").textContent = comunas.length;
    }


    // ===== GUARDAR EL FORMULARIO (crea una nueva o actualiza la existente) =====
    formComuna.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.getElementById("nombre-comuna").value;
        const color = document.getElementById("color-comuna").value;

        if (idComunaEnEdicion) {
            // ----- MODO EDICIÓN -----
            const comuna = buscarComunaPorId(idComunaEnEdicion);
            comuna.nombre = nombre;
            comuna.color = color;
        } else {
            // ----- MODO CREACIÓN -----
            comunas.push({
                id: comunas.length > 0 ? Math.max(...comunas.map(c => c.id)) + 1 : 1,
                nombre,
                color
            });
        }

        renderComunas(comunas);
        bootstrap.Modal.getInstance(document.getElementById("modalComuna")).hide();
    });


    // Si el modal se cierra sin guardar (clic afuera, o la X), vuelve a modo "crear"
    document.getElementById("modalComuna").addEventListener("hidden.bs.modal", restablecerModalComoCreacion);


    // ===== FILTRO DE BÚSQUEDA EN VIVO =====
    inputBuscar.addEventListener("input", () => {
        const termino = inputBuscar.value.trim().toLowerCase();
        const filtradas = comunas.filter(c => c.nombre.toLowerCase().includes(termino));
        renderComunas(filtradas);
    });


    // ===== INICIALIZACIÓN =====
    renderComunas(comunas);

});