import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/admin/dashboard-admin.css';
import { obtenerUsuarioPorId } from '../../Service/UsuariosAPI.js';

export default function TopBarAdmin({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [buscar, setBuscar] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [perfil, setPerfil] = useState({ nombre: '', correo: '' });

  const username = localStorage.getItem('username') || 'Usuario';
  const rol = localStorage.getItem('rol') || '';

  useEffect(() => {
    const id = localStorage.getItem('idUsuario');
    if (!id) return;
    obtenerUsuarioPorId(id)
      .then((u) => setPerfil({
        nombre: [u.primerNombre, u.primerApellido].filter(Boolean).join(' '),
        correo: u.correo || '',
      }))
      .catch(() => {});
  }, []);

  const cerrarSesion = () => {
    ['token', 'rol', 'idUsuario', 'username'].forEach((k) => localStorage.removeItem(k));
    navigate('/login');
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
        {onToggleSidebar && (
          <button type="button" className="btn btn-light d-md-none" onClick={onToggleSidebar} aria-label="Abrir menú">
            <i className="bi bi-list" />
          </button>
        )}
        <div className="input-group search-dash bg-white flex-grow-1">
          <span className="input-group-text bg-white border-0"><i className="bi bi-search" /></span>
          <input type="text" className="form-control border-0" placeholder="Buscar por alerta, barrio, usuario..."
            value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* CAMPANA */}
          <div style={{ position: 'relative' }}>
            <div className="position-relative d-flex align-items-center justify-content-center rounded-circle bg-white"
              style={{ cursor: 'pointer', width: '40px', height: '40px', padding: 0, borderRadius: '9999px', border: '1px solid #e2e8f0' }}
              onClick={() => setShowNotif((s) => !s)}>
              <i className="bi bi-bell" style={{ fontSize: '18px' }} />
              <span className="badge-red-dash position-absolute" style={{ top: '-4px', right: '-4px' }} />
            </div>
            {showNotif && (
              <div className="top-bar__dropdown" style={{ right: 0, top: 'calc(100% + 8px)', width: '320px' }}>
                <div className="top-bar__dropdown-header">
                  <span className="top-bar__dropdown-title">Notificaciones</span>
                </div>
                <div className="top-bar__dropdown-list">
                  <div className="top-bar__notif-item unread">
                    <div className="top-bar__notif-item-icon bg-blue"><i className="bi bi-bell" /></div>
                    <div className="top-bar__notif-item-content">
                      <div className="top-bar__notif-item-title">Alerta de HOMICIDIO</div>
                      <div className="top-bar__notif-item-sub">Casimiro Raul Maestre</div>
                      <div className="top-bar__notif-item-time">hace 10 min</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* USUARIO */}
          <div style={{ position: 'relative' }}>
            <button type="button" className={`top-bar__user ${showUser ? 'open' : ''}`}
              onClick={() => setShowUser((s) => !s)} aria-expanded={showUser}>
              <div className="top-bar__user-avatar"><i className="bi bi-person-circle" /></div>
              <div className="top-bar__user-info">
                <div className="top-bar__user-name">{perfil.nombre || username}</div>
                <div className="top-bar__user-email">{perfil.correo || rol}</div>
              </div>
              <i className="bi bi-chevron-down top-bar__user-chevron" />
            </button>
            {showUser && (
              <div className="top-bar__dropdown">
                <div className="top-bar__dropdown-header">
                  <span className="top-bar__dropdown-title">Cuenta</span>
                </div>
                <div className="top-bar__dropdown-list">
                  <button type="button" className="top-bar__dropdown-link top-bar__dropdown-link--danger" onClick={cerrarSesion}>
                    <i className="bi bi-box-arrow-right top-bar__dropdown-link-icon" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}