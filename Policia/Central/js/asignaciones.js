
const ALERTAS_EJEMPLO = [
  {
    id: 'WL-2026-00125',
    tipo: 'Robo',
    prioridad: 'alta',
    ubicacion: 'Carrera 15 #20-30',
    zona: 'Comuna 1',
    unidadReferencia: 'CAI Centro',
    horaClasificacion: '18:24',
    estado: 'clasificada', // clasificada | asignada | en_atencion
    reporteCiudadano: 'Ciudadano reporta robo en establecimiento comercial.',
    observacionCentral: 'Se recomienda verificar establecimiento y alrededores. Posible presencia del sospechoso según reporte ciudadano.',
    patrulleroAsignadoId: null,
    horaAsignacion: null,
    minutosSinConfirmar: null,
  },
  {
    id: 'WL-2026-00126',
    tipo: 'Persona sospechosa',
    prioridad: 'media',
    ubicacion: 'Calle 8 #12-45',
    zona: 'Comuna 2',
    unidadReferencia: 'CAI Norte',
    horaClasificacion: '18:31',
    estado: 'clasificada',
    reporteCiudadano: 'Vecino reporta persona merodeando vehículos parqueados.',
    observacionCentral: '',
    patrulleroAsignadoId: null,
    horaAsignacion: null,
    minutosSinConfirmar: null,
  },
  {
    id: 'WL-2026-00121',
    tipo: 'Accidente',
    prioridad: 'critica',
    ubicacion: 'Avenida Circunvalar km 3',
    zona: 'Comuna 4',
    unidadReferencia: 'CAI Sur',
    horaClasificacion: '18:10',
    estado: 'asignada',
    reporteCiudadano: 'Choque entre dos vehículos, una persona herida.',
    observacionCentral: 'Priorizar unidad más cercana, posible necesidad de ambulancia.',
    patrulleroAsignadoId: 'P-003',
    horaAsignacion: '18:12',
    minutosSinConfirmar: 6,
  },
  {
    id: 'WL-2026-00119',
    tipo: 'Alteración del orden público',
    prioridad: 'baja',
    ubicacion: 'Parque Sucre',
    zona: 'Comuna 1',
    unidadReferencia: 'CAI Centro',
    horaClasificacion: '17:58',
    estado: 'en_atencion',
    reporteCiudadano: 'Grupo de personas generando disturbios en el parque.',
    observacionCentral: '',
    patrulleroAsignadoId: 'P-002',
    horaAsignacion: '18:02',
    minutosSinConfirmar: 0,
  },
];

const PATRULLEROS_EJEMPLO = [
  { id: 'P-001', nombre: 'Patrullero 01', unidad: 'CAI Norte', estado: 'disponible', distanciaKm: 1.2, etaMin: 4, atencionActualId: null },
  { id: 'P-002', nombre: 'Patrullero 02', unidad: 'CAI Centro', estado: 'en_camino', distanciaKm: 2.4, etaMin: 7, atencionActualId: 'WL-2026-00119' },
  { id: 'P-003', nombre: 'Patrullero 03', unidad: 'CAI Sur', estado: 'en_sitio', distanciaKm: 0.6, etaMin: 0, atencionActualId: 'WL-2026-00121' },
  { id: 'P-004', nombre: 'Patrullero 04', unidad: 'CAI Norte', estado: 'fuera_servicio', distanciaKm: null, etaMin: null, atencionActualId: null },
  { id: 'P-005', nombre: 'Patrullero 05', unidad: 'CAI Centro', estado: 'disponible', distanciaKm: 3.1, etaMin: 9, atencionActualId: null },
  { id: 'P-006', nombre: 'Patrullero 06', unidad: 'CAI Sur', estado: 'ocupado', distanciaKm: 1.8, etaMin: 5, atencionActualId: null },
];

/* ------------------------------------------------------------
   1.1) PERSISTENCIA EN LOCALSTORAGE
   Guarda el estado completo de ALERTAS y PATRULLEROS (incluye
   asignaciones, horas, minutosSinConfirmar, etc.) para que la
   pantalla sobreviva a un F5. Cuando exista backend real, estas
   funciones se reemplazan por los fetch de obtenerAlertasDespacho/
   obtenerPatrulleros y guardarAsignacion, y este bloque se elimina.
------------------------------------------------------------ */
const LS_KEY_ALERTAS_ASIG = 'wolertapp_asignacion_alertas';
const LS_KEY_PATRULLEROS_ASIG = 'wolertapp_asignacion_patrulleros';

function guardarEstadoEnStorage() {
  try {
    localStorage.setItem(LS_KEY_ALERTAS_ASIG, JSON.stringify(ALERTAS));
    localStorage.setItem(LS_KEY_PATRULLEROS_ASIG, JSON.stringify(PATRULLEROS));
  } catch (err) {
    console.error('No se pudo guardar el estado de asignación en localStorage:', err);
  }
}

function cargarAlertasDesdeStorage() {
  try {
    const guardado = localStorage.getItem(LS_KEY_ALERTAS_ASIG);
    if (!guardado) return null;
    const datos = JSON.parse(guardado);
    if (Array.isArray(datos) && datos.length) return datos;
  } catch (err) {
    console.error('No se pudo leer las alertas de asignación desde localStorage:', err);
  }
  return null;
}

function cargarPatrullerosDesdeStorage() {
  try {
    const guardado = localStorage.getItem(LS_KEY_PATRULLEROS_ASIG);
    if (!guardado) return null;
    const datos = JSON.parse(guardado);
    if (Array.isArray(datos) && datos.length) return datos;
  } catch (err) {
    console.error('No se pudo leer los patrulleros de asignación desde localStorage:', err);
  }
  return null;
}

/* ------------------------------------------------------------
   2) PROVEEDORES DE DATOS
   Punto único de integración con el backend. Devuelven Promesas
   para que el resto del código ya esté listo para un fetch real.
   Mientras tanto, primero intentan leer de localStorage y si no
   hay nada, usan los datos de ejemplo.
------------------------------------------------------------ */
function obtenerAlertasDespacho() {
  // TODO: reemplazar por, por ejemplo:
  // return fetch('/api/central/alertas-despacho').then(r => r.json());
  const guardadas = cargarAlertasDesdeStorage();
  return new Promise((resolve) => setTimeout(() => resolve(guardadas || ALERTAS_EJEMPLO.map(a => ({ ...a }))), 200));
}

function obtenerPatrulleros() {
  // TODO: reemplazar por, por ejemplo:
  // return fetch('/api/central/patrulleros').then(r => r.json());
  const guardados = cargarPatrullerosDesdeStorage();
  return new Promise((resolve) => setTimeout(() => resolve(guardados || PATRULLEROS_EJEMPLO.map(p => ({ ...p }))), 200));
}

function guardarAsignacion(alertaId, patrulleroId, esReasignacion) {
  // TODO: reemplazar por la llamada real, por ejemplo:
  // return fetch(`/api/central/alertas/${alertaId}/asignar`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ patrulleroId, esReasignacion }),
  // });
  // Mientras tanto, se actualiza el estado en memoria (y en
  // localStorage) para que la interfaz refleje el cambio de inmediato.
  const alerta = ALERTAS.find(a => a.id === alertaId);
  const patrulleroAnterior = alerta ? PATRULLEROS.find(p => p.id === alerta.patrulleroAsignadoId) : null;
  const patrulleroNuevo = PATRULLEROS.find(p => p.id === patrulleroId);

  if (patrulleroAnterior && patrulleroAnterior.id !== patrulleroId) {
    patrulleroAnterior.estado = 'disponible';
    patrulleroAnterior.atencionActualId = null;
  }

  if (alerta && patrulleroNuevo) {
    alerta.estado = 'asignada';
    alerta.patrulleroAsignadoId = patrulleroNuevo.id;
    alerta.horaAsignacion = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    alerta.minutosSinConfirmar = 0;

    patrulleroNuevo.estado = 'en_camino';
    patrulleroNuevo.atencionActualId = alerta.id;
  }

  guardarEstadoEnStorage();

  return Promise.resolve({ ok: true });
}

function registrarContacto(patrulleroId) {
  // TODO: reemplazar por la integración real de radio/mensajería.
  return Promise.resolve({ ok: true });
}

/* ------------------------------------------------------------
   3) ESTADO DE LA PANTALLA
------------------------------------------------------------ */
let ALERTAS = [];
let PATRULLEROS = [];

const estadoApp = {
  tabActiva: 'pendientes', // pendientes | seguimiento
  filtroTexto: '',
  alertaSeleccionadaId: null,
  modoReasignacion: false,
  accionPendiente: null, // { alertaId, patrulleroId, esReasignacion }
};

/* ------------------------------------------------------------
   4) UTILIDADES DE PRESENTACIÓN
------------------------------------------------------------ */
function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

const ETIQUETAS_PRIORIDAD = { critica: 'Crítica', alta: 'Alta', media: 'Media', baja: 'Baja' };
const CLASES_BADGE_PRIORIDAD = { critica: 'badge-red-dash', alta: 'badge-red-dash', media: 'badge-amber-dash', baja: 'badge-blue-dash' };

const ETIQUETAS_ESTADO_PATRULLERO = {
  disponible: 'Disponible',
  en_camino: 'En camino',
  en_sitio: 'En el sitio',
  ocupado: 'Ocupado',
  fuera_servicio: 'Fuera de servicio',
};

function badgePrioridad(prioridad) {
  const clase = CLASES_BADGE_PRIORIDAD[prioridad] || 'badge-blue-dash';
  const etiqueta = ETIQUETAS_PRIORIDAD[prioridad] || prioridad;
  return `<span class="badge-dash ${clase}">${etiqueta}</span>`;
}

function pillEstadoPatrullero(estado) {
  const etiqueta = ETIQUETAS_ESTADO_PATRULLERO[estado] || estado;
  return `<span class="asig-estado-pill asig-estado-${estado}">${etiqueta}</span>`;
}

function patrulleroPorId(id) {
  return PATRULLEROS.find(p => p.id === id) || null;
}

function alertaPorId(id) {
  return ALERTAS.find(a => a.id === id) || null;
}

function iniciales(nombre) {
  return (nombre || '').split(' ').filter(Boolean).slice(-1)[0]?.slice(0, 2).toUpperCase() || '--';
}

/* ------------------------------------------------------------
   5) SUGERENCIA AUTOMÁTICA DE PATRULLERO
   Reglas: disponible > menor tiempo estimado > menor distancia >
   misma unidad/CAI de referencia del caso.
------------------------------------------------------------ */
function sugerirPatrullero(alerta) {
  const disponibles = PATRULLEROS.filter(p => p.estado === 'disponible');
  if (disponibles.length === 0) return null;

  return disponibles.slice().sort((a, b) => {
    const mismaUnidadA = a.unidad === alerta.unidadReferencia ? 0 : 1;
    const mismaUnidadB = b.unidad === alerta.unidadReferencia ? 0 : 1;
    if (mismaUnidadA !== mismaUnidadB) return mismaUnidadA - mismaUnidadB;
    if (a.etaMin !== b.etaMin) return (a.etaMin ?? 999) - (b.etaMin ?? 999);
    return (a.distanciaKm ?? 999) - (b.distanciaKm ?? 999);
  })[0];
}

/* ------------------------------------------------------------
   6) KPIs SUPERIORES
------------------------------------------------------------ */
function renderKpis() {
  const cont = document.getElementById('kpisDespacho');
  if (!cont) return;

  const pendientes = ALERTAS.filter(a => a.estado === 'clasificada').length;
  const enCamino = PATRULLEROS.filter(p => p.estado === 'en_camino').length;
  const enSitio = PATRULLEROS.filter(p => p.estado === 'en_sitio').length;
  const sinConfirmar = ALERTAS.filter(a => (a.minutosSinConfirmar || 0) >= 5 && a.estado === 'asignada').length;

  const tarjetas = [
    { valor: pendientes, label: 'Pendientes por asignar', clase: 'kpi-amber-dash', icono: 'bi-hourglass-split' },
    { valor: enCamino, label: 'Patrulleros en camino', clase: 'kpi-blue-dash', icono: 'bi-signpost-split' },
    { valor: enSitio, label: 'Patrulleros en el sitio', clase: 'kpi-green-dash', icono: 'bi-geo-alt' },
    { valor: sinConfirmar, label: 'Sin confirmar asignación', clase: 'kpi-red-dash', icono: 'bi-exclamation-triangle' },
  ];

  cont.innerHTML = tarjetas.map(t => `
    <div class="col-6 col-lg-3">
      <div class="kpi-dash ${t.clase}">
        <i class="bi ${t.icono} kpi-icon-dash"></i>
        <div class="kpi-num-dash">${t.valor}</div>
        <div class="kpi-label-dash">${t.label}</div>
      </div>
    </div>
  `).join('');
}

/* ------------------------------------------------------------
   7) LISTAS (colas de trabajo)
------------------------------------------------------------ */
function alertasFiltradas(estados) {
  const texto = estadoApp.filtroTexto.trim().toLowerCase();
  return ALERTAS.filter(a => estados.includes(a.estado)).filter(a => {
    if (!texto) return true;
    return [a.id, a.tipo, a.zona, a.ubicacion].join(' ').toLowerCase().includes(texto);
  });
}

function tarjetaAlertaHtml(alerta) {
  const seleccionada = alerta.id === estadoApp.alertaSeleccionadaId ? 'selected' : '';
  const patrullero = patrulleroPorId(alerta.patrulleroAsignadoId);
  const infoAsignacion = patrullero
    ? `<span><i class="bi bi-shield-check"></i>${escaparHtml(patrullero.nombre)}</span>`
    : `<span><i class="bi bi-clock"></i>${escaparHtml(alerta.horaClasificacion)}</span>`;

  return `
    <article class="asig-card ${seleccionada}" data-prioridad="${alerta.prioridad}" data-id="${alerta.id}" role="button" tabindex="0">
      <div class="asig-card-top">
        <span class="asig-card-caso">#${escaparHtml(alerta.id)}</span>
        ${badgePrioridad(alerta.prioridad)}
      </div>
      <div class="asig-card-tipo">${escaparHtml(alerta.tipo)}</div>
      <div class="asig-card-meta">
        <span><i class="bi bi-geo-alt"></i>${escaparHtml(alerta.zona)}</span>
        ${infoAsignacion}
      </div>
    </article>
  `;
}

function renderListas() {
  const listaPendientes = document.getElementById('listaPendientes');
  const listaSeguimiento = document.getElementById('listaSeguimiento');

  const pendientes = alertasFiltradas(['clasificada']);
  const seguimiento = alertasFiltradas(['asignada', 'en_atencion']);

  listaPendientes.innerHTML = pendientes.length
    ? pendientes.map(tarjetaAlertaHtml).join('')
    : `<div class="asig-empty"><i class="bi bi-inbox"></i>No hay alertas pendientes por asignar.</div>`;

  listaSeguimiento.innerHTML = seguimiento.length
    ? seguimiento.map(tarjetaAlertaHtml).join('')
    : `<div class="asig-empty"><i class="bi bi-broadcast"></i>No hay alertas en seguimiento.</div>`;

  document.getElementById('countPendientes').textContent = pendientes.length;
  document.getElementById('countSeguimiento').textContent = seguimiento.length;

  document.querySelectorAll('.asig-card').forEach(card => {
    card.addEventListener('click', () => seleccionarAlerta(card.dataset.id));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') seleccionarAlerta(card.dataset.id);
    });
  });
}

function seleccionarAlerta(id) {
  estadoApp.alertaSeleccionadaId = id;
  estadoApp.modoReasignacion = false;
  renderListas();
  renderDetalle();
}

/* ------------------------------------------------------------
   8) PANEL DE DETALLE / DESPACHO
------------------------------------------------------------ */
function renderDetalle() {
  const panel = document.getElementById('panelDetalle');
  const alerta = alertaPorId(estadoApp.alertaSeleccionadaId);

  if (!alerta) {
    panel.innerHTML = `
      <div class="asig-empty">
        <i class="bi bi-cursor"></i>
        Selecciona una alerta de la lista para ver el detalle y asignar un patrullero.
      </div>`;
    return;
  }

  const cabecera = `
    <div class="asig-detalle-header">
      <div>
        <div class="asig-detalle-caso">Caso #${escaparHtml(alerta.id)}</div>
        <div class="asig-detalle-titulo">${escaparHtml(alerta.tipo)}</div>
        <div class="asig-detalle-meta">
          <span><i class="bi bi-geo-alt"></i> ${escaparHtml(alerta.ubicacion)}</span>
          <span><i class="bi bi-signpost"></i> ${escaparHtml(alerta.zona)}</span>
          <span><i class="bi bi-clock"></i> Clasificada ${escaparHtml(alerta.horaClasificacion)}</span>
        </div>
      </div>
      ${badgePrioridad(alerta.prioridad)}
    </div>
  `;

  const reportes = `
    <div class="asig-bloque">
      <div class="asig-bloque-titulo">Reporte ciudadano</div>
      <div class="asig-texto-reporte">${escaparHtml(alerta.reporteCiudadano)}</div>
    </div>
    ${alerta.observacionCentral ? `
      <div class="asig-bloque">
        <div class="asig-bloque-titulo">Información agregada por Central</div>
        <div class="asig-texto-reporte central">${escaparHtml(alerta.observacionCentral)}</div>
      </div>` : ''}
  `;

  if (alerta.estado === 'clasificada' || estadoApp.modoReasignacion) {
    panel.innerHTML = cabecera + reportes + renderBloqueDespacho(alerta);
  } else {
    panel.innerHTML = cabecera + reportes + renderBloqueSeguimiento(alerta);
  }

  configurarEventosDetalle(alerta);
}

function renderBloqueDespacho(alerta) {
  const sugerido = sugerirPatrullero(alerta);
  const ordenados = PATRULLEROS.slice().sort((a, b) => {
    const rango = { disponible: 0, en_camino: 1, en_sitio: 1, ocupado: 2, fuera_servicio: 3 };
    return (rango[a.estado] ?? 9) - (rango[b.estado] ?? 9);
  });

  const filas = ordenados.map(p => {
    const esSugerido = sugerido && p.id === sugerido.id;
    const puedeAsignar = p.estado === 'disponible';
    return `
      <div class="asig-patrullero ${esSugerido ? 'sugerido' : ''}">
        <div class="asig-patrullero-info">
          <div class="asig-patrullero-avatar">${iniciales(p.nombre)}</div>
          <div>
            <div class="asig-patrullero-nombre">
              ${escaparHtml(p.nombre)}
              ${esSugerido ? '<span class="asig-sugerido-tag"><i class="bi bi-star-fill"></i>Sugerido</span>' : ''}
            </div>
            <div class="asig-patrullero-sub">
              <span>${escaparHtml(p.unidad)}</span>
              ${p.distanciaKm != null ? `<span>${p.distanciaKm} km</span>` : ''}
              ${p.etaMin != null ? `<span>ETA ${p.etaMin} min</span>` : ''}
              ${pillEstadoPatrullero(p.estado)}
            </div>
          </div>
        </div>
        <button type="button"
          class="btn btn-sm ${esSugerido ? 'btn-cv-azul' : 'btn-outline-secondary'}"
          data-asignar="${p.id}"
          ${puedeAsignar ? '' : 'disabled'}>
          ${estadoApp.modoReasignacion ? 'Reasignar' : 'Asignar'}
        </button>
      </div>
    `;
  }).join('');

  return `
    <div class="asig-bloque">
      <div class="d-flex align-items-center justify-content-between">
        <div class="asig-bloque-titulo mb-0">Patrulleros disponibles</div>
        ${estadoApp.modoReasignacion ? '<button type="button" class="btn btn-sm btn-light" id="btnCancelarReasignacion">Cancelar</button>' : ''}
      </div>
      <div class="mt-2">${filas || '<div class="asig-empty">No hay patrulleros registrados.</div>'}</div>
    </div>
  `;
}

function renderBloqueSeguimiento(alerta) {
  const patrullero = patrulleroPorId(alerta.patrulleroAsignadoId);
  const sinRespuesta = (alerta.minutosSinConfirmar || 0) >= 5 && alerta.estado === 'asignada';

  const aviso = sinRespuesta ? `
    <div class="asig-aviso-sin-respuesta">
      <i class="bi bi-exclamation-triangle-fill"></i>
      El patrullero no ha confirmado la atención (${alerta.minutosSinConfirmar} min).
    </div>` : '';

  const tarjetaPatrullero = patrullero ? `
    <div class="asig-seguimiento-card">
      <div class="asig-patrullero-info mb-3">
        <div class="asig-patrullero-avatar">${iniciales(patrullero.nombre)}</div>
        <div>
          <div class="asig-patrullero-nombre">${escaparHtml(patrullero.nombre)}</div>
          <div class="asig-patrullero-sub">
            <span>${escaparHtml(patrullero.unidad)}</span>
            ${pillEstadoPatrullero(patrullero.estado)}
          </div>
        </div>
      </div>
      <div class="asig-card-meta" style="font-size:12.5px;">
        <span><i class="bi bi-clock-history"></i> Asignado ${escaparHtml(alerta.horaAsignacion || '—')}</span>
      </div>
      <div class="d-flex gap-2 mt-3">
        <button type="button" class="btn btn-sm btn-outline-secondary" id="btnContactar">
          <i class="bi bi-telephone me-1"></i>Contactar
        </button>
        <button type="button" class="btn btn-sm btn-cv-azul" id="btnReasignar">
          <i class="bi bi-arrow-repeat me-1"></i>Reasignar
        </button>
      </div>
    </div>
  ` : `<div class="asig-empty">Esta alerta no tiene patrullero asignado.</div>`;

  return `
    <div class="asig-bloque">
      <div class="asig-bloque-titulo">Seguimiento del despacho</div>
      ${aviso}
      ${tarjetaPatrullero}
    </div>
  `;
}

/* ------------------------------------------------------------
   9) EVENTOS DEL PANEL DE DETALLE
------------------------------------------------------------ */
function configurarEventosDetalle(alerta) {
  document.querySelectorAll('[data-asignar]').forEach(btn => {
    btn.addEventListener('click', () => {
      const patrulleroId = btn.getAttribute('data-asignar');
      abrirConfirmacionAsignacion(alerta.id, patrulleroId, estadoApp.modoReasignacion);
    });
  });

  const btnReasignar = document.getElementById('btnReasignar');
  if (btnReasignar) {
    btnReasignar.addEventListener('click', () => {
      estadoApp.modoReasignacion = true;
      renderDetalle();
    });
  }

  const btnCancelarReasignacion = document.getElementById('btnCancelarReasignacion');
  if (btnCancelarReasignacion) {
    btnCancelarReasignacion.addEventListener('click', () => {
      estadoApp.modoReasignacion = false;
      renderDetalle();
    });
  }

  const btnContactar = document.getElementById('btnContactar');
  if (btnContactar) {
    btnContactar.addEventListener('click', () => {
      const patrullero = patrulleroPorId(alerta.patrulleroAsignadoId);
      registrarContacto(patrullero?.id).then(() => {
        mostrarToast(`Intentando contactar a ${patrullero?.nombre || 'patrullero'}...`);
      });
    });
  }
}

/* ------------------------------------------------------------
   10) MODAL DE CONFIRMACIÓN (asignar / reasignar)
------------------------------------------------------------ */
let modalConfirmar;

function abrirConfirmacionAsignacion(alertaId, patrulleroId, esReasignacion) {
  const alerta = alertaPorId(alertaId);
  const patrullero = patrulleroPorId(patrulleroId);
  if (!alerta || !patrullero) return;

  estadoApp.accionPendiente = { alertaId, patrulleroId, esReasignacion };

  document.getElementById('modalConfirmarTitulo').textContent = esReasignacion ? 'Confirmar reasignación' : 'Confirmar asignación';
  document.getElementById('modalConfirmarBody').innerHTML = esReasignacion
    ? `¿Confirmas reasignar el caso <strong>#${escaparHtml(alerta.id)}</strong> a <strong>${escaparHtml(patrullero.nombre)}</strong>? El patrullero anterior quedará disponible.`
    : `¿Confirmas asignar el caso <strong>#${escaparHtml(alerta.id)}</strong> a <strong>${escaparHtml(patrullero.nombre)}</strong>?`;

  modalConfirmar.show();
}

function confirmarAccionPendiente() {
  const accion = estadoApp.accionPendiente;
  if (!accion) return;

  guardarAsignacion(accion.alertaId, accion.patrulleroId, accion.esReasignacion).then(() => {
    estadoApp.modoReasignacion = false;
    estadoApp.accionPendiente = null;
    modalConfirmar.hide();
    renderKpis();
    renderListas();
    renderDetalle();
  });
}

/* ------------------------------------------------------------
   11) TOAST DE CONTACTO
------------------------------------------------------------ */
let toastContacto;

function mostrarToast(mensaje) {
  document.getElementById('toastContactoBody').textContent = mensaje;
  toastContacto.show();
}

/* ------------------------------------------------------------
   12) EVENTOS GENERALES DE LA PANTALLA
   Separado en dos funciones a propósito: los filtros/tabs NO
   dependen de bootstrap.bundle.js, así que deben funcionar aunque
   ese script falle en cargar (sin internet, CDN bloqueado, etc.).
   Solo el modal y el toast necesitan el objeto global `bootstrap`.
------------------------------------------------------------ */
function configurarFiltrosYTabs() {
  document.querySelectorAll('.asig-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.asig-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      estadoApp.tabActiva = tab.dataset.tab;

      document.getElementById('listaPendientes').classList.toggle('d-none', estadoApp.tabActiva !== 'pendientes');
      document.getElementById('listaSeguimiento').classList.toggle('d-none', estadoApp.tabActiva !== 'seguimiento');
    });
  });

  document.getElementById('buscarAlerta').addEventListener('input', (e) => {
    estadoApp.filtroTexto = e.target.value;
    renderListas();
  });
}

function configurarModalYToast() {
  const elModal = document.getElementById('modalConfirmarAsignacion');
  const elToast = document.getElementById('toastContacto');

  if (typeof bootstrap === 'undefined') {
    // bootstrap.bundle.min.js no cargó (sin conexión, CDN bloqueado, etc.).
    // Se deja un aviso en consola y se crean sustitutos mínimos para que
    // el resto de la pantalla (listas, KPIs, detalle) siga funcionando
    // en vez de romperse por completo.
    console.warn('[Asignación] Bootstrap JS no se cargó: los diálogos de confirmación y el toast de contacto quedarán deshabilitados hasta resolver la carga del script.');
    modalConfirmar = {
      show: () => window.alert('No se pudo abrir el diálogo de confirmación porque Bootstrap JS no cargó.'),
      hide: () => {},
    };
    toastContacto = { show: () => {} };
    return;
  }

  modalConfirmar = new bootstrap.Modal(elModal);
  toastContacto = new bootstrap.Toast(elToast, { delay: 3500 });
}

/* ------------------------------------------------------------
   13) ARRANQUE
   El orden importa: primero se cargan los datos y se pinta todo
   lo visual (listas, KPIs, detalle); la configuración de modal/
   toast va al final y está blindada, así que si algo ahí falla
   ya no puede dejar la pantalla en blanco.
------------------------------------------------------------ */
async function iniciarAsignacion() {
  try {
    ALERTAS = await obtenerAlertasDespacho();
    PATRULLEROS = await obtenerPatrulleros();
  } catch (error) {
    console.error('[Asignación] No se pudieron cargar los datos de despacho:', error);
    ALERTAS = [];
    PATRULLEROS = [];
  }

  configurarFiltrosYTabs();
  renderKpis();
  renderListas();
  renderDetalle();

  try {
    configurarModalYToast();
  } catch (error) {
    console.error('[Asignación] No se pudo inicializar el modal/toast:', error);
  }

  const btnConfirmar = document.getElementById('btnConfirmarAsignacion');
  if (btnConfirmar) btnConfirmar.addEventListener('click', confirmarAccionPendiente);
}

document.addEventListener('DOMContentLoaded', iniciarAsignacion);