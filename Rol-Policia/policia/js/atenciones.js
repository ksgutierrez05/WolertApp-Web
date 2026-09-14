// js/patrullero/mis-atenciones.js
// Lógica de la pantalla "Mis Atenciones" del rol Patrullero.
//
// Reglas clave (ver documento de especificación):
// - Flujo único y sin saltos: ASIGNADA -> EN_CAMINO -> EN_SITIO -> RESUELTA
// - El patrullero NO redacta informe final: solo cambia de estado y puede
//   dejar una observación corta y opcional.
// - Cada cambio de estado registra usuario, fecha, hora, estado anterior y
//   estado nuevo, y alimenta automáticamente la línea de tiempo.
// - "Alerta resuelta" exige confirmación antes de aplicar el cambio.
//
// Requiere que este archivo se cargue DESPUÉS de sidebar.js, y que el HTML
// tenga los ids: sidebarDash, kpiTotal, kpiCamino, kpiSitio, kpiResueltas,
// bannerActivaAt, filtrosAt, buscarCasoAt, filtroTipoAt, filtroFechaAt,
// listaAt, panelDetalleAt, modalResolverAt, btnConfirmarResolucionAt.

renderSidebarPolicia('misatenciones');

/* ============================================================
   FLUJO DE ESTADOS (sin saltos, sin cierre administrativo)
   ============================================================ */
const FLUJO_ESTADOS = ['ASIGNADA', 'EN_CAMINO', 'EN_SITIO', 'RESUELTA'];

const ETIQUETAS_ESTADO = {
  ASIGNADA:  { texto: 'Asignada',    corto: 'Asignada',    badge: 'badge-amber-dash' },
  EN_CAMINO: { texto: 'En camino',   corto: 'En camino',   badge: 'badge-blue-dash' },
  EN_SITIO:  { texto: 'En el sitio', corto: 'En el sitio', badge: 'badge-red-dash' },
  RESUELTA:  { texto: 'Resuelta',    corto: 'Resuelta',    badge: 'badge-green-dash' },
};

// Texto del botón principal según el estado actual (avanza al siguiente paso)
const ACCION_SIGUIENTE = {
  ASIGNADA:  'Iniciar desplazamiento',
  EN_CAMINO: 'Llegué al sitio',
  EN_SITIO:  'Alerta resuelta',
};

const PATRULLERO_ACTUAL = 'Juan Pérez';

/* ============================================================
   DATOS DE EJEMPLO
   En producción esto viene del backend (alertas asignadas al
   patrullero autenticado por Central de Radio).
   ============================================================ */
let atenciones = [
  {
    id: 'WL-2026-00125',
    tipo: 'Robo reportado',
    prioridad: 'alta',
    ubicacion: 'Carrera 15 #20-30',
    horaReportada: '18:20',
    horaAsignacion: '18:23',
    distancia: '1.2 km',
    descripcionCiudadano: 'Ciudadano reporta robo en establecimiento comercial.',
    infoCentral: 'Se recibieron dos llamadas adicionales confirmando el hecho. Posible sospechoso con chaqueta oscura.',
    evidencias: ['Audio de la llamada al 123'],
    estado: 'EN_CAMINO',
    observacion: '',
    fecha: '2026-09-13',
    tiempos: {
      ASIGNADA: '18:23',
      EN_CAMINO: '18:24',
    },
  },
  {
    id: 'WL-2026-00121',
    tipo: 'Riña callejera',
    prioridad: 'media',
    ubicacion: 'Calle 16 con Carrera 7',
    horaReportada: '13:05',
    horaAsignacion: '13:10',
    distancia: '0.6 km',
    descripcionCiudadano: 'Se reporta altercado entre dos personas en vía pública.',
    infoCentral: 'Sin armas reportadas. Vecinos intentando separar a los implicados.',
    evidencias: [],
    estado: 'EN_SITIO',
    observacion: '',
    fecha: '2026-09-13',
    tiempos: {
      ASIGNADA: '13:10',
      EN_CAMINO: '13:11',
      EN_SITIO: '13:19',
    },
  },
  {
    id: 'WL-2026-00118',
    tipo: 'Persona sospechosa',
    prioridad: 'baja',
    ubicacion: 'Parque Simón Bolívar',
    horaReportada: '11:40',
    horaAsignacion: '11:47',
    distancia: '2.4 km',
    descripcionCiudadano: 'Vecino reporta persona merodeando vehículos parqueados.',
    infoCentral: 'Sin antecedentes reportados en la zona en las últimas horas.',
    evidencias: [],
    estado: 'ASIGNADA',
    observacion: '',
    fecha: '2026-09-13',
    tiempos: {
      ASIGNADA: '11:47',
    },
  },
  {
    id: 'WL-2026-00099',
    tipo: 'Ruido excesivo',
    prioridad: 'baja',
    ubicacion: 'Avenida Simón Bolívar #5-10',
    horaReportada: '09:02',
    horaAsignacion: '09:05',
    distancia: '0.9 km',
    descripcionCiudadano: 'Vecino reporta música a alto volumen en horas de la mañana.',
    infoCentral: 'Segunda queja de la semana sobre la misma dirección.',
    evidencias: [],
    estado: 'RESUELTA',
    observacion: 'Se verificó el lugar, sin novedad.',
    fecha: '2026-09-13',
    tiempos: {
      ASIGNADA: '09:05',
      EN_CAMINO: '09:07',
      EN_SITIO: '09:15',
      RESUELTA: '09:20',
    },
  },
];

let filtroActual = 'TODAS';
let idSeleccionado = atenciones[0].id;

function atencionPorId(id) {
  return atenciones.find(a => a.id === id);
}

function estaActiva(a) {
  return a.estado !== 'RESUELTA';
}

/* ============================================================
   KPIs
   ============================================================ */
function renderKPIs() {
  document.getElementById('kpiTotal').textContent = atenciones.filter(estaActiva).length;
  document.getElementById('kpiCamino').textContent = atenciones.filter(a => a.estado === 'EN_CAMINO').length;
  document.getElementById('kpiSitio').textContent = atenciones.filter(a => a.estado === 'EN_SITIO').length;
  document.getElementById('kpiResueltas').textContent = atenciones.filter(a => a.estado === 'RESUELTA').length;
}

/* ============================================================
   BANNER DE ATENCIÓN ACTIVA
   ============================================================ */
function renderBannerActiva() {
  const cont = document.getElementById('bannerActivaAt');
  // Prioriza la atención activa más avanzada en el flujo (en sitio > en camino > asignada)
  const activas = atenciones.filter(estaActiva);
  if (activas.length === 0) {
    cont.innerHTML = '';
    return;
  }
  const orden = { EN_SITIO: 0, EN_CAMINO: 1, ASIGNADA: 2 };
  const a = activas.sort((x, y) => orden[x.estado] - orden[y.estado])[0];

  cont.innerHTML = `
    <div class="banner-activa-at">
      <div>
        <div class="titulo-banner-at"><i class="bi bi-broadcast"></i> Atención activa</div>
        <div class="caso-banner-at">${a.tipo} — Prioridad ${a.prioridad}</div>
        <div class="meta-banner-at"><i class="bi bi-geo-alt"></i> ${a.ubicacion} · Estado: ${ETIQUETAS_ESTADO[a.estado].texto}</div>
      </div>
      <button class="btn-continuar-at" id="btnContinuarActivaAt" data-id="${a.id}">Continuar atención</button>
    </div>
  `;

  document.getElementById('btnContinuarActivaAt').addEventListener('click', (e) => {
    idSeleccionado = e.target.dataset.id;
    renderLista();
    renderDetalle();
    document.getElementById('panelDetalleAt').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ============================================================
   FILTROS (estado, búsqueda por caso, tipo, fecha)
   ============================================================ */
function poblarFiltroTipos() {
  const select = document.getElementById('filtroTipoAt');
  const tipos = [...new Set(atenciones.map(a => a.tipo))];
  select.innerHTML = '<option value="">Tipo de alerta</option>' +
    tipos.map(t => `<option value="${t}">${t}</option>`).join('');
}

function atencionesFiltradas() {
  const busqueda = document.getElementById('buscarCasoAt').value.trim().toLowerCase();
  const tipo = document.getElementById('filtroTipoAt').value;
  const fecha = document.getElementById('filtroFechaAt').value;

  return atenciones.filter(a => {
    if (filtroActual === 'ACTIVAS' && !estaActiva(a)) return false;
    if (filtroActual !== 'TODAS' && filtroActual !== 'ACTIVAS' && a.estado !== filtroActual) return false;
    if (busqueda && !a.id.toLowerCase().includes(busqueda)) return false;
    if (tipo && a.tipo !== tipo) return false;
    if (fecha && a.fecha !== fecha) return false;
    return true;
  });
}

/* ============================================================
   LISTA DE ATENCIONES (tarjetas)
   ============================================================ */
function renderLista() {
  const cont = document.getElementById('listaAt');
  const visibles = atencionesFiltradas();

  if (visibles.length === 0) {
    cont.innerHTML = `<p style="font-size:12.5px;color:var(--subtle);text-align:center;padding:24px 0;">No hay atenciones en este filtro.</p>`;
    return;
  }

  cont.innerHTML = visibles.map(a => `
    <div class="tarjeta-at ${a.id === idSeleccionado ? 'selected' : ''}" data-id="${a.id}">
      <div class="prioridad-barra-at prioridad-${a.prioridad}-at"></div>
      <div class="tipo-at">🚨 ${a.tipo}</div>
      <div class="caso-at">Caso: #${a.id}</div>
      <div class="meta-at">
        <span class="badge-dash ${ETIQUETAS_ESTADO[a.estado].badge}">${ETIQUETAS_ESTADO[a.estado].corto}</span>
        <span><i class="bi bi-geo-alt"></i> ${a.ubicacion}</span>
      </div>
      <div class="meta-at mt-1">
        <span><i class="bi bi-clock"></i> Reportada: ${a.horaReportada}</span>
        <span><i class="bi bi-signpost"></i> ${a.distancia}</span>
      </div>
      <div class="desc-at">${a.descripcionCiudadano}</div>
      <div class="ver-at">Ver atención <i class="bi bi-arrow-right"></i></div>
    </div>
  `).join('');

  cont.querySelectorAll('.tarjeta-at').forEach(el => {
    el.addEventListener('click', () => {
      idSeleccionado = el.dataset.id;
      renderLista();
      renderDetalle();
    });
  });
}

/* ============================================================
   STEPPER (estado visual del flujo)
   ============================================================ */
function renderStepper(estadoActual) {
  const idxActual = FLUJO_ESTADOS.indexOf(estadoActual);
  return FLUJO_ESTADOS.map((estado, idx) => {
    const hecho = idx < idxActual;
    const actual = idx === idxActual;
    const linea = idx < FLUJO_ESTADOS.length - 1
      ? `<div class="linea-at ${idx < idxActual ? 'hecho-at' : ''}"></div>`
      : '';
    return `
      <div class="paso-at ${hecho ? 'hecho-at' : ''} ${actual ? 'actual-at' : ''}">
        <div class="circulo-at">${hecho ? '<i class="bi bi-check-lg"></i>' : idx + 1}</div>
        <span class="txt-paso-at">${ETIQUETAS_ESTADO[estado].corto}</span>
      </div>
      ${linea}
    `;
  }).join('');
}

/* ============================================================
   LÍNEA DE TIEMPO (generada automáticamente a partir de los
   cambios de estado registrados en a.tiempos)
   ============================================================ */
const TEXTO_TIEMPO = {
  ASIGNADA: 'Alerta asignada al patrullero',
  EN_CAMINO: 'Patrullero inició desplazamiento',
  EN_SITIO: 'Patrullero llegó al sitio',
  RESUELTA: 'Alerta marcada como resuelta',
};

function renderLineaTiempo(a) {
  const items = [`<li class="item-tiempo-at"><span class="hora-tiempo-at">${a.horaReportada}</span>Alerta reportada</li>`];
  FLUJO_ESTADOS.forEach(estado => {
    if (a.tiempos[estado]) {
      items.push(`<li class="item-tiempo-at"><span class="hora-tiempo-at">${a.tiempos[estado]}</span>${TEXTO_TIEMPO[estado]}</li>`);
    }
  });
  return `<ul class="linea-tiempo-at">${items.join('')}</ul>`;
}

/* ============================================================
   HORA ACTUAL (para registrar automáticamente cada cambio)
   ============================================================ */
function horaActual() {
  const ahora = new Date();
  return ahora.toTimeString().slice(0, 5);
}

/* ============================================================
   DETALLE DE LA ATENCIÓN
   ============================================================ */
function renderDetalle() {
  const panel = document.getElementById('panelDetalleAt');
  const a = atencionPorId(idSeleccionado);

  if (!a) {
    panel.innerHTML = `
      <div class="vacio-at">
        <i class="bi bi-clipboard2-check"></i>
        <p class="mb-0">Selecciona una atención de la lista<br>para ver su detalle y actualizar su estado.</p>
      </div>`;
    return;
  }

  const accionTexto = ACCION_SIGUIENTE[a.estado];
  const esUltimoPaso = a.estado === 'EN_SITIO'; // "Alerta resuelta" exige confirmación

  panel.innerHTML = `
    <div class="cabecera-detalle-at">
      <div>
        <h2>${a.tipo}</h2>
        <div class="meta-at">
          <span class="badge-dash badge-blue-dash">Caso #${a.id}</span>
          <span><i class="bi bi-geo-alt"></i> ${a.ubicacion}</span>
          <span><i class="bi bi-clock"></i> Reportada: ${a.horaReportada}</span>
        </div>
      </div>
      <span class="badge-dash ${a.prioridad === 'alta' ? 'badge-red-dash' : a.prioridad === 'media' ? 'badge-amber-dash' : 'badge-blue-dash'}">
        Prioridad ${a.prioridad}
      </span>
    </div>

    <div class="stepper-at">${renderStepper(a.estado)}</div>

    <div class="seccion-detalle-at">
      <div class="titulo-seccion-at"><i class="bi bi-info-circle"></i> Información del caso</div>
      <div class="fila-info-at">
        <div class="label-info-at">Estado actual</div>
        <div>${ETIQUETAS_ESTADO[a.estado].texto}</div>
      </div>
      <div class="fila-info-at">
        <div class="label-info-at">Hora de asignación</div>
        <div>${a.horaAsignacion}</div>
      </div>
      <div class="fila-info-at">
        <div class="label-info-at">Distancia aprox.</div>
        <div>${a.distancia}</div>
      </div>
    </div>

    <div class="seccion-detalle-at">
      <div class="titulo-seccion-at"><i class="bi bi-person"></i> Reporte ciudadano</div>
      <div class="caja-lectura-at">${a.descripcionCiudadano}</div>
    </div>

    <div class="seccion-detalle-at">
      <div class="titulo-seccion-at"><i class="bi bi-broadcast"></i> Información de Central</div>
      <div class="caja-lectura-at">
        ${a.infoCentral}
        ${a.evidencias && a.evidencias.length ? `<div class="mt-2"><i class="bi bi-paperclip"></i> Evidencias: ${a.evidencias.join(', ')}</div>` : ''}
      </div>
    </div>

    <div class="seccion-detalle-at">
      <div class="titulo-seccion-at"><i class="bi bi-map"></i> Ubicación</div>
      <div class="mapa-at"><i class="bi bi-geo-alt"></i>${a.ubicacion}</div>
    </div>

    <div class="seccion-detalle-at">
      <div class="titulo-seccion-at"><i class="bi bi-clock-history"></i> Línea de tiempo</div>
      ${renderLineaTiempo(a)}
    </div>

    <div class="form-observacion-at">
      <label>Observación (opcional)</label>
      <textarea class="form-control" rows="2" id="campoObservacion" placeholder="Ej: Situación controlada." ${a.estado === 'RESUELTA' ? 'disabled' : ''}>${a.observacion}</textarea>
      <div class="ayuda-at">Una frase corta es suficiente. Central elabora el informe final del caso.</div>
    </div>

    <div class="acciones-detalle-at">
      ${accionTexto ? `<button class="btn-accion-principal-at" id="btnAvanzarAt">${accionTexto}</button>` : ''}
      ${a.estado === 'RESUELTA' ? `<span class="badge-dash badge-green-dash">Esta alerta ya está resuelta</span>` : ''}
    </div>
  `;

  const btnAvanzar = document.getElementById('btnAvanzarAt');
  if (btnAvanzar) {
    btnAvanzar.addEventListener('click', () => {
      guardarObservacion(a);
      if (esUltimoPaso) {
        abrirModalResolucion(a.id);
      } else {
        avanzarEstado(a.id);
      }
    });
  }
}

function guardarObservacion(a) {
  const obs = document.getElementById('campoObservacion');
  if (obs) a.observacion = obs.value.trim();
}

/* ============================================================
   TRANSICIONES DE ESTADO (sin saltos, con registro automático)
   ============================================================ */
function avanzarEstado(id) {
  const a = atencionPorId(id);
  if (!a) return;

  const idxActual = FLUJO_ESTADOS.indexOf(a.estado);
  if (idxActual >= FLUJO_ESTADOS.length - 1) return;

  const nuevoEstado = FLUJO_ESTADOS[idxActual + 1];
  a.estado = nuevoEstado;
  a.tiempos[nuevoEstado] = horaActual();
  // En una implementación real aquí se notifica a Central de Radio.

  poblarFiltroTipos();
  renderKPIs();
  renderBannerActiva();
  renderLista();
  renderDetalle();
}

let idPendienteResolucion = null;
let modalResolverAt = null;

function abrirModalResolucion(id) {
  idPendienteResolucion = id;
  if (!modalResolverAt) {
    modalResolverAt = new bootstrap.Modal(document.getElementById('modalResolverAt'));
  }
  modalResolverAt.show();
}

document.getElementById('btnConfirmarResolucionAt').addEventListener('click', () => {
  if (idPendienteResolucion) {
    avanzarEstado(idPendienteResolucion);
    idPendienteResolucion = null;
  }
  modalResolverAt.hide();
});

/* ============================================================
   EVENTOS DE FILTRO Y BÚSQUEDA
   ============================================================ */
document.getElementById('filtrosAt').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip-filtro-at');
  if (!btn) return;
  document.querySelectorAll('.chip-filtro-at').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  filtroActual = btn.dataset.filtro;
  renderLista();
});

document.getElementById('buscarCasoAt').addEventListener('input', renderLista);
document.getElementById('filtroTipoAt').addEventListener('change', renderLista);
document.getElementById('filtroFechaAt').addEventListener('change', renderLista);

/* ============================================================
   INICIO
   ============================================================ */
poblarFiltroTipos();
renderKPIs();
renderBannerActiva();
renderLista();
renderDetalle();