// js/policia/sidebar.js
// Sidebar único del rol Policía. Se inyecta en cada página
// (centro de operaciones, alertas, alarmas, asignaciones, policías,
// unidades, historial, estadísticas, reportes, notificaciones) para
// no repetir el HTML del <aside> en cada archivo.
//
// Uso en cada HTML:
//   <aside class="sidebar-dash" id="sidebarDash"></aside>
//   ...
//   <script src="js/policia/sidebar.js"></script>
//   <script>renderSidebarPolicia('centrooperaciones');</script>
//
// El string pasado a renderSidebarPolicia() debe coincidir con el
// "id" del item correspondiente en MENU_POLICIA, para que se le
// aplique la clase "active" automáticamente.

// Íconos con Bootstrap Icons (la misma librería que ya usas en la
// topbar: bi-bell, bi-search). Requiere que el HTML tenga cargado:

const ICONOS_POLICIA = {
  logo: 'bi-shield-check',
  centrooperaciones: 'bi-house',
  alertas: 'bi-bell',
  alarmas: 'bi-megaphone',
  asignaciones: 'bi-clipboard-check',
  policias: 'bi-people',
  unidades: 'bi-car-front',
  historial: 'bi-clock-history',
  estadisticas: 'bi-bar-chart',
  reportes: 'bi-file-earmark-text',
  notificaciones: 'bi-bell-fill',
  configuracion: 'bi-gear',
  logout: 'bi-box-arrow-left',
};

// Estructura del menú de Policía. Para agregar/quitar una opción,
// se edita SOLO este arreglo — no hay que tocar ningún HTML.
//
// NOTA: por ahora solo existe CentroOperaciones/index.html. El resto
// de los href quedan en "#" para no generar links rotos. A medida
// que vayas creando cada página, reemplaza el "#" correspondiente
// por su ruta real, ej: href: '../Alarmas/index.html'.
const MENU_POLICIA = [
  {
    seccion: 'General',
    items: [
      { id: 'centrooperaciones', label: 'Centro de Operaciones', href: '../CentroOperaciones/index.html', icon: ICONOS_POLICIA.centrooperaciones },
    ],
  },
  {
    seccion: 'Operación',
    items: [
      { id: 'alertas',      label: 'Alertas',      href: '../Alertas/alertas.html', icon: ICONOS_POLICIA.alertas },
      { id: 'alarmas',      label: 'Alarmas',      href: '../Alarmas/alarmas.html', icon: ICONOS_POLICIA.alarmas },
      { id: 'asignaciones', label: 'Asignaciones', href: '#', icon: ICONOS_POLICIA.asignaciones },
      { id: 'unidades',     label: 'Unidades',     href: '#', icon: ICONOS_POLICIA.unidades },
      { id: 'policias',     label: 'Policías',     href: '#', icon: ICONOS_POLICIA.policias },
    ],
  },
  {
    seccion: 'Gestión',
    items: [
      { id: 'historial',      label: 'Historial',      href: '#', icon: ICONOS_POLICIA.historial },
      { id: 'estadisticas',   label: 'Estadísticas',   href: '#', icon: ICONOS_POLICIA.estadisticas },
      { id: 'reportes',       label: 'Reportes',       href: '#', icon: ICONOS_POLICIA.reportes },
      { id: 'notificaciones', label: 'Notificaciones', href: '#', icon: ICONOS_POLICIA.notificaciones, badge: 3 },
      { id: 'configuracion',  label: 'Configuración',  href: '#', icon: ICONOS_POLICIA.configuracion },
    ],
  },
];

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
      <span class="brand-icon-dash"><img src="../../../img/LogoWolertAPP.png" alt="WolertApp" style="width:100%;height:100%;object-fit:contain;border-radius:inherit;"></span>
      <span class="brand-name-dash">WolertApp</span>
    </div>

    ${secciones}

    <div class="flex-grow-1"></div>

    <a href="#" class="logout-dash">
      <span class="ic-dash"><i class="bi ${ICONOS_POLICIA.logout}"></i></span>
      <span class="lbl-dash">Cerrar sesión</span>
    </a>
  `;
}