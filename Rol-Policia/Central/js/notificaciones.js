// js/central/notificaciones.js
// Lógica de la pantalla "Notificaciones" de Central de Radio.
// Cubre exactamente los tipos de notificación definidos para el rol:
// nueva alerta, alerta crítica, unidad aceptó, unidad en camino,
// unidad llegó, unidad sin respuesta, alerta reasignada, alerta
// resuelta, informe pendiente y caso pendiente de cierre.
//
// No agrega funcionalidad administrativa: solo lectura, filtrado
// y marcado de leído/no leído de notificaciones.

// ---------- catálogo de tipos: ícono + color + categoría ----------
const TIPOS_NOTIF = {
  nueva_alerta:          { icono: 'bi-exclamation-triangle-fill', color: 'red',   categoria: 'alertas',  etiqueta: 'Nueva alerta' },
  alerta_critica:        { icono: 'bi-exclamation-octagon-fill',  color: 'red',   categoria: 'alertas',  etiqueta: 'Alerta crítica' },
  alerta_reasignada:     { icono: 'bi-arrow-repeat',              color: 'blue',  categoria: 'alertas',  etiqueta: 'Alerta reasignada' },
  alerta_resuelta:       { icono: 'bi-check2-circle',             color: 'green', categoria: 'alertas',  etiqueta: 'Alerta resuelta' },
  unidad_acepto:         { icono: 'bi-person-check-fill',         color: 'blue',  categoria: 'unidades', etiqueta: 'Unidad aceptó' },
  unidad_en_camino:      { icono: 'bi-signpost-2-fill',           color: 'blue',  categoria: 'unidades', etiqueta: 'Unidad en camino' },
  unidad_llego:          { icono: 'bi-geo-alt-fill',               color: 'amber', categoria: 'unidades', etiqueta: 'Unidad en el sitio' },
  unidad_sin_respuesta:  { icono: 'bi-exclamation-circle-fill',   color: 'red',   categoria: 'unidades', etiqueta: 'Sin respuesta' },
  informe_pendiente:     { icono: 'bi-clipboard2-pulse-fill',     color: 'amber', categoria: 'informes', etiqueta: 'Informe pendiente' },
  caso_pendiente_cierre: { icono: 'bi-folder2-open',              color: 'amber', categoria: 'informes', etiqueta: 'Pendiente de cierre' },
};

// ---------- datos de ejemplo (vendrían del backend en producción) ----------
let notificaciones = [
  {
    id: 1,
    tipo: 'alerta_critica',
    titulo: 'Alerta crítica sin asignar',
    mensaje: 'Robo en curso reportado por ciudadano. Requiere asignación inmediata.',
    caso: 'WL-00125',
    hora: minutosAtras(2),
    leida: false,
  },
  {
    id: 2,
    tipo: 'unidad_sin_respuesta',
    titulo: 'La unidad no ha confirmado la atención',
    mensaje: 'Unidad U-02 lleva más de 5 minutos sin aceptar la asignación.',
    caso: 'WL-00124',
    hora: minutosAtras(6),
    leida: false,
  },
  {
    id: 3,
    tipo: 'unidad_en_camino',
    titulo: 'Unidad U-04 en camino',
    mensaje: 'La unidad inició el desplazamiento hacia el lugar reportado.',
    caso: 'WL-00120',
    hora: minutosAtras(14),
    leida: false,
  },
  {
    id: 4,
    tipo: 'unidad_llego',
    titulo: 'Unidad U-04 llegó al sitio',
    mensaje: 'La unidad confirmó su llegada al lugar del caso.',
    caso: 'WL-00120',
    hora: minutosAtras(20),
    leida: true,
  },
  {
    id: 5,
    tipo: 'alerta_resuelta',
    titulo: 'Alerta marcada como resuelta',
    mensaje: 'El patrullero reportó la situación como controlada.',
    caso: 'WL-00118',
    hora: minutosAtras(35),
    leida: true,
  },
  {
    id: 6,
    tipo: 'informe_pendiente',
    titulo: 'Informe pendiente de generar',
    mensaje: 'El caso fue resuelto y está listo para consolidar el informe final.',
    caso: 'WL-00118',
    hora: minutosAtras(37),
    leida: false,
  },
  {
    id: 7,
    tipo: 'caso_pendiente_cierre',
    titulo: 'Caso pendiente de cierre',
    mensaje: 'El informe fue generado y el caso está listo para cerrarse.',
    caso: 'WL-00115',
    hora: minutosAtras(58),
    leida: true,
  },
  {
    id: 8,
    tipo: 'alerta_reasignada',
    titulo: 'Alerta reasignada',
    mensaje: 'La unidad U-01 no estaba disponible; el caso fue reasignado a U-03.',
    caso: 'WL-00121',
    hora: minutosAtras(75),
    leida: true,
  },
  {
    id: 9,
    tipo: 'unidad_acepto',
    titulo: 'Unidad U-03 aceptó la asignación',
    mensaje: 'La unidad confirmó la recepción del caso.',
    caso: 'WL-00121',
    hora: minutosAtras(76),
    leida: true,
  },
  {
    id: 10,
    tipo: 'nueva_alerta',
    titulo: 'Nueva alerta recibida',
    mensaje: 'Ciudadano reportó una persona sospechosa cerca de un establecimiento.',
    caso: 'WL-00126',
    hora: minutosAtras(90),
    leida: true,
  },
];

let filtroActual = 'todas';

// ---------- utilidades ----------
function minutosAtras(min) {
  return new Date(Date.now() - min * 60000);
}

function tiempoRelativo(fecha) {
  const diffMs = Date.now() - fecha.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `Hace ${dias} d`;
}

function notificacionesFiltradas() {
  if (filtroActual === 'todas') return notificaciones;
  if (filtroActual === 'no-leidas') return notificaciones.filter(n => !n.leida);
  return notificaciones.filter(n => TIPOS_NOTIF[n.tipo].categoria === filtroActual);
}

// ---------- render ----------
function renderNotificaciones() {
  const contenedor = document.getElementById('listaNotificaciones');
  const vacio = document.getElementById('estadoVacio');
  const lista = notificacionesFiltradas().slice().sort((a, b) => b.hora - a.hora);

  if (lista.length === 0) {
    contenedor.innerHTML = '';
    vacio.classList.remove('d-none');
  } else {
    vacio.classList.add('d-none');
    contenedor.innerHTML = lista.map(renderItem).join('');
  }

  actualizarKpis();
  actualizarBadgeSidebar();
}

function renderItem(n) {
  const tipo = TIPOS_NOTIF[n.tipo];
  return `
    <div class="notif-item-dash ${n.leida ? 'leida' : 'no-leida'}" data-id="${n.id}">
      <span class="notif-dot-unread-dash"></span>
      <div class="notif-icon-dash notif-icon-${tipo.color}-dash">
        <i class="bi ${tipo.icono}"></i>
      </div>
      <div class="notif-body-dash">
        <div class="notif-top-row-dash">
          <span class="notif-title-dash">${n.titulo}</span>
          <span class="notif-time-dash">${tiempoRelativo(n.hora)}</span>
        </div>
        <p class="notif-msg-dash">${n.mensaje}</p>
        <div class="notif-meta-row-dash">
          ${n.caso ? `<span class="notif-caso-chip-dash">Caso #${n.caso}</span>` : ''}
          ${n.caso ? `<a href="#" class="notif-link-dash" data-ver-caso="${n.caso}">Ver caso</a>` : ''}
          ${!n.leida ? `<button class="notif-mark-dash" data-marcar="${n.id}" type="button">Marcar como leída</button>` : ''}
        </div>
      </div>
    </div>
  `;
}

function actualizarKpis() {
  const hoy = new Date();
  const esHoy = f => f.toDateString() === hoy.toDateString();

  document.getElementById('kpiTotal').textContent = notificaciones.length;
  document.getElementById('kpiNoLeidas').textContent = notificaciones.filter(n => !n.leida).length;
  document.getElementById('kpiUrgentes').textContent = notificaciones.filter(
    n => !n.leida && ['alerta_critica', 'unidad_sin_respuesta', 'informe_pendiente', 'caso_pendiente_cierre'].includes(n.tipo)
  ).length;
  document.getElementById('kpiResueltas').textContent = notificaciones.filter(
    n => n.tipo === 'alerta_resuelta' && esHoy(n.hora)
  ).length;
}

// Reutiliza el sidebar ya inyectado por sidebar.js y solo actualiza
// el contador de "Notificaciones" definido en MENU_CENTRAL, sin
// tocar ninguna otra parte del menú.
function actualizarBadgeSidebar() {
  if (typeof MENU_CENTRAL === 'undefined' || typeof renderSidebarCentral !== 'function') return;
  const noLeidas = notificaciones.filter(n => !n.leida).length;

  for (const seccion of MENU_CENTRAL) {
    const item = seccion.items.find(i => i.id === 'notificaciones');
    if (item) item.badge = noLeidas > 0 ? noLeidas : null;
  }

  renderSidebarCentral('notificaciones');
}

// ---------- interacciones ----------
function marcarComoLeida(id) {
  const n = notificaciones.find(n => n.id === id);
  if (n) n.leida = true;
  renderNotificaciones();
}

function marcarTodasComoLeidas() {
  notificaciones.forEach(n => (n.leida = true));
  renderNotificaciones();
}

document.addEventListener('DOMContentLoaded', () => {
  renderNotificaciones();

  document.getElementById('notifTabs').addEventListener('click', e => {
    const btn = e.target.closest('.notif-tab-dash');
    if (!btn) return;
    document.querySelectorAll('.notif-tab-dash').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroActual = btn.dataset.filtro;
    renderNotificaciones();
  });

  document.getElementById('btnMarcarTodas').addEventListener('click', marcarTodasComoLeidas);

  document.getElementById('listaNotificaciones').addEventListener('click', e => {
    const marcar = e.target.closest('[data-marcar]');
    if (marcar) {
      marcarComoLeida(Number(marcar.dataset.marcar));
      return;
    }
    const verCaso = e.target.closest('[data-ver-caso]');
    if (verCaso) {
      e.preventDefault();
      // Al integrarse con el módulo de Alertas/Historial, esto debe
      // redirigir al detalle del caso correspondiente.
      window.location.href = `../Alertas/alertas.html?caso=${verCaso.dataset.verCaso}`;
    }
  });
});