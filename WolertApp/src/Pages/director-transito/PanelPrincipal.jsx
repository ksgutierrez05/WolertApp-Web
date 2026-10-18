import Layout from '../../Components/director-transito/Layout';

export default function PanelPrincipal() {
  return (
    <Layout titulo="Panel Director de Tránsito" activo="panel" claseTopbar="mb-4"
      busqueda={{ placeholder: 'Buscar por caso, barrio o agente...' }}>

      {/* hero */}
      <div className="hero-dash mb-4">
        <div className="eyebrow-dash">11 de septiembre de 2026 · 08:14 a. m.</div>
        <h1 className="hero-title-dash">Buenos días, Director de Transito</h1>
        <p className="hero-text-dash">
          Hay 6 casos de tránsito activos y 20 reportes registrados en las últimas 24 horas.
          El sistema sigue monitoreando las vías de la ciudad en tiempo real.
        </p>
        <a href="#" className="btn btn-light rounded-pill fw-bold mt-3 hero-cta-dash">
          <span className="dot-danger-dash"></span> Ver casos críticos
        </a>
        <svg className="hero-icon-dash" width="110" height="110" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l8 3v6c0 5-3.4 8.7-8 11-4.6-2.3-8-6-8-11V5l8-3z" stroke="#fff" strokeWidth="1" strokeLinejoin="round" />
        </svg>
      </div>

      {/* KPI */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="kpi-dash kpi-red-dash">
            <i className="bi bi-geo-alt-fill kpi-icon-dash"></i>
            <div className="kpi-num-dash">6</div>
            <div className="kpi-label-dash">Casos activos</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="kpi-dash kpi-blue-dash">
            <i className="bi bi-stopwatch kpi-icon-dash"></i>
            <div className="kpi-num-dash">2.1 min</div>
            <div className="kpi-label-dash">Tiempo de respuesta</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="kpi-dash kpi-green-dash">
            <i className="bi bi-check2-circle kpi-icon-dash"></i>
            <div className="kpi-num-dash">27</div>
            <div className="kpi-label-dash">Casos cerrados hoy</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="kpi-dash kpi-amber-dash">
            <i className="bi bi-shield-check kpi-icon-dash"></i>
            <div className="kpi-num-dash">11/15</div>
            <div className="kpi-label-dash">Agentes disponibles</div>
          </div>
        </div>
      </div>

      {/* casos sin asignar */}
      <div className="sec-head-pd">
        <h2 id="tituloSinAsignar">Casos sin asignar</h2>
        <a className="see-all-dash" href="#">Ver todos <i className="bi bi-chevron-right"></i></a>
      </div>
      <div className="panel-pd mb-4">
        <table className="tabla-pd" id="tablaSinAsignar">
          <thead>
            <tr><th>Tipo</th><th>Ubicación / reportante</th><th>Espera</th><th className="text-end">&nbsp;</th></tr>
          </thead>
          <tbody>
            <tr className="unassigned-row-pd">
              <td><span className="badge-dash badge-amber-dash">SEMÁFORO DAÑADO</span></td>
              <td>
                <div className="info-title-dash">Barrio La Nevada</div>
                <div className="info-sub-dash">Reportado por Laura Peña</div>
              </td>
              <td><span className="wait-dash wait-urgent-dash">12 min</span></td>
              <td className="text-end"><button className="assign-btn-pd">Asignar agente</button></td>
            </tr>
            <tr className="unassigned-row-pd">
              <td><span className="badge-dash badge-red-dash">ACCIDENTE</span></td>
              <td>
                <div className="info-title-dash">Casimiro Raúl Maestre</div>
                <div className="info-sub-dash">Reportado por Katherine Gutiérrez</div>
              </td>
              <td><span className="wait-dash wait-urgent-dash">8 min</span></td>
              <td className="text-end"><button className="assign-btn-pd">Asignar agente</button></td>
            </tr>
            <tr className="unassigned-row-pd">
              <td><span className="badge-dash badge-blue-dash">CHOQUE</span></td>
              <td>
                <div className="info-title-dash">Los Fundadores</div>
                <div className="info-sub-dash">Reportado por Diego Torres</div>
              </td>
              <td><span className="wait-dash wait-warn-dash">5 min</span></td>
              <td className="text-end"><button className="assign-btn-pd">Asignar agente</button></td>
            </tr>
            <tr className="unassigned-row-pd">
              <td><span className="badge-dash badge-amber-dash">EMBOTELLAMIENTO</span></td>
              <td>
                <div className="info-title-dash">El Centro</div>
                <div className="info-sub-dash">Reportado por Ravi Kumar</div>
              </td>
              <td><span className="wait-dash wait-warn-dash">3 min</span></td>
              <td className="text-end"><button className="assign-btn-pd">Asignar agente</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* mapa */}
      <div className="sec-head-pd"><h2 className="titulos">Mapa de tránsito en tiempo real</h2></div>
      <div className="panel-pd mb-4">
        <div className="mapa-canvas-pd">
          <svg className="base-pd" viewBox="0 0 600 320" preserveAspectRatio="none">
            <rect width="600" height="320" fill="#eef2e6" />
            <ellipse cx="470" cy="70" rx="110" ry="80" fill="#dcead2" />
            <ellipse cx="90" cy="240" rx="100" ry="90" fill="#dcead2" />
            <path d="M560,0 C500,60 520,140 470,200 C430,250 460,300 420,320 L600,320 L600,0 Z" fill="#cfe6f0" />
            <g stroke="#d7d2c2" strokeWidth="6">
              <line x1="0" y1="80" x2="600" y2="80" />
              <line x1="0" y1="170" x2="600" y2="170" />
              <line x1="0" y1="250" x2="600" y2="250" />
              <line x1="120" y1="0" x2="120" y2="320" />
              <line x1="260" y1="0" x2="260" y2="320" />
              <line x1="400" y1="0" x2="400" y2="320" />
            </g>
            <line x1="0" y1="130" x2="600" y2="200" stroke="#e7c98a" strokeWidth="9" />
          </svg>
          <div className="map-pin-pd" style={{ left: '20%', top: '28%' }}><span className="dot-pd amber"></span></div>
          <div className="map-pin-pd" style={{ left: '44%', top: '20%' }}><span className="dot-pd purple"></span></div>
          <div className="map-pin-pd" style={{ left: '66%', top: '35%' }}><span className="dot-pd blue"></span></div>
          <div className="map-pin-pd" style={{ left: '35%', top: '62%' }}><span className="dot-pd green"></span></div>
          <div className="map-pin-pd" style={{ left: '76%', top: '70%' }}><span className="dot-pd amber"></span></div>
          <div className="map-pin-pd" style={{ left: '15%', top: '85%' }}><span className="dot-pd gray"></span></div>
        </div>
        <div className="map-legend-pd">
          <b>Estados del caso</b>
          <ul>
            <li><span className="sw-pd" style={{ backgroundColor: 'var(--color-amber)' }}></span>Pendiente</li>
            <li><span className="sw-pd" style={{ backgroundColor: 'var(--color-blue)' }}></span>Recibido</li>
            <li><span className="sw-pd" style={{ backgroundColor: '#7c4fc9' }}></span>En atención</li>
            <li><span className="sw-pd" style={{ backgroundColor: 'var(--color-green)' }}></span>Resuelto</li>
            <li><span className="sw-pd" style={{ backgroundColor: '#8a94a6' }}></span>Cancelado</li>
          </ul>
        </div>
        <a href="#" className="map-cta-pd"><i className="bi bi-map"></i> Ver mapa completo</a>
      </div>

      {/* accidentes por comuna */}
      <div className="sec-head-pd">
        <h2 className="titulos">Accidentes por comuna</h2>
        <span className="text-muted small">Últimos 30 días</span>
      </div>
      <div className="comunas-pd mb-4">
        <div className="comuna-row-pd">
          <span className="nombre-pd">Comuna 1 — Centro</span>
          <div className="pista-pd"><span style={{ width: '82%' }}></span></div>
          <span className="valor-pd">18</span>
        </div>
        <div className="comuna-row-pd">
          <span className="nombre-pd">Comuna 2 — Norte</span>
          <div className="pista-pd"><span style={{ width: '64%' }}></span></div>
          <span className="valor-pd">14</span>
        </div>
        <div className="comuna-row-pd">
          <span className="nombre-pd">Comuna 3 — Sur</span>
          <div className="pista-pd"><span style={{ width: '47%' }}></span></div>
          <span className="valor-pd">10</span>
        </div>
        <div className="comuna-row-pd">
          <span className="nombre-pd">Comuna 4 — Oriente</span>
          <div className="pista-pd"><span style={{ width: '36%' }}></span></div>
          <span className="valor-pd">8</span>
        </div>
      </div>

      {/* últimos casos */}
      <div className="sec-head-pd">
        <h2 className="titulos">Últimos casos de tránsito</h2>
        <a className="see-all-dash" href="#">Ver todos <i className="bi bi-chevron-right"></i></a>
      </div>
      <div className="tabs-pd">
        <button className="tab-pd active-pd">Todas (20)</button>
        <button className="tab-pd">Semáforo dañado (7)</button>
        <button className="tab-pd">Accidente (5)</button>
        <button className="tab-pd">Choque (4)</button>
        <button className="tab-pd">Otras (4)</button>
      </div>
      <div className="panel-pd">
        <table className="tabla-pd">
          <thead>
            <tr><th>Reportado por</th><th>Tipo</th><th>Barrio</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="info-title-dash">Katherine Gutiérrez</div>
                <div className="info-sub-dash">11/9/2026 · 08:12 a.m.</div>
              </td>
              <td><span className="badge-dash badge-amber-dash">SEMÁFORO DAÑADO</span></td>
              <td>Casimiro Raúl Maestre</td>
              <td><span className="badge-dash badge-amber-dash">En atención</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
            <tr>
              <td>
                <div className="info-title-dash">Katherine Gutiérrez</div>
                <div className="info-sub-dash">11/9/2026 · 07:47 a.m.</div>
              </td>
              <td><span className="badge-dash badge-red-dash">ACCIDENTE</span></td>
              <td>Casimiro Raúl Maestre</td>
              <td><span className="badge-dash badge-red-dash">Crítica</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
            <tr>
              <td>
                <div className="info-title-dash">Laura Peña</div>
                <div className="info-sub-dash">10/9/2026 · 10:30 p.m.</div>
              </td>
              <td><span className="badge-dash badge-blue-dash">CHOQUE</span></td>
              <td>Casimiro Raúl Maestre</td>
              <td><span className="badge-dash badge-blue-dash">En camino</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
            <tr>
              <td>
                <div className="info-title-dash">Diego Torres</div>
                <div className="info-sub-dash">10/9/2026 · 07:05 p.m.</div>
              </td>
              <td><span className="badge-dash badge-amber-dash">EMBOTELLAMIENTO</span></td>
              <td>Los Fundadores</td>
              <td><span className="badge-dash badge-green-dash">Resuelta</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
          </tbody>
        </table>
        <div className="paginacion-pd">
          <span>Mostrando 1–4 de 20 reportes</span>
          <div className="paginas-pd">
            <button className="active-pd">1</button>
            <button>2</button>
            <button>3</button>
            <button><i className="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
