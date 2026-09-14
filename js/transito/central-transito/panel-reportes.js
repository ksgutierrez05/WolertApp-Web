const CLAVE_STORAGE = "wolertapp_informes_transito";

// Datos base de ejemplo. En producción esto vendría del backend (casos ya atendidos).
const casosBase = [
  {
    id: 1,
    tipo: "Accidente",
    tipoClase: "tipo-accidente-dash",
    barrio: "Casimiro Raúl Maestre",
    agente: "Laura Pacheco",
    hora: "Hoy · 09:40 a.m.",
    estado: "pendiente",
  },
  {
    id: 2,
    tipo: "Semáforo dañado",
    tipoClase: "tipo-semaforo-dash",
    barrio: "Barrio La Nevada",
    agente: "Diana Torres",
    hora: "Hoy · 10:15 a.m.",
    estado: "pendiente",
  },
  {
    id: 3,
    tipo: "Accidente",
    tipoClase: "tipo-accidente-dash",
    barrio: "Los Fundadores",
    agente: "Jorge Ramírez",
    hora: "Hoy · 11:02 a.m.",
    estado: "pendiente",
  },
];

let casos = [];
let pestaniaActiva = "pendiente";
let idCasoActual = null;

const CargarCasos = () => {
  const guardado = localStorage.getItem(CLAVE_STORAGE);
  if (guardado) {
    casos = JSON.parse(guardado);
    console.log("Informes cargados desde localStorage");
  } else {
    casos = casosBase;
    GuardarEnStorage();
    console.log("Informes inicializados con datos base");
  }
  RenderizarTodo();
};

const GuardarEnStorage = () => {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(casos));
};

const RenderizarTodo = () => {
  RenderizarTabla();
  RenderizarPestanias();
};

const RenderizarPestanias = () => {
  const pendientes = casos.filter((c) => c.estado === "pendiente").length;
  const completados = casos.filter((c) => c.estado === "completado").length;

  document.getElementById("tabPendientes").textContent = `Pendientes de informe (${pendientes})`;
  document.getElementById("tabCompletados").textContent = `Completados hoy (${completados})`;

  document.getElementById("tabPendientes").classList.toggle("active-dash", pestaniaActiva === "pendiente");
  document.getElementById("tabCompletados").classList.toggle("active-dash", pestaniaActiva === "completado");
};

const RenderizarTabla = () => {
  const cuerpoTabla = document.getElementById("tablaCasosBody");
  const casosVisibles = casos.filter((c) => c.estado === pestaniaActiva);

  if (casosVisibles.length === 0) {
    cuerpoTabla.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted py-4">
          No hay casos en esta pestaña.
        </td>
      </tr>`;
    return;
  }

  cuerpoTabla.innerHTML = casosVisibles
    .map((caso) => `
      <tr>
        <td><span class="badge-tipo-dash ${caso.tipoClase}">${caso.tipo}</span></td>
        <td>${caso.barrio}</td>
        <td>${caso.agente}</td>
        <td class="text-muted small">${caso.hora}</td>
        <td class="text-end">
          ${caso.estado === "pendiente"
            ? `<button class="btn-asignar-dash" onclick="AbrirInforme(${caso.id})">Completar informe</button>`
            : `<span class="text-muted small"><i class="bi bi-check2-circle"></i> ${caso.estadoFinal || "Informe guardado"}</span>`
          }
        </td>
      </tr>`)
    .join("");
};

const AbrirInforme = (id) => {
  const caso = casos.find((c) => c.id === id);
  if (!caso) return;

  idCasoActual = id;

  document.getElementById("panelInformeTitulo").textContent =
    `Completar informe · ${caso.tipo} · ${caso.barrio}`;
  document.getElementById("inputAgente").value = caso.agente;
  document.getElementById("selectEstadoFinal").value = "Resuelta";
  document.getElementById("textareaReporte").value = "";

  const panel = document.getElementById("panelInforme");
  panel.classList.remove("d-none");
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
};

const CerrarInforme = () => {
  document.getElementById("panelInforme").classList.add("d-none");
  document.getElementById("textareaReporte").value = "";
  idCasoActual = null;
};

const GuardarInforme = () => {
  if (idCasoActual === null) return;

  const reporte = document.getElementById("textareaReporte").value.trim();
  if (!reporte) {
    document.getElementById("textareaReporte").focus();
    return;
  }

  const caso = casos.find((c) => c.id === idCasoActual);
  caso.estado = "completado";
  caso.estadoFinal = document.getElementById("selectEstadoFinal").value;
  caso.reporte = reporte;
  caso.fechaInforme = new Date().toISOString();

  GuardarEnStorage();
  RenderizarTodo();
  CerrarInforme();
};

const CambiarPestania = (nombre) => {
  pestaniaActiva = nombre;
  RenderizarTodo();
};

document.getElementById("tabPendientes").addEventListener("click", () => CambiarPestania("pendiente"));
document.getElementById("tabCompletados").addEventListener("click", () => CambiarPestania("completado"));
document.getElementById("btnCancelarInforme").addEventListener("click", CerrarInforme);
document.getElementById("btnGuardarInforme").addEventListener("click", GuardarInforme);

CargarCasos();