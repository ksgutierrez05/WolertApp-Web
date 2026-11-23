import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/admin/dashboard-admin.css';
import { obtenerUsuarioPorId } from '../../Services/UsuariosAPI.js';
import { destinoNotificacion, listarNotificaciones } from '../../Services/NotificacionesAPI';
import { obtenerPreferenciasAdmin } from '../../Services/PreferenciasAdmin';

export default function TopBarAdmin({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [buscar, setBuscar] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [perfil, setPerfil] = useState({ nombre: '', correo: '' });
  const [notificaciones, setNotificaciones] = useState([]);
  const [preferencias, setPreferencias] = useState(() => obtenerPreferenciasAdmin());

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

  useEffect(() => {
    let activo = true;
    listarNotificaciones().then((lista) => {
      if (activo && Array.isArray(lista)) setNotificaciones(lista);
    }).catch(() => {});
    const actualizarPreferencias = (evento) => setPreferencias(evento.detail || obtenerPreferenciasAdmin());
    window.addEventListener('wolert:preferencias-admin', actualizarPreferencias);
    return () => {
      activo = false;
      window.removeEventListener('wolert:preferencias-admin', actualizarPreferencias);
    };
  }, []);

  const totalAvisos = preferencias.mostrarCampana ? notificaciones.length : 0;
  const abrirNotificacion = (notificacion) => {
    setShowNotif(false);
    navigate(destinoNotificacion(notificacion).ruta);
  };

  const cerrarSesion = () => {
    document.body.classList.remove('modo-compacto');
    ['token', 'rol', 'idUsuario', 'username'].forEach((k) => localStorage.removeItem(k));
    navigate('/login');
  };

  return (
    <div className="container-fluid admin-topbar-alineada">
      <div className="d-flex justify-content-between align-items-center gap-3 admin-topbar-alineada__fila">
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
            <button type="button" className="position-relative d-flex align-items-center justify-content-center rounded-circle bg-white"
              style={{ cursor: 'pointer', width: '40px', height: '40px', padding: 0, borderRadius: '9999px', border: '1px solid #e2e8f0' }}
              onClick={() => setShowNotif((s) => !s)} aria-label={`Notificaciones: ${totalAvisos}`} aria-expanded={showNotif}>
              <i className="bi bi-bell" style={{ fontSize: '18px' }} />
              {totalAvisos > 0 && <span className="badge-red-dash position-absolute" style={{ top: '-4px', right: '-4px' }}></span>}
            </button>
            {showNotif && (
              <div className="top-bar__dropdown" style={{ right: 0, top: 'calc(100% + 8px)', width: '320px' }}>
                <div className="top-bar__dropdown-header">
                  <span className="top-bar__dropdown-title">Notificaciones</span>
                </div>
                <div className="top-bar__dropdown-list">
                  {preferencias.mostrarCampana && notificaciones.slice(0, 5).map((n) => {
                    const destino = destinoNotificacion(n);
                    return <button type="button" key={n.idNotificacion} className="top-bar__notif-item" onClick={() => abrirNotificacion(n)}>
                      <div className="top-bar__notif-item-icon bg-blue"><i className={`bi ${n.idAlerta != null ? 'bi-exclamation-triangle' : 'bi-bell'}`} /></div>
                      <div className="top-bar__notif-item-content"><div className="top-bar__notif-item-title">{n.mensaje || 'Notificación del sistema'}</div><div className="top-bar__notif-item-sub">Ver en {destino.menu}</div><div className="top-bar__notif-item-time">{n.fecha ? new Date(n.fecha).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : ''}</div></div>
                    </button>;
                  })}
                  {!preferencias.mostrarCampana && <div className="top-bar__notif-item"><div className="top-bar__notif-item-content"><div className="top-bar__notif-item-title">La vista previa está desactivada</div><div className="top-bar__notif-item-sub">Puedes activarla en Configuración.</div></div></div>}
                  {preferencias.mostrarCampana && notificaciones.length === 0 && <div className="top-bar__notif-item"><div className="top-bar__notif-item-content"><div className="top-bar__notif-item-title">No hay notificaciones</div></div></div>}
                  <button type="button" className="top-bar__dropdown-link" onClick={() => { setShowNotif(false); navigate('/admin/notificaciones'); }}>Ver todas las notificaciones</button>
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
                  <button
                    type="button"
                    className="top-bar__dropdown-link"
                    onClick={() => {
                      setShowUser(false);
                      navigate('/admin/configuracion');
                    }}
                  >
                    <i className="bi bi-gear top-bar__dropdown-link-icon" />
                    Configuración
                  </button>
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
