// js/policia/sidebar.js
// Sidebar único del rol Policía. Se inyecta en cada página
// (centro de operaciones, mis alertas, mis atenciones, mi unidad,
// alarmas, historial, mapas, notificaciones, mi perfil) para no
// repetir el HTML del <aside> en cada archivo.
//
// Uso en cada HTML:
//   <aside class="sidebar-dash" id="sidebarDash"></aside>
//   ...
//   <script src="../js/policia/sidebar.js"></script>
//   <script>renderSidebarPolicia('misalertas');</script>
//
// El string pasado a renderSidebarPolicia() debe coincidir con el
// "id" del item correspondiente en MENU_POLICIA, para que se le
// aplique la clase "active" automáticamente.
//
// El rol se pinta con body class="rol-policia" (ver css/temas.css).
// Requiere Bootstrap Icons cargado en el <head> del HTML.

const ICONOS_POLICIA = {
  logo: 'bi-shield-check',
  centrooperaciones: 'bi-house',
  misalertas: 'bi-exclamation-triangle',
  misatenciones: 'bi-check2-circle',
  miunidad: 'bi-people',
  alarmas: 'bi-megaphone',
  historial: 'bi-clock-history',
  mapas: 'bi-geo-alt',
  notificaciones: 'bi-bell',
  miperfil: 'bi-person-circle',
  logout: 'bi-box-arrow-right',
};

// Estructura del menú de Policía. Para agregar/quitar una opción,
// se edita SOLO este arreglo — no hay que tocar ningún HTML.
//
// "badge" es opcional y muestra un contador rojo junto al ítem
// (ej. cantidad de alertas nuevas sin aceptar). Se puede alimentar
// dinámicamente reemplazando el valor antes de llamar a render.
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
      { id: 'misalertas',    label: 'Mis Alertas',    href: '../Alertas/alertas.html', icon: ICONOS_POLICIA.misalertas},
      { id: 'misatenciones', label: 'Mis Atenciones', href: '../Atenciones/atenciones.html', icon: ICONOS_POLICIA.misatenciones },
      { id: 'miunidad',      label: 'Mi Unidad',      href: '../Unidad/unidad.html', icon: ICONOS_POLICIA.miunidad },
      { id: 'alarmas',       label: 'Alarmas',        href: '../Alarmas/alarmas.html', icon: ICONOS_POLICIA.alarmas },
      { id: 'mapas',         label: 'Mapas',          href: '../Mapas/mapas.html', icon: ICONOS_POLICIA.mapas },
    ],
  },
  {
    seccion: 'Cuenta',
    items: [
      { id: 'historial',      label: 'Historial',      href: '../Historial/historial.html', icon: ICONOS_POLICIA.historial },
      { id: 'notificaciones', label: 'Notificaciones', href: '../Notificaciones/notificaciones.html', icon: ICONOS_POLICIA.notificaciones },
      { id: 'miperfil',       label: 'Mi Perfil',      href: '../Perfil/perfil.html', icon: ICONOS_POLICIA.miperfil },
    ],
  },
];

/**
 * Inyecta el sidebar completo del rol Policía dentro de
 * <aside id="sidebarDash">, marcando como "active" el link
 * cuyo id coincida con paginaActiva.
 *
 * @param {string} paginaActiva - id del item activo, ej: 'misalertas', 'miunidad'
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
      <span class="brand-icon-dash brand-icon-dash--logo">
        <img src="../../../img/logopolicia.png" alt="Foto de perfil">
      </span>
      <span class="brand-text-dash">
        <span class="brand-name-dash">WolertApp</span>
        <span class="brand-role-dash">Policía</span>
      </span>
    </div>

    ${secciones}

    <div class="flex-grow-1"></div>

    <a href="#" class="logout-dash">
      <span class="ic-dash"><i class="bi ${ICONOS_POLICIA.logout}"></i></span>
      <span class="lbl-dash">Cerrar sesión</span>
    </a>
  `;
}