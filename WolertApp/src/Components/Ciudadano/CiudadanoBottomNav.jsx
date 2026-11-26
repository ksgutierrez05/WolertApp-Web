import { NavLink, useLocation } from 'react-router-dom';

const items = [
  { label: 'Principal', to: '/ciudadano', icon: 'bi-house' },
  { label: 'Alertas', to: '/ciudadano/alertas', icon: 'bi-broadcast' },
  { label: 'Mis Alertas', to: '/ciudadano/mis-alertas', icon: 'bi-exclamation-triangle' },
  { label: 'Vecinos', to: '/ciudadano/vecinos', icon: 'bi-people' },
  { label: 'Notificaciones', to: '/ciudadano/notificaciones', icon: 'bi-bell' },
  { label: 'Configuración', to: '/ciudadano/configuracion', icon: 'bi-gear' },
];

export default function CiudadanoBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="ciudadano-bottom-nav" aria-label="Navegación del ciudadano">
      {items.map((item) => {
        const inicioActivo = item.label === 'Principal'
          && ['/ciudadano', '/ciudadano/', '/ciudadano/principal'].includes(pathname);

        return (
          <NavLink
            key={item.label}
            to={item.to}
            end
            aria-label={item.label}
            className={({ isActive }) => `ciudadano-bottom-nav__item${isActive || inicioActivo ? ' active' : ''}`}
          >
            <i className={`bi ${item.icon}`} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
