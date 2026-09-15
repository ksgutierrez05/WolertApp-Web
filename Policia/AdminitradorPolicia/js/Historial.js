renderSidebarPolicia('historial');


const LS_KEY_ATENCIONES = 'atencionesPoliciales';

const ESTADOS_ATENCION = {
  FINALIZADA: { label: 'Finalizada', badge: 'badge-green-dash', color: 'var(--color-green)', icon: 'bi-check-lg' },
  EN_PROCESO: { label: 'En proceso', badge: 'badge-amber-dash', color: 'var(--color-amber)', icon: 'bi-clock' },
  PENDIENTE: { label: 'Pendiente', badge: 'badge-red-dash', color: 'var(--color-danger)', icon: 'bi-exclamation-lg' },
  CANCELADA: { label: 'Cancelada', badge: 'badge-dash', color: 'var(--subtle)', icon: 'bi-x-lg' },
};

const ATENCIONES_DEFECTO = [
  { id: 1, unidad: 'Patrulla 101', estado: 'FINALIZADA', descripcion: 'Riña reportada en la vía pública, unidad disolvió el conflicto sin heridos.', fecha: '11/09/2026 08:40', alertaId: 214, policia: 'Sofía Gómez' },
  { id: 2, unidad: 'CAI La Nevada', estado: 'EN_PROCESO', descripcion: 'Robo a mano armada en local comercial, unidad en el sitio recolectando información.', fecha: '11/09/2026 07:55', alertaId: 213, policia: 'Carlos Pérez' },
  { id: 3, unidad: 'Moto 07', estado: 'PENDIENTE', descripcion: 'Alerta comunitaria por sospechoso merodeando, unidad asignada aún no reporta llegada.', fecha: '11/09/2026 07:20', alertaId: 212, policia: null },
  { id: 4, unidad: 'Patrulla 205', estado: 'FINALIZADA', descripcion: 'Accidente de tránsito leve entre motocicleta y vehículo particular.', fecha: '10/09/2026 22:10', alertaId: 211, policia: 'Jorge Rangel' },
  { id: 5, unidad: 'CAI Sicarare', estado: 'CANCELADA', descripcion: 'Alarma comunitaria activada por error de manipulación del vecino.', fecha: '10/09/2026 19:45', alertaId: 210, policia: 'Valentina Cotes' },
  { id: 6, unidad: 'Moto 12', estado: 'FINALIZADA', descripcion: 'Acompañamiento a comerciantes durante el cierre nocturno del sector.', fecha: '10/09/2026 18:05', alertaId: 209, policia: 'Miguel Torres' },
  { id: 7, unidad: 'Patrulla 101', estado: 'EN_PROCESO', descripcion: 'Incendio menor en zona verde, unidad apoya a bomberos con el perímetro.', fecha: '10/09/2026 16:30', alertaId: 208, policia: 'Sofía Gómez' },
];

function cargarAtenciones() {
  try {
    const guardado = localStorage.getItem(LS_KEY_ATENCIONES);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {
    console.warn('No se pudo leer el historial desde localStorage:', e);
  }
  return ATENCIONES_DEFECTO.map(a => ({ ...a }));
}

function guardarAtenciones() {
  try {
    localStorage.setItem(LS_KEY_ATENCIONES, JSON.stringify(ATENCIONES));
  } catch (e) {
    console.warn('No se pudo guardar el historial en localStorage:', e);
  }
}

const ATENCIONES = cargarAtenciones();

function iniciales(nombre) {
  const partes = (nombre || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  return partes.length === 1
    ? partes[0].slice(0, 1).toUpperCase()
    : (partes[0].slice(0, 1) + partes[1].slice(0, 1)).toUpperCase();
}

const COLORES_AVATAR = ['#1c781e', '#154d8c', '#a91824', '#c9821c', '#5b3fa0', '#0a8f72'];
function colorAvatar(texto) {
  let hash = 0;
  for (let i = 0; i < (texto || '').length; i++) hash = texto.charCodeAt(i) + ((hash << 5) - hash);
  return COLORES_AVATAR[Math.abs(hash) % COLORES_AVATAR.length];
}

// ---------- KPIs ----------
function renderKpisHistorial() {
  const finalizadas = ATENCIONES.filter(a => a.estado === 'FINALIZADA').length;
  const enProceso = ATENCIONES.filter(a => a.estado === 'EN_PROCESO').length;
  const pendientes = ATENCIONES.filter(a => a.estado === 'PENDIENTE').length;
  const canceladas = ATENCIONES.filter(a => a.estado === 'CANCELADA').length;

  const kpis = [
    { color: 'green', icon: 'bi-check-lg', num: finalizadas, label: 'Finalizadas' },
    { color: 'amber', icon: 'bi-clock', num: enProceso, label: 'En proceso' },
    { color: 'red', icon: 'bi-exclamation-lg', num: pendientes, label: 'Pendientes' },
    { color: 'blue', icon: 'bi-x-lg', num: canceladas, label: 'Canceladas' },
  ];

  document.getElementById('kpisHistorial').innerHTML = kpis.map(k => `
    <div class="col-6 col-xl-3">
      <div class="kpi-dash kpi-${k.color}-dash">
        <i class="bi ${k.icon} kpi-icon-dash"></i>
        <p class="kpi-num-dash">${k.num}</p>
        <p class="kpi-label-dash">${k.label}</p>
      </div>
    </div>`).join('');
}

// ---------- Timeline ----------
let filtroActual = '';

function renderTimeline() {
  const lista = ATENCIONES.filter(a => !filtroActual || a.estado === filtroActual);
  const cont = document.getElementById('timelineHistorial');
  const vacio = document.getElementById('historialVacio');

  if (lista.length === 0) {
    cont.innerHTML = '';
    vacio.classList.remove('d-none');
    return;
  }
  vacio.classList.add('d-none');

  cont.innerHTML = lista.map((a, i) => {
    const est = ESTADOS_ATENCION[a.estado];
    const esUltimo = i === lista.length - 1;
    return `
    <div class="timeline-item-dash">
      <div class="timeline-line-col-dash">
        <div class="timeline-node-dash" style="border-color:${est.color};color:${est.color};background:#fff;">
          <i class="bi ${est.icon}"></i>
        </div>
        ${esUltimo ? '' : '<div class="timeline-vline-dash"></div>'}
      </div>
      <div class="timeline-content-dash">
        <div class="timeline-card-dash">
          <div class="timeline-top-dash">
            <div class="avatar-sm-dash" style="width:30px;height:30px;min-width:30px;font-size:11px;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;background:${colorAvatar(a.unidad)};">${iniciales(a.unidad)}</div>
            <span class="celda-titulo-dash flex-grow-1">${a.unidad}</span>
            <span class="badge-dash ${est.badge}">${est.label}</span>
          </div>
          <p class="timeline-desc-dash mb-0">${a.descripcion}</p>
          <div class="timeline-meta-dash mt-2">
            <span><i class="bi bi-calendar3 me-1"></i>${a.fecha}</span>
            <span class="sep">·</span>
            <span class="alerta">Alerta #${a.alertaId}</span>
            ${a.policia ? `<span class="sep">·</span><span class="policia">Atendido por: ${a.policia}</span>` : ''}
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

document.getElementById('chipsEstado').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip-filtro-dash');
  if (!btn) return;
  document.querySelectorAll('#chipsEstado .chip-filtro-dash').forEach(c => c.classList.remove('activo'));
  btn.classList.add('activo');
  filtroActual = btn.dataset.estado;
  renderTimeline();
});

// ---------- Inicio ----------
guardarAtenciones();
renderKpisHistorial();
renderTimeline();