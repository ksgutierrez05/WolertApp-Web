/* =========================================================
   HISTORIAL - CENTRAL DE RADIO
   Lógica de la página
   ========================================================= */

/* CONFIGURACIÓN */
const HISTORIAL_CONFIG = {
  // Cambiar posteriormente por la URL real del backend
  endpoint: "/api/central/historial",
  // Tiempo máximo de espera de la petición
  timeout: 15000
};

/* ESTADO */
const historialState = {
  registros: [],
  registrosFiltrados: [],
  cargando: false,
  error: null
};

/* ELEMENTOS */
const elementos = {
  tabla: document.getElementById("tablaHistorial"),
  estadoVacio: document.getElementById("estadoVacio"),
  estadoCarga: document.getElementById("estadoCarga"),
  estadoError: document.getElementById("estadoError"),
  mensajeError: document.getElementById("mensajeError"),
  contador: document.getElementById("contadorResultados"),
  btnActualizar: document.getElementById("btnActualizar"),
  btnLimpiar: document.getElementById("btnLimpiarFiltros"),
  filtroCaso: document.getElementById("filtroCaso"),
  filtroFechaInicio: document.getElementById("filtroFechaInicio"),
  filtroFechaFin: document.getElementById("filtroFechaFin"),
  filtroTipo: document.getElementById("filtroTipo"),
  filtroPrioridad: document.getElementById("filtroPrioridad"),
  filtroZona: document.getElementById("filtroZona"),
  filtroPatrulla: document.getElementById("filtroPatrulla"),
  filtroEstado: document.getElementById("filtroEstado"),
  kpiTotal: document.getElementById("kpiTotal"),
  kpiResueltos: document.getElementById("kpiResueltos"),
  kpiCriticos: document.getElementById("kpiCriticos"),
  kpiInformes: document.getElementById("kpiInformes"),
  detalleTitulo: document.getElementById("detalleTitulo"),
  detalleTipo: document.getElementById("detalleTipo"),
  detalleFecha: document.getElementById("detalleFecha"),
  detallePrioridad: document.getElementById("detallePrioridad"),
  detalleEstado: document.getElementById("detalleEstado"),
  detalleZona: document.getElementById("detalleZona"),
  detallePatrulla: document.getElementById("detallePatrulla"),
  detalleReporte: document.getElementById("detalleReporte"),
  detalleObservaciones: document.getElementById("detalleObservaciones"),
  detalleResultado: document.getElementById("detalleResultado"),
  detalleTimeline: document.getElementById("detalleTimeline")
};

/* CARGAR HISTORIAL */
async function cargarHistorial() {
  mostrarCarga(true);
  historialState.error = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HISTORIAL_CONFIG.timeout);

    const respuesta = await fetch(HISTORIAL_CONFIG.endpoint, {
      method: "GET",
      headers: { "Accept": "application/json" },
      credentials: "include",
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    historialState.registros = normalizarRespuesta(datos);

    actualizarFiltros();
    aplicarFiltros();
    mostrarError(false);

  } catch (error) {
    console.error("Error cargando historial:", error);
    historialState.registros = [];
    historialState.registrosFiltrados = [];
    historialState.error = obtenerMensajeError(error);
    renderizarTabla();
    mostrarError(true);

  } finally {
    mostrarCarga(false);
  }
}

/* NORMALIZAR RESPUESTA */
function normalizarRespuesta(datos) {
  if (Array.isArray(datos)) return datos;
  if (datos && Array.isArray(datos.data)) return datos.data;
  if (datos && Array.isArray(datos.content)) return datos.content;
  if (datos && Array.isArray(datos.registros)) return datos.registros;
  return [];
}

/* FILTROS */
function aplicarFiltros() {
  const caso = elementos.filtroCaso.value.trim().toLowerCase();
  const fechaInicio = elementos.filtroFechaInicio.value;
  const fechaFin = elementos.filtroFechaFin.value;
  const tipo = elementos.filtroTipo.value;
  const prioridad = elementos.filtroPrioridad.value;
  const zona = elementos.filtroZona.value;
  const patrulla = elementos.filtroPatrulla.value;
  const estado = elementos.filtroEstado.value;

  historialState.registrosFiltrados = historialState.registros.filter(registro => {
    const coincideCaso = !caso || String(obtenerCampo(registro, ["idCaso", "caso", "numeroCaso", "caseNumber"])).toLowerCase().includes(caso);

    const fecha = obtenerCampo(registro, ["fecha", "fechaHora", "createdAt", "date"]);
    const coincideFechaInicio = !fechaInicio || compararFecha(fecha, fechaInicio) >= 0;
    const coincideFechaFin = !fechaFin || compararFecha(fecha, fechaFin) <= 0;

    const coincideTipo = !tipo || obtenerCampo(registro, ["tipoAlerta", "tipo", "alertType"]) === tipo;
    const coincidePrioridad = !prioridad || obtenerCampo(registro, ["prioridad", "priority"]) === prioridad;
    const coincideZona = !zona || obtenerCampo(registro, ["zona", "sector", "barrio", "comuna"]) === zona;
    const coincidePatrulla = !patrulla || obtenerCampo(registro, ["patrulla", "unidad", "patrol"]) === patrulla;
    const coincideEstado = !estado || obtenerCampo(registro, ["estado", "status"]) === estado;

    return coincideCaso && coincideFechaInicio && coincideFechaFin && coincideTipo &&
           coincidePrioridad && coincideZona && coincidePatrulla && coincideEstado;
  });

  renderizarTabla();
  actualizarKPIs();
  actualizarContador();
}

/* ACTUALIZAR FILTROS (selects) */
function actualizarFiltros() {
  llenarSelect(elementos.filtroTipo, obtenerValoresUnicos(["tipoAlerta", "tipo", "alertType"]));
  llenarSelect(elementos.filtroPrioridad, obtenerValoresUnicos(["prioridad", "priority"]));
  llenarSelect(elementos.filtroZona, obtenerValoresUnicos(["zona", "sector", "barrio", "comuna"]));
  llenarSelect(elementos.filtroPatrulla, obtenerValoresUnicos(["patrulla", "unidad", "patrol"]));
  llenarSelect(elementos.filtroEstado, obtenerValoresUnicos(["estado", "status"]));
}

/* OBTENER VALORES ÚNICOS */
function obtenerValoresUnicos(campos) {
  const valores = historialState.registros
    .map(registro => obtenerCampo(registro, campos))
    .filter(valor => valor !== null && valor !== undefined && valor !== "")
    .map(valor => String(valor));

  return [...new Set(valores)].sort();
}

/* LLENAR SELECT */
function llenarSelect(select, valores) {
  const valorActual = select.value;
  select.innerHTML = '<option value="">Todos</option>';

  valores.forEach(valor => {
    const option = document.createElement("option");
    option.value = valor;
    option.textContent = valor;
    select.appendChild(option);
  });

  if (valores.includes(valorActual)) select.value = valorActual;
}

/* RENDERIZAR TABLA */
function renderizarTabla() {
  elementos.tabla.innerHTML = "";
  const registros = historialState.registrosFiltrados;

  if (!registros.length) {
    elementos.estadoVacio.hidden = false;
    return;
  }

  elementos.estadoVacio.hidden = true;
  const fragment = document.createDocumentFragment();

  registros.forEach(registro => {
    const fila = document.createElement("tr");

    const caso = obtenerCampo(registro, ["idCaso", "caso", "numeroCaso", "caseNumber"]);
    const fecha = obtenerCampo(registro, ["fecha", "fechaHora", "createdAt", "date"]);
    const tipo = obtenerCampo(registro, ["tipoAlerta", "tipo", "alertType"]);
    const prioridad = obtenerCampo(registro, ["prioridad", "priority"]);
    const zona = obtenerCampo(registro, ["zona", "sector", "barrio", "comuna"]);
    const patrulla = obtenerCampo(registro, ["patrulla", "unidad", "patrol"]);
    const estado = obtenerCampo(registro, ["estado", "status"]);
    const resultado = obtenerCampo(registro, ["resultado", "resultadoFinal", "result"]);

    fila.innerHTML = `
      <td class="historial-case">${escaparHTML(caso)}</td>
      <td class="historial-date">${escaparHTML(formatearFecha(fecha))}</td>
      <td>${escaparHTML(tipo)}</td>
      <td>${crearBadgePrioridad(prioridad)}</td>
      <td>${escaparHTML(zona)}</td>
      <td>${escaparHTML(patrulla)}</td>
      <td>${crearBadgeEstado(estado)}</td>
      <td>${escaparHTML(resultado)}</td>
      <td>
        <button type="button" class="historial-view-btn" title="Ver detalle" data-caso-id="${escaparHTML(obtenerIdRegistro(registro))}">
          <i class="bi bi-eye"></i>
        </button>
      </td>
    `;

    fragment.appendChild(fila);
  });

  elementos.tabla.appendChild(fragment);
}

/* BADGE PRIORIDAD */
function crearBadgePrioridad(prioridad) {
  if (!prioridad) return '<span class="historial-muted">—</span>';

  const clase = String(prioridad).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");

  return `<span class="historial-badge historial-badge-${clase}">${escaparHTML(prioridad)}</span>`;
}

/* BADGE ESTADO */
function crearBadgeEstado(estado) {
  if (!estado) return '<span class="historial-muted">—</span>';

  const normalizado = String(estado).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const clase = normalizado.includes("resuelt") ? "resuelto" : "estado";

  return `<span class="historial-badge historial-badge-${clase}">${escaparHTML(estado)}</span>`;
}

/* DETALLE */
function abrirDetalle(id) {
  const registro = historialState.registros.find(item => String(obtenerIdRegistro(item)) === String(id));
  if (!registro) return;

  elementos.detalleTitulo.textContent = obtenerCampo(registro, ["idCaso", "caso", "numeroCaso", "caseNumber"]) || "Caso";
  elementos.detalleTipo.textContent = obtenerCampo(registro, ["tipoAlerta", "tipo", "alertType"]) || "—";
  elementos.detalleFecha.textContent = formatearFecha(obtenerCampo(registro, ["fecha", "fechaHora", "createdAt", "date"]));
  elementos.detallePrioridad.textContent = obtenerCampo(registro, ["prioridad", "priority"]) || "—";
  elementos.detalleEstado.textContent = obtenerCampo(registro, ["estado", "status"]) || "—";
  elementos.detalleZona.textContent = obtenerCampo(registro, ["zona", "sector", "barrio", "comuna"]) || "—";
  elementos.detallePatrulla.textContent = obtenerCampo(registro, ["patrulla", "unidad", "patrol"]) || "—";
  elementos.detalleReporte.textContent = obtenerCampo(registro, ["reporteCiudadano", "descripcionCiudadano", "descripcion", "citizenReport"]) || "—";
  elementos.detalleObservaciones.textContent = obtenerCampo(registro, ["observacionesCentral", "observaciones", "centralObservations"]) || "—";
  elementos.detalleResultado.textContent = obtenerCampo(registro, ["resultadoFinal", "resultado", "result"]) || "—";

  renderizarTimeline(obtenerCampo(registro, ["timeline", "lineaTiempo", "historial"]));

  const modalElement = document.getElementById("modalDetalleCaso");
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.show();
}

/* TIMELINE */
function renderizarTimeline(eventos) {
  elementos.detalleTimeline.innerHTML = "";

  if (!Array.isArray(eventos) || !eventos.length) {
    elementos.detalleTimeline.innerHTML = `<div class="historial-muted">No hay información de línea de tiempo disponible.</div>`;
    return;
  }

  eventos.forEach(evento => {
    const item = document.createElement("div");
    item.className = "historial-timeline-item";

    item.innerHTML = `
      <span class="historial-timeline-dot"></span>
      <div class="historial-timeline-time">${escaparHTML(evento.hora ?? evento.fechaHora ?? evento.fecha ?? "")}</div>
      <div class="historial-timeline-title">${escaparHTML(evento.titulo ?? evento.accion ?? evento.estado ?? "")}</div>
      <div class="historial-timeline-description">${escaparHTML(evento.descripcion ?? evento.detalle ?? "")}</div>
    `;

    elementos.detalleTimeline.appendChild(item);
  });
}

/* KPIs */
function actualizarKPIs() {
  const registros = historialState.registrosFiltrados;

  elementos.kpiTotal.textContent = registros.length;

  elementos.kpiResueltos.textContent = registros.filter(registro => {
    const estado = obtenerCampo(registro, ["estado", "status"]);
    return String(estado).toLowerCase().includes("resuelt");
  }).length;

  elementos.kpiCriticos.textContent = registros.filter(registro => {
    const prioridad = obtenerCampo(registro, ["prioridad", "priority"]);
    return String(prioridad).toLowerCase().includes("critic");
  }).length;

  elementos.kpiInformes.textContent = registros.filter(registro => {
    return Boolean(obtenerCampo(registro, ["informe", "informeFinal", "report"]));
  }).length;
}

/* CONTADOR */
function actualizarContador() {
  const cantidad = historialState.registrosFiltrados.length;
  elementos.contador.textContent = `${cantidad} ${cantidad === 1 ? "registro encontrado" : "registros encontrados"}`;
}

/* LIMPIAR FILTROS */
function limpiarFiltros() {
  elementos.filtroCaso.value = "";
  elementos.filtroFechaInicio.value = "";
  elementos.filtroFechaFin.value = "";
  elementos.filtroTipo.value = "";
  elementos.filtroPrioridad.value = "";
  elementos.filtroZona.value = "";
  elementos.filtroPatrulla.value = "";
  elementos.filtroEstado.value = "";

  aplicarFiltros();
}

/* ESTADOS VISUALES */
function mostrarCarga(mostrar) {
  historialState.cargando = mostrar;
  elementos.estadoCarga.hidden = !mostrar;
}

function mostrarError(mostrar) {
  elementos.estadoError.hidden = !mostrar;

  if (mostrar) {
    elementos.mensajeError.textContent = historialState.error || "No fue posible obtener los registros.";
  }
}

/* UTILIDADES */
function obtenerCampo(objeto, campos) {
  for (const campo of campos) {
    if (objeto && objeto[campo] !== undefined && objeto[campo] !== null) return objeto[campo];
  }
  return "";
}

function obtenerIdRegistro(registro) {
  return obtenerCampo(registro, ["idCaso", "caso", "numeroCaso", "caseNumber", "id"]);
}

function escaparHTML(valor) {
  if (valor === null || valor === undefined) return "—";

  const div = document.createElement("div");
  div.textContent = String(valor);
  return div.innerHTML;
}

function formatearFecha(fecha) {
  if (!fecha) return "—";

  const fechaObjeto = new Date(fecha);
  if (Number.isNaN(fechaObjeto.getTime())) return String(fecha);

  return new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short" }).format(fechaObjeto);
}

function compararFecha(fecha, fechaFiltro) {
  if (!fecha) return -1;

  const fechaRegistro = new Date(fecha);
  const fechaComparacion = new Date(`${fechaFiltro}T00:00:00`);

  if (Number.isNaN(fechaRegistro.getTime())) return -1;

  return fechaRegistro - fechaComparacion;
}

function obtenerMensajeError(error) {
  if (error.name === "AbortError") return "La consulta tardó demasiado tiempo.";
  return "No fue posible consultar el historial.";
}

/* EVENTOS */
function registrarEventos() {
  elementos.btnActualizar.addEventListener("click", cargarHistorial);
  elementos.btnLimpiar.addEventListener("click", limpiarFiltros);

  elementos.filtroCaso.addEventListener("input", aplicarFiltros);
  elementos.filtroFechaInicio.addEventListener("change", aplicarFiltros);
  elementos.filtroFechaFin.addEventListener("change", aplicarFiltros);
  elementos.filtroTipo.addEventListener("change", aplicarFiltros);
  elementos.filtroPrioridad.addEventListener("change", aplicarFiltros);
  elementos.filtroZona.addEventListener("change", aplicarFiltros);
  elementos.filtroPatrulla.addEventListener("change", aplicarFiltros);
  elementos.filtroEstado.addEventListener("change", aplicarFiltros);

  elementos.tabla.addEventListener("click", evento => {
    const boton = evento.target.closest(".historial-view-btn");
    if (!boton) return;
    abrirDetalle(boton.dataset.casoId);
  });
}

/* INICIALIZACIÓN */
document.addEventListener("DOMContentLoaded", () => {
  registrarEventos();
  cargarHistorial();
});