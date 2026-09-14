// js/transito/central-transito/panel-casos.js
// Maneja los casos sin asignar: carga/guarda en localStorage, renderiza la
// tabla y abre el modal con los grupos disponibles al presionar "Asignar agente".

const CLAVE_CASOS = "casosSinAsignarTransito";
const CLAVE_GRUPOS = "gruposTransito";

const CASOS_SEED = [
  { id: 1,  tipo: "semaforo",   ubicacion: "Barrio La Nevada",        reportante: "Laura Peña",           espera: 12 },
  { id: 2,  tipo: "accidente",  ubicacion: "Casimiro Raúl Maestre",   reportante: "Katherine Gutiérrez",   espera: 8  },
  { id: 3,  tipo: "accidente",  ubicacion: "Los Fundadores",          reportante: "Diego Torres",          espera: 5  },
  { id: 4,  tipo: "semaforo",   ubicacion: "El Centro",               reportante: "Ravi Kumar",            espera: 3  },
  { id: 5,  tipo: "accidente",  ubicacion: "Zona Norte",              reportante: "Andrea Solano",         espera: 15 },
  { id: 6,  tipo: "semaforo",   ubicacion: "Sector La Nevada",        reportante: "Pedro Zapata",          espera: 9  },
  { id: 7,  tipo: "accidente",  ubicacion: "Barrio Los Cortijos",     reportante: "Marcela Ruiz",          espera: 2  },
  { id: 8,  tipo: "accidente",  ubicacion: "Avenida Simón Bolívar",   reportante: "Julián Pérez",          espera: 11 },
  { id: 9,  tipo: "semaforo",   ubicacion: "Calle 16 con Carrera 9",  reportante: "Sofía Daza",            espera: 6  },
  { id: 10, tipo: "accidente",  ubicacion: "Barrio Cañaguate",        reportante: "Camilo Vega",           espera: 4  },
  { id: 11, tipo: "semaforo",   ubicacion: "Barrio Alfonso López",    reportante: "Natalia Arias",         espera: 1  },
  { id: 12, tipo: "accidente",  ubicacion: "Terminal de Transportes", reportante: "Mario Iguarán",         espera: 7  },
];

// Los mismos 5 grupos que salen en el Decreto 001111 de 2023.
const GRUPOS_SEED = [
  { id: 1, nombre: "Grupo 1", disponible: true,  distancia: 2.4 },
  { id: 2, nombre: "Grupo 2", disponible: true,  distancia: 0.9 },
  { id: 3, nombre: "Grupo 3", disponible: false, distancia: 1.6 },
  { id: 4, nombre: "Grupo 4", disponible: true,  distancia: 4.1 },
  { id: 5, nombre: "Grupo 5", disponible: true,  distancia: 1.1 },
];

let casos = [];
let grupos = [];
let casoSeleccionadoId = null;
let filtroGrupoModal = "todos";
let textoBusquedaGrupoModal = "";

const CargarDatos = () => {
  const casosGuardados = localStorage.getItem(CLAVE_CASOS);
  casos = casosGuardados ? JSON.parse(casosGuardados) : CASOS_SEED;
  if (!casosGuardados) localStorage.setItem(CLAVE_CASOS, JSON.stringify(casos));

  const gruposGuardados = localStorage.getItem(CLAVE_GRUPOS);
  const gruposParseados = gruposGuardados ? JSON.parse(gruposGuardados) : null;
  const gruposDesactualizados = gruposParseados && gruposParseados.some((g) => g.distancia === undefined);

  if (gruposParseados && !gruposDesactualizados) {
    grupos = gruposParseados;
  } else {
    grupos = GRUPOS_SEED;
    localStorage.setItem(CLAVE_GRUPOS, JSON.stringify(grupos));
  }

  MostrarCasos();
  ActualizarKpis();
};

const GuardarCasos = () => localStorage.setItem(CLAVE_CASOS, JSON.stringify(casos));

const InfoTipo = (tipo) => {
  if (tipo === "semaforo") return { texto: "Semáforo dañado", clase: "tipo-semaforo-dash" };
  return { texto: "Accidente", clase: "tipo-accidente-dash" };
};

const InfoEspera = (minutos) => {
  const clase = minutos >= 8 ? "espera-alta-dash" : "espera-media-dash";
  return { texto: `${minutos} min`, clase };
};

const MostrarCasos = () => {
  const tbody = document.getElementById("tablaCasosBody");

  if (casos.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="4" class="text-center text-muted py-4">No hay casos sin asignar en este momento.</td></tr>
    `;
    return;
  }

  tbody.innerHTML = casos
    .map((caso) => {
      const tipo = InfoTipo(caso.tipo);
      const espera = InfoEspera(caso.espera);
      return `
        <tr>
          <td><span class="badge-tipo-dash ${tipo.clase}">${tipo.texto}</span></td>
          <td>
            <div class="fw-semibold">${caso.ubicacion}</div>
            <div class="text-muted small">Reportado por ${caso.reportante}</div>
          </td>
          <td><span class="badge-espera-dash ${espera.clase}">${espera.texto}</span></td>
          <td class="text-end">
            <button class="btn-asignar-dash" onclick="AbrirModalAsignar(${caso.id})">Asignar agente</button>
          </td>
        </tr>
      `;
    })
    .join("");
};

const ActualizarKpis = () => {
  document.getElementById("kpiCasosActivos").textContent = casos.length;
  const disponibles = grupos.filter((g) => g.disponible).length;
  document.getElementById("kpiGruposDisponibles").textContent = `${disponibles}/${grupos.length}`;
};

const AbrirModalAsignar = (casoId) => {
  casoSeleccionadoId = casoId;
  const caso = casos.find((c) => c.id === casoId);
  if (!caso) return;

  const tipo = InfoTipo(caso.tipo);
  document.getElementById("modalCasoInfo").textContent = `${tipo.texto} · ${caso.ubicacion}`;

  filtroGrupoModal = "todos";
  textoBusquedaGrupoModal = "";
  document.getElementById("buscarGrupoModal").value = "";
  document.querySelectorAll("#tabsGrupoModal .tab-dash").forEach((btn) => btn.classList.remove("active-dash"));
  document.querySelector('#tabsGrupoModal .tab-dash[data-filtro="todos"]').classList.add("active-dash");

  MostrarGruposModal();

  const modal = new bootstrap.Modal(document.getElementById("modalAsignar"));
  modal.show();
};

const ObtenerGruposFiltrados = () => {
  let lista = [...grupos].sort((a, b) => a.distancia - b.distancia);

  if (filtroGrupoModal === "disponible") lista = lista.filter((g) => g.disponible);
  if (filtroGrupoModal === "no-disponible") lista = lista.filter((g) => !g.disponible);

  if (textoBusquedaGrupoModal.trim() !== "") {
    const texto = textoBusquedaGrupoModal.trim().toLowerCase();
    lista = lista.filter((g) => g.nombre.toLowerCase().includes(texto));
  }

  return lista;
};

const MostrarGruposModal = () => {
  const lista = ObtenerGruposFiltrados();
  const tbody = document.getElementById("listaGruposDisponibles");

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">Sin resultados.</td></tr>`;
    return;
  }

  tbody.innerHTML = lista
    .map((grupo) => `
      <tr>
        <td class="fw-semibold">${grupo.nombre}</td>
        <td>${(grupo.distancia ?? 0).toFixed(1)} km</td>
        <td>
          <span class="badge-state-dash ${grupo.disponible ? "badge-active-dash" : "badge-inactive-dash"}">
            ${grupo.disponible ? "Disponible" : "No disponible"}
          </span>
        </td>
        <td class="text-end">
          <button class="btn-asignar-fila-dash" ${grupo.disponible ? "" : "disabled"} onclick="ConfirmarAsignacion(${grupo.id})">
            Asignar
          </button>
        </td>
      </tr>
    `)
    .join("");
};

document.getElementById("buscarGrupoModal").addEventListener("input", (evento) => {
  textoBusquedaGrupoModal = evento.target.value;
  MostrarGruposModal();
});

document.querySelectorAll("#tabsGrupoModal .tab-dash").forEach((boton) => {
  boton.addEventListener("click", () => {
    document.querySelectorAll("#tabsGrupoModal .tab-dash").forEach((b) => b.classList.remove("active-dash"));
    boton.classList.add("active-dash");
    filtroGrupoModal = boton.dataset.filtro;
    MostrarGruposModal();
  });
});

const ConfirmarAsignacion = (grupoId) => {
  const grupo = grupos.find((g) => g.id === grupoId);
  casos = casos.filter((c) => c.id !== casoSeleccionadoId);
  GuardarCasos();
  MostrarCasos();
  ActualizarKpis();

  const modalEl = document.getElementById("modalAsignar");
  bootstrap.Modal.getInstance(modalEl)?.hide();

  console.log(`Caso ${casoSeleccionadoId} asignado a ${grupo.nombre}`);
  casoSeleccionadoId = null;
};

CargarDatos();