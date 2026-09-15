const ICONOS_CIUDADANO = {
  logo: 'bi-shield-check',
  principal: 'bi-house',
  alertas: 'bi-broadcast',
  misalertas: 'bi-exclamation-triangle',
  vecinos: 'bi-people',
  notificaciones: 'bi-bell',
  configuracion: 'bi-gear',
  logout: 'bi-box-arrow-right',
};

const MENU_CIUDADANO = [
  {
    seccion: 'General',
    items: [
      { id: 'principal', label: 'Principal', href: '../ciudadano/pagina-principal.html', icon: ICONOS_CIUDADANO.principal },
    ],
  },
  {
    seccion: 'Alertas',
    items: [
      { id: 'alertas', label: 'Alertas', href: '../ciudadano/panel-alertas.html', icon: ICONOS_CIUDADANO.alertas },
      { id: 'misalertas', label: 'Mis Alertas', href: '../ciudadano/panel-mis-alertas.html', icon: ICONOS_CIUDADANO.misalertas },
    ],
  },
  {
    seccion: 'Comunidad',
    items: [
      { id: 'vecinos', label: 'Vecinos', href: '../ciudadano/panel-vecinos.html', icon: ICONOS_CIUDADANO.vecinos },
    ],
  },
  {
    seccion: 'Cuenta',
    items: [
      { id: 'notificaciones', label: 'Notificaciones', href: '../ciudadano/panel-notificaciones.html', icon: ICONOS_CIUDADANO.notificaciones },
      { id: 'configuracion', label: 'Configuración', href: '../ciudadano/panel-configuracion.html', icon: ICONOS_CIUDADANO.configuracion },
    ],
  },
];


const SIDEBAR_NOTIF_STORAGE_KEY = 'wolertapp_notificaciones_ciudadano';

function obtenerNoLeidasSidebar() {
  try {
    const raw = localStorage.getItem(SIDEBAR_NOTIF_STORAGE_KEY);
    if (!raw) return 0;
    const lista = JSON.parse(raw);
    return lista.filter(n => !n.leida).length;
  } catch (e) {
    console.error('Error leyendo notificaciones para el sidebar:', e);
    return 0;
  }
}

// Ruta a la que se redirige al cerrar sesión: la página de landing
// (información). Usa la misma profundidad que ya usa este sidebar
// para el logo (../img/...), es decir un nivel arriba de la carpeta
// de páginas del ciudadano. Si el archivo principal de tu landing
// NO se llama "index.html", cambia "index.html" por el nombre real.
const LANDING_URL_CIUDADANO = '../landing/index.html';

/**
 * Cierra la sesión del usuario: limpia los datos guardados en el
 * navegador (token, usuario, rol, notificaciones, etc.) y redirige
 * a la página de landing (información). Ajusta las claves de storage
 * según cómo manejes la autenticación en el resto del proyecto.
 */
function cerrarSesionCiudadano(evento) {
  if (evento) evento.preventDefault();

  const confirmar = window.confirm('¿Seguro que deseas cerrar sesión?');
  if (!confirmar) return;

  try {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    sessionStorage.clear();
  } catch (e) {
    console.warn('cerrarSesionCiudadano: no se pudo limpiar el storage', e);
  }

  window.location.href = LANDING_URL_CIUDADANO;
}

/**
 * Inyecta el sidebar completo del rol Ciudadano dentro de
 * <aside id="sidebarDash">, marcando como "active" el link
 * cuyo id coincida con paginaActiva.
 *
 * @param {string} paginaActiva - id del item activo, ej: 'notificaciones', 'vecinos'
 */
function renderSidebarCiudadano(paginaActiva) {
  const el = document.getElementById('sidebarDash');
  if (!el) {
    console.warn('renderSidebarCiudadano: no se encontró #sidebarDash en el DOM');
    return;
  }

  const noLeidas = obtenerNoLeidasSidebar();

  const secciones = MENU_CIUDADANO.map(sec => `
    <p class="glabel-dash">${sec.seccion}</p>
    <nav class="nav flex-column menu-dash">
      ${sec.items.map(item => `
        <a href="${item.href}" class="${item.id === paginaActiva ? 'active' : ''}">
          <span class="ic-dash"><i class="bi ${item.icon}"></i></span>
          <span class="lbl-dash">${item.label}</span>
          ${item.id === 'notificaciones' && noLeidas > 0 ? `<span class="nav-badge-dash">${noLeidas}</span>` : ''}
        </a>
      `).join('')}
    </nav>
  `).join('');

  el.innerHTML = `
    <div class="d-flex align-items-center brand-dash">
  <span class="brand-icon-dash">
    <img src="../img/LogoWolertAPP.png" alt="WolertApp" class="logo-img-dash">
  </span>
  <span class="brand-text-dash">
    <span class="brand-name-dash">WolertApp</span>
    <span class="brand-role-dash">Ciudadano</span>
  </span>
</div>
    ${secciones}

    <div class="flex-grow-1"></div>

    <a href="#" id="logoutDash" class="logout-dash">
      <span class="ic-dash"><i class="bi ${ICONOS_CIUDADANO.logout}"></i></span>
      <span class="lbl-dash">Cerrar sesión</span>
    </a>
  `;

  // Enlaza el evento de cierre de sesión al link recién inyectado.
  const logoutLink = document.getElementById('logoutDash');
  if (logoutLink) {
    logoutLink.addEventListener('click', cerrarSesionCiudadano);
  }
}