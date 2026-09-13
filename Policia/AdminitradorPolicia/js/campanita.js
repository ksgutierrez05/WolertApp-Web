// js/policia/campanita-dash.js
// Campanita de notificaciones reutilizable para TODOS los dashboards
// del rol Policía (Centro de Operaciones, Alarmas, etc.).
//
// Requiere, en este orden, en el <head>/<body> de cada página:
//   1) Bootstrap CSS + Bootstrap Bundle JS (trae Popper, necesario
//      para que el dropdown funcione).
//   2) js/policia/notificaciones-data.js  → datos compartidos
//   3) js/policia/campanita-dash.js       → este archivo
//
// Uso en el HTML, dentro del topbar, en vez del botón de campana fijo:
//   <span id="notifBellSlot"></span>
//
// El script se autoejecuta al cargar: busca #notifBellSlot y lo
// reemplaza por un dropdown de Bootstrap con el resumen de las
// notificaciones más recientes. Al hacer clic en cualquier ítem del
// resumen (o en "Ver todas"), se navega al Centro de Notificaciones
// completo (RUTA_NOTIFICACIONES, definida en notificaciones-data.js).

const MAX_ITEMS_CAMPANITA = 6;

function _campanitaOrdenadas() {
  // No leídas primero, luego el resto, tal como llegan.
  return [...NOTIFICACIONES].sort((a, b) => Number(a.leida) - Number(b.leida));
}

function _campanitaItemHTML(n) {
  const cat = CATEGORIAS[n.categoria];
  return `
    <a href="${n.link || RUTA_NOTIFICACIONES}" class="notif-dropdown-item-dash ${n.leida ? '' : 'no-leida-dash'}" data-id="${n.id}">
      <div class="notif-icon-dash ${cat.clase}"><i class="bi ${cat.icon}"></i></div>
      <div class="notif-dropdown-body-dash">
        <p class="notif-dropdown-title-dash">${n.titulo}</p>
        <span class="notif-dropdown-time-dash">${cat.label} · ${n.hora}</span>
      </div>
      ${n.leida ? '' : '<span class="unread-dot-dash-sm"></span>'}
    </a>`;
}

function renderCampanita() {
  const lista = _campanitaOrdenadas().slice(0, MAX_ITEMS_CAMPANITA);
  const noLeidas = NOTIFICACIONES.filter(n => !n.leida).length;

  const listaHTML = lista.length
    ? lista.map(_campanitaItemHTML).join('')
    : '<div class="notif-dropdown-empty-dash"><i class="bi bi-inbox d-block mb-1" style="font-size:22px;"></i>No tienes notificaciones.</div>';

  document.getElementById('notifDropdownList').innerHTML = listaHTML;
  document.getElementById('notifDropdownCount').textContent = noLeidas > 0 ? `${noLeidas} sin leer` : 'Al día';
  document.getElementById('notifDropdownCount').className = `badge-dash ${noLeidas > 0 ? 'badge-red-dash' : 'badge-green-dash'}`;

  const dot = document.getElementById('notifBellDot');
  if (dot) dot.style.display = noLeidas > 0 ? 'inline-block' : 'none';

  // Al hacer clic en un ítem, se marca como leída antes de navegar
  // (si la notificación no tiene módulo propio, igual cae en el
  // Centro de Notificaciones, ver _campanitaItemHTML).
  document.querySelectorAll('#notifDropdownList .notif-dropdown-item-dash').forEach(a => {
    a.addEventListener('click', () => {
      const n = NOTIFICACIONES.find(x => x.id === a.dataset.id);
      if (n) n.leida = true;
    });
  });
}

// Se expone para que notificaciones.js pueda refrescar la campanita
// si ambas cosas conviven en la misma página (o en el futuro, si se
// comparte estado entre pestañas).
function refrescarCampanita() {
  if (document.getElementById('notifDropdownList')) renderCampanita();
}

function initCampanita() {
  const slot = document.getElementById('notifBellSlot');
  if (!slot) return;

  slot.outerHTML = `
    <div class="dropdown" id="notifBellWrap">
      <button class="icon-btn-dash btn btn-light rounded-circle position-relative" type="button"
              id="notifBellBtn" data-bs-toggle="dropdown" aria-expanded="false" title="Notificaciones">
        <i class="bi bi-bell"></i>
        <span class="dot-danger-dash position-absolute top-0 end-0" id="notifBellDot"></span>
      </button>
      <div class="dropdown-menu dropdown-menu-end notif-dropdown-dash" aria-labelledby="notifBellBtn">
        <div class="notif-dropdown-head-dash d-flex align-items-center justify-content-between">
          <span>Notificaciones</span>
          <span class="badge-dash badge-red-dash" id="notifDropdownCount">0</span>
        </div>
        <div class="notif-dropdown-list-dash" id="notifDropdownList"></div>
        <a href="${RUTA_NOTIFICACIONES}" class="notif-dropdown-footer-dash">
          Ver todas las notificaciones <i class="bi bi-arrow-right"></i>
        </a>
      </div>
    </div>`;

  renderCampanita();
}

initCampanita();