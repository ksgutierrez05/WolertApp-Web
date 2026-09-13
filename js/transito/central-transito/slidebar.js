// js/transito/central-transito/slidebar.js
// Inyecta el sidebar del rol Central de Despacho en cada página.
// Uso: <aside id="sidebarDash"></aside> + renderSidebarTransito('panel')
// El id pasado debe coincidir con un "id" de MENU_TRANSITO.

const LOGO_TRANSITO_PNG ='../../../img/secretaria transito.png';

const ICONOS_TRANSITO = {
  logo: 'bi-shield-check',
  panel: 'bi-house',
  agentes: 'bi bi-briefcase',
  casos: 'bi-file-earmark-text',
  mapa: 'bi-geo-alt',
  catalogo: 'bi-book',
  reportes: 'bi-bar-chart-line',
  usuarios: 'bi-people',
  configuracion: 'bi-gear',
  logout: 'bi-box-arrow-left',
};

// Solo panel-director.html existe por ahora; el resto queda en "#"
// hasta crear cada página (reemplazar por el archivo real cuando exista).
const MENU_TRANSITO = [
  { seccion: 'General', items: [
    { id: 'panel', label: 'Principal', href: 'panel-principal.html', icon: ICONOS_TRANSITO.panel },
  ]},
  { seccion: 'Operación', items: [
    
    { id: 'asignar',    label: 'Casos sin asignar',    href: 'panel-casos.html', icon: ICONOS_TRANSITO.casos },
    { id: 'mapa',       label: 'Mapa',       href: 'panel-mapa.html', icon: ICONOS_TRANSITO.mapa },
    { id: 'agentes',      label: 'Agentes',      href: 'panel-agentes.html', icon: ICONOS_TRANSITO.agentes },
    { id: 'historial',       label: 'Historial de casos',       href: 'panel-catalogo.html', icon: ICONOS_TRANSITO.catalogo },
  ]},
  { seccion: 'Gestión', items: [
    { id: 'reportes',      label: 'Reportes',      href: 'panel-reportes.html', icon: ICONOS_TRANSITO.reportes },
    { id: 'configuracion', label: 'Configuración', href: 'panel-configuracion.html', icon: ICONOS_TRANSITO.configuracion },
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
      <span class="brand-icon-dash">
        <img src="${LOGO_TRANSITO_PNG}" alt="Logo Tránsito" class="brand-logo-img-dash">
      </span>
       <span class="brand-name-dash">
        <span class="d-block">Secretaria de</span>
        <span class="d-block">Tránsito</span>
      </span>
    </div>
 
    ${secciones}
 
    <div class="flex-grow-1"></div>
 
    <a href="#" class="logout-dash">
      <span class="ic-dash"><i class="bi ${ICONOS_TRANSITO.logout}"></i></span>
      <span class="lbl-dash">Cerrar sesión</span>
    </a>
  `;
}
 