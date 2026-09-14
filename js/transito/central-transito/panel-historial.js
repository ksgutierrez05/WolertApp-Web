const CLAVE_HISTORIAL = "historialCasosTransito";
const TAMANO_PAGINA = 4;
 
const HISTORIAL_SEED = [
  { id: 1,  reportante: "Katherine Gutiérrez", tipo: "accidente", barrio: "Casimiro Raúl Maestre", agente: "Jorge Ramírez",    cierre: "11/9/2026 · 09:40 a.m.", descripcion: "Choque leve entre dos vehículos, sin heridos, tránsito restablecido a las 09:35 a.m." },
  { id: 2,  reportante: "Laura Peña",           tipo: "semaforo",  barrio: "Barrio La Nevada",       agente: "Diana Torres",     cierre: "10/9/2026 · 23:15 p.m.", descripcion: "Semáforo sin energía por corte eléctrico. Se dirigió tránsito manualmente hasta la reconexión." },
  { id: 3,  reportante: "Diego Torres",         tipo: "semaforo",  barrio: "Los Fundadores",         agente: "Manuel Contreras", cierre: "10/9/2026 · 19:50 p.m.", descripcion: "Falla en el módulo del semáforo. Se reportó a mantenimiento y se controló el cruce mientras tanto." },
  { id: 4,  reportante: "Ravi Kumar",            tipo: "accidente", barrio: "El Centro",              agente: "Laura Pacheco",    cierre: "10/9/2026 · 17:05 p.m.", descripcion: "Colisión por alcance en hora pico, un vehículo con daños menores, vía despejada en 15 min." },
  { id: 5,  reportante: "Andrea Solano",        tipo: "accidente", barrio: "Zona Norte",             agente: "Jorge Ramírez",    cierre: "9/9/2026 · 14:20 p.m.",  descripcion: "Volcamiento de motocicleta, conductor remitido a centro asistencial por precaución." },
  { id: 6,  reportante: "Pedro Zapata",          tipo: "semaforo",  barrio: "Sector La Nevada",       agente: "Diana Torres",     cierre: "9/9/2026 · 10:05 a.m.",  descripcion: "Semáforo intermitente reportado como dañado, técnico confirmó que solo estaba en modo nocturno." },
  { id: 7,  reportante: "Marcela Ruiz",          tipo: "accidente", barrio: "Barrio Los Cortijos",    agente: "Manuel Contreras", cierre: "8/9/2026 · 20:40 p.m.",  descripcion: "Choque entre dos motocicletas, ambos conductores con golpes leves, se levantó croquis." },
  { id: 8,  reportante: "Julián Pérez",          tipo: "accidente", barrio: "Avenida Simón Bolívar",  agente: "Laura Pacheco",    cierre: "8/9/2026 · 08:15 a.m.",  descripcion: "Vehículo varado obstruyendo un carril, generó embotellamiento hasta que fue remolcado." },
  { id: 9,  reportante: "Sofía Daza",            tipo: "semaforo",  barrio: "Calle 16 con Carrera 9", agente: "Jorge Ramírez",    cierre: "7/9/2026 · 18:30 p.m.",  descripcion: "Semáforo dañado por impacto de vehículo. Se instaló señalización preventiva temporal." },
  { id: 10, reportante: "Camilo Vega",           tipo: "accidente", barrio: "Barrio Cañaguate",       agente: "Diana Torres",     cierre: "7/9/2026 · 12:00 p.m.",  descripcion: "Choque leve por invasión de carril, acuerdo amistoso entre las partes." },
];
 
let historial = [];
let filtroActual = "todos";
let textoBusqueda = "";
let paginaActual = 1;
 
const CargarHistorial = () => {
  const guardado = localStorage.getItem(CLAVE_HISTORIAL);
  historial = guardado ? JSON.parse(guardado) : HISTORIAL_SEED;
  if (!guardado) localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial));
  RenderizarTodo();
};
 
const InfoTipo = (tipo) =>
  tipo === "semaforo"
    ? { texto: "Semáforo dañado", clase: "tipo-semaforo-dash" }
    : { texto: "Accidente", clase: "tipo-accidente-dash" };
 
const ObtenerListaFiltrada = () => {
  let lista = historial;
 
  if (filtroActual !== "todos") lista = lista.filter((c) => c.tipo === filtroActual);
 
  if (textoBusqueda.trim() !== "") {
    const texto = textoBusqueda.trim().toLowerCase();
    lista = lista.filter((c) =>
      c.barrio.toLowerCase().includes(texto) || c.agente.toLowerCase().includes(texto)
    );
  }
 
  return lista;
};
 
const MostrarHistorial = (lista) => {
  const tbody = document.getElementById("tablaHistorialBody");
 
  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay casos que coincidan con la búsqueda.</td></tr>`;
    return;
  }
 
  const inicio = (paginaActual - 1) * TAMANO_PAGINA;
  const pagina = lista.slice(inicio, inicio + TAMANO_PAGINA);
 
  tbody.innerHTML = pagina
    .map((caso) => {
      const tipo = InfoTipo(caso.tipo);
      return `
        <tr>
          <td><div class="fw-semibold">${caso.reportante}</div></td>
          <td><span class="badge-tipo-dash ${tipo.clase}">${tipo.texto}</span></td>
          <td>${caso.barrio}</td>
          <td>${caso.agente}</td>
          <td class="text-muted small">${caso.cierre}</td>
          <td class="text-end"><a href="#" class="link-detalle-dash" onclick="AbrirDetalle(${caso.id}); return false;">Ver detalle</a></td>
        </tr>
      `;
    })
    .join("");
};
 
const ActualizarPaginacion = (lista) => {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / TAMANO_PAGINA));
  if (paginaActual > totalPaginas) paginaActual = totalPaginas;
 
  const inicio = lista.length === 0 ? 0 : (paginaActual - 1) * TAMANO_PAGINA + 1;
  const fin = Math.min(paginaActual * TAMANO_PAGINA, lista.length);
 
  document.getElementById("resumenPaginacion").textContent =
    `Mostrando ${lista.length === 0 ? 0 : `${inicio}–${fin}`} de ${lista.length} casos cerrados`;
 
  const contenedor = document.getElementById("botonesPaginacion");
  let botones = "";
  for (let i = 1; i <= totalPaginas; i++) {
    botones += `<button class="page-btn-dash ${i === paginaActual ? "active-dash" : ""}" onclick="IrAPagina(${i})">${i}</button>`;
  }
  botones += `<button class="page-btn-dash" onclick="IrAPagina(${Math.min(paginaActual + 1, totalPaginas)})"><i class="bi bi-chevron-right"></i></button>`;
  contenedor.innerHTML = botones;
};
 
const ActualizarTabs = () => {
  const total = historial.length;
  const accidentes = historial.filter((c) => c.tipo === "accidente").length;
  const semaforos = historial.filter((c) => c.tipo === "semaforo").length;
 
  document.getElementById("tabTodos").textContent = `Todos (${total})`;
  document.getElementById("tabAccidente").textContent = `Accidente (${accidentes})`;
  document.getElementById("tabSemaforo").textContent = `Semáforo dañado (${semaforos})`;
};
 
const RenderizarTodo = () => {
  const lista = ObtenerListaFiltrada();
  MostrarHistorial(lista);
  ActualizarPaginacion(lista);
  ActualizarTabs();
};
 
const FiltrarHistorial = (filtro) => {
  filtroActual = filtro;
  paginaActual = 1;
 
  document.querySelectorAll(".tabs-dash .tab-dash").forEach((btn) => btn.classList.remove("active-dash"));
  const idBoton = filtro === "accidente" ? "tabAccidente" : filtro === "semaforo" ? "tabSemaforo" : "tabTodos";
  document.getElementById(idBoton).classList.add("active-dash");
 
  RenderizarTodo();
};
 
const BuscarHistorial = (texto) => {
  textoBusqueda = texto;
  paginaActual = 1;
  RenderizarTodo();
};
 
const IrAPagina = (numero) => {
  paginaActual = numero;
  RenderizarTodo();
};
 
const AbrirDetalle = (id) => {
  const caso = historial.find((c) => c.id === id);
  if (!caso) return;
 
  const tipo = InfoTipo(caso.tipo);
  const badge = document.getElementById("detalleTipoBadge");
  badge.textContent = tipo.texto;
  badge.className = `badge-tipo-dash mb-2 d-inline-block ${tipo.clase}`;
 
  document.getElementById("detalleBarrio").textContent = caso.barrio;
  document.getElementById("detalleReportante").textContent = caso.reportante;
  document.getElementById("detalleAgente").textContent = caso.agente;
  document.getElementById("detalleCierre").textContent = caso.cierre;
  document.getElementById("detalleDescripcion").textContent = caso.descripcion;
 
  const modal = new bootstrap.Modal(document.getElementById("modalDetalle"));
  modal.show();
};
 
CargarHistorial();
 