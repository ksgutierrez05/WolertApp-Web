// js/transito/sidebar.js
// Inyecta el sidebar del rol Tránsito en cada página.
// Uso: <aside id="sidebarDash"></aside> + renderSidebarTransito('panel')
// El id pasado debe coincidir con un "id" de MENU_TRANSITO.

const ICONOS_TRANSITO = {
  logo: 'bi-shield-check',
  panel: 'bi-house',
  accidentes: 'bi-cone-striped',
  agentes: 'bi-person-badge',
  casos: 'bi-file-earmark-text',
  mapa: 'bi-geo-alt',
  reportes: 'bi-bar-chart',
  usuarios: 'bi-people',
  configuracion: 'bi-gear',
  logout: 'bi-box-arrow-left',
};

// Solo panel-director.html existe por ahora; el resto queda en "#"
// hasta crear cada página (reemplazar por el archivo real cuando exista).
const MENU_TRANSITO = [
  { seccion: 'General', items: [
    { id: 'panel', label: 'Panel', href: 'panel-director.html', icon: ICONOS_TRANSITO.panel },
  ]},
  { seccion: 'Operación', items: [
    { id: 'accidentes', label: 'Accidentes', href: '#', icon: ICONOS_TRANSITO.accidentes },
    { id: 'agentes',    label: 'Agentes',    href: '#', icon: ICONOS_TRANSITO.agentes },
    { id: 'casos',      label: 'Casos',      href: '#', icon: ICONOS_TRANSITO.casos },
    { id: 'mapa',       label: 'Mapa',       href: '#', icon: ICONOS_TRANSITO.mapa },
  ]},
  { seccion: 'Gestión', items: [
    { id: 'reportes',      label: 'Reportes',      href: '#', icon: ICONOS_TRANSITO.reportes },
    { id: 'usuarios',      label: 'Usuarios',      href: '#', icon: ICONOS_TRANSITO.usuarios },
    { id: 'configuracion', label: 'Configuración', href: '#', icon: ICONOS_TRANSITO.configuracion },
  ]},
];

function renderSidebarTransito(paginaActiva) {
  const el = document.getElementById('sidebarDash');
  if (!el) return;

  const secciones = MENU_TRANSITO.map(sec => `
    <p class="glabel-dash">${sec.seccion}</p>
    <nav class="nav flex-column menu-dash">
      ${sec.items.map(item => `
        <a href="${item.href}" class="${item.id === paginaActiva ? 'active' : ''}">
          <span class="ic-dash"><i class="bi ${item.icon}"></i></span>
          <span class="lbl-dash">${item.label}</span>
        </a>
      `).join('')}
    </nav>
  `).join('');

  el.innerHTML = `
    <div class="d-flex align-items-center brand-dash">
      <span class="brand-icon-dash"><i class="bi ${ICONOS_TRANSITO.logo}"></i></span>
      <span class="brand-name-dash">WolertApp</span>
    </div>

    ${secciones}

    <div class="flex-grow-1"></div>

    <a href="#" class="logout-dash">
      <span class="ic-dash"><i class="bi ${ICONOS_TRANSITO.logout}"></i></span>
      <span class="lbl-dash">Cerrar sesión</span>
    </a>
  `;
}