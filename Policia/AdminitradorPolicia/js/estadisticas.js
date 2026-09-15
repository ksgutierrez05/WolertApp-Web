renderSidebarPolicia('estadisticas');

const LS_KEY_ALERTAS_ESTADO = 'estadisticasAlertasPorEstado';
const LS_KEY_POLICIAS_ESTADO = 'estadisticasPoliciasPorEstado';
const LS_KEY_ALARMAS_UNIDADES = 'estadisticasAlarmasUnidades';

const ALERTAS_POR_ESTADO_DEFECTO = {
  PENDIENTE: 3,
  RECIBIDA: 2,
  'EN ATENCIÓN': 4,
  'UNIDAD ASIGNADA': 2,
  RESUELTA: 15,
  CANCELADA: 1,
};

const POLICIAS_POR_ESTADO_DEFECTO = {
  DISPONIBLE: 3,
  'EN SERVICIO': 2,
  OCUPADO: 1,
  'FUERA DE SERVICIO': 1,
};

const ALARMAS_UNIDADES_DEFECTO = [
  { nombre: 'Alarmas activas', valor: 4, total: 12, color: 'var(--color-green)' },
  { nombre: 'Alarmas en mantenimiento', valor: 2, total: 12, color: 'var(--color-amber)' },
  { nombre: 'Alarmas inactivas', valor: 6, total: 12, color: 'var(--subtle)' },
  { nombre: 'Unidades operativas', valor: 3, total: 6, color: 'var(--color-green)' },
  { nombre: 'Unidades activas', valor: 2, total: 6, color: 'var(--color-amber)' },
  { nombre: 'Unidades inactivas', valor: 1, total: 6, color: 'var(--subtle)' },
];

function cargarDesdeLocalStorage(clave, porDefecto) {
  try {
    const guardado = localStorage.getItem(clave);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {
    console.warn(`No se pudo leer "${clave}" desde localStorage:`, e);
  }
  return JSON.parse(JSON.stringify(porDefecto)); // copia profunda del valor por defecto
}

function guardarEnLocalStorage(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (e) {
    console.warn(`No se pudo guardar "${clave}" en localStorage:`, e);
  }
}

const ALERTAS_POR_ESTADO = cargarDesdeLocalStorage(LS_KEY_ALERTAS_ESTADO, ALERTAS_POR_ESTADO_DEFECTO);
const POLICIAS_POR_ESTADO = cargarDesdeLocalStorage(LS_KEY_POLICIAS_ESTADO, POLICIAS_POR_ESTADO_DEFECTO);
const ALARMAS_UNIDADES = cargarDesdeLocalStorage(LS_KEY_ALARMAS_UNIDADES, ALARMAS_UNIDADES_DEFECTO);

// Deja guardado lo que se terminó usando (útil la primera vez que se
// visita la página, para que quede fijado en localStorage).
guardarEnLocalStorage(LS_KEY_ALERTAS_ESTADO, ALERTAS_POR_ESTADO);
guardarEnLocalStorage(LS_KEY_POLICIAS_ESTADO, POLICIAS_POR_ESTADO);
guardarEnLocalStorage(LS_KEY_ALARMAS_UNIDADES, ALARMAS_UNIDADES);

// ---------- Colores semánticos por estado ----------
// Cada estado tiene siempre el mismo color, sin importar el orden
// en el que llegue el objeto desde el backend.
const COLOR_ESTADO = {
  // Alertas
  PENDIENTE: '#c9821c',
  RECIBIDA: '#1f5fa8',
  'EN ATENCIÓN': '#5b3fa0',
  'UNIDAD ASIGNADA': '#0a8f72',
  RESUELTA: '#1f9d5b',
  CANCELADA: '#98a2b3',
  // Policías
  DISPONIBLE: '#1f9d5b',
  'EN SERVICIO': '#1f5fa8',
  OCUPADO: '#c9821c',
  'FUERA DE SERVICIO': '#98a2b3',
};

const COLOR_DEFAULT = '#98a2b3'; // fallback para estados nuevos no mapeados

// ---------- KPIs ----------
function renderKpisEstadisticas() {
  const totalAlertas = Object.values(ALERTAS_POR_ESTADO).reduce((a, b) => a + b, 0);
  const alertasActivas = ALERTAS_POR_ESTADO.PENDIENTE + ALERTAS_POR_ESTADO.RECIBIDA
    + ALERTAS_POR_ESTADO['EN ATENCIÓN'] + ALERTAS_POR_ESTADO['UNIDAD ASIGNADA'];
  const unidadesOperativas = ALARMAS_UNIDADES.find(a => a.nombre === 'Unidades operativas').valor;
  const policiasActivos = POLICIAS_POR_ESTADO.DISPONIBLE + POLICIAS_POR_ESTADO['EN SERVICIO'];

  const kpis = [
    { color: 'blue', icon: 'bi-bell', num: totalAlertas, label: 'Alertas totales' },
    { color: 'red', icon: 'bi-exclamation-triangle', num: alertasActivas, label: 'Alertas activas' },
    { color: 'green', icon: 'bi-shield-check', num: unidadesOperativas, label: 'Unidades operativas' },
    { color: 'amber', icon: 'bi-person-check', num: policiasActivos, label: 'Policías activos' },
  ];

  document.getElementById('kpisEstadisticas').innerHTML = kpis.map(k => `
    <div class="col-6 col-xl-3">
      <div class="kpi-dash kpi-${k.color}-dash">
        <i class="bi ${k.icon} kpi-icon-dash"></i>
        <p class="kpi-num-dash">${k.num}</p>
        <p class="kpi-label-dash">${k.label}</p>
      </div>
    </div>`).join('');
}

// ---------- Barras horizontales ----------
function renderBarras(contenedorId, datos) {
  const total = Object.values(datos).reduce((a, b) => a + b, 0) || 1;
  const max = Math.max(...Object.values(datos), 1);

  const entradas = Object.entries(datos).sort((a, b) => b[1] - a[1]);

  const html = entradas.map(([nombre, valor]) => {
    const pctBarra = Math.max(4, Math.round((valor / max) * 100)); // ancho visual
    const pctTotal = Math.round((valor / total) * 100);            // dato real
    const color = COLOR_ESTADO[nombre] || COLOR_DEFAULT;
    return `
    <div class="barra-fila-dash">
      <span class="barra-etiqueta-dash">${nombre}</span>
      <div class="barra-track-dash">
        <div class="barra-fill-dash"
             role="progressbar"
             aria-valuenow="${valor}"
             aria-valuemin="0"
             aria-valuemax="${max}"
             title="${nombre}: ${valor} (${pctTotal}% del total)"
             style="background:${color};"
             data-width="${pctBarra}"></div>
      </div>
      <span class="barra-valor-dash">${valor}<span class="barra-pct-dash">(${pctTotal}%)</span></span>
    </div>`;
  }).join('');

  document.getElementById(contenedorId).innerHTML = html;

  // Anima el ancho después de insertar en el DOM (si no, la transición no se ve)
  requestAnimationFrame(() => {
    document.querySelectorAll(`#${contenedorId} .barra-fill-dash`).forEach(el => {
      el.style.width = el.dataset.width + '%';
    });
  });
}

// ---------- Filas de estado ----------
function renderFilasEstado() {
  const html = ALARMAS_UNIDADES.map(a => {
    const pct = Math.round((a.valor / a.total) * 100);
    return `
    <div class="estado-fila-dash">
      <span class="estado-dot-dash" style="background:${a.color};"></span>
      <span class="estado-nombre-dash">${a.nombre}</span>
      <span class="estado-valor-dash">${a.valor}<span class="estado-pct-dash">(${pct}%)</span></span>
    </div>`;
  }).join('');
  document.getElementById('filasEstado').innerHTML = html;
}

// ---------- Inicio ----------
renderKpisEstadisticas();
renderBarras('barrasAlertas', ALERTAS_POR_ESTADO);
renderBarras('barrasPolicias', POLICIAS_POR_ESTADO);
renderFilasEstado();