

const NOTIF_STORAGE_KEY = 'wolertapp_notificaciones_ciudadano';

const NOTIFICACIONES_PRUEBA = [
  {
    id: 1,
    tipo: 'alerta_vecino',
    titulo: 'Nueva alerta cercana',
    detalle: 'María G. reportó un robo a 200 m de tu ubicación.',
    tiempo: Date.now() - 1000 * 60 * 8,
    leida: false,
  },
  {
    id: 2,
    tipo: 'cambio_estado',
    titulo: 'Tu alerta fue actualizada',
    detalle: 'Tu reporte #A-1042 pasó de "Pendiente" a "En atención".',
    tiempo: Date.now() - 1000 * 60 * 60,
    leida: false,
  },
  {
    id: 3,
    tipo: 'alerta_vecino',
    titulo: 'Nueva alerta cercana',
    detalle: 'Carlos R. reportó un disturbio en la cuadra vecina.',
    tiempo: Date.now() - 1000 * 60 * 60 * 3,
    leida: true,
  },
  {
    id: 4,
    tipo: 'cambio_estado',
    titulo: 'Tu alerta fue cerrada',
    detalle: 'Tu reporte #A-1039 fue marcado como "Resuelto" por la unidad asignada.',
    tiempo: Date.now() - 1000 * 60 * 60 * 26,
    leida: true,
  },
];

const CONFIG_NOTIF = {
  alerta_vecino: { icon: 'bi-broadcast', badge: 'badge-blue-dash', texto: 'Vecino' },
  cambio_estado: { icon: 'bi-arrow-repeat', badge: 'badge-amber-dash', texto: 'Actualización' },
};

let filtroActual = 'todas';

// -------- Storage helpers --------
function cargarNotificaciones() {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (!raw) {
      guardarNotificaciones(NOTIFICACIONES_PRUEBA);
      return NOTIFICACIONES_PRUEBA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo notificaciones de localStorage:', e);
    return NOTIFICACIONES_PRUEBA;
  }
}

function guardarNotificaciones(lista) {
  try {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(lista));
  } catch (e) {
    console.error('Error guardando notificaciones en localStorage:', e);
  }
}

// -------- Helpers de presentación --------
function tiempoRelativo(timestamp) {
  const diffMs = Date.now() - timestamp;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Ahora mismo';
  if (min < 60) return `Hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `Hace ${dias} d`;
}

// -------- Render --------
function renderNotificaciones() {
  const cont = document.getElementById('listaNotificaciones');
  if (!cont) return;

  const todas = cargarNotificaciones().sort((a, b) => b.tiempo - a.tiempo);

  const filtradas = todas.filter(n => {
    if (filtroActual === 'todas') return true;
    if (filtroActual === 'no_leidas') return !n.leida;
    return n.tipo === filtroActual;
  });

  if (filtradas.length === 0) {
    cont.innerHTML = `
      <div class="notif-empty-dash">
        <i class="bi bi-bell-slash"></i>
        No hay notificaciones para mostrar.
      </div>
    `;
    return;
  }

  cont.innerHTML = filtradas.map(n => {
    const cfg = CONFIG_NOTIF[n.tipo] || { icon: 'bi-bell', badge: 'badge-blue-dash', texto: 'Aviso' };
    return `
      <div class="notif-item-dash ${n.leida ? '' : 'no-leida'}" data-id="${n.id}">
        ${n.leida ? '' : '<span class="notif-dot-dash"></span>'}
        <span class="notif-icon-dash tipo-${n.tipo}"><i class="bi ${cfg.icon}"></i></span>
        <div class="notif-body-dash">
          <div class="notif-top-row-dash">
            <span class="info-title-dash">${n.titulo}</span>
            <span class="badge-dash ${cfg.badge}">${cfg.texto}</span>
          </div>
          <p class="info-sub-dash mb-0">${n.detalle}</p>
        </div>
        <span class="notif-time-dash">${tiempoRelativo(n.tiempo)}</span>
      </div>
    `;
  }).join('');
}

// -------- Interacciones --------
function marcarComoLeida(id) {
  const lista = cargarNotificaciones();
  const idx = lista.findIndex(n => n.id === id);
  if (idx === -1) return;
  lista[idx].leida = true;
  guardarNotificaciones(lista);
  renderNotificaciones();

  // Refresca el contador del sidebar (definido en sidebar.js)
  if (typeof renderSidebarCiudadano === 'function') {
    renderSidebarCiudadano('notificaciones');
  }
}

function marcarTodasComoLeidas() {
  const lista = cargarNotificaciones().map(n => ({ ...n, leida: true }));
  guardarNotificaciones(lista);
  renderNotificaciones();

  if (typeof renderSidebarCiudadano === 'function') {
    renderSidebarCiudadano('notificaciones');
  }
}

document.addEventListener('click', (e) => {
  const item = e.target.closest('.notif-item-dash');
  if (item) {
    marcarComoLeida(Number(item.dataset.id));
    return;
  }

  const tab = e.target.closest('.notif-tab-dash');
  if (tab) {
    document.querySelectorAll('.notif-tab-dash').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    filtroActual = tab.dataset.filtro;
    renderNotificaciones();
    return;
  }

  if (e.target.closest('#btnMarcarTodas')) {
    marcarTodasComoLeidas();
  }
});

// -------- Init --------
document.addEventListener('DOMContentLoaded', () => {
  renderSidebarCiudadano('notificaciones'); // definido en sidebar.js
  renderNotificaciones();
});