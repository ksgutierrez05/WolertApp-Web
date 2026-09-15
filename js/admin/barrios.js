document.addEventListener("DOMContentLoaded", () => {

    // ===== CLAVES USADAS PARA GUARDAR EN EL NAVEGADOR =====
    const CLAVE_BARRIOS = "wolertapp_barrios";
    const CLAVE_COMUNAS = "comunasWolertApp"; // debe ser la misma clave que usa comunas.js

    // ===== DATOS DE EJEMPLO (se usan solo la primera vez, si no hay nada guardado) =====
    const comunasDeEjemplo = [
        { id: 1, nombre: "Comuna 1", color: "#1f3a8a" },
        { id: 2, nombre: "Comuna 2", color: "#5c4033" },
        { id: 3, nombre: "Comuna 3", color: "#374151" },
        { id: 4, nombre: "Comuna 4", color: "#166534" },
        { id: 5, nombre: "Comuna 5", color: "#1d4ed8" },
        { id: 6, nombre: "Comuna 6", color: "#14532d" }
    ];

    const barriosDeEjemplo = [
        { id: 1, nombre: "Los Fundadores", idComuna: 1 },
        { id: 2, nombre: "Cañaguate", idComuna: 1 },
        { id: 3, nombre: "Centro", idComuna: 2 },
        { id: 4, nombre: "La Nevada", idComuna: 2 },
        { id: 5, nombre: "El Prado", idComuna: 3 },
        { id: 6, nombre: "San Joaquín", idComuna: 4 },
        { id: 7, nombre: "Villa del Rosario", idComuna: 5 },
        { id: 8, nombre: "Casimiro Raul Maestre", idComuna: 6 }
    ];

    // Estas dos listas se llenan al iniciar la página
    let listaBarrios = [];
    let listaComunas = [];

    // Elementos del HTML que vamos a usar varias veces
    const contenedorBarrios = document.getElementById("lista-barrios");
    const campoBuscar = document.getElementById("input-buscar-barrio");
    const selectorComuna = document.getElementById("comuna-barrio");
    const formularioNuevoBarrio = document.getElementById("form-barrio");


    // ===== CARGAR COMUNAS GUARDADAS (o crear datos de ejemplo si no hay nada) =====
    function cargarComunas() {
        const datosGuardados = localStorage.getItem(CLAVE_COMUNAS);

        if (datosGuardados) {
            listaComunas = JSON.parse(datosGuardados);
        } else {
            listaComunas = comunasDeEjemplo;
            localStorage.setItem(CLAVE_COMUNAS, JSON.stringify(listaComunas));
        }
    }


    // ===== CARGAR BARRIOS GUARDADOS (o crear datos de ejemplo si no hay nada) =====
    function cargarBarrios() {
        const datosGuardados = localStorage.getItem(CLAVE_BARRIOS);

        if (datosGuardados) {
            listaBarrios = JSON.parse(datosGuardados);
        } else {
            listaBarrios = barriosDeEjemplo;
            guardarBarrios();
        }
    }


    // ===== GUARDAR LA LISTA ACTUAL DE BARRIOS EN EL NAVEGADOR =====
    function guardarBarrios() {
        localStorage.setItem(CLAVE_BARRIOS, JSON.stringify(listaBarrios));
    }


    // ===== LLENAR EL SELECT DE COMUNAS DENTRO DEL FORMULARIO =====
    function mostrarComunasEnSelector() {
        selectorComuna.innerHTML = `<option value="" selected disabled>Seleccionar comuna *</option>`;

        listaComunas.forEach(comuna => {
            selectorComuna.innerHTML += `<option value="${comuna.id}">${comuna.nombre}</option>`;
        });
    }


    // ===== BUSCAR UNA COMUNA POR SU ID =====
    function buscarComunaPorId(idComuna) {
        return listaComunas.find(comuna => comuna.id === Number(idComuna));
    }


    // ===== MOSTRAR LA LISTA DE BARRIOS EN PANTALLA =====
    function mostrarBarrios(barrios) {
        contenedorBarrios.innerHTML = "";

        if (barrios.length === 0) {
            contenedorBarrios.innerHTML = `<div class="tabla-barrios-vacio">No se encontraron barrios.</div>`;
            return;
        }

        barrios.forEach(barrio => {
            const comuna = buscarComunaPorId(barrio.idComuna);
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
            contenedorBarrios.appendChild(fila);
        });

        activarBotonesEliminar();
        actualizarTarjetasResumen();
    }


    // ===== ACTIVAR EL BOTÓN "ELIMINAR" DE CADA FILA =====
    function activarBotonesEliminar() {
        const botonesEliminar = document.querySelectorAll(".btn-eliminar-barrio");

        botonesEliminar.forEach(boton => {
            boton.addEventListener("click", () => {
                const idBarrio = Number(boton.getAttribute("data-id"));
                listaBarrios = listaBarrios.filter(barrio => barrio.id !== idBarrio);
                guardarBarrios();
                mostrarBarrios(listaBarrios);
            });
        });
    }


    // ===== ACTUALIZAR LOS NÚMEROS DE LAS TARJETAS (KPIs) =====
    function actualizarTarjetasResumen() {
        document.getElementById("kpi-total-barrios").textContent = listaBarrios.length;
        document.getElementById("kpi-barrios-activos").textContent = listaBarrios.length;

        const comunasConAlMenosUnBarrio = new Set(listaBarrios.map(barrio => barrio.idComuna));
        document.getElementById("kpi-comunas-cubiertas").textContent = comunasConAlMenosUnBarrio.size;
    }


    // ===== REGISTRAR UN BARRIO NUEVO CUANDO SE ENVÍA EL FORMULARIO =====
    formularioNuevoBarrio.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const nombreIngresado = document.getElementById("nombre-barrio").value;
        const idComunaSeleccionada = Number(selectorComuna.value);

        const nuevoId = listaBarrios.length > 0
            ? Math.max(...listaBarrios.map(barrio => barrio.id)) + 1
            : 1;

        const nuevoBarrio = {
            id: nuevoId,
            nombre: nombreIngresado,
            idComuna: idComunaSeleccionada
        };

        listaBarrios.push(nuevoBarrio);
        guardarBarrios();
        mostrarBarrios(listaBarrios);

        formularioNuevoBarrio.reset();
        bootstrap.Modal.getInstance(document.getElementById("modalBarrio")).hide();
    });


    // ===== FILTRAR BARRIOS MIENTRAS SE ESCRIBE EN EL BUSCADOR =====
    campoBuscar.addEventListener("input", () => {
        const textoBuscado = campoBuscar.value.trim().toLowerCase();

        const barriosFiltrados = listaBarrios.filter(barrio =>
            barrio.nombre.toLowerCase().includes(textoBuscado)
        );

        mostrarBarrios(barriosFiltrados);
    });


    // ===== PUNTO DE INICIO: se ejecuta apenas carga la página =====
    cargarComunas();
    cargarBarrios();
    mostrarComunasEnSelector();
    mostrarBarrios(listaBarrios);

});