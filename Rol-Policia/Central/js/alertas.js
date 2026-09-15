
// ---------- ICONOS POR TIPO DE ALERTA (Bootstrap Icons, ya cargado por el sidebar) ----------
const ICONO_TIPO = {
  'Robo': 'bi-shop',
  'Accidente': 'bi-car-front',
  'Persona sospechosa': 'bi-person-bounding-box',
  'Violencia': 'bi-people-fill',
  'Emergencia': 'bi-heart-pulse',
  'Alteración del orden público': 'bi-megaphone',
  'Otro': 'bi-question-circle',
};

const BADGE_PRIORIDAD = {
  'Crítica': 'badge-red-dash',
  'Alta': 'badge-red-dash',
  'Media': 'badge-amber-dash',
  'Baja': 'badge-blue-dash',
};

const BADGE_ESTADO = {
  'Nueva': 'badge-blue-dash',
  'Clasificada': 'badge-amber-dash',
  'Asignada': 'badge-blue-dash',
  'En atención': 'badge-amber-dash',
  'Resuelta': 'badge-green-dash',
};

// ---------- PATRULLEROS DISPONIBLES (mock, compartido por todas las alertas) ----------
const PATRULLEROS = [
  { id: 'P-001', unidad: 'CAI Norte', estado: 'Disponible', distancia: '1.2 km', eta: '4 min' },
  { id: 'P-002', unidad: 'CAI Centro', estado: 'Disponible', distancia: '2.4 km', eta: '7 min' },
  { id: 'P-004', unidad: 'CAI Norte', estado: 'Disponible', distancia: '3.1 km', eta: '9 min' },
  { id: 'P-003', unidad: 'CAI Sur', estado: 'En atención', distancia: '4.0 km', eta: '—' },
  { id: 'P-006', unidad: 'CAI Sur', estado: 'Fuera de servicio', distancia: '—', eta: '—' },
];

// ---------- PERSISTENCIA EN LOCALSTORAGE ----------
const STORAGE_KEY_ALERTAS = 'wolertapp_alertas_central';

function guardarAlertasEnStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_ALERTAS, JSON.stringify(ALERTAS));
  } catch (err) {
    console.error('No se pudo guardar las alertas en localStorage:', err);
  }
}

function cargarAlertasDesdeStorage() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY_ALERTAS);
    if (!guardado) return null;
    const datos = JSON.parse(guardado);
    if (Array.isArray(datos) && datos.length) return datos;
  } catch (err) {
    console.error('No se pudo leer las alertas desde localStorage:', err);
  }
  return null;
}

// ---------- ALERTAS ENTRANTES (semilla, solo se usa si no hay nada guardado) ----------
const ALERTAS_SEMILLA = [
  {
    id: 'WL-2026-00125',
    tipoReportado: 'Robo',
    fecha: '13 sep 2026',
    hora: '18:20',
    ubicacion: 'Carrera 15 #20-30',
    prioridadInicial: 'Alta',
    descripcion: 'Ciudadano reporta robo en establecimiento comercial. Indica que el sospechoso huyó a pie hacia la carrera 14.',
    evidencias: 2,
    contacto: 'Anónimo (llamada)',
    distancia: '1.2 km al patrullero más cercano',
    estado: 'Nueva',
    clasificacion: null,
    notas: [],
    patrulleroAsignado: null,
    sinRespuesta: false,
  },
  {
    id: 'WL-2026-00126',
    tipoReportado: 'Violencia',
    fecha: '13 sep 2026',
    hora: '18:26',
    ubicacion: 'Calle 9 #4-21',
    prioridadInicial: 'Alta',
    descripcion: 'Vecinos reportan altercado con posible agresión física en zona residencial. Piden atención urgente.',
    evidencias: 0,
    contacto: 'María R. — 3xx xxx xxxx',
    distancia: '0.8 km al patrullero más cercano',
    estado: 'Clasificada',
    clasificacion: { tipo: 'Violencia', prioridad: 'Alta', nivel: 'Atención inmediata', zona: 'Comuna 2 — La Loma' },
    notas: [{ texto: 'Se recomienda apoyo de segunda unidad por posible riña múltiple.', hora: '18:27' }],
    patrulleroAsignado: null,
    sinRespuesta: false,
  },
  {
    id: 'WL-2026-00120',
    tipoReportado: 'Persona sospechosa',
    fecha: '13 sep 2026',
    hora: '18:02',
    ubicacion: 'Av. Simón Bolívar #12-10',
    prioridadInicial: 'Media',
    descripcion: 'Vecinos reportan persona merodeando frente a conjunto residencial desde hace varios minutos.',
    evidencias: 1,
    contacto: 'Anónimo (app)',
    distancia: '2.1 km al patrullero más cercano',
    estado: 'Asignada',
    clasificacion: { tipo: 'Persona sospechosa', prioridad: 'Media', nivel: 'Atención prioritaria', zona: 'Comuna 1 — Centro' },
    notas: [],
    patrulleroAsignado: 'P-003',
    sinRespuesta: true,
  },
  {
    id: 'WL-2026-00118',
    tipoReportado: 'Alteración del orden público',
    fecha: '13 sep 2026',
    hora: '17:40',
    ubicacion: 'Calle 22 #6-30',
    prioridadInicial: 'Baja',
    descripcion: 'Ciudadano reporta música a alto volumen en establecimiento comercial, ya pasadas las 10 p.m.',
    evidencias: 0,
    contacto: 'Anónimo (llamada)',
    distancia: '3.4 km al patrullero más cercano',
    estado: 'En atención',
    clasificacion: { tipo: 'Alteración del orden público', prioridad: 'Baja', nivel: 'Atención normal', zona: 'Comuna 4 — San José' },
    notas: [],
    patrulleroAsignado: 'P-002',
    sinRespuesta: false,
  },
  {
    id: 'WL-2026-00127',
    tipoReportado: 'Accidente',
    fecha: '13 sep 2026',
    hora: '18:31',
    ubicacion: 'Diagonal 8 con Cra 19',
    prioridadInicial: 'Crítica',
    descripcion: 'Choque entre motocicleta y vehículo particular. Ciudadano reporta persona lesionada en la vía.',
    evidencias: 3,
    contacto: 'Testigo — 3xx xxx xxxx',
    distancia: '0.5 km al patrullero más cercano',
    estado: 'Nueva',
    clasificacion: null,
    notas: [],
    patrulleroAsignado: null,
    sinRespuesta: false,
  },
];

let ALERTAS = cargarAlertasDesdeStorage();
if (!ALERTAS) {
  ALERTAS = ALERTAS_SEMILLA.map(a => ({ ...a, notas: [...a.notas] }));
  guardarAlertasEnStorage();
}

let filtroActual = 'todas';
let alertaSeleccionadaId = null;
let patrulleroSeleccionadoTmp = null;

document.addEventListener('DOMContentLoaded', () => {
  renderSidebarCentral('alertas');
  renderKpis();
  renderLista();
  wireFiltros();
  wireBuscador();
  wireModal();
});

// ---------- KPIs ----------
function renderKpis() {
  const activas = ALERTAS.filter(a => a.estado !== 'Resuelta');
  const criticas = activas.filter(a => (a.clasificacion?.prioridad || a.prioridadInicial) === 'Crítica' || (a.clasificacion?.prioridad || a.prioridadInicial) === 'Alta');
  const sinClasificar = activas.filter(a => a.estado === 'Nueva');
  const sinRespuesta = activas.filter(a => a.sinRespuesta);

  document.getElementById('kpiTotal').textContent = activas.length;
  document.getElementById('kpiCriticas').textContent = criticas.length;
  document.getElementById('kpiSinClasificar').textContent = sinClasificar.length;
  document.getElementById('kpiSinRespuesta').textContent = sinRespuesta.length;
  document.getElementById('badgeNuevas').textContent = `${sinClasificar.length} alertas nuevas`;
}

// ---------- LISTA ----------
function renderLista() {
  const cont = document.getElementById('listaAlertas');
  const empty = document.getElementById('alEmpty');
  const texto = (document.getElementById('buscarAlerta').value || '').toLowerCase().trim();

  const visibles = ALERTAS.filter(a => cumpleFiltro(a) && cumpleBusqueda(a, texto));

  cont.innerHTML = visibles.map(a => tarjetaAlerta(a)).join('');
  empty.classList.toggle('d-none', visibles.length > 0);

  cont.querySelectorAll('[data-gestionar]').forEach(btn => {
    btn.addEventListener('click', () => abrirGestion(btn.dataset.gestionar));
  });
}

function cumpleFiltro(a) {
  if (filtroActual === 'todas') return true;
  if (filtroActual === '__criticas') {
    const p = a.clasificacion?.prioridad || a.prioridadInicial;
    return p === 'Crítica' || p === 'Alta';
  }
  if (filtroActual === '__sinrespuesta') return a.sinRespuesta;
  return a.estado === filtroActual;
}

function cumpleBusqueda(a, texto) {
  if (!texto) return true;
  return [a.id, a.tipoReportado, a.ubicacion].join(' ').toLowerCase().includes(texto);
}

function tarjetaAlerta(a) {
  const prioridad = a.clasificacion?.prioridad || a.prioridadInicial;
  const badgePrioridad = BADGE_PRIORIDAD[prioridad] || 'badge-blue-dash';
  const badgeEstado = BADGE_ESTADO[a.estado] || 'badge-blue-dash';
  const icono = ICONO_TIPO[a.tipoReportado] || 'bi-question-circle';
  const esCritica = prioridad === 'Crítica' || prioridad === 'Alta';

  return `
    <div class="col-12 al-card-col">
      <article class="card-panel-dash al-card ${esCritica ? 'is-critica' : ''} ${a.sinRespuesta ? 'is-sinrespuesta' : ''}">
        <div class="al-card-top">
          <div class="d-flex align-items-center gap-2">
            <span class="al-type-icon"><i class="bi ${icono}"></i></span>
            <div>
              <p class="al-title mb-0">${a.tipoReportado} <span class="al-meta-inline">#${a.id}</span></p>
              <span class="al-meta-inline"><i class="bi bi-clock"></i> ${a.fecha}, ${a.hora}</span>
            </div>
          </div>
          <span class="badge-dash ${badgePrioridad}">Prioridad ${prioridad.toLowerCase()}</span>
        </div>

        <div class="al-meta">
          <span><i class="bi bi-geo-alt"></i> ${a.ubicacion}</span>
          <span><i class="bi bi-rulers"></i> ${a.distancia}</span>
          <span class="badge-dash ${badgeEstado}">${a.estado}</span>
          ${a.sinRespuesta ? '<span class="badge-dash badge-red-dash"><i class="bi bi-wifi-off"></i> Sin respuesta</span>' : ''}
        </div>

        <div class="al-desc-box">
          <i class="bi bi-quote"></i>
          <p class="mb-0">"${a.descripcion}"</p>
        </div>

        <div class="al-evidence">
          <i class="bi bi-paperclip"></i> ${a.evidencias > 0 ? `${a.evidencias} evidencia(s) adjunta(s)` : 'Sin evidencias adjuntas'}
        </div>

        <div class="al-card-actions">
          <button class="btn btn-cv-azul btn-sm" data-gestionar="${a.id}">Gestionar alerta</button>
        </div>
      </article>
    </div>
  `;
}

// ---------- FILTROS Y BUSCADOR ----------
function wireFiltros() {
  document.querySelectorAll('.al-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.al-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filtroActual = chip.dataset.filter;
      renderLista();
    });
  });
}

function wireBuscador() {
  document.getElementById('buscarAlerta').addEventListener('input', renderLista);
}

// ---------- MODAL DE GESTIÓN ----------
function abrirGestion(id) {
  alertaSeleccionadaId = id;
  patrulleroSeleccionadoTmp = null;
  const a = ALERTAS.find(x => x.id === id);
  if (!a) return;

  document.getElementById('mCaso').textContent = `#${a.id}`;
  document.getElementById('mTitulo').textContent = a.tipoReportado;

  const badgeEstado = document.getElementById('mEstadoBadge');
  badgeEstado.className = `badge-dash ${BADGE_ESTADO[a.estado] || 'badge-blue-dash'}`;
  badgeEstado.textContent = a.estado;

  document.getElementById('mAvisoSinRespuesta').classList.toggle('d-none', !a.sinRespuesta);

  // Reporte del ciudadano (solo lectura)
  document.getElementById('rTipo').textContent = a.tipoReportado;
  document.getElementById('rFechaHora').textContent = `${a.fecha}, ${a.hora}`;
  document.getElementById('rUbicacion').textContent = a.ubicacion;
  document.getElementById('rPrioridadInicial').textContent = a.prioridadInicial;
  document.getElementById('rContacto').textContent = a.contacto;
  document.getElementById('rDistancia').textContent = a.distancia;
  document.getElementById('rDescripcion').textContent = `"${a.descripcion}"`;
  document.getElementById('rEvidencias').innerHTML = `<i class="bi bi-paperclip"></i> ${a.evidencias > 0 ? `${a.evidencias} evidencia(s) adjunta(s)` : 'Sin evidencias adjuntas'}`;

  // Clasificación de Central
  document.getElementById('cTipo').value = a.clasificacion?.tipo || a.tipoReportado;
  document.getElementById('cPrioridad').value = a.clasificacion?.prioridad || a.prioridadInicial;
  document.getElementById('cNivel').value = a.clasificacion?.nivel || 'Atención normal';
  document.getElementById('cZona').value = a.clasificacion?.zona || '';
  document.getElementById('cGuardadoHint').classList.toggle('d-none', !a.clasificacion);

  renderNotas(a);
  renderDespacho(a);

  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalGestionAlerta'));
  modal.show();
}

function renderNotas(a) {
  const cont = document.getElementById('cNotasLista');
  cont.innerHTML = a.notas.map(n => `
    <div class="al-nota-item">
      ${n.texto}
      <span class="al-nota-time"><i class="bi bi-clock-history"></i> ${n.hora}</span>
    </div>
  `).join('');
}

function renderDespacho(a) {
  const box = document.getElementById('cAsignadoBox');
  const hint = document.getElementById('cDespachoHint');
  const btnAsignar = document.getElementById('btnAsignar');

  if (a.patrulleroAsignado) {
    const p = PATRULLEROS.find(x => x.id === a.patrulleroAsignado);
    box.classList.remove('d-none');
    document.getElementById('cAsignadoNombre').textContent = `${p.id} · ${p.unidad}`;
    document.getElementById('cAsignadoInfo').textContent = a.sinRespuesta
      ? 'Asignado — sin confirmar atención'
      : `Asignado · ${p.distancia} · ETA ${p.eta}`;
    hint.textContent = 'Ya hay un patrullero asignado. Selecciona otro para reasignar.';
    btnAsignar.textContent = 'Reasignar';
  } else {
    box.classList.add('d-none');
    hint.textContent = 'Selecciona el patrullero más adecuado para atender el caso.';
    btnAsignar.textContent = 'Asignar patrullero';
  }

  btnAsignar.disabled = !a.clasificacion;

  document.getElementById('cPatrulleros').innerHTML = PATRULLEROS.map(p => {
    const disponible = p.estado === 'Disponible';
    const esActual = a.patrulleroAsignado === p.id;
    return `
      <div class="al-patrullero-item ${disponible ? '' : 'disabled'} ${esActual ? 'selected' : ''}" data-patrullero="${p.id}">
        <i class="bi bi-car-front-fill" style="font-size:18px;color:var(--color-primary);"></i>
        <div class="al-patrullero-info">
          <p class="al-patrullero-nombre mb-0">${p.id} <span class="al-patrullero-meta">· ${p.unidad}</span></p>
          <p class="al-patrullero-meta mb-0">${p.estado} ${disponible ? `· ${p.distancia} · ETA ${p.eta}` : ''}</p>
        </div>
        ${esActual ? '<span class="badge-dash badge-blue-dash">Asignado</span>' : ''}
      </div>
    `;
  }).join('');

  document.querySelectorAll('.al-patrullero-item').forEach(item => {
    if (item.classList.contains('disabled')) return;
    item.addEventListener('click', () => {
      document.querySelectorAll('.al-patrullero-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      patrulleroSeleccionadoTmp = item.dataset.patrullero;
    });
  });
}

function wireModal() {
  document.getElementById('btnGuardarClasificacion').addEventListener('click', guardarClasificacion);
  document.getElementById('btnAgregarNota').addEventListener('click', agregarNota);
  document.getElementById('btnAsignar').addEventListener('click', asignarPatrullero);
  document.getElementById('btnReasignarAviso').addEventListener('click', () => {
    document.querySelector('[data-patrullero]')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('btnContactar').addEventListener('click', () => {
    alert('Intentando contactar al patrullero asignado…');
  });
}

function alertaActual() {
  return ALERTAS.find(x => x.id === alertaSeleccionadaId);
}

function guardarClasificacion() {
  const a = alertaActual();
  if (!a) return;

  a.clasificacion = {
    tipo: document.getElementById('cTipo').value,
    prioridad: document.getElementById('cPrioridad').value,
    nivel: document.getElementById('cNivel').value,
    zona: document.getElementById('cZona').value || 'Sin especificar',
  };

  if (a.estado === 'Nueva') a.estado = 'Clasificada';

  guardarAlertasEnStorage();

  document.getElementById('cGuardadoHint').classList.remove('d-none');
  document.getElementById('btnAsignar').disabled = false;

  const badgeEstado = document.getElementById('mEstadoBadge');
  badgeEstado.className = `badge-dash ${BADGE_ESTADO[a.estado] || 'badge-blue-dash'}`;
  badgeEstado.textContent = a.estado;

  renderKpis();
  renderLista();
}

function agregarNota() {
  const input = document.getElementById('cNuevaNota');
  const texto = input.value.trim();
  if (!texto) return;

  const a = alertaActual();
  if (!a) return;

  const ahora = new Date();
  const hora = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  a.notas.push({ texto, hora });

  guardarAlertasEnStorage();

  input.value = '';
  renderNotas(a);
}

function asignarPatrullero() {
  const a = alertaActual();
  if (!a || !a.clasificacion) return;

  if (!patrulleroSeleccionadoTmp) {
    alert('Selecciona un patrullero de la lista antes de asignar.');
    return;
  }

  const reasignando = !!a.patrulleroAsignado && a.patrulleroAsignado !== patrulleroSeleccionadoTmp;

  if (reasignando) {
    const confirmar = confirm('¿Confirmas que deseas reasignar esta alerta a otro patrullero?');
    if (!confirmar) return;
  }

  a.patrulleroAsignado = patrulleroSeleccionadoTmp;
  a.sinRespuesta = false;
  a.estado = 'Asignada';
  patrulleroSeleccionadoTmp = null;

  guardarAlertasEnStorage();

  const badgeEstado = document.getElementById('mEstadoBadge');
  badgeEstado.className = `badge-dash ${BADGE_ESTADO[a.estado] || 'badge-blue-dash'}`;
  badgeEstado.textContent = a.estado;
  document.getElementById('mAvisoSinRespuesta').classList.add('d-none');

  renderDespacho(a);
  renderKpis();
  renderLista();
}