// js/policia/notificaciones.js
// Centro de Notificaciones del Administrador de Policía (Comandante de
// Estación). A diferencia del feed de "Alertas recientes" del Centro de
// Operaciones (que muestra el flujo operativo en tiempo real que maneja
// la Central de Radio), esta vista solo muestra eventos de SUPERVISIÓN
// y GESTIÓN que le corresponden al comandante, filtrados por su propia
// estación/jurisdicción (ver JURISDICCION_ACTUAL más abajo).

renderSidebarPolicia('notificaciones');

// CATEGORIAS, PRIORIDAD_BADGE, PRIORIDAD_LABEL, NOTIFICACIONES y
// JURISDICCION_ACTUAL vienen de notificaciones-data.js (cargado antes
// que este archivo), para compartir la misma fuente de datos con el
// resumen de la campanita (campanita-dash.js).

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
      renderChips();
      renderLista();
      if (typeof refrescarCampanita === 'function') refrescarCampanita();
    });
  });

  renderKpis();
}

document.getElementById('btnMarcarTodas').addEventListener('click', () => {
  NOTIFICACIONES.forEach(n => n.leida = true);
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