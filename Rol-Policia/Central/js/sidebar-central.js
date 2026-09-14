// js/central/sidebar.js
// Sidebar único del rol Central de Radio. Se inyecta en cada página
// (centro de operaciones, alertas, asignación, unidad, mapa operativo,
// informes, historial, notificaciones, mi perfil, configuración) para
// no repetir el HTML del <aside> en cada archivo.
//
// Uso en cada HTML:
//   <aside class="sidebar-dash" id="sidebarDash"></aside>
//   ...
//   <script src="../js/central/sidebar.js"></script>
//   <script>renderSidebarCentral('centrooperaciones');</script>
//
// El string pasado a renderSidebarCentral() debe coincidir con el
// "id" del item correspondiente en MENU_CENTRAL, para que se le
// aplique la clase "active" automáticamente.
//
// El rol se pinta con body class="rol-policia" (ver css/temas.css).
// Requiere Bootstrap Icons cargado en el <head> del HTML.

const ICONOS_CENTRAL = {
  logo: 'bi-broadcast',
  centrooperaciones: 'bi-house',
  alertas: 'bi-exclamation-triangle',
  asignacion: 'bi-broadcast-pin',
  unidad: 'bi-people',
  mapaoperativo: 'bi-geo-alt',
  informes: 'bi-clipboard-check',
  historial: 'bi-clock-history',
  notificaciones: 'bi-bell',
  configuracion: 'bi-gear',
  logout: 'bi-box-arrow-right',
};

// Estructura del menú de Central de Radio. Para agregar/quitar una
// opción, se edita SOLO este arreglo — no hay que tocar ningún HTML.
//
// "badge" es opcional y muestra un contador rojo junto al ítem
// (ej. cantidad de alertas nuevas o informes pendientes). Se puede
// alimentar dinámicamente reemplazando el valor antes de llamar a render.
const MENU_CENTRAL = [
  {
    seccion: 'General',
    items: [
      { id: 'centrooperaciones', label: 'Centro de Operaciones', href: '../centro-operaciones/centro-operaciones.html', icon: ICONOS_CENTRAL.centrooperaciones },
    ],
  },
  {
    seccion: 'Operación',
    items: [
      { id: 'alertas',       label: 'Alertas',        href: '../Alertas/alertas.html', icon: ICONOS_CENTRAL.alertas, badge: null },
      { id: 'asignacion',    label: 'Asignación',     href: '../Asignaciones/asignaciones.html', icon: ICONOS_CENTRAL.asignacion },
      { id: 'unidad',        label: 'Unidad',         href: '../Unidad/unidad.html', icon: ICONOS_CENTRAL.unidad },
      { id: 'mapaoperativo', label: 'Mapa Operativo', href: '../Mapas/mapas.html', icon: ICONOS_CENTRAL.mapaoperativo },
      { id: 'reportes',      label: 'Reportes',       href: '../Informe/reportes.html', icon: ICONOS_CENTRAL.informes, badge: null },
    ],
  },
  {
    seccion: 'Cuenta',
    items: [
      { id: 'historial',      label: 'Historial',      href: '../Historial/historial.html', icon: ICONOS_CENTRAL.historial },
      { id: 'notificaciones', label: 'Notificaciones', href: '../Notificaciones/notificaciones.html', icon: ICONOS_CENTRAL.notificaciones, badge: null },
      { id: 'configuracion',  label: 'Configuración',  href: '../Configuracion/configuracion.html', icon: ICONOS_CENTRAL.configuracion },
    ],
  },
];

/**
 * Inyecta el sidebar completo del rol Central de Radio dentro de
 * <aside id="sidebarDash">, marcando como "active" el link
 * cuyo id coincida con paginaActiva.
 *
 * @param {string} paginaActiva - id del item activo, ej: 'alertas', 'unidad'
 */
function renderSidebarCentral(paginaActiva) {
  const el = document.getElementById('sidebarDash');
  if (!el) {
    console.warn('renderSidebarCentral: no se encontró #sidebarDash en el DOM');
    return;
  }

  const secciones = MENU_CENTRAL.map(sec => `
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
      <span class="brand-icon-dash">
        <i class="bi ${ICONOS_CENTRAL.logo}"></i>
      </span>
      <span class="brand-text-dash">
        <span class="brand-name-dash">WolertApp</span>
        <span class="brand-role-dash">Central de Radio</span>
      </span>
    </div>

    ${secciones}

    <div class="flex-grow-1"></div>

    <a href="#" class="logout-dash">
      <span class="ic-dash"><i class="bi ${ICONOS_CENTRAL.logout}"></i></span>
      <span class="lbl-dash">Cerrar sesión</span>
    </a>
  `;
}