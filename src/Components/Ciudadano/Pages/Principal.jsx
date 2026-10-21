import { useState, useEffect } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/ciudadano/pagina-principal.css';

import { Link } from 'react-router-dom';

export default function Principal() {
  const [tab, setTab] = useState('todas');
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  useEffect(() => {
    const tick = () => {
      const ahora = new Date();
      setFecha(ahora.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }));
      setHora(ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container-fluid px-4 py-4">
      {/* topbar estilo admin */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="top-bar__brand">
          <span className="top-bar__brand-text">WolertApp</span>
          <span className="top-bar__brand-sub">Panel de Ciudadano</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="text-end">
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
              <i className="bi bi-calendar3" style={{ color: 'var(--color-primary)' }} /> {fecha}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
              <i className="bi bi-clock" /> {hora}
            </div>
          </div>
          <div className="col-auto" style={{ position: 'relative' }}>
            <div className="position-relative d-flex align-items-center justify-content-center rounded-circle bg-white" style={{ cursor: 'pointer', width: '40px', height: '40px', padding: 0, position: 'relative', borderRadius: '9999px', border: '1px solid #e2e8f0' }} onClick={() => setShowNotif((s) => !s)}>
              <i className="bi bi-bell"></i>
              <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle">2</span>
            </div>
            {showNotif && (
              <div className="top-bar__dropdown" style={{ right: 0, top: 'calc(100% + 8px)', width: '320px' }}>
                <div className="top-bar__dropdown-header">
                  <span className="top-bar__dropdown-title">Notificaciones</span>
                  <span className="top-bar__dropdown-mark-all" style={{ cursor: 'pointer' }}>Marcar todo como leído</span>
                </div>
                <div className="top-bar__dropdown-list">
                  <div className="top-bar__notif-item unread">
                    <div className="top-bar__notif-item-icon bg-blue"><i className="bi bi-bell" /></div>
                    <div className="top-bar__notif-item-content">
                      <div className="top-bar__notif-item-title">Nueva alerta cerca</div>
                      <div className="top-bar__notif-item-sub">Laura Peña reportó un accidente</div>
                      <div className="top-bar__notif-item-time">hace 5 min</div>
                    </div>
                  </div>
                </div>
                <div className="top-bar__dropdown-footer">
                  <Link to="/ciudadano/notificaciones" className="top-bar__dropdown-link" onClick={() => setShowNotif(false)}>
                    Ver todas las notificaciones
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className={`top-bar__user ${showUser ? 'open' : ''}`}
              onClick={() => setShowUser((s) => !s)}
              aria-expanded={showUser}
            >
              <div className="top-bar__user-avatar"><i className="bi bi-person-circle" /></div>
              <div className="top-bar__user-info">
                <div className="top-bar__user-name">Juan Carlos Pérez</div>
                <div className="top-bar__user-email">ciudadano@wolertapp.com</div>
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
                  <button type="button" className="top-bar__dropdown-link top-bar__dropdown-link--danger" onClick={() => setShowUser(false)}>
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
      <div className="hero-dash mb-4">
        <div className="eyebrow-dash">11 de septiembre de 2026 · 08:14 a. m.</div>
        <h1 className="hero-title-dash">Buenos días, Juan Carlos Pérez</h1>
        <p className="hero-text-dash">Tienes 2 alertas activas y 6 vecinos conectados cerca de ti. Este es tu resumen de seguridad.</p>
        <a href="#" className="btn btn-light rounded-pill fw-bold mt-3 hero-cta-dash">
          <span className="dot-danger-dash"></span> Reportar una alerta
        </a>
        <svg className="hero-icon-dash" width="110" height="110" viewBox="0 0 24 24" fill="none"><path d="M12 2l8 3v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5l8-3z" stroke="#fff" strokeWidth="1" strokeLinejoin="round"/></svg>
      </div>

      {/* KPI */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="kpi-dash kpi-red-dash">
            <i className="bi bi-exclamation-triangle kpi-icon-dash"></i>
            <div className="kpi-num-dash" id="kpiAlertasActivas">2</div>
            <div className="kpi-label-dash">Mis alertas activas</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="kpi-dash kpi-blue-dash">
            <i className="bi bi-people kpi-icon-dash"></i>
            <div className="kpi-num-dash">6</div>
            <div className="kpi-label-dash">Vecinos conectados</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="kpi-dash kpi-green-dash">
            <i className="bi bi-check2-circle kpi-icon-dash"></i>
            <div className="kpi-num-dash">9</div>
            <div className="kpi-label-dash">Alertas resueltas este mes</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="kpi-dash kpi-amber-dash">
            <i className="bi bi-shield-check kpi-icon-dash"></i>
            <div className="kpi-num-dash">Zona segura</div>
            <div className="kpi-label-dash">Estado de mi barrio</div>
          </div>
        </div>
      </div>

      {/* SOS */}
      <div className="sos-panel-usu mb-4">
        <div className="sos-panel-texto-usu">
          <span className="sos-panel-badge-usu"><i className="bi bi-bell-fill"></i></span>
          <div>
            <div className="sos-panel-titulo-usu">Botón de emergencia</div>
            <div className="sos-panel-sub-usu">Envía tu ubicación en tiempo real a la policía y a tus vecinos conectados.</div>
          </div>
        </div>
        <button className="sos-btn-usu" type="button" title="Enviar alerta de emergencia">
          <span className="sos-pulso-usu"></span>
          <span className="sos-contenido-usu">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>SOS</span>
          </span>
        </button>
      </div>

      {/* MIS ALERTAS */}
      <div className="sec-head-usu">
        <h2 id="tituloMisAlertas">Mis alertas</h2>
        <a className="see-all-dash" href="#">Ver todas <i className="bi bi-chevron-right"></i></a>
      </div>
      <div className="panel-usu mb-4">
        <table className="tabla-usu" id="tablaMisAlertas">
          <thead>
            <tr>
              <th>Tipo</th><th>Ubicación</th><th>Estado</th><th className="text-end">&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <tr className="alerta-row-usu" data-id="1" data-estado="pendiente">
              <td><span className="badge-dash badge-amber-dash">SEMÁFORO DAÑADO</span></td>
              <td>
                <div className="info-title-dash">Casimiro Raúl Maestre</div>
                <div className="info-sub-dash">Reportada hoy · 08:12 a.m.</div>
              </td>
              <td><span className="estado-badge-usu estado-pendiente-usu" data-estado-label>Pendiente</span></td>
              <td className="text-end"><button className="cancelar-btn-usu" data-id="1" data-accion>Cancelar</button></td>
            </tr>
            <tr className="alerta-row-usu" data-id="2" data-estado="en_camino">
              <td><span className="badge-dash badge-red-dash">ACCIDENTE</span></td>
              <td>
                <div className="info-title-dash">Casimiro Raúl Maestre</div>
                <div className="info-sub-dash">Reportada hoy · 07:47 a.m.</div>
              </td>
              <td><span className="estado-badge-usu estado-en_camino-usu" data-estado-label>En camino</span></td>
              <td className="text-end"><button className="cancelar-btn-usu" data-id="2" data-accion disabled>En atención</button></td>
            </tr>
          </tbody>
        </table>
        <p className="text-center text-muted small mb-0 d-none" id="mensajeMisAlertasVacio" style={{ padding: '20px' }}>
          No tienes alertas activas por ahora.
        </p>
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
        <h2 className="titulos-usu">Últimas alertas del barrio</h2>
        <a className="see-all-dash" href="#">Ver todas <i className="bi bi-chevron-right"></i></a>
      </div>
      <div className="tabs-usu" id="tabsUltimasAlertas">
        {['Todas (12)','Semáforo dañado (4)','Accidente (3)','Choque (3)','Otras (2)'].map((t, i) => (
          <button key={t} className={`tab-usu ${i === 0 ? 'active-usu' : ''}`} data-tipo={t}>{t}</button>
        ))}
      </div>
      <div className="panel-usu">
        <table className="tabla-usu" id="tablaUltimasAlertas">
          <thead>
            <tr>
              <th>Reportado por</th><th>Tipo</th><th>Barrio</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr data-tipo="semaforo">
              <td>
                <div className="info-title-dash">Katherine Gutiérrez</div>
                <div className="info-sub-dash">11/9/2026 · 08:12 a.m.</div>
              </td>
              <td><span className="badge-dash badge-amber-dash">SEMÁFORO DAÑADO</span></td>
              <td>Casimiro Raúl Maestre</td>
              <td><span className="badge-dash badge-amber-dash">Pendiente</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
            <tr data-tipo="accidente">
              <td>
                <div className="info-title-dash">Katherine Gutiérrez</div>
                <div className="info-sub-dash">11/9/2026 · 07:47 a.m.</div>
              </td>
              <td><span className="badge-dash badge-red-dash">ACCIDENTE</span></td>
              <td>Casimiro Raúl Maestre</td>
              <td><span className="badge-dash badge-blue-dash">En camino</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
            <tr data-tipo="choque">
              <td>
                <div className="info-title-dash">Laura Peña</div>
                <div className="info-sub-dash">10/9/2026 · 10:30 p.m.</div>
              </td>
              <td><span className="badge-dash badge-blue-dash">CHOQUE</span></td>
              <td>Casimiro Raúl Maestre</td>
              <td><span className="badge-dash badge-green-dash">Resuelto</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
            <tr data-tipo="otras">
              <td>
                <div className="info-title-dash">Diego Torres</div>
                <div className="info-sub-dash">10/9/2026 · 07:05 p.m.</div>
              </td>
              <td><span className="badge-dash badge-amber-dash">EMBOTELLAMIENTO</span></td>
              <td>Los Fundadores</td>
              <td><span className="badge-dash badge-green-dash">Resuelto</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
          </tbody>
        </table>
        <p className="text-center text-muted small mb-0 d-none" id="mensajeUltimasAlertasVacio" style={{ padding: '20px' }}>
          Ningún caso coincide con este filtro.
        </p>
        <div className="paginacion-usu">
          <span>Mostrando 1–4 de 12 alertas</span>
          <div className="paginas-usu">
            <button className="active-usu">1</button>
            <button>2</button>
            <button>3</button>
            <button><i className="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </div>
  );
}