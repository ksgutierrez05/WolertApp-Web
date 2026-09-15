

renderSidebarPolicia('notificaciones');

const LS_KEY_NOTIF_LEIDAS = 'notificacionesPolicialesLeidas';

function cargarIdsLeidas() {
  try {
    const guardado = localStorage.getItem(LS_KEY_NOTIF_LEIDAS);
    if (guardado) return new Set(JSON.parse(guardado));
  } catch (e) {
    console.warn('No se pudo leer el estado de notificaciones leídas desde localStorage:', e);
  }
  return new Set();
}

function guardarIdsLeidas() {
  try {
    const idsLeidas = NOTIFICACIONES.filter(n => n.leida).map(n => n.id);
    localStorage.setItem(LS_KEY_NOTIF_LEIDAS, JSON.stringify(idsLeidas));
  } catch (e) {
    console.warn('No se pudo guardar el estado de notificaciones leídas en localStorage:', e);
  }
}


(function aplicarEstadoLeidasGuardado() {
  const idsLeidas = cargarIdsLeidas();
  NOTIFICACIONES.forEach(n => {
    if (idsLeidas.has(n.id)) n.leida = true;
  });
})();

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
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
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
      if (typeof refrescarCampanita === 'function') refrescarCampanita();
    });
  });

  renderKpis();
}

document.getElementById('btnMarcarTodas').addEventListener('click', () => {
  NOTIFICACIONES.forEach(n => n.leida = true);
  guardarIdsLeidas();
  renderLista();
  if (typeof refrescarCampanita === 'function') refrescarCampanita();
});

if (JURISDICCION_ACTUAL) {
  document.getElementById('lblJurisdiccion').textContent = JURISDICCION_ACTUAL;
} else {
  document.querySelector('.notif-jurisdiccion-dash').style.display = 'none';
}

renderChips();
renderLista();