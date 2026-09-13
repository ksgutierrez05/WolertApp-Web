/* ==========================================================================
   WolertApp - Semáforos (CRUD)
   Carga, guarda, busca, filtra (por tipo y estado) y permite
   crear/editar/eliminar semáforos usando localStorage.
   Sigue el mismo patrón que panel-casos.js.
   ========================================================================== */

const CLAVE_STORAGE_SEMAFOROS = "wolert_semaforos";

// Datos semilla: se usan solo la primera vez (si no hay nada en localStorage)
const SEMAFOROS_INICIALES = [
  { id: 1,  codigo: "SEM-001", ubicacion: "Cra 19 con Calle 16",  barrio: "Casimiro Raúl Maestre", tipo: "vehicular", estado: "funcionando",   ultimaRevision: "2026-08-20" },
  { id: 2,  codigo: "SEM-002", ubicacion: "Av. Simón Bolívar con Cra 9", barrio: "Simón Bolívar",  tipo: "peatonal",  estado: "danado",         ultimaRevision: "2026-07-02" },
  { id: 3,  codigo: "SEM-003", ubicacion: "Cra 7 con Calle 44",   barrio: "Los Fundadores",        tipo: "vehicular", estado: "mantenimiento", ultimaRevision: "2026-09-01" },
  { id: 4,  codigo: "SEM-004", ubicacion: "Calle 16 con Cra 23",  barrio: "El Carmen",              tipo: "vehicular", estado: "funcionando",   ultimaRevision: "2026-08-28" },
  { id: 5,  codigo: "SEM-005", ubicacion: "Cra 9 con Calle 9",    barrio: "La Popa",                tipo: "peatonal",  estado: "funcionando",   ultimaRevision: "2026-06-15" },
  { id: 6,  codigo: "SEM-006", ubicacion: "Av. Hurtado con Cra 19", barrio: "La Nevada",            tipo: "vehicular", estado: "danado",         ultimaRevision: "2026-05-30" },
  { id: 7,  codigo: "SEM-007", ubicacion: "Cra 14 con Calle 20",  barrio: "Casimiro Raúl Maestre", tipo: "vehicular", estado: "funcionando",   ultimaRevision: "2026-09-05" },
  { id: 8,  codigo: "SEM-008", ubicacion: "Calle 44 con Cra 11",  barrio: "Los Fundadores",         tipo: "peatonal",  estado: "mantenimiento", ultimaRevision: "2026-08-10" },
];

// Estado en memoria de la app
let semaforos = [];
let idEnEdicion = null; // null = creando nuevo, número = editando ese id

const filtrosSem = {
  busqueda: "",
  tipo: "todas",       // todas | vehicular | peatonal
  estados: new Set(),  // valores: funcionando, danado, mantenimiento
};

/* ---------------------- Carga y guardado en localStorage ---------------------- */

const cargarSemaforos = () => {
  const guardado = localStorage.getItem(CLAVE_STORAGE_SEMAFOROS);
  if (guardado) {
    try {
      console.log("Semáforos cargados desde localStorage");
      return JSON.parse(guardado);
    } catch (error) {
      console.error("Error al leer localStorage, se usan datos iniciales: ", error);
    }
  }
  localStorage.setItem(CLAVE_STORAGE_SEMAFOROS, JSON.stringify(SEMAFOROS_INICIALES));
  console.log("Semáforos iniciales guardados en localStorage");
  return [...SEMAFOROS_INICIALES];
};

const guardarSemaforos = (lista) => {
  try {
    localStorage.setItem(CLAVE_STORAGE_SEMAFOROS, JSON.stringify(lista));
  } catch (error) {
    console.error("Error al guardar en localStorage: ", error);
  }
};

/* ------------------------------- Utilidades ------------------------------- */

const claseEstadoSem = (estado) => {
  switch (estado) {
    case "funcionando":   return "estado-resuelta-dash";   // verde
    case "danado":        return "estado-critica-dash";    // rojo
    case "mantenimiento": return "estado-atencion-dash";   // ámbar
    default:              return "";
  }
};

const etiquetaEstadoSem = (estado) => {
  switch (estado) {
    case "funcionando":   return "Funcionando";
    case "danado":        return "Dañado";
    case "mantenimiento": return "En mantenimiento";
    default:              return estado;
  }
};

const etiquetaTipoSem = (tipo) => (tipo === "peatonal" ? "Peatonal" : "Vehicular");

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return "-";
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
};

const siguienteId = () => (semaforos.length ? Math.max(...semaforos.map((s) => s.id)) + 1 : 1);

const siguienteCodigo = () => {
  const numero = siguienteId().toString().padStart(3, "0");
  return `SEM-${numero}`;
};

/* --------------------------------- Render --------------------------------- */

const renderizarTablaSemaforos = (lista) => {
  const tbody = document.querySelector("#tablaSemaforos tbody");
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">
          No se encontraron semáforos con los filtros seleccionados.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = lista
    .map(
      (sem) => `
      <tr>
        <td class="fw-semibold">${sem.codigo}</td>
        <td>${sem.ubicacion}</td>
        <td>${sem.barrio}</td>
        <td>${etiquetaTipoSem(sem.tipo)}</td>
        <td><span class="badge-estado-dash ${claseEstadoSem(sem.estado)}">${etiquetaEstadoSem(sem.estado)}</span></td>
        <td class="text-muted small">${formatearFecha(sem.ultimaRevision)}</td>
        <td class="text-end">
          <button type="button" class="btn-icono-dash btn-icono-editar-dash" title="Editar semáforo"
            onclick="abrirModalEditar(${sem.id})">
            <i class="bi bi-pencil"></i>
          </button>
          <button type="button" class="btn-icono-dash btn-icono-eliminar-dash" title="Eliminar semáforo"
            onclick="eliminarSemaforo(${sem.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`
    )
    .join("");
};

// Igual que actualizarContadoresTabs en panel-casos.js, pero por tipo de semáforo
const actualizarContadoresTabsSemaforos = () => {
  const total = semaforos.length;
  const vehiculares = semaforos.filter((s) => s.tipo === "vehicular").length;
  const peatonales = semaforos.filter((s) => s.tipo === "peatonal").length;

  const tabTodas = document.querySelector('.tab-dash-sem[data-tipo="todas"]');
  const tabVehicular = document.querySelector('.tab-dash-sem[data-tipo="vehicular"]');
  const tabPeatonal = document.querySelector('.tab-dash-sem[data-tipo="peatonal"]');

  if (tabTodas) tabTodas.textContent = `Todas (${total})`;
  if (tabVehicular) tabVehicular.textContent = `Vehicular (${vehiculares})`;
  if (tabPeatonal) tabPeatonal.textContent = `Peatonal (${peatonales})`;
};

const actualizarKPIsSemaforos = () => {
  const total = semaforos.length;
  const funcionando = semaforos.filter((s) => s.estado === "funcionando").length;
  const danados = semaforos.filter((s) => s.estado === "danado").length;
  const mantenimiento = semaforos.filter((s) => s.estado === "mantenimiento").length;

  const kpiTotal = document.getElementById("kpiSemaforosTotal");
  const kpiFuncionando = document.getElementById("kpiSemaforosFuncionando");
  const kpiDanados = document.getElementById("kpiSemaforosDanados");
  const kpiMantenimiento = document.getElementById("kpiSemaforosMantenimiento");

  if (kpiTotal) kpiTotal.textContent = total;
  if (kpiFuncionando) kpiFuncionando.textContent = funcionando;
  if (kpiDanados) kpiDanados.textContent = danados;
  if (kpiMantenimiento) kpiMantenimiento.textContent = mantenimiento;
};

const actualizarContadorResultadosSemaforos = (lista) => {
  const contador = document.getElementById("contadorResultadosSemaforos");
  if (contador) {
    contador.textContent = `Mostrando ${lista.length} de ${semaforos.length} semáforos`;
  }
};

/* --------------------------------- Filtros --------------------------------- */

const aplicarFiltrosSemaforos = () => {
  let resultado = [...semaforos];

  if (filtrosSem.tipo !== "todas") {
    resultado = resultado.filter((s) => s.tipo === filtrosSem.tipo);
  }

  if (filtrosSem.estados.size > 0) {
    resultado = resultado.filter((s) => filtrosSem.estados.has(s.estado));
  }

  if (filtrosSem.busqueda) {
    const termino = filtrosSem.busqueda;
    resultado = resultado.filter(
      (s) =>
        s.codigo.toLowerCase().includes(termino) ||
        s.ubicacion.toLowerCase().includes(termino) ||
        s.barrio.toLowerCase().includes(termino)
    );
  }

  renderizarTablaSemaforos(resultado);
  actualizarContadorResultadosSemaforos(resultado);
};

const limpiarFiltrosSemaforos = () => {
  filtrosSem.busqueda = "";
  filtrosSem.tipo = "todas";
  filtrosSem.estados.clear();

  document.querySelectorAll(".js-busqueda-sem").forEach((input) => (input.value = ""));
  document.querySelectorAll(".js-filtro-estado-sem").forEach((pill) => pill.classList.remove("pill-activa-dash"));

  document.querySelectorAll(".tab-dash-sem").forEach((tab) => tab.classList.remove("active-dash"));
  const tabTodas = document.querySelector('.tab-dash-sem[data-tipo="todas"]');
  if (tabTodas) tabTodas.classList.add("active-dash");

  aplicarFiltrosSemaforos();
};

/* ------------------------------- CRUD: Crear/Editar ------------------------------- */

const abrirModalCrear = () => {
  idEnEdicion = null;
  document.getElementById("formSemaforoTitulo").textContent = "Nuevo semáforo";
  document.getElementById("formSemaforo").reset();
  document.getElementById("inputCodigo").value = siguienteCodigo();
  const modal = new bootstrap.Modal(document.getElementById("modalSemaforo"));
  modal.show();
};
window.abrirModalCrear = abrirModalCrear;

const abrirModalEditar = (id) => {
  const sem = semaforos.find((s) => s.id === id);
  if (!sem) return;

  idEnEdicion = id;
  document.getElementById("formSemaforoTitulo").textContent = "Editar semáforo";
  document.getElementById("inputCodigo").value = sem.codigo;
  document.getElementById("inputUbicacion").value = sem.ubicacion;
  document.getElementById("inputBarrio").value = sem.barrio;
  document.getElementById("inputTipo").value = sem.tipo;
  document.getElementById("inputEstado").value = sem.estado;
  document.getElementById("inputRevision").value = sem.ultimaRevision;

  const modal = new bootstrap.Modal(document.getElementById("modalSemaforo"));
  modal.show();
};
window.abrirModalEditar = abrirModalEditar;

const guardarFormularioSemaforo = (evento) => {
  evento.preventDefault();

  const datos = {
    codigo: document.getElementById("inputCodigo").value.trim(),
    ubicacion: document.getElementById("inputUbicacion").value.trim(),
    barrio: document.getElementById("inputBarrio").value.trim(),
    tipo: document.getElementById("inputTipo").value,
    estado: document.getElementById("inputEstado").value,
    ultimaRevision: document.getElementById("inputRevision").value,
  };

  if (!datos.ubicacion || !datos.barrio || !datos.ultimaRevision) {
    return; // el atributo "required" de los inputs ya cubre esto en el navegador
  }

  if (idEnEdicion === null) {
    // Crear
    semaforos.push({ id: siguienteId(), ...datos });
  } else {
    // Actualizar
    semaforos = semaforos.map((s) => (s.id === idEnEdicion ? { ...s, ...datos } : s));
  }

  guardarSemaforos(semaforos);
  actualizarContadoresTabsSemaforos();
  actualizarKPIsSemaforos();
  aplicarFiltrosSemaforos();

  const modalEl = document.getElementById("modalSemaforo");
  bootstrap.Modal.getOrCreateInstance(modalEl).hide();
};

/* ------------------------------- CRUD: Eliminar ------------------------------- */

const eliminarSemaforo = (id) => {
  const sem = semaforos.find((s) => s.id === id);
  if (!sem) return;
  const confirmado = confirm(`¿Eliminar el semáforo ${sem.codigo} (${sem.ubicacion})?`);
  if (!confirmado) return;

  semaforos = semaforos.filter((s) => s.id !== id);
  guardarSemaforos(semaforos);
  actualizarContadoresTabsSemaforos();
  actualizarKPIsSemaforos();
  aplicarFiltrosSemaforos();
};
window.eliminarSemaforo = eliminarSemaforo;

/* ------------------------------ Eventos de UI ------------------------------ */

const configurarEventosSemaforos = () => {
  // Todos los buscadores (topbar y panel de filtros) quedan sincronizados,
  // igual que en panel-casos.js
  document.querySelectorAll(".js-busqueda-sem").forEach((input) => {
    input.addEventListener("input", (evento) => {
      const valor = evento.target.value;
      filtrosSem.busqueda = valor.trim().toLowerCase();
      document.querySelectorAll(".js-busqueda-sem").forEach((otro) => {
        if (otro !== evento.target) otro.value = valor;
      });
      aplicarFiltrosSemaforos();
    });
  });

  // Tabs de tipo (Todas / Vehicular / Peatonal)
  document.querySelectorAll(".tab-dash-sem").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-dash-sem").forEach((t) => t.classList.remove("active-dash"));
      tab.classList.add("active-dash");
      filtrosSem.tipo = tab.dataset.tipo || "todas";
      aplicarFiltrosSemaforos();
    });
  });

  document.querySelectorAll(".js-filtro-estado-sem").forEach((pill) => {
    pill.addEventListener("click", () => {
      const valor = pill.dataset.estado;
      const activa = pill.classList.toggle("pill-activa-dash");
      if (activa) filtrosSem.estados.add(valor);
      else filtrosSem.estados.delete(valor);
      aplicarFiltrosSemaforos();
    });
  });

  const btnLimpiar = document.getElementById("btnLimpiarFiltrosSemaforos");
  if (btnLimpiar) btnLimpiar.addEventListener("click", limpiarFiltrosSemaforos);

  const btnNuevo = document.getElementById("btnNuevoSemaforo");
  if (btnNuevo) btnNuevo.addEventListener("click", abrirModalCrear);

  const form = document.getElementById("formSemaforo");
  if (form) form.addEventListener("submit", guardarFormularioSemaforo);
};

/* ---------------------------------- Inicio ---------------------------------- */

const iniciarPanelSemaforos = () => {
  semaforos = cargarSemaforos();
  actualizarContadoresTabsSemaforos();
  actualizarKPIsSemaforos();
  configurarEventosSemaforos();
  aplicarFiltrosSemaforos();
};

document.addEventListener("DOMContentLoaded", iniciarPanelSemaforos);
