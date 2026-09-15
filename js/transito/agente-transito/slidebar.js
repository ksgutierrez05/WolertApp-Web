// js/transito/agente-transito/sidebar.js
// Inyecta el sidebar del rol Agente de Transito en cada página.
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
  perfil: 'bi bi-person',
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
    
    { id: 'grupo',    label: 'Mi grupo',    href: 'panel-grupo.html', icon: ICONOS_TRANSITO.casos },
    { id: 'historial',       label: 'Historial de casos',       href: 'panel-historial.html', icon: ICONOS_TRANSITO.catalogo },
     { id: 'perfil',       label: 'Perfil',       href: 'panel-perfil.html', icon: ICONOS_TRANSITO.perfil },
    { id: 'mapa',       label: 'Mapa',       href: 'panel-mapa.html', icon: ICONOS_TRANSITO.mapa },
  ]},
  { seccion: 'Gestión', items: [
    { id: 'reportes',      label: 'Reportes',      href: 'panel-reportes.html', icon: ICONOS_TRANSITO.reportes },
    { id: 'configuracion', label: 'Configuración', href: 'panel-configuracion.html', icon: ICONOS_TRANSITO.configuracion },
  ]},
];

// Ruta a la que se redirige al cerrar sesión: la página de landing
// (información), a la misma profundidad que usa LOGO_TRANSITO_PNG.
// Si el archivo principal de tu landing NO se llama "index.html",
// cambia "index.html" por el nombre real (ej: "landing.html").
const LANDING_URL_TRANSITO = '../../../landing/index.html';

/**
 * Cierra la sesión del usuario: limpia los datos guardados en el
 * navegador (token, usuario, rol, etc.) y redirige a la página de
 * landing (información). Ajusta las claves de storage según cómo
 * manejes la autenticación en el resto del proyecto.
 */
function cerrarSesionTransito(evento) {
  if (evento) evento.preventDefault();

  const confirmar = window.confirm('¿Seguro que deseas cerrar sesión?');
  if (!confirmar) return;

  try {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    sessionStorage.clear();
  } catch (e) {
    console.warn('cerrarSesionTransito: no se pudo limpiar el storage', e);
  }

  window.location.href = LANDING_URL_TRANSITO;
}

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
 
    <a href="#" id="logoutDash" class="logout-dash">
      <span class="ic-dash"><i class="bi ${ICONOS_TRANSITO.logout}"></i></span>
      <span class="lbl-dash">Cerrar sesión</span>
    </a>
  `;

  // Enlaza el evento de cierre de sesión al link recién inyectado.
  const logoutLink = document.getElementById('logoutDash');
  if (logoutLink) {
    logoutLink.addEventListener('click', cerrarSesionTransito);
  }
}