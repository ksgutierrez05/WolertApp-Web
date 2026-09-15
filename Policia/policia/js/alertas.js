
const STORAGE_KEY_AL = 'wolert_mis_alertas';
const STORAGE_KEY_AL_FILTRO = 'wolert_alertas_filtro';
const STORAGE_KEY_AT = 'wolert_mis_atenciones';

/* ============================================================
   DATOS DE PRUEBA
   ============================================================ */
const ALERTAS_INICIALES = [
  {
    id: 'AL-1001',
    tipo: 'Robo en establecimiento',
    icono: 'bi-shop',
    prioridad: 'alta',
    tiempoTexto: 'Hoy, 14:32',
    horaReportada: '14:32',
    ubicacion: 'Carrera 15 # 8-42, Centro',
    distancia: '1.4 km',
    estadoBadge: 'nueva',
    cita: 'Ciudadano reporta robo en establecimiento comercial. Indica que el sospechoso huyó a pie hacia la carrera 14.',
    evidencias: ['Foto del sospechoso', 'Foto de la vitrina forzada'],
  },
  {
    id: 'AL-1002',
    tipo: 'Riña entre vecinos',
    icono: 'bi-people-fill',
    prioridad: 'alta',
    tiempoTexto: 'Hace 6 min',
    horaReportada: '14:52',
    ubicacion: 'Calle 9 # 4-21',
    distancia: '0.8 km',
    estadoBadge: 'nueva',
    cita: 'Vecinos reportan altercado con posible agresión física en zona residencial. Piden atención urgente.',
    evidencias: [],
  },
  {
    id: 'AL-1003',
    tipo: 'Persona sospechosa',
    icono: 'bi-person-bounding-box',
    prioridad: 'media',
    tiempoTexto: 'Hace 18 min',
    horaReportada: '14:40',
    ubicacion: 'Av. Simón Bolívar # 12-10',
    distancia: '2.1 km',
    estadoBadge: 'vista',
    cita: 'Vecinos reportan persona merodeando frente a conjunto residencial desde hace varios minutos.',
    evidencias: ['Foto de la persona'],
  },
  {
    id: 'AL-1004',
    tipo: 'Ruido excesivo',
    icono: 'bi-volume-up',
    prioridad: 'baja',
    tiempoTexto: 'Hace 40 min',
    horaReportada: '14:18',
    ubicacion: 'Calle 22 # 6-30',
    distancia: '3.4 km',
    estadoBadge: 'vista',
    cita: 'Ciudadano reporta música a alto volumen en establecimiento comercial, ya pasadas las 10 p.m.',
    evidencias: [],
  },
];

// Copia de los mismos casos de ejemplo de mis-atenciones.js, solo para que
// la primera vez que alguien acepte una alerta desde esta página no se
// pierdan las atenciones de muestra si Mis Atenciones nunca se ha abierto.
// Cuando haya backend esta duplicación desaparece.
const ATENCIONES_INICIALES_BASE = [
  { id: 'WL-2026-00125', tipo: 'Robo reportado', prioridad: 'alta', ubicacion: 'Carrera 15 #20-30', horaReportada: '18:20', horaAsignacion: '18:23', distancia: '1.2 km', descripcionCiudadano: 'Ciudadano reporta robo en establecimiento comercial.', infoCentral: 'Se recibieron dos llamadas adicionales confirmando el hecho. Posible sospechoso con chaqueta oscura.', evidencias: ['Audio de la llamada al 123'], estado: 'EN_CAMINO', observacion: '', fecha: '2026-09-13', tiempos: { ASIGNADA: '18:23', EN_CAMINO: '18:24' } },
  { id: 'WL-2026-00121', tipo: 'Riña callejera', prioridad: 'media', ubicacion: 'Calle 16 con Carrera 7', horaReportada: '13:05', horaAsignacion: '13:10', distancia: '0.6 km', descripcionCiudadano: 'Se reporta altercado entre dos personas en vía pública.', infoCentral: 'Sin armas reportadas. Vecinos intentando separar a los implicados.', evidencias: [], estado: 'EN_SITIO', observacion: '', fecha: '2026-09-13', tiempos: { ASIGNADA: '13:10', EN_CAMINO: '13:11', EN_SITIO: '13:19' } },
  { id: 'WL-2026-00118', tipo: 'Persona sospechosa', prioridad: 'baja', ubicacion: 'Parque Simón Bolívar', horaReportada: '11:40', horaAsignacion: '11:47', distancia: '2.4 km', descripcionCiudadano: 'Vecino reporta persona merodeando vehículos parqueados.', infoCentral: 'Sin antecedentes reportados en la zona en las últimas horas.', evidencias: [], estado: 'ASIGNADA', observacion: '', fecha: '2026-09-13', tiempos: { ASIGNADA: '11:47' } },
  { id: 'WL-2026-00099', tipo: 'Ruido excesivo', prioridad: 'baja', ubicacion: 'Avenida Simón Bolívar #5-10', horaReportada: '09:02', horaAsignacion: '09:05', distancia: '0.9 km', descripcionCiudadano: 'Vecino reporta música a alto volumen en horas de la mañana.', infoCentral: 'Segunda queja de la semana sobre la misma dirección.', evidencias: [], estado: 'RESUELTA', observacion: 'Se verificó el lugar, sin novedad.', fecha: '2026-09-13', tiempos: { ASIGNADA: '09:05', EN_CAMINO: '09:07', EN_SITIO: '09:15', RESUELTA: '09:20' } },
];

/* ============================================================
   PERSISTENCIA
   ============================================================ */
function cargarAlertas() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY_AL);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {
    console.warn('No se pudo leer Mis Alertas desde localStorage, usando datos de prueba.', e);
  }
  return structuredClone(ALERTAS_INICIALES);
}

function guardarAlertas() {
  try {
    localStorage.setItem(STORAGE_KEY_AL, JSON.stringify(alertas));
  } catch (e) {
    console.warn('No se pudo guardar Mis Alertas en localStorage.', e);
  }
}

function cargarAtencionesParaFusion() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY_AT);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {
    console.warn('No se pudo leer Mis Atenciones desde localStorage.', e);
  }
  return structuredClone(ATENCIONES_INICIALES_BASE);
}

function guardarAtencionesFusion(lista) {
  try {
    localStorage.setItem(STORAGE_KEY_AT, JSON.stringify(lista));
  } catch (e) {
    console.warn('No se pudo guardar Mis Atenciones en localStorage.', e);
  }
}

let alertas = cargarAlertas();
let filtroActualAl = 'todas';
let contenedorAlertasAl = null;
let badgeContadorAl = null;

/* ============================================================
   HORA / FECHA ACTUAL (para registrar la aceptación)
   ============================================================ */
function horaActualAl() {
  return new Date().toTimeString().slice(0, 5);
}

function fechaHoyAl() {
  return new Date().toISOString().slice(0, 10);
}

/* ============================================================
   RENDER
   ============================================================ */
const BADGE_PRIORIDAD_AL = { alta: 'badge-red-dash', media: 'badge-amber-dash', baja: 'badge-blue-dash' };
const BADGE_ESTADO_AL = { nueva: { texto: 'Nueva', clase: 'badge-blue-dash' }, vista: { texto: 'Vista', clase: 'badge-green-dash' } };

function textoEvidenciasAl(evidencias) {
  if (!evidencias || evidencias.length === 0) return 'Sin evidencias adjuntas';
  if (evidencias.length === 1) return '1 evidencia adjunta (foto)';
  return `${evidencias.length} evidencias adjuntas (fotos)`;
}

function alertasFiltradas() {
  if (filtroActualAl === 'todas') return alertas;
  return alertas.filter(a => a.prioridad === filtroActualAl);
}

function renderContador() {
  if (!badgeContadorAl) return;
  const nuevas = alertas.filter(a => a.estadoBadge === 'nueva').length;
  badgeContadorAl.textContent = `${nuevas} alerta${nuevas === 1 ? '' : 's'} nueva${nuevas === 1 ? '' : 's'}`;
}

function renderAlertas() {
  if (!contenedorAlertasAl) return;
  const visibles = alertasFiltradas();

  if (visibles.length === 0) {
    contenedorAlertasAl.innerHTML = `<div class="col-12"><p style="font-size:12.5px;color:var(--muted);text-align:center;padding:24px 0;">No tienes alertas para este filtro.</p></div>`;
    renderContador();
    return;
  }

  contenedorAlertasAl.innerHTML = visibles.map(a => {
    const badgePrioridad = BADGE_PRIORIDAD_AL[a.prioridad];
    const estado = BADGE_ESTADO_AL[a.estadoBadge];
    return `
      <div class="col-12 al-card-col">
        <article class="card-panel-dash al-card" data-priority="${a.prioridad}" data-id="${a.id}">
          <div class="al-card-top">
            <div class="d-flex align-items-center gap-2">
              <span class="al-type-icon"><i class="bi ${a.icono}"></i></span>
              <div>
                <p class="al-title mb-0">${a.tipo}</p>
                <span class="al-meta-inline"><i class="bi bi-clock"></i> ${a.tiempoTexto}</span>
              </div>
            </div>
            <span class="badge-dash ${badgePrioridad}">Prioridad ${a.prioridad}</span>
          </div>

          <div class="al-meta">
            <span><i class="bi bi-geo-alt"></i> ${a.ubicacion}</span>
            <span><i class="bi bi-rulers"></i> ${a.distancia}</span>
            <span class="badge-dash ${estado.clase}">${estado.texto}</span>
          </div>

          <div class="al-desc-box">
            <i class="bi bi-quote"></i>
            <p class="mb-0">"${a.cita}"</p>
          </div>

          <div class="al-evidence">
            <i class="bi bi-paperclip"></i> ${textoEvidenciasAl(a.evidencias)}
          </div>

          <div class="al-card-actions">
            <button class="btn btn-outline-secondary btn-sm btn-ver-detalle-al" data-id="${a.id}">Ver detalle</button>
            <button class="btn btn-cv-azul btn-sm btn-aceptar-al" data-id="${a.id}">Aceptar alerta</button>
          </div>
        </article>
      </div>
    `;
  }).join('');

  contenedorAlertasAl.querySelectorAll('.btn-ver-detalle-al').forEach(btn => {
    btn.addEventListener('click', () => verDetalleAlerta(btn.dataset.id));
  });
  contenedorAlertasAl.querySelectorAll('.btn-aceptar-al').forEach(btn => {
    btn.addEventListener('click', () => aceptarAlerta(btn.dataset.id));
  });

  renderContador();
}

/* ============================================================
   ACCIONES
   ============================================================ */
function verDetalleAlerta(id) {
  const a = alertas.find(x => x.id === id);
  if (!a || a.estadoBadge === 'vista') return;
  a.estadoBadge = 'vista';
  guardarAlertas();
  renderAlertas();
}

function aceptarAlerta(id) {
  const idx = alertas.findIndex(a => a.id === id);
  if (idx === -1) return;
  const a = alertas[idx];

  const nuevaAtencion = {
    id: `WL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`,
    tipo: a.tipo,
    prioridad: a.prioridad,
    ubicacion: a.ubicacion,
    horaReportada: a.horaReportada,
    horaAsignacion: horaActualAl(),
    distancia: a.distancia,
    descripcionCiudadano: a.cita,
    infoCentral: 'Alerta aceptada desde Mis Alertas.',
    evidencias: a.evidencias || [],
    estado: 'ASIGNADA',
    observacion: '',
    fecha: fechaHoyAl(),
    tiempos: { ASIGNADA: horaActualAl() },
  };

  const atenciones = cargarAtencionesParaFusion();
  atenciones.push(nuevaAtencion);
  guardarAtencionesFusion(atenciones);

  alertas.splice(idx, 1);
  guardarAlertas();
  renderAlertas();
}

/* ============================================================
   FILTROS
   ============================================================ */
function aplicarFiltroChips(filtro) {
  document.querySelectorAll('.al-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.filter === filtro);
  });
  filtroActualAl = filtro;
  renderAlertas();
  try {
    localStorage.setItem(STORAGE_KEY_AL_FILTRO, filtro);
  } catch (e) {
    console.warn('No se pudo guardar el filtro de alertas en localStorage.', e);
  }
}

/* ============================================================
   INICIO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderSidebarPolicia('misalertas');

  const primeraTarjeta = document.querySelector('.al-card-col');
  contenedorAlertasAl = primeraTarjeta ? primeraTarjeta.closest('.row') : null;

  badgeContadorAl = [...document.querySelectorAll('.badge-dash')]
    .find(b => /alertas nuevas/.test(b.textContent));

  document.querySelectorAll('.al-chip').forEach(chip => {
    chip.addEventListener('click', () => aplicarFiltroChips(chip.dataset.filter));
  });

  let filtroGuardado = 'todas';
  try {
    filtroGuardado = localStorage.getItem(STORAGE_KEY_AL_FILTRO) || 'todas';
  } catch (e) {
    console.warn('No se pudo leer el filtro de alertas desde localStorage.', e);
  }

  aplicarFiltroChips(filtroGuardado);
});