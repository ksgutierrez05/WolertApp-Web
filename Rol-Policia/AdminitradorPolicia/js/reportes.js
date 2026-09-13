renderSidebarPolicia('reportes');

// ---------- Datos de ejemplo (en memoria) ----------
// Simula lo que hoy calcula ReporteStatsCalculator y trae
// AlertaService.listar() desde MySQL.

const ESTADOS_ALERTA = {
  PENDIENTE: { label: 'Pendiente', badge: 'badge-red-dash' },
  RECIBIDA: { label: 'Recibida', badge: 'badge-blue-dash' },
  EN_ATENCION: { label: 'En atención', badge: 'badge-amber-dash' },
  UNIDAD_ASIGNADA: { label: 'Unidad asignada', badge: 'badge-blue-dash' },
  RESUELTA: { label: 'Resuelta', badge: 'badge-green-dash' },
  CANCELADA: { label: 'Cancelada', badge: 'badge-dash' },
};

const STATS_GENERALES = {
  alertas: 27, policias: 7, unidades: 6, asignaciones: 21, alarmas: 12, atenciones: 19,
};

const NOTIFICACIONES_ENVIADAS = 34;

const ALERTAS = [
  { id: 214, tipo: 'Riña', barrio: 'Centro', estado: 'RESUELTA', fecha: '11/09/2026 08:40', desc: 'Riña reportada en la vía pública, unidad disolvió el conflicto sin heridos.', unidad: 'Patrulla 101', policia: 'Sofía Gómez' },
  { id: 213, tipo: 'Robo', barrio: 'La Nevada', estado: 'EN_ATENCION', fecha: '11/09/2026 07:55', desc: 'Robo a mano armada en local comercial, unidad en el sitio recolectando información.', unidad: 'CAI La Nevada', policia: 'Carlos Pérez' },
  { id: 212, tipo: 'Sospechoso', barrio: 'Cañaguate', estado: 'PENDIENTE', fecha: '11/09/2026 07:20', desc: 'Alerta comunitaria por sospechoso merodeando cerca de un colegio.', unidad: '—', policia: '—' },
  { id: 211, tipo: 'Accidente', barrio: 'Los Almendros', estado: 'RESUELTA', fecha: '10/09/2026 22:10', desc: 'Accidente de tránsito leve entre motocicleta y vehículo particular.', unidad: 'Patrulla 205', policia: 'Jorge Rangel' },
  { id: 210, tipo: 'Alarma', barrio: 'Sicarare', estado: 'CANCELADA', fecha: '10/09/2026 19:45', desc: 'Alarma comunitaria activada por error de manipulación del vecino.', unidad: 'CAI Sicarare', policia: 'Valentina Cotes' },
  { id: 209, tipo: 'Vandalismo', barrio: 'La Popa', estado: 'RESUELTA', fecha: '10/09/2026 18:05', desc: 'Grafitis en fachada de local comercial reportados por el propietario.', unidad: 'Moto 12', policia: 'Miguel Torres' },
  { id: 208, tipo: 'Incendio', barrio: 'Centro', estado: 'EN_ATENCION', fecha: '10/09/2026 16:30', desc: 'Incendio menor en zona verde, unidad apoya a bomberos con el perímetro.', unidad: 'Patrulla 101', policia: 'Sofía Gómez' },
  { id: 207, tipo: 'Robo', barrio: 'La Nevada', estado: 'UNIDAD_ASIGNADA', fecha: '09/09/2026 23:15', desc: 'Hurto a transeúnte reportado por testigo, unidad despachada.', unidad: 'CAI La Nevada', policia: 'Daniela Suárez' },
  { id: 206, tipo: 'Accidente', barrio: 'Cañaguate', estado: 'RESUELTA', fecha: '09/09/2026 20:05', desc: 'Choque leve entre dos vehículos, sin heridos.', unidad: 'Moto 07', policia: 'Laura Martínez' },
  { id: 205, tipo: 'Sospechoso', barrio: 'Los Almendros', estado: 'RECIBIDA', fecha: '09/09/2026 12:40', desc: 'Reporte de persona sospechosa cerca de una vivienda.', unidad: '—', policia: '—' },
  { id: 204, tipo: 'Riña', barrio: 'La Popa', estado: 'RESUELTA', fecha: '08/09/2026 21:30', desc: 'Disturbio en establecimiento nocturno, unidad controló la situación.', unidad: 'Moto 12', policia: 'Miguel Torres' },
  { id: 203, tipo: 'Robo', barrio: 'Sicarare', estado: 'RESUELTA', fecha: '08/09/2026 15:10', desc: 'Hurto de bicicleta reportado por el propietario.', unidad: 'CAI Sicarare', policia: 'Valentina Cotes' },
];

let alertasFiltradas = [...ALERTAS];
let paginaActual = 1;
const PAGE_SIZE = 5;

// ---------- Poblar selects de filtro ----------
function poblarFiltros() {
  const tipos = [...new Set(ALERTAS.map(a => a.tipo))].sort();
  const barrios = [...new Set(ALERTAS.map(a => a.barrio))].sort();

  document.getElementById('filtroTipo').insertAdjacentHTML('beforeend',
    tipos.map(t => `<option value="${t}">${t}</option>`).join(''));
  document.getElementById('filtroBarrioReporte').insertAdjacentHTML('beforeend',
    barrios.map(b => `<option value="${b}">${b}</option>`).join(''));
  document.getElementById('filtroEstadoReporte').insertAdjacentHTML('beforeend',
    Object.entries(ESTADOS_ALERTA).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join(''));
}

// ---------- KPIs ----------
function renderKpisReportes() {
  const kpis = [
    { color: 'red', icon: 'bi-bell', num: STATS_GENERALES.alertas, label: 'Alertas' },
    { color: 'blue', icon: 'bi-shield', num: STATS_GENERALES.policias, label: 'Policías' },
    { color: 'green', icon: 'bi-car-front', num: STATS_GENERALES.unidades, label: 'Unidades' },
    { color: 'amber', icon: 'bi-clipboard-check', num: STATS_GENERALES.asignaciones, label: 'Asignaciones' },
    { color: 'blue', icon: 'bi-megaphone', num: STATS_GENERALES.alarmas, label: 'Alarmas' },
    { color: 'green', icon: 'bi-check2-square', num: STATS_GENERALES.atenciones, label: 'Atenciones' },
  ];
  document.getElementById('kpisReportes').innerHTML = kpis.map(k => `
    <div class="col-6 col-md-4 col-xl-2">
      <div class="kpi-dash kpi-${k.color}-dash">
        <i class="bi ${k.icon} kpi-icon-dash"></i>
        <p class="kpi-num-dash">${k.num}</p>
        <p class="kpi-label-dash">${k.label}</p>
      </div>
    </div>`).join('');
}

// ---------- Filtros ----------
function hayFiltrosActivos() {
  return document.getElementById('filtroTipo').value
    || document.getElementById('filtroEstadoReporte').value
    || document.getElementById('filtroBarrioReporte').value
    || document.getElementById('filtroBuscarReporte').value.trim()
    || document.getElementById('filtroDesde').value
    || document.getElementById('filtroHasta').value;
}

function actualizarBotonLimpiar() {
  document.getElementById('btnLimpiarFiltros').classList.toggle('d-none', !hayFiltrosActivos());
}

function aplicarFiltros() {
  const tipo = document.getElementById('filtroTipo').value;
  const estado = document.getElementById('filtroEstadoReporte').value;
  const barrio = document.getElementById('filtroBarrioReporte').value;
  const texto = document.getElementById('filtroBuscarReporte').value.trim().toLowerCase();
  const desde = document.getElementById('filtroDesde').value;
  const hasta = document.getElementById('filtroHasta').value;

  alertasFiltradas = ALERTAS.filter(a => {
    if (tipo && a.tipo !== tipo) return false;
    if (estado && a.estado !== estado) return false;
    if (barrio && a.barrio !== barrio) return false;
    if (texto && !a.desc.toLowerCase().includes(texto)) return false;
    if (desde || hasta) {
      const [fechaPart] = a.fecha.split(' ');
      const [d, m, y] = fechaPart.split('/');
      const fechaAlerta = `${y}-${m}-${d}`;
      if (desde && fechaAlerta < desde) return false;
      if (hasta && fechaAlerta > hasta) return false;
    }
    return true;
  });

  paginaActual = 1;
  actualizarBotonLimpiar();
  renderTabla();
}

function limpiarFiltros() {
  document.getElementById('filtroTipo').value = '';
  document.getElementById('filtroEstadoReporte').value = '';
  document.getElementById('filtroBarrioReporte').value = '';
  document.getElementById('filtroBuscarReporte').value = '';
  document.getElementById('filtroDesde').value = '';
  document.getElementById('filtroHasta').value = '';
  alertasFiltradas = [...ALERTAS];
  paginaActual = 1;
  actualizarBotonLimpiar();
  renderTabla();
}

// ---------- Tabla + paginación ----------
function renderTabla() {
  const tbody = document.getElementById('tablaReportes');
  const vacio = document.getElementById('reportesVacio');
  const total = alertasFiltradas.length;

  if (total === 0) {
    tbody.innerHTML = '';
    vacio.classList.remove('d-none');
    document.getElementById('reportesMostrando').textContent = 'Mostrando 0 de 0 alertas';
    document.getElementById('reportesPaginacion').innerHTML = '';
    return;
  }
  vacio.classList.add('d-none');

  const totalPaginas = Math.ceil(total / PAGE_SIZE);
  if (paginaActual > totalPaginas) paginaActual = totalPaginas;
  const desde = (paginaActual - 1) * PAGE_SIZE;
  const pagina = alertasFiltradas.slice(desde, desde + PAGE_SIZE);

  tbody.innerHTML = pagina.map(a => {
    const est = ESTADOS_ALERTA[a.estado] || { label: a.estado, badge: 'badge-dash' };
    return `
    <tr>
      <td>#${a.id}</td>
      <td style="width:110px;">${a.tipo}</td>
      <td style="width:110px;">${a.barrio}</td>
      <td style="width:130px;"><span class="badge-dash ${est.badge}">${est.label}</span></td>
      <td style="width:130px;" class="celda-sub-dash">${a.fecha}</td>
      <td class="celda-desc-dash">${a.desc}</td>
      <td style="width:110px;">${a.unidad}</td>
      <td style="width:130px;">${a.policia}</td>
    </tr>`;
  }).join('');

  document.getElementById('reportesMostrando').textContent =
    `Mostrando ${desde + 1}–${Math.min(desde + PAGE_SIZE, total)} de ${total} alertas`;

  const pagBtns = [];
  pagBtns.push(`<button class="pagina-btn-dash" data-pagina="${paginaActual - 1}" ${paginaActual === 1 ? 'disabled' : ''}><i class="bi bi-chevron-left"></i></button>`);
  for (let i = 1; i <= totalPaginas; i++) {
    pagBtns.push(`<button class="pagina-btn-dash ${i === paginaActual ? 'activo' : ''}" data-pagina="${i}">${i}</button>`);
  }
  pagBtns.push(`<button class="pagina-btn-dash" data-pagina="${paginaActual + 1}" ${paginaActual === totalPaginas ? 'disabled' : ''}><i class="bi bi-chevron-right"></i></button>`);
  document.getElementById('reportesPaginacion').innerHTML = pagBtns.join('');
}

document.getElementById('reportesPaginacion').addEventListener('click', (e) => {
  const btn = e.target.closest('.pagina-btn-dash');
  if (!btn) return;
  paginaActual = parseInt(btn.dataset.pagina, 10);
  renderTabla();
});

['filtroTipo', 'filtroEstadoReporte', 'filtroBarrioReporte', 'filtroDesde', 'filtroHasta'].forEach(id => {
  document.getElementById(id).addEventListener('change', aplicarFiltros);
});
document.getElementById('filtroBuscarReporte').addEventListener('input', aplicarFiltros);
document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);

// ---------- Exportar CSV ----------
document.getElementById('btnExportarCsv').addEventListener('click', () => {
  const encabezados = ['#', 'Tipo', 'Barrio', 'Estado', 'Fecha y hora', 'Descripción', 'Unidad', 'Atendida por'];
  const filas = alertasFiltradas.map(a => [
    a.id, a.tipo, a.barrio, (ESTADOS_ALERTA[a.estado] || {}).label || a.estado,
    a.fecha, `"${a.desc.replace(/"/g, '""')}"`, a.unidad, a.policia,
  ]);
  const csv = [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Reporte_Alertas_WolertApp.csv';
  a.click();
  URL.revokeObjectURL(url);
});

// ---------- Detalle adicional ----------
function renderDetalleExtra() {
  document.getElementById('valNotificaciones').textContent = NOTIFICACIONES_ENVIADAS;
  document.getElementById('valAsignaciones').textContent = STATS_GENERALES.asignaciones;
}

// ---------- Inicio ----------
poblarFiltros();
renderKpisReportes();
renderTabla();
renderDetalleExtra();