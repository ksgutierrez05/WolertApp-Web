// ============================================================
// REPORTES.JS — Central de Radio
// ============================================================

const CASOS_EJEMPLO = [
  {
    id: "WL-2026-00125",
    tipo: "robo",
    tipoTexto: "Robo",
    fecha: "2026-09-13",
    hora: "18:20",
    prioridad: "alta",
    zona: "Comuna 2",
    barrio: "Centro",
    ubicacion: "Carrera 15 #20-30",
    patrullero: "P-002",
    unidad: "CAI Centro",
    estado: "cerrada",
    resultado: "resuelto",

    reporteCiudadano:
      "Ciudadano reporta robo en establecimiento comercial.",

    observacionCentral:
      "Se recomienda verificar el establecimiento y sus alrededores según la información proporcionada.",

    observacionPatrullero:
      "Se verificó el establecimiento y se realizó atención en el lugar.",

    asignacion: "18:25",
    aceptacion: "18:26",
    desplazamiento: "18:26",
    llegada: "18:31",
    resolucion: "18:40",
    informe: "18:45",
    cierre: "18:47",

    tiempoAtencion: "9 minutos"
  },

  {
    id: "WL-2026-00126",
    tipo: "violencia",
    tipoTexto: "Violencia",
    fecha: "2026-09-13",
    hora: "18:35",
    prioridad: "critica",
    zona: "Comuna 3",
    barrio: "La Esperanza",
    ubicacion: "Calle 10 #12-45",
    patrullero: "P-004",
    unidad: "CAI Norte",
    estado: "en_atencion",
    resultado: "seguimiento",

    reporteCiudadano:
      "Ciudadano informa una situación de violencia en vía pública.",

    observacionCentral:
      "Caso clasificado como crítico y enviado a atención prioritaria.",

    observacionPatrullero:
      "Patrullero se encuentra atendiendo el caso.",

    asignacion: "18:37",
    aceptacion: "18:38",
    desplazamiento: "18:39",
    llegada: "18:43",
    resolucion: null,
    informe: null,
    cierre: null,

    tiempoAtencion: null
  },

  {
    id: "WL-2026-00127",
    tipo: "accidente",
    tipoTexto: "Accidente",
    fecha: "2026-09-13",
    hora: "17:50",
    prioridad: "media",
    zona: "Comuna 1",
    barrio: "Centro",
    ubicacion: "Carrera 9 #16-20",
    patrullero: "P-001",
    unidad: "CAI Norte",
    estado: "resuelta",
    resultado: "atencion_realizada",

    reporteCiudadano:
      "Se reporta accidente de tránsito con afectación de la vía.",

    observacionCentral:
      "Se solicita verificación de la situación y control del sector.",

    observacionPatrullero:
      "Se realizó atención y regulación del tránsito en el lugar.",

    asignacion: "17:54",
    aceptacion: "17:55",
    desplazamiento: "17:55",
    llegada: "18:02",
    resolucion: "18:25",
    informe: null,
    cierre: null,

    tiempoAtencion: "23 minutos"
  },

  {
    id: "WL-2026-00128",
    tipo: "persona_sospechosa",
    tipoTexto: "Persona sospechosa",
    fecha: "2026-09-12",
    hora: "22:10",
    prioridad: "baja",
    zona: "Comuna 4",
    barrio: "Los Fundadores",
    ubicacion: "Carrera 20 #30-12",
    patrullero: "P-005",
    unidad: "CAI Centro",
    estado: "cerrada",
    resultado: "sin_novedad",

    reporteCiudadano:
      "Ciudadano reporta presencia de una persona sospechosa en el sector.",

    observacionCentral:
      "Se solicita verificación preventiva del sector.",

    observacionPatrullero:
      "Se realizó verificación sin encontrar novedad.",

    asignacion: "22:14",
    aceptacion: "22:15",
    desplazamiento: "22:15",
    llegada: "22:20",
    resolucion: "22:28",
    informe: "22:35",
    cierre: "22:38",

    tiempoAtencion: "8 minutos"
  },

  {
    id: "WL-2026-00129",
    tipo: "emergencia",
    tipoTexto: "Emergencia",
    fecha: "2026-09-12",
    hora: "20:05",
    prioridad: "alta",
    zona: "Comuna 2",
    barrio: "San Martín",
    ubicacion: "Calle 18 #14-22",
    patrullero: "P-007",
    unidad: "CAI Occidente",
    estado: "informe",
    resultado: "resuelto",

    reporteCiudadano:
      "Ciudadano solicita presencia policial por una emergencia.",

    observacionCentral:
      "Se realiza despacho prioritario.",

    observacionPatrullero:
      "Se atendió la emergencia y se controló la situación.",

    asignacion: "20:07",
    aceptacion: "20:08",
    desplazamiento: "20:08",
    llegada: "20:13",
    resolucion: "20:27",
    informe: null,
    cierre: null,

    tiempoAtencion: "14 minutos"
  }
];

let casosReportes = [];
let casoSeleccionado = null;
let modalInforme = null;


// ============================================================
// PROVEEDOR DE DATOS
// ============================================================

function obtenerCasosReportes() {

  // TODO BACKEND:
  // return fetch('/api/central/reportes')
  //   .then(response => response.json());

  return new Promise(resolve => {
    setTimeout(() => resolve(CASOS_EJEMPLO), 200);
  });
}


// ============================================================
// UTILIDADES
// ============================================================

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}


const ETIQUETAS_ESTADO = {
  recibida: "Recibida",
  clasificada: "Clasificada",
  asignada: "Asignada",
  en_atencion: "En atención",
  resuelta: "Resuelta",
  informe: "Informe",
  cerrada: "Cerrada"
};


const ETIQUETAS_RESULTADO = {
  resuelto: "Resuelto",
  sin_novedad: "Sin novedad",
  atencion_realizada: "Atención realizada",
  seguimiento: "Requiere seguimiento",
  remitido: "Remitido a otra entidad",
  otro: "Otro"
};


function prioridadHtml(prioridad) {

  const texto = {
    critica: "Crítica",
    alta: "Alta",
    media: "Media",
    baja: "Baja"
  };

  return `
    <span class="reporte-pill prioridad-${prioridad}">
      ${texto[prioridad] || prioridad}
    </span>
  `;
}


function estadoHtml(estado) {

  return `
    <span class="reporte-pill estado-${estado}">
      ${ETIQUETAS_ESTADO[estado] || estado}
    </span>
  `;
}


// ============================================================
// KPIs
// ============================================================

function renderKpis() {

  const contenedor = document.getElementById("kpisReportes");

  if (!contenedor) return;

  const total = casosReportes.length;

  const criticos = casosReportes.filter(
    c => c.prioridad === "critica"
  ).length;

  const resueltos = casosReportes.filter(
    c => c.estado === "resuelta" ||
         c.estado === "cerrada"
  ).length;

  const pendientesInforme = casosReportes.filter(
    c => c.estado === "informe"
  ).length;

  const tarjetas = [
    {
      numero: total,
      texto: "Total de casos",
      icono: "bi-file-earmark-text",
      clase: "reportes-kpi-blue"
    },
    {
      numero: criticos,
      texto: "Casos críticos",
      icono: "bi-exclamation-triangle",
      clase: "reportes-kpi-red"
    },
    {
      numero: resueltos,
      texto: "Casos resueltos",
      icono: "bi-check-circle",
      clase: "reportes-kpi-green"
    },
    {
      numero: pendientesInforme,
      texto: "Pendientes de informe",
      icono: "bi-clock-history",
      clase: "reportes-kpi-amber"
    }
  ];

  contenedor.innerHTML = tarjetas.map(t => `
    <div class="col-6 col-lg-3">
      <div class="reportes-kpi ${t.clase}">
        <i class="bi ${t.icono} reportes-kpi-icon"></i>

        <div class="reportes-kpi-num">
          ${t.numero}
        </div>

        <div class="reportes-kpi-label">
          ${t.texto}
        </div>
      </div>
    </div>
  `).join("");
}


// ============================================================
// FILTROS DINÁMICOS
// ============================================================

function llenarFiltros() {

  const patrulleros = [
    ...new Set(
      casosReportes
        .map(c => c.patrullero)
        .filter(Boolean)
    )
  ].sort();

  const zonas = [
    ...new Set(
      casosReportes
        .map(c => c.zona)
        .filter(Boolean)
    )
  ].sort();

  document.getElementById("filtroPatrullero").innerHTML =
    `<option value="todos">Todos</option>` +
    patrulleros.map(p =>
      `<option value="${escapar(p)}">${escapar(p)}</option>`
    ).join("");

  document.getElementById("filtroZona").innerHTML =
    `<option value="todos">Todas</option>` +
    zonas.map(z =>
      `<option value="${escapar(z)}">${escapar(z)}</option>`
    ).join("");
}


// ============================================================
// OBTENER FILTROS
// ============================================================

function casosFiltrados() {

  const texto =
    document.getElementById("buscarReporte")
      .value
      .trim()
      .toLowerCase();

  const tipo =
    document.getElementById("filtroTipo").value;

  const prioridad =
    document.getElementById("filtroPrioridad").value;

  const estado =
    document.getElementById("filtroEstado").value;

  const resultado =
    document.getElementById("filtroResultado").value;

  const patrullero =
    document.getElementById("filtroPatrullero").value;

  const zona =
    document.getElementById("filtroZona").value;

  const desde =
    document.getElementById("filtroDesde").value;

  const hasta =
    document.getElementById("filtroHasta").value;


  return casosReportes.filter(caso => {

    if (
      texto &&
      ![
        caso.id,
        caso.tipoTexto,
        caso.patrullero,
        caso.zona,
        caso.barrio
      ]
        .join(" ")
        .toLowerCase()
        .includes(texto)
    ) {
      return false;
    }

    if (tipo !== "todos" && caso.tipo !== tipo)
      return false;

    if (
      prioridad !== "todos" &&
      caso.prioridad !== prioridad
    )
      return false;

    if (
      estado !== "todos" &&
      caso.estado !== estado
    )
      return false;

    if (
      resultado !== "todos" &&
      caso.resultado !== resultado
    )
      return false;

    if (
      patrullero !== "todos" &&
      caso.patrullero !== patrullero
    )
      return false;

    if (
      zona !== "todos" &&
      caso.zona !== zona
    )
      return false;

    if (desde && caso.fecha < desde)
      return false;

    if (hasta && caso.fecha > hasta)
      return false;

    return true;
  });
}


// ============================================================
// TABLA
// ============================================================

function renderTabla() {

  const tbody =
    document.getElementById("tablaReportes");

  const vacio =
    document.getElementById("reportesVacio");

  const contador =
    document.getElementById("contadorResultados");

  const casos = casosFiltrados();

  contador.textContent =
    `${casos.length} ${casos.length === 1 ? "caso" : "casos"} encontrados`;

  tbody.innerHTML = casos.map(caso => `

    <tr>

      <td>
        <span class="reporte-caso">
          #${escapar(caso.id)}
        </span>

        <span class="reporte-fecha">
          ${escapar(caso.fecha)} · ${escapar(caso.hora)}
        </span>
      </td>

      <td>
        ${escapar(caso.tipoTexto)}
      </td>

      <td>
        ${prioridadHtml(caso.prioridad)}
      </td>

      <td>
        ${escapar(caso.zona)}
        <small class="d-block text-muted">
          ${escapar(caso.barrio)}
        </small>
      </td>

      <td>
        ${escapar(caso.patrullero || "—")}
      </td>

      <td>
        <span class="reporte-resultado">
          ${escapar(
            ETIQUETAS_RESULTADO[caso.resultado] ||
            caso.resultado ||
            "—"
          )}
        </span>
      </td>

      <td>
        ${estadoHtml(caso.estado)}
      </td>

      <td>
        <div class="reporte-acciones">

          <button
            type="button"
            class="reporte-btn"
            title="Ver informe"
            data-ver-informe="${escapar(caso.id)}"
          >
            <i class="bi bi-eye"></i>
          </button>

          <button
            type="button"
            class="reporte-btn"
            title="Imprimir"
            data-imprimir="${escapar(caso.id)}"
          >
            <i class="bi bi-printer"></i>
          </button>

        </div>
      </td>

    </tr>

  `).join("");

  vacio.classList.toggle(
    "d-none",
    casos.length > 0
  );

  configurarAccionesTabla();
}


// ============================================================
// ACCIONES TABLA
// ============================================================

function configurarAccionesTabla() {

  document.querySelectorAll("[data-ver-informe]")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        abrirInforme(
          btn.dataset.verInforme
        );

      });

    });


  document.querySelectorAll("[data-imprimir]")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        abrirInforme(
          btn.dataset.imprimir,
          true
        );

      });

    });
}


// ============================================================
// INFORME
// ============================================================

function abrirInforme(id, imprimir = false) {

  const caso =
    casosReportes.find(c => c.id === id);

  if (!caso) return;

  casoSeleccionado = caso;

  document.getElementById("modalCasoNumero").textContent =
    `#${caso.id}`;

  document.getElementById("modalInformeBody").innerHTML = `

    <!-- INFORMACIÓN GENERAL -->

    <section class="informe-seccion">

      <div class="informe-titulo">
        Información del caso
      </div>

      <div class="informe-grid">

        ${datoInforme("Número de caso", caso.id)}
        ${datoInforme("Fecha", caso.fecha)}
        ${datoInforme("Hora de recepción", caso.hora)}

        ${datoInforme("Tipo", caso.tipoTexto)}
        ${datoInforme("Prioridad", prioridadTexto(caso.prioridad))}
        ${datoInforme("Estado", ETIQUETAS_ESTADO[caso.estado])}

        ${datoInforme("Zona", caso.zona)}
        ${datoInforme("Barrio", caso.barrio)}
        ${datoInforme("Ubicación", caso.ubicacion)}

      </div>

    </section>


    <!-- REPORTE CIUDADANO -->

    <section class="informe-seccion">

      <div class="informe-titulo">
        Reporte ciudadano
      </div>

      <div class="informe-texto">
        ${escapar(caso.reporteCiudadano)}
      </div>

    </section>


    <!-- CLASIFICACIÓN CENTRAL -->

    <section class="informe-seccion">

      <div class="informe-titulo">
        Clasificación de Central
      </div>

      <div class="informe-grid">

        ${datoInforme("Tipo clasificado", caso.tipoTexto)}
        ${datoInforme("Prioridad", prioridadTexto(caso.prioridad))}
        ${datoInforme("Nivel de atención", nivelAtencion(caso.prioridad))}

      </div>

      <div class="informe-texto informe-central mt-2">
        <strong>Observación de Central</strong><br>
        ${escapar(caso.observacionCentral)}
      </div>

    </section>


    <!-- DESPACHO -->

    <section class="informe-seccion">

      <div class="informe-titulo">
        Despacho
      </div>

      <div class="informe-grid">

        ${datoInforme("Patrullero", caso.patrullero)}
        ${datoInforme("Unidad / CAI", caso.unidad)}
        ${datoInforme("Asignación", caso.asignacion || "—")}

        ${datoInforme("Aceptación", caso.aceptacion || "—")}
        ${datoInforme("Inicio desplazamiento", caso.desplazamiento || "—")}
        ${datoInforme("Llegada", caso.llegada || "—")}

      </div>

    </section>


    <!-- ATENCIÓN -->

    <section class="informe-seccion">

      <div class="informe-titulo">
        Atención en campo
      </div>

      <div class="informe-grid">

        ${datoInforme("Patrullero", caso.patrullero)}
        ${datoInforme("Hora de llegada", caso.llegada || "—")}
        ${datoInforme("Hora de resolución", caso.resolucion || "—")}

        ${datoInforme("Tiempo de atención", caso.tiempoAtencion || "—")}
        ${datoInforme("Resultado", ETIQUETAS_RESULTADO[caso.resultado] || "—")}

      </div>

      <div class="informe-texto mt-2">
        <strong>Observación del patrullero</strong><br>
        ${escapar(caso.observacionPatrullero || "Sin observación registrada.")}
      </div>

    </section>


    <!-- RESULTADO -->

    <section class="informe-seccion">

      <div class="informe-titulo">
        Resultado final
      </div>

      <div class="informe-texto">
        <strong>
          ${escapar(
            ETIQUETAS_RESULTADO[caso.resultado] ||
            caso.resultado ||
            "Sin resultado registrado"
          )}
        </strong>
      </div>

    </section>


    <!-- LÍNEA DE TIEMPO -->

    <section class="informe-seccion">

      <div class="informe-titulo">
        Línea de tiempo
      </div>

      <div class="informe-linea-tiempo">

        ${eventoInforme(
          caso.hora,
          "Ciudadano reportó la alerta"
        )}

        ${eventoInforme(
          sumarMinutos(caso.hora, 2),
          "Central recibió la alerta"
        )}

        ${caso.asignacion
          ? eventoInforme(
              caso.asignacion,
              "Patrullero asignado"
            )
          : ""
        }

        ${caso.desplazamiento
          ? eventoInforme(
              caso.desplazamiento,
              "Patrullero inició desplazamiento"
            )
          : ""
        }

        ${caso.llegada
          ? eventoInforme(
              caso.llegada,
              "Patrullero llegó al sitio"
            )
          : ""
        }

        ${caso.resolucion
          ? eventoInforme(
              caso.resolucion,
              "Patrullero reportó alerta resuelta"
            )
          : ""
        }

        ${caso.informe
          ? eventoInforme(
              caso.informe,
              "Central generó informe final"
            )
          : ""
        }

        ${caso.cierre
          ? eventoInforme(
              caso.cierre,
              "Central cerró el caso"
            )
          : ""
        }

      </div>

    </section>

  `;

  modalInforme.show();

  if (imprimir) {

    setTimeout(() => {
      window.print();
    }, 400);

  }
}


function datoInforme(label, valor) {

  return `
    <div class="informe-dato">

      <span class="informe-dato-label">
        ${escapar(label)}
      </span>

      <span class="informe-dato-valor">
        ${escapar(valor || "—")}
      </span>

    </div>
  `;
}


function eventoInforme(hora, texto) {

  return `
    <div class="informe-evento">

      <div class="informe-hora">
        ${escapar(hora)}
      </div>

      <div class="informe-evento-texto">
        ${escapar(texto)}
      </div>

    </div>
  `;
}


function prioridadTexto(prioridad) {

  return {
    critica: "Crítica",
    alta: "Alta",
    media: "Media",
    baja: "Baja"
  }[prioridad] || prioridad;
}


function nivelAtencion(prioridad) {

  return {
    critica: "Atención inmediata",
    alta: "Atención prioritaria",
    media: "Atención normal",
    baja: "Atención normal"
  }[prioridad] || "Atención normal";
}


function sumarMinutos(hora, minutos) {

  if (!hora) return "—";

  const [h, m] = hora.split(":").map(Number);

  const fecha = new Date();

  fecha.setHours(h);
  fecha.setMinutes(m + minutos);

  return fecha.toTimeString().slice(0, 5);
}


// ============================================================
// LIMPIAR FILTROS
// ============================================================

function limpiarFiltros() {

  document.getElementById("buscarReporte").value = "";

  document.getElementById("filtroTipo").value = "todos";
  document.getElementById("filtroPrioridad").value = "todos";
  document.getElementById("filtroEstado").value = "todos";
  document.getElementById("filtroResultado").value = "todos";
  document.getElementById("filtroPatrullero").value = "todos";
  document.getElementById("filtroZona").value = "todos";

  document.getElementById("filtroDesde").value = "";
  document.getElementById("filtroHasta").value = "";

  renderTabla();
}


// ============================================================
// EXPORTAR / IMPRIMIR
// ============================================================

function imprimirInformeSeleccionado() {

  if (!casoSeleccionado) return;

  window.print();
}


// ============================================================
// EVENTOS
// ============================================================

function configurarEventos() {

  const filtros = [
    "buscarReporte",
    "filtroTipo",
    "filtroPrioridad",
    "filtroEstado",
    "filtroResultado",
    "filtroPatrullero",
    "filtroZona",
    "filtroDesde",
    "filtroHasta"
  ];

  filtros.forEach(id => {

    const elemento =
      document.getElementById(id);

    if (!elemento) return;

    elemento.addEventListener(
      elemento.tagName === "INPUT" &&
      elemento.type === "text"
        ? "input"
        : "change",
      renderTabla
    );

  });


  document.getElementById(
    "btnLimpiarFiltros"
  ).addEventListener(
    "click",
    limpiarFiltros
  );


  document.getElementById(
    "btnExportar"
  ).addEventListener(
    "click",
    () => {

      const casos = casosFiltrados();

      if (!casos.length) {
        alert("No hay casos para generar el reporte.");
        return;
      }

      window.print();
    }
  );


  document.getElementById(
    "btnImprimirInforme"
  ).addEventListener(
    "click",
    imprimirInformeSeleccionado
  );

}


// ============================================================
// INICIO
// ============================================================

async function iniciarReportes() {

  try {

    casosReportes =
      await obtenerCasosReportes();

  } catch (error) {

    console.error(
      "[Reportes] Error cargando casos:",
      error
    );

    casosReportes = [];

  }


  renderKpis();

  llenarFiltros();

  configurarEventos();

  renderTabla();


  // Bootstrap Modal
  if (typeof bootstrap !== "undefined") {

    const elemento =
      document.getElementById("modalInforme");

    modalInforme =
      new bootstrap.Modal(elemento);

  } else {

    console.error(
      "[Reportes] Bootstrap JS no está disponible."
    );

  }

}


document.addEventListener(
  "DOMContentLoaded",
  iniciarReportes
);