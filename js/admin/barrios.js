document.addEventListener("DOMContentLoaded", () => {

    // ===== CLAVES DE LOCALSTORAGE =====
    const CLAVE_BARRIOS = "wolertapp_barrios";
    const CLAVE_COMUNAS = "comunasWolertApp"; // debe coincidir con la usada en comunas.js

    let barrios = [];
    let comunas = [];

    const contenedor = document.getElementById("lista-barrios");
    const inputBuscar = document.getElementById("input-buscar-barrio");
    const selectComuna = document.getElementById("comuna-barrio");
    const formBarrio = document.getElementById("form-barrio");


    // ===== CARGAR DATOS GUARDADOS =====
    function cargarComunas() {
        const guardado = localStorage.getItem(CLAVE_COMUNAS);
        comunas = guardado ? JSON.parse(guardado) : [];
    }

    function cargarBarrios() {
        const guardado = localStorage.getItem(CLAVE_BARRIOS);
        barrios = guardado ? JSON.parse(guardado) : [];
    }

    function guardarBarrios() {
        localStorage.setItem(CLAVE_BARRIOS, JSON.stringify(barrios));
    }


    // ===== LLENAR EL SELECT DE COMUNAS EN EL MODAL =====
    function llenarSelectComunas() {
        selectComuna.innerHTML = `<option value="" selected disabled>Seleccionar comuna *</option>`;
        comunas.forEach(c => {
            selectComuna.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
        });
    }


    // ===== BUSCAR EL NOMBRE/COLOR DE UNA COMUNA POR SU ID =====
    function obtenerComuna(idComuna) {
        return comunas.find(c => c.id === Number(idComuna));
    }


    // ===== RENDERIZAR LISTA DE BARRIOS =====
    function renderBarrios(lista) {
        contenedor.innerHTML = "";

        if (lista.length === 0) {
            contenedor.innerHTML = `<div class="tabla-barrios-vacio">No se encontraron barrios.</div>`;
            return;
        }

        lista.forEach(barrio => {
            const comuna = obtenerComuna(barrio.idComuna);
            const nombreComuna = comuna ? comuna.nombre : "Sin comuna";
            const colorComuna = comuna ? comuna.color : "#98a2b3";

            const fila = document.createElement("div");
            fila.className = "tabla-barrios-fila";
            fila.innerHTML = `
                <div class="barrio-nombre-dash">${barrio.nombre.toUpperCase()}</div>
                <div>
                    <span class="barrio-comuna-badge-dash" style="background-color: ${colorComuna};">${nombreComuna}</span>
                </div>
                <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn-accion-dash btn-eliminar-barrio" data-id="${barrio.id}" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            contenedor.appendChild(fila);
        });

        conectarBotonesEliminar();
        actualizarKpis();
    }


    // ===== ELIMINAR BARRIO =====
    function conectarBotonesEliminar() {
        document.querySelectorAll(".btn-eliminar-barrio").forEach(boton => {
            boton.addEventListener("click", () => {
                const id = Number(boton.getAttribute("data-id"));
                barrios = barrios.filter(b => b.id !== id);
                guardarBarrios();
                renderBarrios(barrios);
            });
        });
    }


    // ===== ACTUALIZAR KPIs =====
    function actualizarKpis() {
        document.getElementById("kpi-total-barrios").textContent = barrios.length;
        document.getElementById("kpi-barrios-activos").textContent = barrios.length;

        const comunasCubiertas = new Set(barrios.map(b => b.idComuna)).size;
        document.getElementById("kpi-comunas-cubiertas").textContent = comunasCubiertas;
    }


    // ===== REGISTRAR NUEVO BARRIO =====
    formBarrio.addEventListener("submit", (e) => {
        e.preventDefault();

        const nuevoBarrio = {
            id: barrios.length > 0 ? Math.max(...barrios.map(b => b.id)) + 1 : 1,
            nombre: document.getElementById("nombre-barrio").value,
            idComuna: Number(selectComuna.value)
        };

        barrios.push(nuevoBarrio);
        guardarBarrios();
        renderBarrios(barrios);

        formBarrio.reset();
        bootstrap.Modal.getInstance(document.getElementById("modalBarrio")).hide();
    });


    // ===== FILTRO DE BÚSQUEDA =====
    inputBuscar.addEventListener("input", () => {
        const termino = inputBuscar.value.trim().toLowerCase();
        const filtrados = barrios.filter(b => b.nombre.toLowerCase().includes(termino));
        renderBarrios(filtrados);
    });


    // ===== INICIALIZACIÓN =====
    cargarComunas();
    cargarBarrios();
    llenarSelectComunas();
    renderBarrios(barrios);

});