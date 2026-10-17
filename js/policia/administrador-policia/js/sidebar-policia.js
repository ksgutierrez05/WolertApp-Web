

const ICONOS_POLICIA = {
  logo: 'bi-shield-check',
  centrooperaciones: 'bi-house',
  alertas: 'bi-exclamation-triangle',
  alarmas: 'bi-megaphone',
  tiposalertas: 'bi-list-check',
  policias: 'bi-person-badge',
  unidades: 'bi-car-front',
  historial: 'bi-clock-history',
  estadisticas: 'bi-bar-chart-line',
  reportes: 'bi-file-earmark-bar-graph',
  notificaciones: 'bi-bell',
  configuracion: 'bi-sliders',
  logout: 'bi-box-arrow-right',
};

const MENU_POLICIA = [
  {
    seccion: 'General',
    items: [
      { id: 'centrooperaciones', label: 'Centro de Operaciones', href: '../centro-operaciones/centro-operaciones.html', icon: ICONOS_POLICIA.centrooperaciones },
    ],
  },
  {
    seccion: 'Operación',
    items: [
      { id: 'alertas',      label: 'Alertas',      href: '../Alertas/alertas.html', icon: ICONOS_POLICIA.alertas },
      { id: 'alarmas',      label: 'Alarmas',      href: '../Alarmas/alarmas.html', icon: ICONOS_POLICIA.alarmas },
      {id:  'tiposalertas', label: 'Tipos de Alertas', href: '../tipos-alertas/tipos-alertas.html', icon: ICONOS_POLICIA.tiposalertas},
      { id: 'unidades',     label: 'Unidades',     href: '../Unidades/unidades.html', icon: ICONOS_POLICIA.unidades },
      { id: 'policias',     label: 'Policías',     href: '../Policias/policias.html', icon: ICONOS_POLICIA.policias },
    ],
  },
  {
    seccion: 'Gestión',
    items: [
      { id: 'historial',      label: 'Historial',      href: '../Historial/historial.html', icon: ICONOS_POLICIA.historial },
      { id: 'estadisticas',   label: 'Estadísticas',   href: '../Estadisticas/estadisticas.html', icon: ICONOS_POLICIA.estadisticas },
      { id: 'reportes',       label: 'Reportes',       href: '../Reportes/reportes.html', icon: ICONOS_POLICIA.reportes },
      { id: 'notificaciones', label: 'Notificaciones', href: '../Notificaciones/notificaciones.html', icon: ICONOS_POLICIA.notificaciones },
      { id: 'configuracion',  label: 'Configuración',  href: '../Configuracion/configuracion.html', icon: ICONOS_POLICIA.configuracion },
    ],
  },
];

function cerrarSesionPolicia(evento) {
  if (evento) evento.preventDefault();

  const confirmar = window.confirm('¿Seguro que deseas cerrar sesión?');
  if (!confirmar) return;

  try {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    sessionStorage.clear();
  } catch (e) {
    console.warn('cerrarSesionPolicia: no se pudo limpiar el storage', e);
  }

  window.location.href = LANDING_URL_POLICIA;
}

/**
 * Inyecta el sidebar completo del rol Policía dentro de
 * <aside id="sidebarDash">, marcando como "active" el link
 * cuyo id coincida con paginaActiva.
 *
 * @param {string} paginaActiva - id del item activo, ej: 'centrooperaciones', 'alarmas'
 */
function renderSidebarPolicia(paginaActiva) {
  const el = document.getElementById('sidebarDash');
  if (!el) {
    console.warn('renderSidebarPolicia: no se encontró #sidebarDash en el DOM');
    return;
  }

  const secciones = MENU_POLICIA.map(sec => `
    <p class="glabel-dash">${sec.seccion}</p>
    <nav class="nav flex-column menu-dash">
      ${sec.items.map(item => `
        <a href="${item.href}" class="${item.id === paginaActiva ? 'active' : ''}">
          <span class="ic-dash"><i class="bi ${item.icon}"></i></span>
          <span class="lbl-dash">${item.label}</span>
          ${item.badge ? `<span class="nav-badge-dash">${item.badge}</span>` : ''}
        </a>
      `).join('')}
    </nav>
  `).join('');

  el.innerHTML = `
    <div class="d-flex align-items-center brand-dash">
  <span class="brand-icon-dash brand-icon-dash--logo"><img src="../../../img/logopolicia.png" alt="Policía Nacional"></span>
  <span class="brand-text-dash">
    <span class="brand-name-dash">WolertApp</span>
    <span class="brand-role-dash">Administrador Policía</span>
  </span>
</div>

    ${secciones}

    <div class="flex-grow-1"></div>

    <a href="#" id="logoutDash" class="logout-dash">
      <span class="ic-dash"><i class="bi ${ICONOS_POLICIA.logout}"></i></span>
      <span class="lbl-dash">Cerrar sesión</span>
    </a>
  `;

  // Enlaza el evento de cierre de sesión al link recién inyectado.
  const logoutLink = document.getElementById('logoutDash');
  if (logoutLink) {
    logoutLink.addEventListener('click', cerrarSesionPolicia);
  }
}