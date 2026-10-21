import { useState } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/ciudadano/pagina-principal.css';

export default function Principal() {
  const [tab, setTab] = useState('todas');

  return (
    <div className="container-fluid px-4 py-4">
      {/* topbar */}
      <div className="row g-3 align-items-center mb-4">
        <div className="col">
          <div className="input-group search-dash">
            <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
            <input type="text" className="form-control border-0" placeholder="Buscar en tu barrio..." />
          </div>
        </div>
        <div className="col-auto">
          <button className="btn btn-light rounded-circle position-relative icon-btn-dash">
            <i className="bi bi-bell"></i>
            <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle">2</span>
          </button>
        </div>
        <div className="col-auto">
          <span className="avatar-dash" title="Mostrar/ocultar perfil">K</span>
        </div>
      </div>

      {/* hero */}
      <div className="hero-dash mb-4">
        <div className="eyebrow-dash">11 de septiembre de 2026 · 08:14 a. m.</div>
        <h1 className="hero-title-dash">Buenos días, Katherine Gutiérrez</h1>
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