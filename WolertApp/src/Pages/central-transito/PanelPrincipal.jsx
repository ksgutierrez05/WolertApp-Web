import { useState } from 'react';
import Layout from '../../Components/transito/Layout';
import KpiCard from '../../Components/transito/KpiCard';

const COLA = [
  { tipo: 'SEMÁFORO DAÑADO', color: 'amber', lugar: 'Barrio El Poblado', quien: 'Camila Restrepo', espera: '15 min', urgente: true },
  { tipo: 'ACCIDENTE', color: 'red', lugar: 'Calle 33 con Av. Regional', quien: 'Andrés Salazar', espera: '6 min', urgente: true },
  { tipo: 'CHOQUE', color: 'blue', lugar: 'Barrio Belén', quien: 'Mariana Ríos', espera: '4 min', urgente: false },
  { tipo: 'EMBOTELLAMIENTO', color: 'amber', lugar: 'Barrio Laureles', quien: 'Julián Herrera', espera: '2 min', urgente: false },
  { tipo: 'VÍA OBSTRUIDA', color: 'blue', lugar: 'Barrio Manrique', quien: 'Sofía Londoño', espera: '1 min', urgente: false },
];

const AGENTES = [
  { ini: 'AC', nombre: 'Andrea Cárdenas', zona: 'Zona Norte · Moto 14', estado: 'Disponible', badge: 'green' },
  { ini: 'FO', nombre: 'Felipe Ossa', zona: 'Zona Centro · Moto 07', estado: 'En ruta', badge: 'blue' },
  { ini: 'MZ', nombre: 'Manuela Zapata', zona: 'Zona Sur · Moto 22', estado: 'En atención', badge: 'purple' },
  { ini: 'JR', nombre: 'Jorge Iván Ruiz', zona: 'Zona Oriente · Moto 11', estado: 'Disponible', badge: 'green' },
  { ini: 'PG', nombre: 'Paula Andrea Gómez', zona: 'Zona Norte · Moto 03', estado: 'Fuera de servicio', badge: 'gray' },
];

const DESPACHOS = [
  { grupo: 'semaforo', agente: 'Andrea Cárdenas', fecha: '14/9/2026 · 08:50 a.m.', tipo: 'SEMÁFORO DAÑADO', tc: 'amber', barrio: 'El Poblado', estado: 'En atención', ec: 'amber' },
  { grupo: 'accidente', agente: 'Felipe Ossa', fecha: '14/9/2026 · 08:20 a.m.', tipo: 'ACCIDENTE', tc: 'red', barrio: 'Calle 33 con Av. Regional', estado: 'Crítica', ec: 'red' },
  { grupo: 'choque', agente: 'Manuela Zapata', fecha: '13/9/2026 · 09:40 p.m.', tipo: 'CHOQUE', tc: 'blue', barrio: 'Belén', estado: 'En camino', ec: 'blue' },
  { grupo: 'otras', agente: 'Jorge Iván Ruiz', fecha: '13/9/2026 · 07:10 p.m.', tipo: 'EMBOTELLAMIENTO', tc: 'amber', barrio: 'Laureles', estado: 'Resuelta', ec: 'green' },
];

const TABS = [
  { id: 'todas', label: 'Todas (32)' },
  { id: 'semaforo', label: 'Semáforo dañado (11)' },
  { id: 'accidente', label: 'Accidente (8)' },
  { id: 'choque', label: 'Choque (7)' },
  { id: 'otras', label: 'Otras (6)' },
];

export default function PanelPrincipal() {
  const [tab, setTab] = useState('todas');
  const filas = tab === 'todas' ? DESPACHOS : DESPACHOS.filter((d) => d.grupo === tab);
  const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();

  return (
    <Layout rol="central" titulo="Panel Central de Despacho" activo="panel" claseTopbar="mb-4"
      busqueda={{ placeholder: 'Buscar por caso, agente o barrio...' }}>

      {/* hero */}
      <div className="hero-dash hero-img-dash mb-4">
        <div className="eyebrow-dash eyebrow-img-dash">
          <i className="bi bi-shield-check"></i>
          <span>CENTRAL DE DESPACHO · {fecha}</span>
        </div>
        <h1 className="hero-title-dash">¡Bienvenido,<br />central de despacho!</h1>
        <p className="hero-text-dash">
          Hay 9 reportes en cola y 5 agentes en ruta en este momento. Sistema operativo con monitoreo en tiempo real.
        </p>
        <a href="#" className="btn btn-light rounded-pill fw-bold mt-3 hero-cta-dash">
          <span className="dot-danger-dash"></span> Ver cola de despacho
        </a>
      </div>

      {/* KPI */}
      <div className="row g-3 mb-4">
        <KpiCard variante="panel" color="red"   valor="9"       label="Reportes en cola"           icono="bi-inboxes" />
        <KpiCard variante="panel" color="blue"  valor="1.4 min" label="Tiempo prom. de despacho"   icono="bi-stopwatch" />
        <KpiCard variante="panel" color="green" valor="32"      label="Despachos completados hoy"  icono="bi-check2-circle" />
        <KpiCard variante="panel" color="amber" valor="13/15"   label="Agentes en servicio"        icono="bi-shield-check" />
      </div>

      {/* cola de despacho */}
      <div className="sec-head-pd">
        <h2 id="tituloSinAsignar">Cola de despacho</h2>
        <a className="see-all-dash" href="#">Ver todos <i className="bi bi-chevron-right"></i></a>
      </div>
      <div className="panel-pd mb-4">
        <table className="tabla-pd">
          <thead>
            <tr><th>Tipo</th><th>Ubicación / reportante</th><th>Espera</th><th className="text-end">&nbsp;</th></tr>
          </thead>
          <tbody>
            {COLA.map((c) => (
              <tr key={c.lugar} className="unassigned-row-pd">
                <td><span className={`badge-dash badge-${c.color}-dash`}>{c.tipo}</span></td>
                <td>
                  <div className="info-title-dash">{c.lugar}</div>
                  <div className="info-sub-dash">Reportado por {c.quien}</div>
                </td>
                <td><span className={`wait-dash ${c.urgente ? 'wait-urgent-dash' : 'wait-warn-dash'}`}>{c.espera}</span></td>
                <td className="text-end"><button className="assign-btn-pd">Despachar agente</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* mapa */}
      <div className="sec-head-pd"><h2 className="titulos">Mapa de despacho en tiempo real</h2></div>
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
          <div className="map-pin-pd" style={{ left: '22%', top: '26%' }}><span className="dot-pd green"></span></div>
          <div className="map-pin-pd" style={{ left: '41%', top: '18%' }}><span className="dot-pd blue"></span></div>
          <div className="map-pin-pd" style={{ left: '63%', top: '38%' }}><span className="dot-pd purple"></span></div>
          <div className="map-pin-pd" style={{ left: '33%', top: '64%' }}><span className="dot-pd green"></span></div>
          <div className="map-pin-pd" style={{ left: '78%', top: '68%' }}><span className="dot-pd amber"></span></div>
          <div className="map-pin-pd" style={{ left: '17%', top: '83%' }}><span className="dot-pd gray"></span></div>
        </div>
        <div className="map-legend-pd">
          <b>Estado de agentes</b>
          <ul>
            <li><span className="sw-pd" style={{ backgroundColor: 'var(--color-green)' }}></span>Disponible</li>
            <li><span className="sw-pd" style={{ backgroundColor: 'var(--color-blue)' }}></span>En ruta</li>
            <li><span className="sw-pd" style={{ backgroundColor: '#7c4fc9' }}></span>En atención</li>
            <li><span className="sw-pd" style={{ backgroundColor: 'var(--color-amber)' }}></span>En pausa</li>
            <li><span className="sw-pd" style={{ backgroundColor: '#8a94a6' }}></span>Fuera de servicio</li>
          </ul>
        </div>
        <a href="#" className="map-cta-pd"><i className="bi bi-map"></i> Ver mapa completo</a>
      </div>

      {/* agentes en servicio */}
      <div className="sec-head-pd">
        <h2 className="titulos">Agentes en servicio</h2>
        <span className="text-muted small">Actualizado hace 1 min</span>
      </div>
      <div className="agentes-pd mb-4">
        {AGENTES.map((a) => (
          <div key={a.ini} className="agente-row-pd">
            <div className="agente-info-pd">
              <span className="agente-avatar-pd">{a.ini}</span>
              <div>
                <div className="agente-nombre-pd">{a.nombre}</div>
                <div className="agente-zona-pd">{a.zona}</div>
              </div>
            </div>
            <span className={`badge-dash badge-${a.badge}-dash`}>{a.estado}</span>
          </div>
        ))}
      </div>

      {/* últimos despachos */}
      <div className="sec-head-pd">
        <h2 className="titulos">Últimos despachos</h2>
        <a className="see-all-dash" href="#">Ver todos <i className="bi bi-chevron-right"></i></a>
      </div>
      <div className="tabs-pd">
        {TABS.map((t) => (
          <button key={t.id} className={`tab-pd ${tab === t.id ? 'active-pd' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="panel-pd">
        <table className="tabla-pd">
          <thead>
            <tr><th>Agente asignado</th><th>Tipo</th><th>Barrio</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {filas.map((d) => (
              <tr key={d.agente}>
                <td>
                  <div className="info-title-dash">{d.agente}</div>
                  <div className="info-sub-dash">{d.fecha}</div>
                </td>
                <td><span className={`badge-dash badge-${d.tc}-dash`}>{d.tipo}</span></td>
                <td>{d.barrio}</td>
                <td><span className={`badge-dash badge-${d.ec}-dash`}>{d.estado}</span></td>
                <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filas.length === 0 && (
          <p className="text-center text-muted small mb-0" style={{ padding: 20 }}>Ningún despacho coincide con este filtro.</p>
        )}
        <div className="paginacion-pd">
          <span>Mostrando 1–4 de 32 despachos</span>
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