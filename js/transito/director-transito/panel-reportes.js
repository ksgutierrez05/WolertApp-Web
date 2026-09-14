const USAR_DATOS_MOCK = true;
 
let reportes = [];
 
// pestaña activa ('todos' | 'caso' | 'agente' | 'zona'), filtros y búsqueda
let tabActiva = "todos";
let filtroTexto = "";
let filtroRango = "7"; // '7' | '30' | 'mes' | 'todo'
let filtroZona = "todas";
 

const MOCK_REPORTES = [
  {
    id: 1,
    fechaISO: "2026-09-11T07:42:00",
    fecha: "11 sep 2026 · 07:42 a. m.",
    tipo: "Accidente de tránsito",
    zona: "Zona Norte",
    agente: "Agente Rojas",
    estado: "Crítico",
    categoria: "caso",
    tiempoHoras: 0.5,
  },
  {
    id: 2,
    fechaISO: "2026-09-11T06:15:00",
    fecha: "11 sep 2026 · 06:15 a. m.",
    tipo: "Congestión vehicular",
    zona: "Centro",
    agente: "Agente Pacheco",
    estado: "En proceso",
    categoria: "zona",
    tiempoHoras: 1.2,
  },
  {
    id: 3,
    fechaISO: "2026-09-10T21:03:00",
    fecha: "10 sep 2026 · 09:03 p. m.",
    tipo: "Semáforo averiado",
    zona: "Sector La Nevada",
    agente: "Agente Mendoza",
    estado: "Resuelto",
    categoria: "zona",
    tiempoHoras: 3.1,
  },
  {
    id: 4,
    fechaISO: "2026-09-10T16:27:00",
    fecha: "10 sep 2026 · 04:27 p. m.",
    tipo: "Infracción de tránsito",
    zona: "Los Fundadores",
    agente: "Agente Rojas",
    estado: "Resuelto",
    categoria: "agente",
    tiempoHoras: 0.8,
  },
];
 
// ---------------------------------------------------------------------
// Carga: localStorage validado -> mock (o API real cuando exista)
// ---------------------------------------------------------------------
function esCacheValido(lista) {
  return Array.isArray(lista) && lista.length > 0 && "fechaISO" in lista[0] && "categoria" in lista[0];
}
 
const ConsumirApiReportes = () => {
  fetch(RUTA_API_REPORTES)
    .then((res) => res.json())
    .then((data) => {
      reportes = data;
    })
    .catch((error) => console.error("Error: ", error));
};
 
const CargarReportes = async () => {
  let reportesLocal = localStorage.getItem("reportes");
  let reportesParseados = reportesLocal ? JSON.parse(reportesLocal) : null;
 
  if (esCacheValido(reportesParseados)) {
    reportes = reportesParseados;
    console.log("Reportes cargados desde localstorage");
    RenderTodo();
    return;
  }
 
  if (reportesLocal) {
    console.warn("El cache de 'reportes' en localStorage tenía datos con otra forma (o vacío). Se descarta y se recarga.");
    localStorage.removeItem("reportes");
  }
 
  if (USAR_DATOS_MOCK) {
    reportes = MOCK_REPORTES;
    localStorage.setItem("reportes", JSON.stringify(reportes));
    console.log("Reportes cargados desde el respaldo local (MOCK_REPORTES)");
    RenderTodo();
    return;
  }
 
  try {
    const rest = await fetch(RUTA_API_REPORTES);
    const data = await rest.json();
    reportes = data;
    localStorage.setItem("reportes", JSON.stringify(reportes));
    console.log("Reportes cargados desde la API");
  } catch (error) {
    console.error("Error: ", error);
    reportes = MOCK_REPORTES;
    localStorage.setItem("reportes", JSON.stringify(reportes));
    console.log("Reportes cargados desde el respaldo local (MOCK_REPORTES)");
  }
  RenderTodo();
};
 
// ---------------------------------------------------------------------
// Filtrado: tab (categoría) + rango de fecha + zona + texto de búsqueda
// ---------------------------------------------------------------------
function estaEnRango(fechaISO) {
  if (filtroRango === "todo") return true;
 
  const fecha = new Date(fechaISO);
  const ahora = new Date();
 
  if (filtroRango === "mes") {
    return fecha.getFullYear() === ahora.getFullYear() && fecha.getMonth() === ahora.getMonth();
  }
 
  const dias = parseInt(filtroRango, 10); // 7 o 30
  const limite = new Date(ahora);
  limite.setDate(limite.getDate() - dias);
  return fecha >= limite;
}
 
function obtenerReportesFiltrados() {
  return reportes.filter((r) => {
    const pasaTab = tabActiva === "todos" || r.categoria === tabActiva;
    const pasaZona = filtroZona === "todas" || r.zona === filtroZona;
    const pasaRango = estaEnRango(r.fechaISO);
    const texto = filtroTexto.toLowerCase();
    const pasaTexto =
      !texto ||
      r.tipo.toLowerCase().includes(texto) ||
      r.zona.toLowerCase().includes(texto) ||
      r.agente.toLowerCase().includes(texto);
 
    return pasaTab && pasaZona && pasaRango && pasaTexto;
  });
}
 
// ---------------------------------------------------------------------
// Render de la tabla
// ---------------------------------------------------------------------
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
 
const claseBadgePorEstado = {
  "Crítico": "badge-critico-dash",
  "En proceso": "badge-proceso-dash",
  "Resuelto": "badge-resuelto-dash",
};
 
const MostrarReportes = (lista) => {
  const tbody = document.getElementById("tbodyReportes");
  const empty = document.getElementById("emptyReportes");
 
  tbody.innerHTML = lista
    .map((r) => {
      const claseBadge = claseBadgePorEstado[r.estado] || "badge-proceso-dash";
      return `
    <tr>
      <td>${escapeHtml(r.fecha)}</td>
      <td class="fw-semibold">${escapeHtml(r.tipo)}</td>
      <td>${escapeHtml(r.zona)}</td>
      <td>${escapeHtml(r.agente)}</td>
      <td><span class="badge-estado-dash ${claseBadge}">${escapeHtml(r.estado)}</span></td>
      <td class="text-end">
        <button class="btn-icon-dash" title="Ver" onclick="VerReporte(${r.id})">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn-icon-dash" title="Descargar" onclick="DescargarReporte(${r.id})">
          <i class="bi bi-download"></i>
        </button>
      </td>
    </tr>
  `;
    })
    .join("");
 
  empty.classList.toggle("d-none", lista.length > 0);
};
 
// ---------------------------------------------------------------------
// KPIs, recalculados sobre el total de reportes (no sobre el filtro de tabla)
// ---------------------------------------------------------------------
const ActualizarKpis = () => {
  const ahora = new Date();
  const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
 
  const ultimas24h = reportes.filter((r) => new Date(r.fechaISO) >= hace24h).length;
  const resueltosMes = reportes.filter(
    (r) =>
      r.estado === "Resuelto" &&
      new Date(r.fechaISO).getFullYear() === ahora.getFullYear() &&
      new Date(r.fechaISO).getMonth() === ahora.getMonth(),
  ).length;
  const criticosActivos = reportes.filter((r) => r.estado === "Crítico").length;
 
  const conTiempo = reportes.filter((r) => typeof r.tiempoHoras === "number");
  const promedioHoras = conTiempo.length
    ? conTiempo.reduce((acc, r) => acc + r.tiempoHoras, 0) / conTiempo.length
    : 0;
 
  document.getElementById("kpiUltimas24h").textContent = ultimas24h;
  document.getElementById("kpiTiempoPromedio").textContent = `${promedioHoras.toFixed(1)}h`;
  document.getElementById("kpiResueltosMes").textContent = resueltosMes;
  document.getElementById("kpiCriticosActivos").textContent = criticosActivos;
};
 
// ---------------------------------------------------------------------
// Render conjunto: tabla + KPIs
// ---------------------------------------------------------------------
function RenderTodo() {
  MostrarReportes(obtenerReportesFiltrados());
  ActualizarKpis();
}
 
// ---------------------------------------------------------------------
// Acciones por fila
// ---------------------------------------------------------------------
const VerReporte = (id) => {
  const r = reportes.find((rep) => rep.id === id);
  if (!r) return;
  // TODO: reemplazar por navegación a la vista de detalle o un modal real.
  alert(
    `Reporte: ${r.tipo}\nFecha: ${r.fecha}\nZona: ${r.zona}\nAgente: ${r.agente}\nEstado: ${r.estado}`,
  );
};
 
function convertirAFilaCSV(r) {
  const campos = [r.fecha, r.tipo, r.zona, r.agente, r.estado];
  return campos.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",");
}
 
function descargarCSV(nombreArchivo, filas) {
  const encabezado = "Fecha,Tipo de reporte,Zona,Agente,Estado";
  const contenido = [encabezado, ...filas].join("\n");
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
 
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
 
const DescargarReporte = (id) => {
  const r = reportes.find((rep) => rep.id === id);
  if (!r) return;
  // TODO: reemplazar por la descarga real del backend (PDF/CSV del reporte puntual).
  descargarCSV(`reporte-${r.id}.csv`, [convertirAFilaCSV(r)]);
};
 
// ---------------------------------------------------------------------
// Exportar: descarga en CSV todo lo que está filtrado/visible en la tabla
// ---------------------------------------------------------------------
document.getElementById("btnExportarReportes").addEventListener("click", () => {
  const filas = obtenerReportesFiltrados().map(convertirAFilaCSV);
  if (filas.length === 0) {
    alert("No hay reportes para exportar con los filtros actuales.");
    return;
  }
  descargarCSV("reportes-transito.csv", filas);
});
 
// ---------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------
document.querySelectorAll("#tabsReportes .tab-dash").forEach((btn) => {
  btn.addEventListener("click", () => {
    tabActiva = btn.dataset.tab;
    document.querySelectorAll("#tabsReportes .tab-dash").forEach((b) => {
      b.classList.toggle("active-dash", b === btn);
    });
    RenderTodo();
  });
});
 
// ---------------------------------------------------------------------
// Filtros de fecha y zona
// ---------------------------------------------------------------------
document.getElementById("selectRangoFecha").addEventListener("change", (e) => {
  filtroRango = e.target.value;
  RenderTodo();
});
 
document.getElementById("selectZona").addEventListener("change", (e) => {
  filtroZona = e.target.value;
  RenderTodo();
});
 
// ---------------------------------------------------------------------
// Buscador
// ---------------------------------------------------------------------
document.getElementById("inputBuscarReportes").addEventListener("input", (e) => {
  filtroTexto = e.target.value.trim();
  RenderTodo();
});
 
// ---------------------------------------------------------------------
// Inicio
// ---------------------------------------------------------------------
CargarReportes();
 