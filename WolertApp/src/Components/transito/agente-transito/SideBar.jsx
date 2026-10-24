import { Link } from 'react-router-dom';
import logoTransito from '../../../../public/img/secretaria transito.png';

// Si tu landing vive fuera de la app React, ajusta esta ruta
const LANDING_URL = '/landing/index.html';
const BASE = '/transito/agente';

const MENU = [
  { seccion: 'General', items: [
    { id: 'panel', label: 'Principal', href: `${BASE}/panel`, icon: 'bi-house' },
  ]},
  { seccion: 'Operación', items: [
    { id: 'grupo',     label: 'Mi grupo',  href: `${BASE}/grupo`,     icon: 'bi-people' },
    { id: 'historial', label: 'Historial', href: `${BASE}/historial`, icon: 'bi-clock-history' },
  ]},
  { seccion: 'Cuenta', items: [
    { id: 'perfil',        label: 'Perfil',        href: `${BASE}/perfil`,        icon: 'bi-person' },
    { id: 'configuracion', label: 'Configuración', href: `${BASE}/configuracion`, icon: 'bi-gear' },
  ]},
];

function cerrarSesion(e) {
  e.preventDefault();
  if (!window.confirm('¿Seguro que deseas cerrar sesión?')) return;
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    sessionStorage.clear();
  } catch (err) {
    console.warn('No se pudo limpiar el storage', err);
  }
  window.location.href = LANDING_URL;
}

export default function Sidebar({ activo }) {
  return (
    <aside className="sidebar-dash" id="sidebarDash">
      <div className="d-flex align-items-center brand-dash">
        <span className="brand-icon-dash">
          <img src={logoTransito} alt="Logo Tránsito" className="brand-logo-img-dash" />
        </span>
        <span className="brand-name-dash">
          <span className="d-block">Agente de</span>
          <span className="d-block">Tránsito</span>
        </span>
      </div>

      {MENU.map((sec) => (
        <div key={sec.seccion}>
          <p className="glabel-dash">{sec.seccion}</p>
          <nav className="nav flex-column menu-dash">
            {sec.items.map((item) => (
              <Link key={item.id} to={item.href} className={item.id === activo ? 'active' : ''}>
                <span className="ic-dash"><i className={`bi ${item.icon}`}></i></span>
                <span className="lbl-dash">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      ))}

      <div className="flex-grow-1"></div>

      <a href="#" className="logout-dash" onClick={cerrarSesion}>
        <span className="ic-dash"><i className="bi bi-box-arrow-left"></i></span>
        <span className="lbl-dash">Cerrar sesión</span>
      </a>
    </aside>
  );
}