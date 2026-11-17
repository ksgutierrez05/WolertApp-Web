import { NavLink } from 'react-router-dom';
import { cerrarSesion } from '../../Utils/utils';

const menu = [
  { group: 'General', items: [{ label: 'Principal', href: '/ciudadano', icon: 'bi-house' }] },
  { group: 'Alertas', items: [
      { label: 'Alertas', href: '/ciudadano/alertas', icon: 'bi-broadcast' },
      { label: 'Mis Alertas', href: '/ciudadano/mis-alertas', icon: 'bi-exclamation-triangle' },
  ]},
  { group: 'Comunidad', items: [{ label: 'Vecinos', href: '/ciudadano/vecinos', icon: 'bi-people' }] },
  { group: 'Cuenta', items: [
      { label: 'Notificaciones', href: '/ciudadano/notificaciones', icon: 'bi-bell' },
      { label: 'Configuración', href: '/ciudadano/configuracion', icon: 'bi-gear' },
  ]},
];

export default function CiudadanoSidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark" style={{ background: '#1e293b', padding: '4px', borderRadius: '8px' }}>
          <img src="/img/logo.png" alt="WolertApp" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        </div>
        <span className="sidebar__brand-text">WolertApp</span>
      </div>
      {menu.map((sec) => (
        <div key={sec.group}>
          <li className="sidebar__group-label">{sec.group}</li>
          {sec.items.map((item) => (
            <NavLink key={item.label} to={item.href} end={item.label === 'Principal'} className={({ isActive }) => isActive ? 'sidebar__link active' : 'sidebar__link'}>
              <i className={`bi ${item.icon} sidebar__icon`} />
              <span className="sidebar__label">{item.label}</span>
            </NavLink>
          ))}
        </div>
      ))}

      <div className="sidebar__footer">
        <button type="button" className="sidebar__logout" onClick={() => { cerrarSesion(); window.location.href = '/login'; }}>
          <i className="bi bi-box-arrow-right sidebar__icon" />
          <span className="sidebar__label">Cerrar sesión</span>
        </button>
      </div>
    </nav>
  );
}