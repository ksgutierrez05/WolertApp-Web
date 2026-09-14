// js/transito/central-transito/panel-agentes.js
// Vista de solo consulta para Central de Despacho: lista de agentes con su
// disponibilidad y un modal de "Ver perfil" de solo lectura (sin edición,
// eso sigue siendo del Director de Tránsito).

const CLAVE_AGENTES_DESPACHO = "agentesDespachoTransito";

const AGENTES_SEED = [
  { id: 1, nombre: "Jorge Ramírez",    cedula: "CC 1065.234.812", zona: "Zona Norte",       grupo: "Grupo 1", estado: "disponible", casoActual: null,                                   canalRadio: "Canal 3" },
  { id: 2, nombre: "Laura Pacheco",    cedula: "CC 1102.556.903", zona: "Centro",            grupo: "Grupo 2", estado: "atencion",   casoActual: "Accidente · Casimiro Raúl Maestre",     canalRadio: "Canal 1" },
  { id: 3, nombre: "Manuel Contreras", cedula: "CC 1098.774.221", zona: "Sector La Nevada",  grupo: "Grupo 3", estado: "disponible", casoActual: null,                                   canalRadio: "Canal 2" },
  { id: 4, nombre: "Diana Torres",     cedula: "CC 1076.443.190", zona: "Zona Norte",        grupo: "Grupo 1", estado: "atencion",   casoActual: "Semáforo dañado · Los Fundadores",      canalRadio: "Canal 3" },
];

let agentes = [];
let filtroActual = "todos";
let textoBusqueda = "";

const CargarAgentes = () => {
  const guardado = localStorage.getItem(CLAVE_AGENTES_DESPACHO);
  const parseado = guardado ? JSON.parse(guardado) : null;
  const desactualizado = parseado && parseado.some((a) => a.canalRadio === undefined);

  if (parseado && !desactualizado) {
    agentes = parseado;
  } else {
    agentes = AGENTES_SEED;
    localStorage.setItem(CLAVE_AGENTES_DESPACHO, JSON.stringify(agentes));
  }

  FiltrarAgentes(filtroActual);
};

const Iniciales = (nombreCompleto) => {
  const partes = nombreCompleto.trim().split(" ");
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
};

const ClaseAvatar = (estado) => (estado === "disponible" ? "avatar-green-dash" : "avatar-amber-dash");
const ClaseEstado = (estado) => (estado === "disponible" ? "estado-resuelta-dash" : "estado-atencion-dash");
const TextoEstado = (estado) => (estado === "disponible" ? "Disponible" : "En atención");

const ObtenerListaFiltrada = () => {
  let lista = agentes;

  if (filtroActual === "disponible") lista = lista.filter((a) => a.estado === "disponible");
  if (filtroActual === "atencion") lista = lista.filter((a) => a.estado === "atencion");

  if (textoBusqueda.trim() !== "") {
    const texto = textoBusqueda.trim().toLowerCase();
    lista = lista.filter((a) =>
      a.nombre.toLowerCase().includes(texto) || a.zona.toLowerCase().includes(texto)
    );
  }

  return lista;
};

const MostrarAgentes = (lista) => {
  const tbody = document.getElementById("tablaAgentesBody");

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No hay agentes en esta categoría.</td></tr>`;
    return;
  }

  tbody.innerHTML = lista
    .map((agente) => `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <span class="avatar-icon-dash ${ClaseAvatar(agente.estado)}">${Iniciales(agente.nombre)}</span>
            <div class="fw-semibold">${agente.nombre}</div>
          </div>
        </td>
        <td>${agente.zona}</td>
        <td><span class="badge-estado-dash ${ClaseEstado(agente.estado)}">${TextoEstado(agente.estado)}</span></td>
        <td class="${agente.casoActual ? "" : "text-muted"}">${agente.casoActual ?? "—"}</td>
        <td class="text-end"><a href="#" class="link-detalle-dash" onclick="AbrirPerfil(${agente.id}); return false;">Ver perfil</a></td>
      </tr>
    `)
    .join("");
};

const ActualizarKpisYTabs = () => {
  const total = agentes.length;
  const disponibles = agentes.filter((a) => a.estado === "disponible").length;
  const atencion = agentes.filter((a) => a.estado === "atencion").length;

  document.getElementById("kpiTotal").textContent = total;
  document.getElementById("kpiDisponibles").textContent = disponibles;
  document.getElementById("kpiAtencion").textContent = atencion;
  document.getElementById("kpiNoDisponibles").textContent = 0;

  document.getElementById("tabTodos").textContent = `Todos (${total})`;
  document.getElementById("tabDisponibles").textContent = `Disponibles (${disponibles})`;
  document.getElementById("tabAtencion").textContent = `En atención (${atencion})`;
};

const FiltrarAgentes = (filtro) => {
  filtroActual = filtro;

  document.querySelectorAll(".tabs-dash .tab-dash").forEach((btn) => btn.classList.remove("active-dash"));
  const idBoton = filtro === "disponible" ? "tabDisponibles" : filtro === "atencion" ? "tabAtencion" : "tabTodos";
  document.getElementById(idBoton).classList.add("active-dash");

  MostrarAgentes(ObtenerListaFiltrada());
  ActualizarKpisYTabs();
};

const BuscarAgentes = (texto) => {
  textoBusqueda = texto;
  MostrarAgentes(ObtenerListaFiltrada());
};

const AbrirPerfil = (id) => {
  const agente = agentes.find((a) => a.id === id);
  if (!agente) return;

  document.getElementById("perfilAvatar").textContent = Iniciales(agente.nombre);
  document.getElementById("perfilAvatar").className = `avatar-icon-dash avatar-grande-dash ${ClaseAvatar(agente.estado)}`;
  document.getElementById("perfilNombre").textContent = agente.nombre;
  document.getElementById("perfilCedula").textContent = agente.cedula;
  document.getElementById("perfilZona").textContent = agente.zona;
  document.getElementById("perfilGrupo").textContent = agente.grupo;
  document.getElementById("perfilEstado").textContent = TextoEstado(agente.estado);
  document.getElementById("perfilCaso").textContent = agente.casoActual ?? "Sin caso asignado";
  document.getElementById("perfilCanal").textContent = agente.canalRadio;

  const modal = new bootstrap.Modal(document.getElementById("modalPerfil"));
  modal.show();
};

CargarAgentes();