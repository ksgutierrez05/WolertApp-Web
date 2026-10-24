
import { NavLink, useNavigate } from 'react-router-dom';

const RAIZ = '/Central-Policia';

const MENU_CENTRAL = [
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
      { id: 'alertas', label: 'Alertas', to: `${RAIZ}/Alertas`, icon: 'bi-exclamation-triangle' },
      { id: 'asignaciones', label: 'Asignaciones', to: `${RAIZ}/Asignaciones`, icon: 'bi-diagram-3' },
      { id: 'mapa', label: 'Mapa operativo', to: `${RAIZ}/Mapa`, icon: 'bi-geo-alt' },
      { id: 'unidades', label: 'Unidades', to: `${RAIZ}/Unidades`, icon: 'bi-car-front' },
    ],
  },
  {
    seccion: 'Gestión',
    items: [
      { id: 'historial', label: 'Historial', to: `${RAIZ}/Historial`, icon: 'bi-clock-history' },
      { id: 'reportes', label: 'Informes', to: `${RAIZ}/Reportes`, icon: 'bi-file-earmark-bar-graph' },
      { id: 'notificaciones', label: 'Notificaciones', to: `${RAIZ}/Notificaciones`, icon: 'bi-bell' },
      { id: 'configuracion', label: 'Configuración', to: `${RAIZ}/Configuracion`, icon: 'bi-sliders' },
    ],
  },
];

function Sidebar() {
  const navigate = useNavigate();

  function cerrarSesion(evento) {
    evento.preventDefault();

    if (window.confirm('¿Seguro que deseas cerrar sesión?')) {
      navigate('/');
    }
  }

  return (
    <aside className="sidebar-dash" id="sidebarDash">
      <div className="d-flex align-items-center brand-dash">
        <span className="brand-icon-dash brand-icon-dash--logo">
          <img src="/img/logopolicia.png" alt="Policía Nacional" />
        </span>

        <span className="brand-text-dash">
          <span className="brand-name-dash">WolertApp</span>
          <span className="brand-role-dash">Central de Radio</span>
        </span>
      </div>

      {MENU_CENTRAL.map((seccion) => (
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
