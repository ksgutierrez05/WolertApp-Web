// js/transito/director-transito/panel-agentes.js
// Maneja la lista de agentes de tránsito: carga inicial, guardado en
// localStorage, renderizado de la tabla y alta de agentes nuevos desde el modal.

const CLAVE_STORAGE = "agentesTransito";

// Datos semilla: solo se usan la primera vez, si no hay nada en localStorage.
const AGENTES_SEED = [
  { id: 1, nombre: "Jorge Ramírez",     cedula: "CC 1065.234.812", zona: "Zona Norte",        estado: "activo",   casosMes: 18, tiempoProm: "4.2 min" },
  { id: 2, nombre: "Laura Pacheco",     cedula: "CC 1102.556.903", zona: "Centro",             estado: "activo",   casosMes: 22, tiempoProm: "3.8 min" },
  { id: 3, nombre: "Manuel Contreras",  cedula: "CC 1098.774.221", zona: "Sector La Nevada",   estado: "inactivo", casosMes: 9,  tiempoProm: "5.6 min" },
  { id: 4, nombre: "Diana Torres",      cedula: "CC 1076.443.190", zona: "Zona Norte",         estado: "activo",   casosMes: 15, tiempoProm: "4.9 min" },
];

let agentes = [];
let filtroActual = "todos";
let textoBusqueda = "";

const CargarAgentes = () => {
  const guardado = localStorage.getItem(CLAVE_STORAGE);
  if (guardado) {
    agentes = JSON.parse(guardado);
    console.log("Agentes cargados desde localStorage");
  } else {
    agentes = AGENTES_SEED;
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(agentes));
    console.log("Agentes cargados desde la semilla inicial");
  }
  FiltrarAgentes(filtroActual);
};

const GuardarAgentes = () => {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(agentes));
};

const Iniciales = (nombreCompleto) => {
  const partes = nombreCompleto.trim().split(" ");
  const primera = partes[0]?.[0] ?? "";
  const segunda = partes[1]?.[0] ?? "";
  return (primera + segunda).toUpperCase();
};

const MostrarAgentes = (lista) => {
  const tbody = document.getElementById("tablaAgentesBody");

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">No hay agentes en esta categoría.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = lista
    .map((agente) => `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-sm-dash">${Iniciales(agente.nombre)}</div>
            <div>
              <div class="fw-semibold">${agente.nombre}</div>
              <div class="text-muted small">${agente.cedula}</div>
            </div>
          </div>
        </td>
        <td>${agente.zona}</td>
        <td>
          <span class="badge-state-dash ${agente.estado === "activo" ? "badge-active-dash" : "badge-inactive-dash"}">
            ${agente.estado === "activo" ? "Activo" : "Inactivo"}
          </span>
        </td>
        <td>${agente.casosMes}</td>
        <td>${agente.tiempoProm}</td>
        <td class="text-end">
          <button class="btn-icon-dash" title="Ver perfil"><i class="bi bi-eye"></i></button>
          <button class="btn-icon-dash" title="${agente.estado === "activo" ? "Desactivar" : "Activar"}" onclick="CambiarEstadoAgente(${agente.id})">
            <i class="bi ${agente.estado === "activo" ? "bi-toggle-on text-green-dash" : "bi-toggle-off text-muted"}"></i>
          </button>
        </td>
      </tr>
    `)
    .join("");
};

const ActualizarKpisYTabs = () => {
  const total = agentes.length;
  const activos = agentes.filter((a) => a.estado === "activo").length;
  const inactivos = total - activos;

  document.getElementById("kpiTotal").textContent = total;
  document.getElementById("kpiActivos").textContent = activos;
  document.getElementById("kpiInactivos").textContent = inactivos;

  document.getElementById("tabTodos").textContent = `Todos (${total})`;
  document.getElementById("tabActivos").textContent = `Activos (${activos})`;
  document.getElementById("tabInactivos").textContent = `Inactivos (${inactivos})`;

  const listaFiltrada = ObtenerListaFiltrada();
  document.getElementById("resumenPaginacion").textContent =
    `Mostrando ${listaFiltrada.length} de ${total} agentes`;
};

const ObtenerListaFiltrada = () => {
  let lista = agentes;

  if (filtroActual === "activo") lista = lista.filter((a) => a.estado === "activo");
  if (filtroActual === "inactivo") lista = lista.filter((a) => a.estado === "inactivo");

  if (textoBusqueda.trim() !== "") {
    const texto = textoBusqueda.trim().toLowerCase();
    lista = lista.filter((a) =>
      a.nombre.toLowerCase().includes(texto) ||
      a.cedula.toLowerCase().includes(texto) ||
      a.zona.toLowerCase().includes(texto)
    );
  }

  return lista;
};

const BuscarAgentes = (texto) => {
  textoBusqueda = texto;
  MostrarAgentes(ObtenerListaFiltrada());
  document.getElementById("resumenPaginacion").textContent =
    `Mostrando ${ObtenerListaFiltrada().length} de ${agentes.length} agentes`;
};

const FiltrarAgentes = (filtro) => {
  filtroActual = filtro;

  document.querySelectorAll(".tabs-dash .tab-dash").forEach((btn) => btn.classList.remove("active-dash"));
  const idBoton = filtro === "activo" ? "tabActivos" : filtro === "inactivo" ? "tabInactivos" : "tabTodos";
  document.getElementById(idBoton).classList.add("active-dash");

  MostrarAgentes(ObtenerListaFiltrada());
  ActualizarKpisYTabs();
};

const CambiarEstadoAgente = (id) => {
  const agente = agentes.find((a) => a.id === id);
  if (!agente) return;
  agente.estado = agente.estado === "activo" ? "inactivo" : "activo";
  GuardarAgentes();
  FiltrarAgentes(filtroActual);
};

const AgregarAgente = (nombre, cedula, zona, estado) => {
  const nuevoId = agentes.length ? Math.max(...agentes.map((a) => a.id)) + 1 : 1;
  const nuevoAgente = {
    id: nuevoId,
    nombre,
    cedula,
    zona,
    estado,
    casosMes: 0,
    tiempoProm: "—",
  };
  agentes.push(nuevoAgente);
  GuardarAgentes();
  FiltrarAgentes(filtroActual);
};

// ===================== FORMULARIO DEL MODAL =====================
document.getElementById("formAgente").addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nombre = document.getElementById("inputNombre").value.trim();
  const cedula = document.getElementById("inputCedula").value.trim();
  const zona = document.getElementById("inputZona").value;
  const estado = document.getElementById("inputEstado").value;

  if (!nombre || !cedula || !zona) return;

  AgregarAgente(nombre, cedula, zona, estado);

  evento.target.reset();
  const modalEl = document.getElementById("modalAgente");
  const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modal.hide();
});

CargarAgentes();