/* ==========================================================================
   WolertApp - Casos de Tránsito
   Carga, guarda, busca y filtra los casos usando localStorage.
   ========================================================================== */

const CLAVE_STORAGE = "wolert_casos_transito";

// Datos semilla: se usan solo la primera vez (si no hay nada en localStorage)
const CASOS_INICIALES = [
  { id: 1,  reportante: "Katherine Gutiérrez", iniciales: "KG", avatarClase: "avatar-amber-dash", fecha: "11/9/2026 · 08:12 a.m.", tipo: "semaforo",  tipoLabel: "Semáforo dañado", barrio: "Casimiro Raúl Maestre", estado: "atencion", estadoLabel: "En atención" },
  { id: 2,  reportante: "Katherine Gutiérrez", iniciales: "KG", avatarClase: "avatar-red-dash",   fecha: "11/9/2026 · 07:47 a.m.", tipo: "accidente", tipoLabel: "Accidente",       barrio: "Casimiro Raúl Maestre", estado: "critica",  estadoLabel: "Crítica" },
  { id: 3,  reportante: "Laura Peña",           iniciales: "LP", avatarClase: "avatar-red-dash",   fecha: "10/9/2026 · 22:30 p.m.", tipo: "accidente", tipoLabel: "Accidente",       barrio: "Casimiro Raúl Maestre", estado: "camino",   estadoLabel: "En camino" },
  { id: 4,  reportante: "Diego Torres",         iniciales: "DT", avatarClase: "avatar-amber-dash", fecha: "10/9/2026 · 19:05 p.m.", tipo: "semaforo",  tipoLabel: "Semáforo dañado", barrio: "Los Fundadores",         estado: "resuelta", estadoLabel: "Resuelta" },
  { id: 5,  reportante: "Andrés Molina",        iniciales: "AM", avatarClase: "avatar-blue-dash",  fecha: "10/9/2026 · 15:40 p.m.", tipo: "accidente", tipoLabel: "Accidente",       barrio: "La Nevada",              estado: "resuelta", estadoLabel: "Resuelta" },
  { id: 6,  reportante: "Sofía Ramírez",        iniciales: "SR", avatarClase: "avatar-amber-dash", fecha: "10/9/2026 · 13:15 p.m.", tipo: "semaforo",  tipoLabel: "Semáforo dañado", barrio: "El Carmen",              estado: "atencion", estadoLabel: "En atención" },
  { id: 7,  reportante: "Camilo Rincón",        iniciales: "CR", avatarClase: "avatar-red-dash",   fecha: "10/9/2026 · 11:02 a.m.", tipo: "accidente", tipoLabel: "Accidente",       barrio: "Simón Bolívar",          estado: "critica",  estadoLabel: "Crítica" },
  { id: 8,  reportante: "Valentina Castro",     iniciales: "VC", avatarClase: "avatar-blue-dash",  fecha: "9/9/2026 · 20:20 p.m.",  tipo: "accidente", tipoLabel: "Accidente",       barrio: "La Popa",                estado: "resuelta", estadoLabel: "Resuelta" },
  { id: 9,  reportante: "Jorge Salcedo",        iniciales: "JS", avatarClase: "avatar-amber-dash", fecha: "9/9/2026 · 18:05 p.m.",  tipo: "semaforo",  tipoLabel: "Semáforo dañado", barrio: "Los Fundadores",         estado: "camino",   estadoLabel: "En camino" },
  { id: 10, reportante: "Mariana Ospina",       iniciales: "MO", avatarClase: "avatar-red-dash",   fecha: "9/9/2026 · 16:30 p.m.",  tipo: "accidente", tipoLabel: "Accidente",       barrio: "El Carmen",              estado: "resuelta", estadoLabel: "Resuelta" },
  { id: 11, reportante: "Felipe Vergara",       iniciales: "FV", avatarClase: "avatar-blue-dash",  fecha: "9/9/2026 · 14:12 p.m.",  tipo: "semaforo",  tipoLabel: "Semáforo dañado", barrio: "La Nevada",              estado: "resuelta", estadoLabel: "Resuelta" },
  { id: 12, reportante: "Daniela Restrepo",     iniciales: "DR", avatarClase: "avatar-amber-dash", fecha: "9/9/2026 · 10:55 a.m.",  tipo: "accidente", tipoLabel: "Accidente",       barrio: "Simón Bolívar",          estado: "critica",  estadoLabel: "Crítica" },
  { id: 13, reportante: "Julián Herrera",       iniciales: "JH", avatarClase: "avatar-red-dash",   fecha: "8/9/2026 · 21:47 p.m.",  tipo: "accidente", tipoLabel: "Accidente",       barrio: "La Popa",                estado: "atencion", estadoLabel: "En atención" },
  { id: 14, reportante: "Natalia Cortés",       iniciales: "NC", avatarClase: "avatar-blue-dash",  fecha: "8/9/2026 · 19:30 p.m.",  tipo: "semaforo",  tipoLabel: "Semáforo dañado", barrio: "Casimiro Raúl Maestre", estado: "resuelta", estadoLabel: "Resuelta" },
  { id: 15, reportante: "Esteban Duarte",       iniciales: "ED", avatarClase: "avatar-amber-dash", fecha: "8/9/2026 · 17:10 p.m.",  tipo: "accidente", tipoLabel: "Accidente",       barrio: "Los Fundadores",         estado: "camino",   estadoLabel: "En camino" },
  { id: 16, reportante: "Paula Jiménez",        iniciales: "PJ", avatarClase: "avatar-red-dash",   fecha: "8/9/2026 · 12:25 p.m.",  tipo: "accidente", tipoLabel: "Accidente",       barrio: "El Carmen",              estado: "resuelta", estadoLabel: "Resuelta" },
  { id: 17, reportante: "Ricardo Nieto",        iniciales: "RN", avatarClase: "avatar-blue-dash",  fecha: "8/9/2026 · 09:50 a.m.",  tipo: "semaforo",  tipoLabel: "Semáforo dañado", barrio: "La Nevada",              estado: "atencion", estadoLabel: "En atención" },
  { id: 18, reportante: "Carolina Vega",        iniciales: "CV", avatarClase: "avatar-amber-dash", fecha: "7/9/2026 · 22:05 p.m.",  tipo: "accidente", tipoLabel: "Accidente",       barrio: "Simón Bolívar",          estado: "resuelta", estadoLabel: "Resuelta" },
  { id: 19, reportante: "Manuel Barrios",       iniciales: "MB", avatarClase: "avatar-red-dash",   fecha: "7/9/2026 · 18:40 p.m.",  tipo: "accidente", tipoLabel: "Accidente",       barrio: "La Popa",                estado: "resuelta", estadoLabel: "Resuelta" },
  { id: 20, reportante: "Isabel Quintero",      iniciales: "IQ", avatarClase: "avatar-blue-dash",  fecha: "7/9/2026 · 15:15 p.m.",  tipo: "semaforo",  tipoLabel: "Semáforo dañado", barrio: "Los Fundadores",         estado: "resuelta", estadoLabel: "Resuelta" },
];

// Estado en memoria de la app
let casos = [];
const filtros = {
  busqueda: "",
  tipo: "todas",
  estados: new Set(), // valores: atencion, critica, camino, resuelta
};

/* ---------------------- Carga y guardado en localStorage ---------------------- */

const cargarCasos = () => {
  const guardado = localStorage.getItem(CLAVE_STORAGE);
  if (guardado) {
    try {
      console.log("Casos cargados desde localStorage");
      return JSON.parse(guardado);
    } catch (error) {
      console.error("Error al leer localStorage, se usan datos iniciales: ", error);
    }
  }
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(CASOS_INICIALES));
  console.log("Casos iniciales guardados en localStorage");
  return [...CASOS_INICIALES];
};

const guardarCasos = (listaCasos) => {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(listaCasos));
  } catch (error) {
    console.error("Error al guardar en localStorage: ", error);
  }
};

/* ------------------------------- Utilidades ------------------------------- */

const claseEstado = (estado) => {
  switch (estado) {
    case "atencion": return "estado-atencion-dash";
    case "critica":  return "estado-critica-dash";
    case "camino":   return "estado-camino-dash";
    case "resuelta": return "estado-resuelta-dash";
    default:         return "";
  }
};

const claseTipo = (tipo) => (tipo === "accidente" ? "tipo-accidente-dash" : "tipo-semaforo-dash");

/* --------------------------------- Render --------------------------------- */

const renderizarTabla = (lista) => {
  const tbody = document.querySelector("#tablaCasos tbody");
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted py-4">
          No se encontraron casos con los filtros seleccionados.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = lista
    .map(
      (caso) => `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <span class="avatar-icon-dash ${caso.avatarClase}">${caso.iniciales}</span>
            <div>
              <div class="fw-semibold">${caso.reportante}</div>
              <div class="text-muted small">${caso.fecha}</div>
            </div>
          </div>
        </td>
        <td><span class="badge-tipo-dash ${claseTipo(caso.tipo)}">${caso.tipoLabel}</span></td>
        <td>${caso.barrio}</td>
        <td><span class="badge-estado-dash ${claseEstado(caso.estado)}">${caso.estadoLabel}</span></td>
        <td class="text-end">
          <a href="#" class="link-detalle-dash me-2" data-id="${caso.id}">Ver detalle</a>
          <button type="button" class="btn btn-sm btn-link text-danger p-0" title="Eliminar caso"
            onclick="eliminarCaso(${caso.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`
    )
    .join("");
};

const actualizarContadoresTabs = () => {
  const total = casos.length;
  const accidentes = casos.filter((c) => c.tipo === "accidente").length;
  const semaforos = casos.filter((c) => c.tipo === "semaforo").length;

  const tabTodas = document.querySelector('.tab-dash[data-tipo="todas"]');
  const tabAccidente = document.querySelector('.tab-dash[data-tipo="accidente"]');
  const tabSemaforo = document.querySelector('.tab-dash[data-tipo="semaforo"]');

  if (tabTodas) tabTodas.textContent = `Todas (${total})`;
  if (tabAccidente) tabAccidente.textContent = `Accidente (${accidentes})`;
  if (tabSemaforo) tabSemaforo.textContent = `Semáforo dañado (${semaforos})`;
};

const actualizarKPIs = () => {
  const kpiActivos = document.getElementById("kpiCasosActivos");
  if (kpiActivos) {
    const activos = casos.filter((c) => c.estado !== "resuelta").length;
    kpiActivos.textContent = activos;
  }
};

const actualizarContadorResultados = (lista) => {
  const contador = document.getElementById("contadorResultados");
  if (contador) {
    contador.textContent = `Mostrando ${lista.length} de ${casos.length} reportes`;
  }
};

/* --------------------------------- Filtros --------------------------------- */

const aplicarFiltros = () => {
  let resultado = [...casos];

  if (filtros.tipo !== "todas") {
    resultado = resultado.filter((c) => c.tipo === filtros.tipo);
  }

  if (filtros.estados.size > 0) {
    resultado = resultado.filter((c) => filtros.estados.has(c.estado));
  }

  if (filtros.busqueda) {
    const termino = filtros.busqueda;
    resultado = resultado.filter(
      (c) =>
        c.reportante.toLowerCase().includes(termino) ||
        c.barrio.toLowerCase().includes(termino) ||
        c.tipoLabel.toLowerCase().includes(termino) ||
        c.estadoLabel.toLowerCase().includes(termino)
    );
  }

  renderizarTabla(resultado);
  actualizarContadorResultados(resultado);
};

const limpiarFiltros = () => {
  filtros.busqueda = "";
  filtros.tipo = "todas";
  filtros.estados.clear();

  document.querySelectorAll(".js-busqueda").forEach((input) => (input.value = ""));
  document.querySelectorAll(".js-filtro-estado").forEach((pill) => pill.classList.remove("pill-activa-dash"));

  document.querySelectorAll(".tab-dash").forEach((tab) => tab.classList.remove("active-dash"));
  const tabTodas = document.querySelector('.tab-dash[data-tipo="todas"]');
  if (tabTodas) tabTodas.classList.add("active-dash");

  aplicarFiltros();
};

/* ---------------------------------- Acciones ---------------------------------- */

const eliminarCaso = (id) => {
  casos = casos.filter((c) => c.id !== id);
  guardarCasos(casos);
  actualizarContadoresTabs();
  actualizarKPIs();
  aplicarFiltros();
};
// Se expone globalmente porque se usa desde el atributo onclick de la tabla
window.eliminarCaso = eliminarCaso;

/* ------------------------------ Eventos de UI ------------------------------ */

const configurarEventos = () => {
  // Barra(s) de búsqueda: la del sidebar izquierdo y la del topbar quedan sincronizadas
  document.querySelectorAll(".js-busqueda").forEach((input) => {
    input.addEventListener("input", (evento) => {
      const valor = evento.target.value;
      filtros.busqueda = valor.trim().toLowerCase();
      document.querySelectorAll(".js-busqueda").forEach((otro) => {
        if (otro !== evento.target) otro.value = valor;
      });
      aplicarFiltros();
    });
  });

  // Tabs de tipo (Todas / Accidente / Semáforo dañado)
  document.querySelectorAll(".tab-dash").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-dash").forEach((t) => t.classList.remove("active-dash"));
      tab.classList.add("active-dash");
      filtros.tipo = tab.dataset.tipo || "todas";
      aplicarFiltros();
    });
  });

  // Pills de estado en el panel de filtros (toggle al hacer clic)
  document.querySelectorAll(".js-filtro-estado").forEach((pill) => {
    pill.addEventListener("click", () => {
      const valor = pill.dataset.estado;
      const activa = pill.classList.toggle("pill-activa-dash");
      if (activa) filtros.estados.add(valor);
      else filtros.estados.delete(valor);
      aplicarFiltros();
    });
  });

  // Botón limpiar filtros
  const btnLimpiar = document.getElementById("btnLimpiarFiltros");
  if (btnLimpiar) btnLimpiar.addEventListener("click", limpiarFiltros);
};

/* ---------------------------------- Inicio ---------------------------------- */

const iniciarPanelCasos = () => {
  casos = cargarCasos();
  actualizarContadoresTabs();
  actualizarKPIs();
  configurarEventos();
  aplicarFiltros();
};

document.addEventListener("DOMContentLoaded", iniciarPanelCasos);