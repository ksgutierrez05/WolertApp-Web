renderSidebarPolicia('centrooperaciones');


const LS_KEY_ALERTAS = 'alertasCentroOperaciones';
const LS_KEY_KPIS = 'kpisCentroOperaciones';

const ALERTS_DEFECTO = [
  { id: 1, title: "HOMICIDIO — CASIMIRO RAUL MAESTRE", sub: "Centro", status: "pendiente", time: "Hace 12 min" },
  { id: 2, title: "ROBO — CENTRO", sub: "Centro", status: "atencion", time: "Hace 28 min" },
  { id: 3, title: "ROBO — CENTRO", sub: "Centro", status: "asignada", time: "Hace 42 min" },
  { id: 4, title: "ROBO — CENTRO", sub: "Centro", status: "recibida", time: "Hace 1 h" },
  { id: 5, title: "ROBO — CENTRO", sub: "Centro", status: "resuelta", time: "Hace 1 h 20 min" },
];

// KPIs de supervisión de la estación (primera fila + sección "Estado operativo").
const KPIS_DEFECTO = {
  alertasActivas: 6,
  alertasCriticas: 2,
  patrullerosDisponibles: 4,
  enAtencion: 1,
  pendientes: 1,
  resueltasHoy: 3,
  patrullerosServicio: 7,
  totalAlertasHoy: 9,
};

function cargarAlertas() {
  try {
    const guardado = localStorage.getItem(LS_KEY_ALERTAS);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {
    console.warn('No se pudo leer las alertas del Centro de Operaciones desde localStorage:', e);
  }
  return ALERTS_DEFECTO.map(a => ({ ...a }));
}

function guardarAlertas() {
  try {
    localStorage.setItem(LS_KEY_ALERTAS, JSON.stringify(alerts));
  } catch (e) {
    console.warn('No se pudo guardar las alertas del Centro de Operaciones en localStorage:', e);
  }
}

function cargarKpis() {
  try {
    const guardado = localStorage.getItem(LS_KEY_KPIS);
    if (guardado) return { ...KPIS_DEFECTO, ...JSON.parse(guardado) };
  } catch (e) {
    console.warn('No se pudo leer los KPIs del Centro de Operaciones desde localStorage:', e);
  }
  return { ...KPIS_DEFECTO };
}

function guardarKpis() {
  try {
    localStorage.setItem(LS_KEY_KPIS, JSON.stringify(kpis));
  } catch (e) {
    console.warn('No se pudo guardar los KPIs del Centro de Operaciones en localStorage:', e);
  }
}

const alerts = cargarAlertas();
const kpis = cargarKpis();

guardarAlertas();
guardarKpis();

const badgeClass = {
  pendiente: "badge-red-dash",
  atencion: "badge-amber-dash",
  asignada: "badge-blue-dash",
  recibida: "badge-blue-dash",
  resuelta: "badge-green-dash",
  cancelada: "badge-dash",
};

const badgeLabel = {
  pendiente: "Pendiente",
  atencion: "En atención",
  asignada: "Unidad asignada",
  recibida: "Recibida",
  resuelta: "Resuelta",
  cancelada: "Cancelada",
};

// ---------- Alertas recientes ----------
function renderAlertas() {
  document.getElementById('alerts').innerHTML = alerts.map(a => `
    <div class="alert-row-dash">
      <span class="ic-dash"><i class="bi bi-bell"></i></span>
      <div class="flex-grow-1 min-w-0">
        <p class="info-title-dash mb-0">${a.title}</p>
        <p class="info-sub-dash mb-0">${a.sub}</p>
      </div>
      <span class="badge-dash ${badgeClass[a.status]}">${badgeLabel[a.status]}</span>
      <span class="alert-time-dash">${a.time}</span>
    </div>`).join('');
}

// ---------- KPIs ----------
function pintarKpi(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor;
}

function renderKpis() {
  pintarKpi('kpiAlertasActivas', kpis.alertasActivas);
  pintarKpi('kpiAlertasCriticas', kpis.alertasCriticas);
  pintarKpi('kpiPatrullerosDisponibles', kpis.patrullerosDisponibles);
  pintarKpi('kpiEnAtencion', kpis.enAtencion);
  pintarKpi('kpiPendientes', kpis.pendientes);
  pintarKpi('kpiResueltasHoy', kpis.resueltasHoy);

  // Sección "Estado operativo"
  pintarKpi('kpiPatrullerosServicio', kpis.patrullerosServicio);
  pintarKpi('kpiTotalAlertasHoy', kpis.totalAlertasHoy);

  const heroTexto = document.getElementById('heroTextoOperativo');
  if (heroTexto) {
    heroTexto.textContent = `${kpis.alertasActivas} alertas activas y el sistema operativo con monitoreo en tiempo real.`;
  }
}

// ---------- Inicio ----------
renderAlertas();
renderKpis();