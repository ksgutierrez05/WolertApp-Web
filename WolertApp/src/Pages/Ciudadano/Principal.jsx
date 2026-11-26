import { cerrarSesionCiudadano } from "../../Services/sesionCiudadanoService";
import { useState, useEffect, useMemo } from 'react';
import '../../css/global.css';
import '../../css/temas.css';
import '../../css/ciudadano/pagina-principal.css';
import { Link, useNavigate } from 'react-router-dom';
import { logOut, obtenerUsuarioPorId, listarVecinos } from '../../Services/UsuariosAPI.js';
import { listarAlertas, listarMisAlertas } from '../../Services/AlertasAPI.js';
import { ListarBarrios } from '../../Services/BarriosApi.js';
import { destinoNotificacion, listarMisNotificaciones } from '../../Services/NotificacionesAPI';
import { notificacionPermitidaCiudadano, obtenerPreferenciasCiudadano } from '../../Services/PreferenciasCiudadano';

const normalizar = (valor = '') =>
  String(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es-CO');

const barrioIdDe = (item) => {
  const valor =
    item?.barrioId ??
    item?.idBarrio ??
    item?.BarrioId ??
    item?.IdBarrio ??
    item?.barrio?.barrioId ??
    item?.barrio?.idBarrio ??
    item?.Barrio?.IdBarrio;
  const id = Number(valor);
  return valor != null && Number.isInteger(id) && id > 0 ? id : null;
};
const barrioNombreDe = (item) => item?.barrioNombre ?? item?.BarrioNombre ?? item?.barrio?.nombre ?? item?.Barrio?.Nombre ?? '';
const nombreBarrioCatalogo = (item) => item?.nombre ?? item?.Nombre ?? barrioNombreDe(item) ?? '';
const tipoAlertaDe = (item) => item?.tipo ?? item?.tipoAlertaNombre ?? item?.tipoAlerta?.nombre ?? item?.tipoNombre ?? 'Alerta';
const fechaAlertaDe = (item) => item?.fechaCreacion ?? item?.fecha ?? item?.fechaAlerta ?? item?.createdAt ?? item?.CreatedAt;
const formatearFechaAlerta = (valor) => {
  if (!valor) return 'Fecha no disponible';
  const texto = String(valor);
  const fecha = new Date(/(Z|[+-]\d{2}:\d{2})$/i.test(texto) ? texto : `${texto}Z`);
  if (Number.isNaN(fecha.getTime())) return 'Fecha no disponible';

  return fecha.toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};
const estadoAlertaDe = (item) => item?.estado ?? item?.Estado ?? 'Pendiente';
const claseEstadoAlerta = (estado) => {
  const valor = normalizar(estado);
  if (['resuelta', 'resuelto', 'cerrada', 'cerrado', 'finalizada', 'finalizado', 'atendida'].includes(valor)) return 'badge-green-dash';
  if (['en_camino', 'en_atencion', 'asignada', 'asignado', 'en_revision', 'en proceso'].includes(valor)) return 'badge-blue-dash';
  return 'badge-amber-dash';
};

export default function Principal() {
  const hayUsuarioEnSesion = Boolean(localStorage.getItem('idUsuario'));
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [fecha, setFecha] = useState('');
  const [buscar, setBuscar] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [misAlertas, setMisAlertas] = useState(hayUsuarioEnSesion ? null : []);
  const [vecinosActivos, setVecinosActivos] = useState(hayUsuarioEnSesion ? null : []);
  const [errorVecinos, setErrorVecinos] = useState(false);
  const [alertasComunidad, setAlertasComunidad] = useState(hayUsuarioEnSesion ? null : []);
  const [barrios, setBarrios] = useState([]);
  const [errorMisAlertas, setErrorMisAlertas] = useState(
    hayUsuarioEnSesion ? '' : 'Inicia sesión para consultar tus alertas.',
  );
  const [errorAlertasComunidad, setErrorAlertasComunidad] = useState(
    hayUsuarioEnSesion ? '' : 'Inicia sesión para consultar las alertas de tu barrio.',
  );
  const [tipoAlertaSeleccionado, setTipoAlertaSeleccionado] = useState('todas');
  const [notificaciones, setNotificaciones] = useState([]);
  const [preferencias, setPreferencias] = useState(() => obtenerPreferenciasCiudadano());

  useEffect(() => {
    const id = localStorage.getItem('idUsuario');
    if (!id) return;
    obtenerUsuarioPorId(id)
      .then(setUsuario)
      .catch((error) => console.error('No se pudieron cargar los datos del usuario:', error));
  }, []); 

  useEffect(() => {
    let activo = true;
    const idUsuario = localStorage.getItem('idUsuario');
    if (!idUsuario) return () => { activo = false; };

    listarMisAlertas()
      .then((datos) => {
        if (activo) setMisAlertas(Array.isArray(datos) ? datos : []);
      })
      .catch((error) => {
        if (!activo) return;
        setMisAlertas([]);
        setErrorMisAlertas(error.message || 'No se pudieron cargar tus alertas.');
      });
    listarAlertas()
      .then((datos) => {
        if (activo) setAlertasComunidad(Array.isArray(datos) ? datos : []);
      })
      .catch((error) => {
        if (!activo) return;
        setAlertasComunidad([]);
        setErrorAlertasComunidad(error.message || 'No se pudieron cargar las alertas del barrio.');
      });
    ListarBarrios()
      .then((datos) => {
        if (activo) setBarrios(Array.isArray(datos) ? datos : []);
      })
      .catch(() => { if (activo) setBarrios([]); });

    return () => { activo = false; };
  }, []);

  useEffect(() => {
    let activo = true;
    let cargandoVecinos = false;
    const idUsuario = localStorage.getItem('idUsuario');

    if (!idUsuario) {
      setVecinosActivos([]);
      return () => { activo = false; };
    }

    const cargarVecinos = async () => {
      if (cargandoVecinos) return;
      cargandoVecinos = true;
      try {
        const datos = await listarVecinos();
        if (activo) {
          setVecinosActivos(Array.isArray(datos) ? datos : []);
          setErrorVecinos(false);
        }
      } catch {
        if (activo) setErrorVecinos(true);
      } finally {
        cargandoVecinos = false;
      }
    };

    cargarVecinos();
    const intervalo = window.setInterval(cargarVecinos, 60000);
    window.addEventListener('focus', cargarVecinos);
    return () => {
      activo = false;
      window.clearInterval(intervalo);
      window.removeEventListener('focus', cargarVecinos);
    };
  }, []);

  useEffect(() => {
    let activo = true;
    const cargar = () => listarMisNotificaciones().then((datos) => {
      if (activo && Array.isArray(datos)) setNotificaciones(datos);
    }).catch(() => {});
    const sincronizarPreferencias = (evento) => setPreferencias(evento.detail || obtenerPreferenciasCiudadano());
    const cambioSesion = (evento) => {
      if (evento.key && !['token', 'idUsuario'].includes(evento.key)) return;
      setNotificaciones([]);
      cargar();
    };
    cargar();
    const intervalo = window.setInterval(cargar, 60000);
    window.addEventListener('focus', cargar);
    window.addEventListener('storage', cambioSesion);
    window.addEventListener('wolert:preferencias-ciudadano', sincronizarPreferencias);
    return () => {
      activo = false;
      window.clearInterval(intervalo);
      window.removeEventListener('focus', cargar);
      window.removeEventListener('storage', cambioSesion);
      window.removeEventListener('wolert:preferencias-ciudadano', sincronizarPreferencias);
    };
  }, []);

  const navigate = useNavigate();

  const cerrarSesion = cerrarSesionCiudadano;

  const notificacionesVisibles = notificaciones.filter((n) => notificacionPermitidaCiudadano(n, preferencias));
  const totalAvisos = notificacionesVisibles.length;
  const abrirNotificacion = (notificacion) => {
    setShowNotif(false);
    navigate(destinoNotificacion(notificacion, 'ciudadano').ruta);
  };

  useEffect(() => {
    const tick = () => {
      const ahora = new Date();
      setFecha(ahora.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const h = new Date().getHours();
  const saludo = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';

  const nombreCorto = usuario
  ? [usuario.primerNombre, usuario.primerApellido].filter(Boolean).join(' ')
  : (localStorage.getItem('username') || '');

  const nombreCompleto = usuario
    ? [usuario.primerNombre, usuario.segundoNombre, usuario.primerApellido, usuario.segundoApellido]
        .filter(Boolean).join(' ')
    : nombreCorto;
  const idBarrioPerfil = barrioIdDe(usuario);
  const barrioUsuario = barrioNombreDe(usuario) || nombreBarrioCatalogo(barrios.find((barrio) => barrioIdDe(barrio) === idBarrioPerfil));
  const alertasPropiasOrdenadas = useMemo(
    () =>
      [...(misAlertas || [])].sort(
        (a, b) =>
          new Date(fechaAlertaDe(b) || 0) -
          new Date(fechaAlertaDe(a) || 0),
      ),
    [misAlertas],
  );
  const alertasActivasTotal = alertasPropiasOrdenadas.filter(
    (alerta) =>
      ![
        'resuelta', 'resuelto', 'cerrada', 'cerrado',
        'finalizada', 'finalizado', 'atendida', 'cancelada', 'cancelado',
      ].includes(normalizar(estadoAlertaDe(alerta))),
  ).length;
  const alertasCerradasTotal = alertasPropiasOrdenadas.filter(
    (alerta) =>
      ['resuelta', 'resuelto', 'cerrada', 'cerrado', 'finalizada', 'finalizado', 'atendida']
        .includes(normalizar(estadoAlertaDe(alerta))),
  ).length;
  const vecinosConectadosTotal = vecinosActivos?.length ?? 0;
  const idBarrioUsuario =
    idBarrioPerfil ??
    barrioIdDe(
      barrios.find(
        (barrio) =>
          normalizar(nombreBarrioCatalogo(barrio)) === normalizar(barrioUsuario),
      ),
    );
  const alertasDelBarrio = useMemo(() => {
    if (!alertasComunidad) return [];
    const nombreUsuario = normalizar(barrioUsuario);
    return alertasComunidad.filter((alerta) => {
      const idAlerta =
        barrioIdDe(alerta) ??
        barrioIdDe(
          barrios.find(
            (barrio) =>
              normalizar(nombreBarrioCatalogo(barrio)) ===
              normalizar(barrioNombreDe(alerta)),
          ),
        );
      if (idBarrioUsuario !== null && idAlerta !== null) return idAlerta === idBarrioUsuario;
      return nombreUsuario !== '' && normalizar(barrioNombreDe(alerta)) === nombreUsuario;
    }).sort(
      (a, b) =>
        new Date(fechaAlertaDe(b) || 0) -
        new Date(fechaAlertaDe(a) || 0),
    );
  }, [alertasComunidad, barrios, idBarrioUsuario, barrioUsuario]);
  const tiposAlertaBarrio = useMemo(() => {
    const tipos = new Map();
    alertasDelBarrio.forEach((alerta) => {
      const nombre = tipoAlertaDe(alerta);
      const clave = normalizar(nombre);
      const actual = tipos.get(clave) || { clave, nombre, cantidad: 0 };
      actual.cantidad += 1;
      tipos.set(clave, actual);
    });
    return [...tipos.values()].sort((a, b) => b.cantidad - a.cantidad);
  }, [alertasDelBarrio]);
  const alertasBarrioFiltradas = tipoAlertaSeleccionado === 'todas'
    ? alertasDelBarrio
    : alertasDelBarrio.filter((alerta) => normalizar(tipoAlertaDe(alerta)) === tipoAlertaSeleccionado);

  return (
    <div className="container-fluid px-4">
      {/* topbar estilo admin */}
      <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
        {/* BUSCADOR */}
        <div className="input-group search-dash bg-white flex-grow-1">
          <span className="input-group-text bg-white border-0"><i className="bi bi-search" /></span>
          <input
            type="text"
            className="form-control border-0"
            placeholder="Buscar por alerta, barrio o vecino..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* CAMPANA */}
          <div className="col-auto" style={{ position: 'relative' }}>
            <button
              type="button"
              className="position-relative d-flex align-items-center justify-content-center rounded-circle bg-white"
              style={{
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                padding: 0,
                borderRadius: '9999px',
                border: '1px solid #e2e8f0',
              }}
              onClick={() => setShowNotif((s) => !s)}
              aria-label={`Notificaciones: ${totalAvisos}`}
              aria-expanded={showNotif}
            >
              <i className="bi bi-bell"></i>
            </button>
            {showNotif && (
              <div className="top-bar__dropdown" style={{ right: 0, top: 'calc(100% + 8px)', width: '320px' }}>
                <div className="top-bar__dropdown-header">
                  <span className="top-bar__dropdown-title">Notificaciones</span>
                  <span className="top-bar__dropdown-title">{totalAvisos} avisos</span>
                </div>
                <div className="top-bar__dropdown-list">
                  {notificacionesVisibles.slice(0, 5).map((n) => {
                    const destino = destinoNotificacion(n, 'ciudadano');
                    return (
                      <button
                        type="button"
                        key={n.idNotificacion}
                        className="top-bar__notif-item"
                        onClick={() => abrirNotificacion(n)}
                      >
                        <div className="top-bar__notif-item-icon bg-blue">
                          <i
                            className={`bi ${n.idAlerta != null ? 'bi-exclamation-triangle' : 'bi-bell'}`}
                          />
                        </div>
                        <div className="top-bar__notif-item-content">
                          <div className="top-bar__notif-item-title">
                            {n.mensaje || 'Notificación de Wolert'}
                          </div>
                          <div className="top-bar__notif-item-sub">
                            Ver en {destino.menu}
                          </div>
                          <div className="top-bar__notif-item-time">
                            {n.fecha
                              ? new Date(n.fecha).toLocaleString('es-CO', {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })
                              : ''}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {notificacionesVisibles.length === 0 && (
                    <div className="top-bar__notif-item">
                      <div className="top-bar__notif-item-content">
                        <div className="top-bar__notif-item-title">
                          No hay notificaciones
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="top-bar__dropdown-footer">
                  <Link to="/ciudadano/notificaciones" className="top-bar__dropdown-link" onClick={() => setShowNotif(false)}>
                    Ver todas las notificaciones
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* USUARIO */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={`top-bar__user ${showUser ? 'open' : ''}`}
              onClick={() => setShowUser((s) => !s)}
              aria-expanded={showUser}
            >
              <div className="top-bar__user-avatar"><i className="bi bi-person-circle" /></div>
              <div className="top-bar__user-info">
                <div className="top-bar__user-name">{nombreCompleto}</div>
                <div className="top-bar__user-email">{usuario?.correo || ''}</div>
              </div>
              <i className="bi bi-chevron-down top-bar__user-chevron" />
            </button>
            {showUser && (
              <div className="top-bar__dropdown">
                <div className="top-bar__dropdown-header">
                  <span className="top-bar__dropdown-title">Cuenta</span>
                </div>
                <div className="top-bar__dropdown-list">
                  <Link to="/ciudadano/configuracion" className="top-bar__dropdown-link" onClick={() => setShowUser(false)}>
                    <i className="bi bi-person-gear top-bar__dropdown-link-icon" />
                    Configuración de perfil
                  </Link>
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

      {/* hero */}
      <div
        className="hero-dash hero-ciudadano-usu mb-4"
        style={{ '--hero-img': 'url("/img/Hero-ciudadano.jpg")' }}
      >
        <div className="eyebrow-dash">
          <i className="bi bi-shield-check" /> Panel de ciudadano · {fecha}
        </div>
        <h1 className="hero-title-dash">{saludo}, {nombreCorto}</h1>
        <p className="hero-text-dash">Consulta el seguimiento de tus reportes y las alertas recientes de tu barrio.</p>
        <Link to="/ciudadano/mis-alertas" className="btn btn-light rounded-pill fw-bold mt-3 hero-cta-dash">
          <i className="bi bi-clipboard2-check" aria-hidden="true" /> Ver mis alertas
        </Link>
        <svg
          className="hero-icon-dash"
          width="110"
          height="110"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 2l8 3v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5l8-3z"
            stroke="#fff"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* KPI */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="kpi-dash kpi-red-dash">
            <i className="bi bi-exclamation-triangle kpi-icon-dash"></i>
            <div className="kpi-num-dash" id="kpiAlertasActivas">{misAlertas === null ? '…' : alertasActivasTotal}</div>
            <div className="kpi-label-dash">Mis alertas activas</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="kpi-dash kpi-blue-dash">
            <i className="bi bi-people kpi-icon-dash"></i>
            <div
              className="kpi-num-dash"
              title={errorVecinos ? 'No se pudo consultar la lista de vecinos.' : 'Ciudadanos activos registrados en tu barrio.'}
            >
              {vecinosActivos === null ? '…' : errorVecinos ? '—' : vecinosConectadosTotal}
            </div>
            <div className="kpi-label-dash">Vecinos activos del barrio</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="kpi-dash kpi-green-dash">
            <i className="bi bi-check2-circle kpi-icon-dash"></i>
            <div className="kpi-num-dash">{misAlertas === null ? '…' : alertasCerradasTotal}</div>
            <div className="kpi-label-dash">Mis alertas cerradas</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="kpi-dash kpi-amber-dash">
            <i className="bi bi-geo-alt kpi-icon-dash"></i>
            <div
              className="kpi-num-dash"
              title={barrioUsuario || undefined}
              style={{
                fontSize: '20px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}
            >
              {usuario ? barrioUsuario || 'No asignado' : 'Cargando...'}
            </div>
            <div className="kpi-label-dash">Mi barrio</div>
          </div>
        </div>
      </div>

      {/* SOS */}
      <div className="sos-panel-usu mb-4">
        <div className="sos-panel-texto-usu">
          <span className="sos-panel-badge-usu"><i className="bi bi-bell-fill"></i></span>
          <div>
            <div className="sos-panel-titulo-usu">Botón de emergencia</div>
            <div className="sos-panel-sub-usu">Envía tu ubicación en tiempo real a las autoridades y a tus vecinos conectados.</div>
          </div>
        </div>
        <Link
          to="/ciudadano/reportar-emergencia"
          className="sos-btn-usu"
          title="Enviar alerta de emergencia"
          aria-label="Reportar una alerta de emergencia"
        >
          <span className="sos-pulso-usu"></span>
          <span className="sos-contenido-usu">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>SOS</span>
          </span>
        </Link>
      </div>

      {/* MIS ALERTAS */}
      <div className="sec-head-usu">
        <h2 id="tituloMisAlertas">Mis alertas</h2>
        <Link className="see-all-dash" to="/ciudadano/mis-alertas">Ver todas <i className="bi bi-chevron-right"></i></Link>
      </div>
      <div className="panel-usu mb-4">
        <table className="tabla-usu" id="tablaMisAlertas">
          <thead><tr><th>Tipo</th><th>Ubicación</th><th>Estado</th><th className="text-end">Fecha</th></tr></thead>
          <tbody>
            {misAlertas === null && (
              <tr>
                <td colSpan={4} className="text-center">Cargando tus alertas...</td>
              </tr>
            )}
            {misAlertas !== null && errorMisAlertas && (
              <tr>
                <td colSpan={4} className="text-center text-danger">{errorMisAlertas}</td>
              </tr>
            )}
            {misAlertas !== null && !errorMisAlertas && alertasPropiasOrdenadas.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  No has reportado alertas todavía.
                </td>
              </tr>
            )}
            {alertasPropiasOrdenadas.slice(0, 4).map((alerta, index) => {
              const id = alerta.idAlerta ?? alerta.IdAlerta ?? alerta.id ?? index;
              const estado = estadoAlertaDe(alerta);
              const coordenadas =
                alerta.latitud != null && alerta.longitud != null
                  ? `${alerta.latitud}, ${alerta.longitud}`
                  : 'Ubicación no disponible';
              const ubicacion = barrioNombreDe(alerta) || coordenadas;
              return <tr className="alerta-row-usu" key={id}>
                <td><span className="badge-dash badge-blue-dash">{tipoAlertaDe(alerta).toLocaleUpperCase('es-CO')}</span></td>
                <td>
                  <div className="info-title-dash">{ubicacion}</div>
                  <div className="info-sub-dash">
                    Reportada {formatearFechaAlerta(fechaAlertaDe(alerta))}
                  </div>
                </td>
                <td><span className={`badge-dash ${claseEstadoAlerta(estado)}`}>{String(estado).replaceAll('_', ' ')}</span></td>
                <td className="text-end"><Link className="link-btn-dash" to="/ciudadano/mis-alertas">Ver seguimiento</Link></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      {/* MIS VECINOS */}
      <div className="sec-head-usu">
        <h2 className="titulos-usu">Mis vecinos</h2>
        <a className="see-all-dash" href="#">Ver todos <i className="bi bi-chevron-right"></i></a>
      </div>
      <div className="vecinos-usu mb-4">
        <div className="vecino-row-usu">
          <div className="vecino-info-usu">
            <span className="nombre-usu">Laura Peña</span>
            <span className="distancia-usu"><i className="bi bi-geo-alt"></i> 80 m</span>
          </div>
          <span className="estado-mini-usu estado-verde-usu">Conectada</span>
        </div>
        <div className="vecino-row-usu">
          <div className="vecino-info-usu">
            <span className="nombre-usu">Diego Torres</span>
            <span className="distancia-usu"><i className="bi bi-geo-alt"></i> 140 m</span>
          </div>
          <span className="estado-mini-usu estado-verde-usu">Conectado</span>
        </div>
        <div className="vecino-row-usu">
          <div className="vecino-info-usu">
            <span className="nombre-usu">Ravi Kumar</span>
            <span className="distancia-usu"><i className="bi bi-geo-alt"></i> 210 m</span>
          </div>
          <span className="estado-mini-usu estado-gris-usu">Sin conexión</span>
        </div>
        <div className="vecino-row-usu">
          <div className="vecino-info-usu">
            <span className="nombre-usu">Marta Correa</span>
            <span className="distancia-usu"><i className="bi bi-geo-alt"></i> 260 m</span>
          </div>
          <span className="estado-mini-usu estado-verde-usu">Conectada</span>
        </div>
      </div>

      {/* ÚLTIMAS ALERTAS */}
      <div className="sec-head-usu">
        <h2 className="titulos-usu">Últimas alertas del barrio{barrioUsuario ? ` · ${barrioUsuario}` : ''}</h2>
        <Link className="see-all-dash" to="/ciudadano/alertas">Ver todas <i className="bi bi-chevron-right"></i></Link>
      </div>
      <div className="tabs-usu" id="tabsUltimasAlertas" role="group" aria-label="Filtrar alertas por tipo">
        <button
          type="button"
          className={`tab-usu ${tipoAlertaSeleccionado === 'todas' ? 'active-usu' : ''}`}
          onClick={() => setTipoAlertaSeleccionado('todas')}
        >
          Todas ({alertasDelBarrio.length})
        </button>
        {tiposAlertaBarrio.map((tipo) => (
          <button
            type="button"
            key={tipo.clave}
            className={`tab-usu ${tipoAlertaSeleccionado === tipo.clave ? 'active-usu' : ''}`}
            onClick={() => setTipoAlertaSeleccionado(tipo.clave)}
          >
            {tipo.nombre} ({tipo.cantidad})
          </button>
        ))}
      </div>
      <div className="panel-usu">
        <div className="table-responsive">
          <table className="tabla-usu" id="tablaUltimasAlertas">
            <thead>
              <tr>
                <th>Reportado por</th>
                <th>Tipo</th>
                <th>Barrio</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {alertasComunidad === null && (
                <tr>
                  <td colSpan={5} className="text-center">Cargando alertas del barrio...</td>
                </tr>
              )}
              {alertasComunidad !== null && errorAlertasComunidad && (
                <tr>
                  <td colSpan={5} className="text-center text-danger">{errorAlertasComunidad}</td>
                </tr>
              )}
              {alertasComunidad !== null && !errorAlertasComunidad && !barrioUsuario && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    Tu perfil no tiene un barrio asignado para filtrar las alertas.
                  </td>
                </tr>
              )}
              {alertasComunidad !== null && !errorAlertasComunidad && barrioUsuario && alertasDelBarrio.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    No hay alertas registradas para tu barrio.
                  </td>
                </tr>
              )}
              {alertasComunidad !== null &&
                !errorAlertasComunidad &&
                alertasBarrioFiltradas.length === 0 &&
                alertasDelBarrio.length > 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    No hay alertas de este tipo en tu barrio.
                  </td>
                </tr>
              )}
              {alertasBarrioFiltradas.slice(0, 4).map((alerta, index) => {
                const id = alerta.idAlerta ?? alerta.IdAlerta ?? alerta.id ?? index;
                const estado = estadoAlertaDe(alerta);
                const reportante =
                  alerta.reportadoPor ??
                  alerta.ReportadoPor ??
                  alerta.usuarioNombre ??
                  alerta.nombreUsuario ??
                  alerta.usuario?.nombre ??
                  'Vecino';

                return (
                  <tr key={id}>
                    <td>
                      <div className="info-title-dash">{reportante}</div>
                      <div className="info-sub-dash">
                        {formatearFechaAlerta(fechaAlertaDe(alerta))}
                      </div>
                    </td>
                    <td>
                      <span className="badge-dash badge-blue-dash">
                        {tipoAlertaDe(alerta).toLocaleUpperCase('es-CO')}
                      </span>
                    </td>
                    <td>{barrioNombreDe(alerta) || barrioUsuario}</td>
                    <td>
                      <span className={`badge-dash ${claseEstadoAlerta(estado)}`}>
                        {String(estado).replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="text-end">
                      <Link to="/ciudadano/alertas" className="link-btn-dash">
                        Ver alertas
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!errorAlertasComunidad && alertasComunidad !== null && alertasBarrioFiltradas.length > 0 && (
          <div className="paginacion-usu">
            <span>
              Mostrando {Math.min(alertasBarrioFiltradas.length, 4)} de{' '}
              {alertasBarrioFiltradas.length} alertas
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
