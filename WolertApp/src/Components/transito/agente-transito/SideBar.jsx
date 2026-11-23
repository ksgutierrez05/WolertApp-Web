
import { Link, useNavigate } from 'react-router-dom';

const BASE = '/transito/agente';

const MENU = [
  {
    seccion: 'General',
    items: [
      {
        id: 'panel',
        label: 'Principal',
        href: `${BASE}/panel`,
        icon: 'bi-house'
      }
    ]
  },
  {
    seccion: 'Operación',
    items: [
      {
        id: 'grupo',
        label: 'Mi grupo',
        href: `${BASE}/grupo`,
        icon: 'bi-people'
      },
      {
        id: 'historial',
        label: 'Historial',
        href: `${BASE}/historial`,
        icon: 'bi-clock-history'
      }
    ]
  },
  {
    seccion: 'Cuenta',
    items: [
      {
        id: 'configuracion',
        label: 'Configuración',
        href: `${BASE}/configuracion`,
        icon: 'bi-gear'
      }
    ]
  }
];

export default function Sidebar({ activo }) {
  const navigate = useNavigate();

  const cerrarSesion = (e) => {
    e.preventDefault();

    ['token', 'usuario', 'rol', 'idUsuario', 'username'].forEach(
      (clave) => {
        localStorage.removeItem(clave);
        sessionStorage.removeItem(clave);
      }
    );

    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar-dash" id="sidebarDash">
      <div className="d-flex align-items-center brand-dash">
        <span className="brand-icon-dash">
          <img
            src="/img/secretaria transito.png"
            alt="Logo Tránsito"
            className="brand-logo-img-dash"
          />
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
              <Link
                key={item.id}
                to={item.href}
                className={item.id === activo ? 'active' : ''}
              >
                <span className="ic-dash">
                  <i className={`bi ${item.icon}`} />
                </span>
                <span className="lbl-dash">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      ))}

      <div className="flex-grow-1" />

      <a
        href="/login"
        className="logout-dash"
        onClick={cerrarSesion}
      >
        <span className="ic-dash">
          <i className="bi bi-box-arrow-left" />
        </span>
        <span className="lbl-dash">Cerrar sesión</span>
      </a>
    </aside>
  );
}
