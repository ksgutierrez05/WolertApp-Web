import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarDirector from './director-transito/Sidebar';
import SidebarCentral from './central-transito/SideBar';
import SidebarAgente from './agente-transito/SideBar';
import {
  destinoNotificacionTransito,
  idNotificacionTransito,
  listarNotificacionesTransito,
  notificacionTransitoNoLeida,
  textoNotificacionTransito,
  fechaNotificacionTransito,
} from '../../Services/NotificacionesTransito';


const ROLES = {
  director: { Sidebar: SidebarDirector, avatar: 'D', nombre: 'Director de Tránsito', configuracion: '/transito/director/configuracion' },
  central: { Sidebar: SidebarCentral, avatar: 'C', nombre: 'Admin de Tránsito', configuracion: '/transito/central/configuracion' },
  agente: { Sidebar: SidebarAgente, avatar: 'A', nombre: 'Agente de Tránsito', configuracion: '/transito/agente/configuracion' }

};

export default function Layout({ rol = 'director', titulo, activo, busqueda, claseTopbar = 'mb-5', avatar, children }) {
  const cfg = ROLES[rol];
  const Sidebar = cfg.Sidebar;
  const [menuCuentaAbierto, setMenuCuentaAbierto] = useState(false);
  const [menuNotificacionesAbierto, setMenuNotificacionesAbierto] = useState(false);
  const [listaNotificaciones, setListaNotificaciones] = useState([]);
  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(true);
  const [errorNotificaciones, setErrorNotificaciones] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMenuCuentaAbierto(false);
    setMenuNotificacionesAbierto(false);
  }, [location.pathname]);

  useEffect(() => {
    const controlador = new AbortController();
    listarNotificacionesTransito(rol, controlador.signal)
      .then((lista) => {
        if (!controlador.signal.aborted) {
          setListaNotificaciones(lista);
          setErrorNotificaciones('');
          setCargandoNotificaciones(false);
        }
      })
      .catch((error) => {
        if (!controlador.signal.aborted) {
          setErrorNotificaciones(error.message || 'No se pudieron cargar las notificaciones.');
          setCargandoNotificaciones(false);
        }
      });
    return () => controlador.abort();
  }, [rol]);

  useEffect(() => {
    if (!menuCuentaAbierto && !menuNotificacionesAbierto) return undefined;
    const cerrarConEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuCuentaAbierto(false);
        setMenuNotificacionesAbierto(false);
      }
    };
    window.addEventListener('keydown', cerrarConEscape);
    return () => window.removeEventListener('keydown', cerrarConEscape);
  }, [menuCuentaAbierto, menuNotificacionesAbierto]);

  const cerrarSesion = () => {
    ['token', 'accessToken', 'authToken', 'jwt', 'usuario', 'user', 'usuarioActual', 'currentUser', 'rol', 'idUsuario', 'username']
      .forEach((clave) => {
        localStorage.removeItem(clave);
        sessionStorage.removeItem(clave);
      });
    navigate('/login', { replace: true });
  };

  const notificacionesNoLeidas = listaNotificaciones.filter(notificacionTransitoNoLeida).length;
  const abrirNotificacion = (notificacion) => {
    setMenuNotificacionesAbierto(false);
    navigate(destinoNotificacionTransito(notificacion, rol));
  };

  useEffect(() => { document.title = `WolertApp - ${titulo}`; }, [titulo]);

  useEffect(() => {
    document.body.classList.add('rol-transito');
    document.body.dataset.rol = 'transito';
    return () => {
      document.body.classList.remove('rol-transito', 'rail-collapsed');
      delete document.body.dataset.rol;
    };
  }, []);

  useEffect(() => {
    document.body.classList.add('rail-collapsed');
    return () => document.body.classList.remove('rail-collapsed');
  }, []);

  return (
    // pg-... no hace nada hoy; queda por si después quieres limitar un CSS a una sola página
    <div className={`d-flex pg-${rol}-${activo} ${rol === 'director' ? 'dt' : rol === 'central' ? 'ct' : rol === 'agente' ? 'ag' : ''}`} id="wrapperDash">
      <Sidebar activo={activo} />
      <main className="main-dash flex-grow-1">
        <div className="container-fluid px-4 py-4">

          <div className={`row g-3 align-items-center ${claseTopbar}`}>
            <div className="col">
              <div className="input-group search-dash">
                <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control border-0"
                  placeholder={busqueda?.placeholder ?? 'Buscar...'}
                  value={busqueda?.valor ?? ''}
                  onChange={(e) => busqueda?.onChange?.(e.target.value)} />
              </div>
            </div>
            <div className="col-auto">
              <div className="transito-notificaciones">
                <button
                  type="button"
                  className="btn btn-light rounded-circle position-relative icon-btn-dash"
                  aria-label={`Notificaciones: ${notificacionesNoLeidas} sin leer`}
                  aria-expanded={menuNotificacionesAbierto}
                  onClick={() => {
                    setMenuCuentaAbierto(false);
                    setMenuNotificacionesAbierto((abierto) => !abierto);
                  }}
                >
                  <i className="bi bi-bell" />
                  {notificacionesNoLeidas > 0 && (
                    <span className="transito-notificaciones__badge">
                      {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
                    </span>
                  )}
                </button>
                {menuNotificacionesAbierto && (
                  <section className="transito-notificaciones__menu" aria-label="Notificaciones de Tránsito">
                    <header className="transito-notificaciones__header">
                      <strong>Avisos de {cfg.nombre}</strong>
                      <span>{notificacionesNoLeidas} sin leer</span>
                    </header>
                    <div className="transito-notificaciones__lista">
                      {errorNotificaciones && (
                        <p className="transito-notificaciones__estado" role="alert">{errorNotificaciones}</p>
                      )}
                      {!errorNotificaciones && cargandoNotificaciones && (
                        <p className="transito-notificaciones__estado" role="status">Cargando avisos…</p>
                      )}
                      {!errorNotificaciones && !cargandoNotificaciones && listaNotificaciones.length === 0 && (
                        <p className="transito-notificaciones__estado">No hay avisos de Tránsito.</p>
                      )}
                      {!errorNotificaciones && !cargandoNotificaciones && listaNotificaciones.slice(0, 6).map((notificacion, indice) => {
                        const fecha = fechaNotificacionTransito(notificacion);
                        const fechaTexto = fecha && !Number.isNaN(new Date(fecha).getTime())
                          ? new Date(fecha).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
                          : '';
                        return (
                          <button
                            type="button"
                            key={idNotificacionTransito(notificacion) ?? `${indice}-${textoNotificacionTransito(notificacion)}`}
                            className={`transito-notificaciones__item ${notificacionTransitoNoLeida(notificacion) ? 'is-no-leida' : ''}`}
                            onClick={() => abrirNotificacion(notificacion)}
                          >
                            <i className={`bi ${notificacionTransitoNoLeida(notificacion) ? 'bi-bell-fill' : 'bi-bell'}`} aria-hidden="true" />
                            <span>
                              <strong>{textoNotificacionTransito(notificacion)}</strong>
                              {fechaTexto && <small>{fechaTexto}</small>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            </div>
            <div className="col-auto transito-cuenta">
              <button
                type="button"
                className="avatar-dash transito-cuenta__boton"
                aria-label="Abrir opciones de cuenta"
                aria-haspopup="menu"
                aria-expanded={menuCuentaAbierto}
                onClick={() => {
                  setMenuNotificacionesAbierto(false);
                  setMenuCuentaAbierto((abierto) => !abierto);
                }}
              >{avatar ?? cfg.avatar}</button>
              {menuCuentaAbierto && (
                <div className="transito-cuenta__menu" role="menu">
                  <div className="transito-cuenta__encabezado">
                    <strong>{localStorage.getItem('username') || cfg.nombre}</strong>
                    <span>{cfg.nombre}</span>
                  </div>
                  <button type="button" role="menuitem" onClick={() => navigate(cfg.configuracion)}>
                    <i className="bi bi-gear" aria-hidden="true" />
                    Configuración
                  </button>
                  <button type="button" role="menuitem" className="transito-cuenta__salir" onClick={cerrarSesion}>
                    <i className="bi bi-box-arrow-right" aria-hidden="true" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
