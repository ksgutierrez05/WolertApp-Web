import { NavLink, useNavigate } from 'react-router-dom';

const RAIZ = '/Patrullero';

const MENU_PATRULLERO = [
  {
    seccion: 'General',
    items: [
      {
        id: 'centro',
        label: 'Centro de operaciones',
        to: RAIZ,
        end: true,
        icon: 'bi-house',
      },
    ],
  },
  {
    seccion: 'Operación',
    items: [
      { id: 'alertas', label: 'Mis alertas', to: `${RAIZ}/Alertas`, icon: 'bi-exclamation-triangle' },
      { id: 'asignaciones', label: 'Mis asignaciones', to: `${RAIZ}/Asignaciones`, icon: 'bi-clipboard-check' },
      { id: 'unidad', label: 'Mi unidad', to: `${RAIZ}/Unidad`, icon: 'bi-people' },
    ],
  },
  {
    seccion: 'Cuenta',
    items: [
      { id: 'notificaciones', label: 'Notificaciones', to: `${RAIZ}/Notificaciones`, icon: 'bi-bell' },
      { id: 'configuracion', label: 'Configuración', to: `${RAIZ}/Configuracion`, icon: 'bi-sliders' },
    ],
  },
];

function Sidebar() {
  const navigate = useNavigate();

  function cerrarSesion(evento) {
    evento.preventDefault();

    if (!window.confirm('¿Seguro que deseas cerrar sesión?')) return;

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('rol');
      sessionStorage.clear();
    } catch (error) {
      console.warn('No se pudo limpiar el almacenamiento', error);
    }

    navigate('/');
  }

  return (
    <aside className="sidebar-dash" id="sidebarDash">
      <div className="d-flex align-items-center brand-dash">
        <span className="brand-icon-dash brand-icon-dash--logo">
          <img src="/img/logopolicia.png" alt="Policía Nacional" />
        </span>

        <span className="brand-text-dash">
          <span className="brand-name-dash">WolertApp</span>
          <span className="brand-role-dash">Patrullero</span>
        </span>
      </div>

      {MENU_PATRULLERO.map((seccion) => (
        <div key={seccion.seccion}>
          <p className="glabel-dash">{seccion.seccion}</p>

          <nav className="nav flex-column menu-dash">
            {seccion.items.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.end}
                title={item.label}
              >
                <span className="ic-dash">
                  <i className={`bi ${item.icon}`} aria-hidden="true" />
                </span>

                <span className="lbl-dash">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      ))}

      <div className="flex-grow-1" />

      <a
        href="/"
        id="logoutDash"
        className="logout-dash"
        onClick={cerrarSesion}
      >
        <span className="ic-dash">
          <i className="bi bi-box-arrow-right" aria-hidden="true" />
        </span>
        <span className="lbl-dash">Cerrar sesión</span>
      </a>
    </aside>
  );
}

export default Sidebar;