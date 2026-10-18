import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Topbar({ onToggleSidebar }) {
  const [openMenu, setOpenMenu] = useState(null); // 'notif' | 'user' | null
  const barRef = useRef(null);

  const toggle = (name) => setOpenMenu((m) => (m === name ? null : name));
  const close = () => setOpenMenu(null);

  // Cierra los menús al hacer clic fuera o presionar Escape
  useEffect(() => {
    const onClick = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) close();
    };
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="top-bar" ref={barRef}>
      <div className="top-bar__left">
        <div className="top-bar__brand">
          <span className="top-bar__brand-text">WolertApp</span>
          <span className="top-bar__brand-sub">Panel de Administración</span>
        </div>
      </div>

      <div className="top-bar__center">
        <div className="top-bar__search">
          <i className="bi bi-search top-bar__search-icon" />
          <input type="text" className="top-bar__search-input" placeholder="Buscar en el sistema..." />
        </div>
      </div>

      <div className="top-bar__right">
        {/* Notificaciones: botón + menú dentro del mismo contenedor relativo */}
        <div className="top-bar__menu-wrap">
          <button type="button" className="top-bar__notif" onClick={() => toggle('notif')} aria-expanded={openMenu === 'notif'}>
            <i className="bi bi-bell top-bar__notif-icon" />
            <span className="top-bar__notif-badge">3</span>
          </button>

          {openMenu === 'notif' && (
            <div className="top-bar__dropdown top-bar__dropdown--notif">
              <div className="top-bar__dropdown-header">
                <span className="top-bar__dropdown-title">Notificaciones</span>
                <span className="top-bar__dropdown-mark-all">Marcar todo como leído</span>
              </div>
              <div className="top-bar__dropdown-list">
                <div className="top-bar__notif-item unread">
                  <div className="top-bar__notif-item-icon bg-blue"><i className="bi bi-shield-exclamation" /></div>
                  <div className="top-bar__notif-item-content">
                    <div className="top-bar__notif-item-title">Alerta de HOMICIDIO</div>
                    <div className="top-bar__notif-item-sub">Casimiro Raul Maestre</div>
                    <div className="top-bar__notif-item-time">hace 10 min</div>
                  </div>
                </div>
                <div className="top-bar__notif-item">
                  <div className="top-bar__notif-item-icon bg-amber"><i className="bi bi-bell" /></div>
                  <div className="top-bar__notif-item-content">
                    <div className="top-bar__notif-item-title">Nueva asignación</div>
                    <div className="top-bar__notif-item-sub">Unidad asignada a ROBO en CENTRO</div>
                    <div className="top-bar__notif-item-time">hace 2 h</div>
                  </div>
                </div>
                <div className="top-bar__notif-item">
                  <div className="top-bar__notif-item-icon bg-green"><i className="bi bi-check-circle" /></div>
                  <div className="top-bar__notif-item-content">
                    <div className="top-bar__notif-item-title">Caso resuelto</div>
                    <div className="top-bar__notif-item-sub">ROBO en CENTRO cerrado</div>
                    <div className="top-bar__notif-item-time">hace 5 h</div>
                  </div>
                </div>
              </div>
              <div className="top-bar__dropdown-footer">
                <Link to="/admin/notificaciones" className="top-bar__dropdown-link" onClick={close}>
                  Ver todas las notificaciones
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Usuario */}
        <div className="top-bar__menu-wrap">
          <button
            type="button"
            className={`top-bar__user ${openMenu === 'user' ? 'open' : ''}`}
            onClick={() => toggle('user')}
            aria-expanded={openMenu === 'user'}
          >
            <div className="top-bar__user-avatar"><i className="bi bi-person-circle" /></div>
            <div className="top-bar__user-info">
              <div className="top-bar__user-name">Administrador</div>
              <div className="top-bar__user-email">admin@wolertapp.com</div>
            </div>
            <i className="bi bi-chevron-down top-bar__user-chevron" />
          </button>

          {openMenu === 'user' && (
            <div className="top-bar__dropdown top-bar__dropdown--user">
              <div className="top-bar__dropdown-header">
                <span className="top-bar__dropdown-title">Cuenta</span>
              </div>
              <div className="top-bar__dropdown-list">
                <Link to="/admin/configuracion" className="top-bar__dropdown-link" onClick={close}>
                  <i className="bi bi-person-gear top-bar__dropdown-link-icon" />
                  Configuración de perfil
                </Link>
                <button type="button" className="top-bar__dropdown-link" onClick={close}>
                  <i className="bi bi-shield-lock top-bar__dropdown-link-icon" />
                  Cambiar contraseña
                </button>
                <button type="button" className="top-bar__dropdown-link top-bar__dropdown-link--danger" onClick={close}>
                  <i className="bi bi-box-arrow-right top-bar__dropdown-link-icon" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Topbar;