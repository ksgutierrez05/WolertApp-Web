// js/transito/agente-transito/panel-historial.js
// Historial de casos ya atendidos por el grupo: búsqueda por caso/barrio,
// filtro por tipo (tabs), paginación y modal de "Ver detalle".

const CLAVE_HISTORIAL = "historialTransito1";
const POR_PAGINA = 4;

const HISTORIAL_SEED = [
  { id: 1, fechaTexto: "10/9/2026 · 19:05 p.m.", tipo: "semaforo", caso: "Los Fundadores", reportadoPor: "Diego Torres", estado: "resuelta" },
  { id: 2, fechaTexto: "9/9/2026 · 14:20 p.m.", tipo: "accidente", caso: "Casimiro Raúl Maestre", reportadoPor: "Laura Peña", estado: "resuelta" },
  { id: 3, fechaTexto: "8/9/2026 · 09:40 a.m.", tipo: "accidente", caso: "Los Fundadores", reportadoPor: "Jorge Martínez", estado: "resuelta" },
  { id: 4, fechaTexto: "7/9/2026 · 17:12 p.m.", tipo: "semaforo", caso: "Casimiro Raúl Maestre", reportadoPor: "Diego Torres", estado: "resuelta" },
  { id: 5, fechaTexto: "6/9/2026 · 08:15 a.m.", tipo: "accidente", caso: "Zona Norte", reportadoPor: "Katherine Gutiérrez", estado: "resuelta" },
  { id: 6, fechaTexto: "6/9/2026 · 20:47 p.m.", tipo: "semaforo", caso: "Centro", reportadoPor: "Camilo Vega", estado: "resuelta" },
  { id: 7, fechaTexto: "5/9/2026 · 11:32 a.m.", tipo: "accidente", caso: "Sector La Nevada", reportadoPor: "Sara Molina", estado: "resuelta" },
  { id: 8, fechaTexto: "4/9/2026 · 16:05 p.m.", tipo: "accidente", caso: "El Prado", reportadoPor: "Manuel Contreras", estado: "resuelta" },
  { id: 9, fechaTexto: "4/9/2026 · 07:58 a.m.", tipo: "semaforo", caso: "La Castellana", reportadoPor: "Diana Torres", estado: "resuelta" },
  { id: 10, fechaTexto: "3/9/2026 · 13:22 p.m.", tipo: "accidente", caso: "San Vicente", reportadoPor: "Laura Pacheco", estado: "resuelta" },
  { id: 11, fechaTexto: "2/9/2026 · 18:40 p.m.", tipo: "accidente", caso: "Los Fundadores", reportadoPor: "Jorge Ramírez", estado: "resuelta" },
  { id: 12, fechaTexto: "1/9/2026 · 09:10 a.m.", tipo: "semaforo", caso: "Casimiro Raúl Maestre", reportadoPor: "Andrea Ríos", estado: "resuelta" },
  { id: 13, fechaTexto: "31/8/2026 · 15:27 p.m.", tipo: "accidente", caso: "Villa Country", reportadoPor: "Felipe Salcedo", estado: "resuelta" },
  { id: 14, fechaTexto: "30/8/2026 · 10:05 a.m.", tipo: "accidente", caso: "El Poblado", reportadoPor: "Natalia Rojas", estado: "resuelta" },
  { id: 15, fechaTexto: "29/8/2026 · 19:50 p.m.", tipo: "semaforo", caso: "Zona Norte", reportadoPor: "Katherine Gutiérrez", estado: "resuelta" },
  { id: 16, fechaTexto: "28/8/2026 · 08:33 a.m.", tipo: "accidente", caso: "Centro", reportadoPor: "Camilo Vega", estado: "resuelta" },
  { id: 17, fechaTexto: "27/8/2026 · 21:14 p.m.", tipo: "accidente", caso: "Sector La Nevada", reportadoPor: "Sara Molina", estado: "resuelta" },
  { id: 18, fechaTexto: "26/8/2026 · 12:48 p.m.", tipo: "semaforo", caso: "El Prado", reportadoPor: "Manuel Contreras", estado: "resuelta" },
];

let historial = [];
let filtroTipo = "todos"; // "todos" | "accidente" | "semaforo"
let textoBusqueda = "";
let paginaActual = 1;

const TextoTipo = (tipo) => (tipo === "semaforo" ? "Semáforo dañado" : "Accidente");
const ClaseTipo = (tipo) => (tipo === "semaforo" ? "tipo-semaforo-dash" : "tipo-accidente-dash");
const TextoEstado = (estado) => (estado === "resuelta" ? "Resuelta" : estado);
const ClaseEstado = (estado) => (estado === "resuelta" ? "estado-resuelta-dash" : "estado-atencion-dash");

const GuardarHistorial = () => {
  localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial));
};

const CargarHistorial = () => {
  const guardado = localStorage.getItem(CLAVE_HISTORIAL);
  const parseado = guardado ? JSON.parse(guardado) : null;

  historial = parseado && Array.isArray(parseado) && parseado.length > 0 ? parseado : structuredClone(HISTORIAL_SEED);
  if (!parseado) GuardarHistorial();

  VincularEventos();
  RenderizarTabs();
  RenderizarTodo();
};

const VincularEventos = () => {
  const inputBusqueda = document.querySelector(".search-dash input");
  if (inputBusqueda) {
    inputBusqueda.addEventListener("input", (evento) => BuscarHistorial(evento.target.value));
  }

  const claves = ["todos", "accidente", "semaforo"];
  document.querySelectorAll(".tabs-dash .tab-dash").forEach((boton, index) => {
    boton.addEventListener("click", () => FiltrarPorTipo(claves[index]));
  });

  const tbody = document.querySelector(".table-card-dash tbody");
  if (tbody) {
    tbody.addEventListener("click", (evento) => {
      const link = evento.target.closest(".link-detalle-dash");
      if (!link) return;
      evento.preventDefault();
      AbrirDetalle(Number(link.dataset.id));
    });
  }
};

const ObtenerListaFiltrada = () => {
  let lista = historial;

  if (filtroTipo !== "todos") {
    lista = lista.filter((item) => item.tipo === filtroTipo);
  }

  if (textoBusqueda.trim() !== "") {
    const texto = textoBusqueda.trim().toLowerCase();
    lista = lista.filter(
      (item) =>
        item.caso.toLowerCase().includes(texto) ||
        item.reportadoPor.toLowerCase().includes(texto)
    );
  }

  return lista;
};

const RenderizarTodo = () => {
  const listaFiltrada = ObtenerListaFiltrada();
  const totalPaginas = Math.max(1, Math.ceil(listaFiltrada.length / POR_PAGINA));
  paginaActual = Math.min(paginaActual, totalPaginas);

  const inicio = (paginaActual - 1) * POR_PAGINA;
  const listaPagina = listaFiltrada.slice(inicio, inicio + POR_PAGINA);

  RenderizarTabla(listaPagina);
  RenderizarPaginacion(listaFiltrada.length, totalPaginas);
};

const RenderizarTabla = (lista) => {
  const tbody = document.querySelector(".table-card-dash tbody");
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay reportes que coincidan con la búsqueda.</td></tr>`;
    return;
  }

  tbody.innerHTML = lista
    .map(
      (item) => `
      <tr>
        <td class="text-muted small">${item.fechaTexto}</td>
        <td><span class="badge-tipo-dash ${ClaseTipo(item.tipo)}">${TextoTipo(item.tipo)}</span></td>
        <td>${item.caso}</td>
        <td>${item.reportadoPor}</td>
        <td><span class="badge-estado-dash ${ClaseEstado(item.estado)}">${TextoEstado(item.estado)}</span></td>
        <td class="text-end"><a href="#" class="link-detalle-dash" data-id="${item.id}">Ver detalle</a></td>
      </tr>
    `
    )
    .join("");
};

const RenderizarTabs = () => {
  const total = historial.length;
  const totalAccidente = historial.filter((item) => item.tipo === "accidente").length;
  const totalSemaforo = historial.filter((item) => item.tipo === "semaforo").length;

  const botones = document.querySelectorAll(".tabs-dash .tab-dash");
  if (botones[0]) botones[0].textContent = `Todas (${total})`;
  if (botones[1]) botones[1].textContent = `Accidente (${totalAccidente})`;
  if (botones[2]) botones[2].textContent = `Semáforo dañado (${totalSemaforo})`;

  const claves = ["todos", "accidente", "semaforo"];
  botones.forEach((boton, index) => {
    boton.classList.toggle("active-dash", claves[index] === filtroTipo);
  });
};

const RenderizarPaginacion = (totalFiltrados, totalPaginas) => {
  const textoResumen = document.querySelector(".paginacion-dash .text-muted.small");
  const contenedorBotones = document.querySelector(".paginacion-dash .d-flex.gap-1");
  if (!textoResumen || !contenedorBotones) return;

  if (totalFiltrados === 0) {
    textoResumen.textContent = "No se encontraron reportes";
    contenedorBotones.innerHTML = "";
    return;
  }

  const inicio = (paginaActual - 1) * POR_PAGINA + 1;
  const fin = Math.min(paginaActual * POR_PAGINA, totalFiltrados);
  textoResumen.textContent = `Mostrando ${inicio}–${fin} de ${totalFiltrados} reportes`;

  let botonesHtml = "";
  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    botonesHtml += `<button class="page-btn-dash ${pagina === paginaActual ? "active-dash" : ""}" data-pagina="${pagina}">${pagina}</button>`;
  }
  botonesHtml += `<button class="page-btn-dash" data-pagina="siguiente" ${paginaActual === totalPaginas ? "disabled" : ""}><i class="bi bi-chevron-right"></i></button>`;

  contenedorBotones.innerHTML = botonesHtml;

  contenedorBotones.querySelectorAll(".page-btn-dash").forEach((boton) => {
    boton.addEventListener("click", () => {
      const valor = boton.dataset.pagina;
      if (valor === "siguiente") {
        CambiarPagina(paginaActual + 1);
      } else {
        CambiarPagina(Number(valor));
      }
    });
  });
};

const FiltrarPorTipo = (tipo) => {
  filtroTipo = tipo;
  paginaActual = 1;
  RenderizarTabs();
  RenderizarTodo();
};

const BuscarHistorial = (texto) => {
  textoBusqueda = texto;
  paginaActual = 1;
  RenderizarTodo();
};

const CambiarPagina = (pagina) => {
  paginaActual = pagina;
  RenderizarTodo();
};

const AsegurarModalDetalle = () => {
  let modalEl = document.getElementById("modalDetalleHistorial");
  if (modalEl) return modalEl;

  modalEl = document.createElement("div");
  modalEl.className = "modal fade";
  modalEl.id = "modalDetalleHistorial";
  modalEl.tabIndex = -1;
  modalEl.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold">Detalle del reporte</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <p class="mb-2"><strong>Fecha:</strong> <span id="detalleFecha"></span></p>
          <p class="mb-2"><strong>Tipo:</strong> <span id="detalleTipo"></span></p>
          <p class="mb-2"><strong>Caso / Barrio:</strong> <span id="detalleCaso"></span></p>
          <p class="mb-2"><strong>Reportado por:</strong> <span id="detalleReportadoPor"></span></p>
          <p class="mb-0"><strong>Estado:</strong> <span id="detalleEstado"></span></p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalEl);
  return modalEl;
};

const AbrirDetalle = (id) => {
  const registro = historial.find((item) => item.id === id);
  if (!registro) return;

  AsegurarModalDetalle();
  document.getElementById("detalleFecha").textContent = registro.fechaTexto;
  document.getElementById("detalleTipo").textContent = TextoTipo(registro.tipo);
  document.getElementById("detalleCaso").textContent = registro.caso;
  document.getElementById("detalleReportadoPor").textContent = registro.reportadoPor;
  document.getElementById("detalleEstado").textContent = TextoEstado(registro.estado);

  const modal = new bootstrap.Modal(document.getElementById("modalDetalleHistorial"));
  modal.show();
};

CargarHistorial();