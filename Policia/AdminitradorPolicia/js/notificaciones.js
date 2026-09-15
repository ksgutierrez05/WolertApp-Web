

renderSidebarPolicia('notificaciones');

// ------------------------------------------------------------------
// Datos de referencia (categorías y prioridades)
// ------------------------------------------------------------------
const CATEGORIAS = {
  alertas:     { label: 'Alertas',     icon: 'bi-bell',          clase: 'notif-icon-red-dash' },
  patrulleros: { label: 'Patrulleros', icon: 'bi-person-badge',  clase: 'notif-icon-blue-dash' },
  sistema:     { label: 'Sistema',     icon: 'bi-gear',          clase: 'notif-icon-gray-dash' },
};

const PRIORIDAD_BADGE = {
  critica: 'badge-red-dash',
  alta: 'badge-amber-dash',
  media: 'badge-blue-dash',
  baja: 'badge-dash',
};

const PRIORIDAD_LABEL = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

// Jurisdicción/estación del comandante que tiene la sesión iniciada.
// Cuando exista login real, esto vendría del usuario autenticado.
const JURISDICCION_ACTUAL = 'Estación de Policía Centro';

// ------------------------------------------------------------------
// Datos de ejemplo (en memoria + localStorage)
// ------------------------------------------------------------------
const LS_KEY_NOTIFICACIONES = 'notificacionesPoliciales';
const LS_KEY_NOTIF_LEIDAS = 'notificacionesPolicialesLeidas';

function _fechaDDMMAAAA(diasAtras = 0) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

const NOTIFICACIONES_DEFECTO = [
  { id: 'n1', categoria: 'alertas', prioridad: 'critica', titulo: 'Alerta crítica sin asignar hace más de 10 min', descripcion: 'La alerta #212 (Sospechoso — Cañaguate) sigue sin unidad asignada. Revisa la cola de despacho.', fecha: _fechaDDMMAAAA(0), hora: '08:05', leida: false, link: '../reportes/Reportes.html' },
  { id: 'n2', categoria: 'patrulleros', prioridad: 'alta', titulo: 'Patrullero fuera de servicio sin justificación', descripcion: 'Miguel Torres (Moto 12) cambió su estado a "Fuera de servicio" sin registrar motivo.', fecha: _fechaDDMMAAAA(0), hora: '07:50', leida: false, link: '../policias/Policias.html' },
  { id: 'n3', categoria: 'alertas', prioridad: 'alta', titulo: 'Alerta reabierta por el ciudadano', descripcion: 'La alerta #210 (Alarma — Sicarare), marcada como cancelada, fue reabierta por el reportante.', fecha: _fechaDDMMAAAA(0), hora: '07:15', leida: false, link: '../historial/Historial.html' },
  { id: 'n4', categoria: 'sistema', prioridad: 'media', titulo: 'Respaldo diario completado', descripcion: 'El respaldo automático de la información de la estación se completó sin errores.', fecha: _fechaDDMMAAAA(0), hora: '06:00', leida: true, link: null },
  { id: 'n5', categoria: 'patrulleros', prioridad: 'media', titulo: 'Nuevo patrullero asignado a tu estación', descripcion: 'Daniela Suárez fue asignada a la unidad "CAI La Nevada" de tu jurisdicción.', fecha: _fechaDDMMAAAA(1), hora: '17:40', leida: true, link: '../policias/Policias.html' },
  { id: 'n6', categoria: 'alertas', prioridad: 'baja', titulo: 'Alerta resuelta dentro del tiempo esperado', descripcion: 'La alerta #214 (Riña — Centro) fue resuelta en 25 minutos, dentro del tiempo objetivo.', fecha: _fechaDDMMAAAA(1), hora: '09:05', leida: true, link: '../historial/Historial.html' },
  { id: 'n7', categoria: 'sistema', prioridad: 'baja', titulo: 'Actualización de la plataforma disponible', descripcion: 'Hay una nueva versión de WolertApp disponible con mejoras de estabilidad.', fecha: _fechaDDMMAAAA(2), hora: '10:00', leida: true, link: null },
];

function cargarNotificaciones() {
  let notificaciones;
  try {
    const guardado = localStorage.getItem(LS_KEY_NOTIFICACIONES);
    notificaciones = guardado ? JSON.parse(guardado) : NOTIFICACIONES_DEFECTO.map(n => ({ ...n }));
  } catch (e) {
    console.warn('No se pudo leer las notificaciones desde localStorage:', e);
    notificaciones = NOTIFICACIONES_DEFECTO.map(n => ({ ...n }));
  }

  // Aplica el estado "leída" guardado por separado (por si en algún
  // momento el contenido se vuelve a traer del backend, el estado de
  // lectura local no se pierde).
  try {
    const idsLeidasGuardado = localStorage.getItem(LS_KEY_NOTIF_LEIDAS);
    if (idsLeidasGuardado) {
      const idsLeidas = new Set(JSON.parse(idsLeidasGuardado));
      notificaciones.forEach(n => { if (idsLeidas.has(n.id)) n.leida = true; });
    }
  } catch (e) {
    console.warn('No se pudo leer el estado de notificaciones leídas desde localStorage:', e);
  }

  return notificaciones;
}

function guardarNotificaciones() {
  try {
    localStorage.setItem(LS_KEY_NOTIFICACIONES, JSON.stringify(NOTIFICACIONES));
  } catch (e) {
    console.warn('No se pudo guardar las notificaciones en localStorage:', e);
  }
}

function guardarIdsLeidas() {
  try {
    const idsLeidas = NOTIFICACIONES.filter(n => n.leida).map(n => n.id);
    localStorage.setItem(LS_KEY_NOTIF_LEIDAS, JSON.stringify(idsLeidas));
  } catch (e) {
    console.warn('No se pudo guardar el estado de notificaciones leídas en localStorage:', e);
  }
}

const NOTIFICACIONES = cargarNotificaciones();
guardarNotificaciones();
guardarIdsLeidas();

// ------------------------------------------------------------------
// Estado de la vista
// ------------------------------------------------------------------
let filtroActivo = 'todas';   // todas | critica | alertas | patrulleros | sistema
let detalleAbierto = null;    // id de la notificación con el detalle expandido

const FILTROS = [
  { id: 'todas',       label: 'Todas' },
  { id: 'critica',     label: 'Críticas' },
  { id: 'alertas',     label: 'Alertas' },
  { id: 'patrulleros', label: 'Patrulleros' },
  { id: 'sistema',     label: 'Sistema' },
];

function notificacionesFiltradas() {
  if (filtroActivo === 'todas') return NOTIFICACIONES;
  if (filtroActivo === 'critica') return NOTIFICACIONES.filter(n => n.prioridad === 'critica');
  return NOTIFICACIONES.filter(n => n.categoria === filtroActivo);
}

function renderChips() {
  document.getElementById('filtrosNotif').innerHTML = FILTROS.map(f => `
    <button class="chip-notif-dash ${f.id === filtroActivo ? 'active' : ''}" data-filtro="${f.id}">
      ${f.label}
    </button>
  `).join('');

  document.querySelectorAll('.chip-notif-dash').forEach(btn => {
    btn.addEventListener('click', () => {
      filtroActivo = btn.dataset.filtro;
      detalleAbierto = null;
      renderChips();
      renderLista();
    });
  });
}

function _fechaHoyDDMMAAAA() {
  return _fechaDDMMAAAA(0);
}

function renderKpis() {
  const total = NOTIFICACIONES.length;
  const noLeidas = NOTIFICACIONES.filter(n => !n.leida).length;
  const criticas = NOTIFICACIONES.filter(n => n.prioridad === 'critica').length;
  const hoy = NOTIFICACIONES.filter(n => n.fecha === _fechaHoyDDMMAAAA()).length;

  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiNoLeidas').textContent = noLeidas;
  document.getElementById('kpiCriticas').textContent = criticas;
  document.getElementById('kpiHoy').textContent = hoy;
}

function renderLista() {
  const lista = notificacionesFiltradas();
  const cont = document.getElementById('listaNotif');

  if (lista.length === 0) {
    cont.innerHTML = `
      <div class="notif-empty-dash">
        <i class="bi bi-inbox"></i>
        No hay notificaciones en esta categoría.
      </div>`;
    renderKpis();
    return;
  }

  cont.innerHTML = lista.map(n => {
    const cat = CATEGORIAS[n.categoria];
    const abierto = detalleAbierto === n.id;
    return `
    <div class="notif-item-dash ${n.leida ? '' : 'no-leida'}" data-id="${n.id}">
      ${n.leida ? '' : '<span class="unread-dot-dash"></span>'}
      <div class="notif-icon-dash ${cat.clase}"><i class="bi ${cat.icon}"></i></div>
      <div class="notif-body-dash">
        <p class="notif-title-dash">${n.titulo}</p>
        <p class="notif-desc-dash">${n.descripcion}</p>
        <div class="notif-meta-dash">
          <span class="notif-cat-label-dash">${cat.label}</span>
          <span class="notif-time-dash"><i class="bi bi-clock me-1"></i>${n.fecha} · ${n.hora}</span>
        </div>
        <div class="notif-detail-dash ${abierto ? 'abierto' : ''}">
          ${n.descripcion}
          ${n.link ? `<br><a href="${n.link}">Ir al módulo relacionado <i class="bi bi-arrow-right"></i></a>` : '<br><span class="text-body-secondary">Sin módulo de detalle asociado todavía.</span>'}
        </div>
      </div>
      <div class="notif-actions-dash">
        <span class="badge-dash ${PRIORIDAD_BADGE[n.prioridad]}">${PRIORIDAD_LABEL[n.prioridad]}</span>
        <button class="btn-ver-detalle-dash" data-accion="detalle" data-id="${n.id}">
          ${abierto ? 'Ocultar' : 'Ver detalle'}
        </button>
      </div>
    </div>`;
  }).join('');

  cont.querySelectorAll('[data-accion="detalle"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const n = NOTIFICACIONES.find(x => x.id === id);
      n.leida = true;
      detalleAbierto = detalleAbierto === id ? null : id;
      guardarIdsLeidas();
      renderChips();
      renderLista();
    });
  });

  renderKpis();
}

document.getElementById('btnMarcarTodas').addEventListener('click', () => {
  NOTIFICACIONES.forEach(n => n.leida = true);
  guardarIdsLeidas();
  renderLista();
});

if (JURISDICCION_ACTUAL) {
  document.getElementById('lblJurisdiccion').textContent = JURISDICCION_ACTUAL;
} else {
  document.querySelector('.notif-jurisdiccion-dash').style.display = 'none';
}

renderChips();
renderLista();