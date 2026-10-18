import { NavLink, useLocation } from 'react-router-dom';

const menuItems = [
  { group: 'General' },
  { label: 'Dashboard', href: '/admin', icon: 'bi-speedometer2', exact: true },
  { label: 'Usuarios', href: '/admin/usuarios', icon: 'bi-people' },
  { label: 'Alertas', href: '/admin/alertas', icon: 'bi-bell' },
  { label: 'Alarmas', href: '/admin/alarmas', icon: 'bi-megaphone' },
  { group: 'Ubicaciones' },
  { label: 'Comunas', href: '/admin/comunas', icon: 'bi-geo-alt' },
  { label: 'Barrios', href: '/admin/barrios', icon: 'bi-house' },
  { label: 'Tipos', href: '/admin/tipos', icon: 'bi-list-ul' },
  { group: 'Sistema' },
  { label: 'Notificaciones', href: '/admin/notificaciones', icon: 'bi-bell-slash' },
  { label: 'Reportes', href: '/admin/reportes', icon: 'bi-file-earmark-text' },
  { label: 'Estadísticas', href: '/admin/estadisticas', icon: 'bi-graph-up' },
  { label: 'Configuración', href: '/admin/configuracion', icon: 'bi-gear' },
];

export default function Sidebar({ collapsed = false }) {
  const { pathname } = useLocation();

  return (
    <nav className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark" style={{ background: 'transparent', padding: 0 }}>
          <img src="/img/logo.png" alt="WolertApp" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        </div>
        <span className="sidebar__brand-text">WolertApp</span>
      </div>

      <div className="sidebar__user">
        <div className="sidebar__user-avatar">
          <i className="bi bi-person-circle" />
        </div>
        <div className="sidebar__user-info">
          <div className="sidebar__user-name">Administrador</div>
          <div className="sidebar__user-role">rol-admin</div>
        </div>
      </div>

      <ul className="sidebar__menu">
        {menuItems.map((item, idx) => {
          if (item.group) {
            return (
              <li key={`group-${idx}`} className="sidebar__group-label">{item.group}</li>
            );
          }
          return (
            <li key={item.label} className="sidebar__item">
              <NavLink
                to={item.href}
                end={item.exact}
                className={({ isActive }) => (isActive ? 'sidebar__link active' : 'sidebar__link')}
              >
                <i className={`bi ${item.icon} sidebar__icon`} />
                <span className="sidebar__label">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="sidebar__footer">
        <button type="button" className="sidebar__logout" onClick={() => { /* TODO: logout */ }}>
          <i className="bi bi-box-arrow-right sidebar__icon" />
          <span className="sidebar__label">Cerrar sesión</span>
        </button>
      </div>
    </nav>
  );
}