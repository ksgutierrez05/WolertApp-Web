import { useState } from 'react';
import Layout from '../../Components/transito/Layout';
import KpiCard from '../../Components/transito/KpiCard';

const CASOS_INICIAL = [
  { id: 1, tipo: 'SEMÁFORO DAÑADO', color: 'amber', lugar: 'Barrio La Nevada', quien: 'Laura Peña', estado: 'pendiente' },
  { id: 2, tipo: 'ACCIDENTE', color: 'red', lugar: 'Casimiro Raúl Maestre', quien: 'Katherine Gutiérrez', estado: 'en_camino' },
  { id: 3, tipo: 'CHOQUE', color: 'blue', lugar: 'Los Fundadores', quien: 'Diego Torres', estado: 'en_sitio' },
];

const SIGUIENTE = { pendiente: 'en_camino', en_camino: 'en_sitio', en_sitio: 'resuelto' };
const ACCION = { pendiente: 'Marcar en camino', en_camino: 'Marcar en sitio', en_sitio: 'Marcar resuelto' };
const ETIQUETA = { pendiente: 'Pendiente', en_camino: 'En camino', en_sitio: 'En sitio' };

const GRUPO = [
  { nombre: 'Ana Salcedo', estado: 'Disponible', clase: 'verde' },
  { nombre: 'Jorge Rueda', estado: 'En camino', clase: 'azul' },
  { nombre: 'Marta Correa', estado: 'En sitio', clase: 'morado' },
  { nombre: 'Ravi Kumar', estado: 'Fuera de servicio', clase: 'gris' },
];

const HISTORIAL = [
  { grupo: 'semaforo', quien: 'Katherine Gutiérrez', fecha: '11/9/2026 · 08:12 a.m.', tipo: 'SEMÁFORO DAÑADO', tc: 'amber', barrio: 'Casimiro Raúl Maestre', estado: 'Resuelto', ec: 'green' },
  { grupo: 'accidente', quien: 'Katherine Gutiérrez', fecha: '11/9/2026 · 07:47 a.m.', tipo: 'ACCIDENTE', tc: 'red', barrio: 'Casimiro Raúl Maestre', estado: 'Crítica', ec: 'red' },
  { grupo: 'choque', quien: 'Laura Peña', fecha: '10/9/2026 · 10:30 p.m.', tipo: 'CHOQUE', tc: 'blue', barrio: 'Casimiro Raúl Maestre', estado: 'Resuelto', ec: 'green' },
  { grupo: 'otras', quien: 'Diego Torres', fecha: '10/9/2026 · 07:05 p.m.', tipo: 'EMBOTELLAMIENTO', tc: 'amber', barrio: 'Los Fundadores', estado: 'Resuelto', ec: 'green' },
];

const TABS = [
  { id: 'todas', label: 'Todas (12)' },
  { id: 'semaforo', label: 'Semáforo dañado (4)' },
  { id: 'accidente', label: 'Accidente (3)' },
  { id: 'choque', label: 'Choque (3)' },
  { id: 'otras', label: 'Otras (2)' },
];

export default function PanelPrincipal() {
  const [casos, setCasos] = useState(CASOS_INICIAL);
  const [resueltos, setResueltos] = useState(5);
  const [tab, setTab] = useState('todas');

  const avanzar = (id) => {
    const caso = casos.find((c) => c.id === id);
    const nuevo = SIGUIENTE[caso.estado];
    if (nuevo === 'resuelto') {
      setCasos((prev) => prev.filter((c) => c.id !== id));
      setResueltos((n) => n + 1);
    } else {
      setCasos((prev) => prev.map((c) => (c.id === id ? { ...c, estado: nuevo } : c)));
    }
  };

  const enCamino = casos.filter((c) => c.estado === 'en_camino').length;
  const filas = tab === 'todas' ? HISTORIAL : HISTORIAL.filter((h) => h.grupo === tab);
  const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();

  return (
    <Layout rol="agente" titulo="Panel Agente de Tránsito" activo="panel" claseTopbar="mb-4"
      avatar="A" notificaciones="3"
      busqueda={{ placeholder: 'Buscar por caso o barrio...' }}>

      {/* hero */}
      <div className="hero-dash hero-img-dash mb-4">
        <div className="eyebrow-dash eyebrow-img-dash">
          <i className="bi bi-shield-check"></i>
          <span>PANEL DEL AGENTE · {fecha}</span>
        </div>
        <h1 className="hero-title-dash">¡Bienvenido,<br />agente Carlos Ríos!</h1>
        <p className="hero-text-dash">
          Tienes {casos.length} {casos.length === 1 ? 'caso asignado' : 'casos asignados'} y {enCamino} en camino en este momento. Este es el resumen de tu turno.
        </p>
        <a href="#" className="btn btn-light rounded-pill fw-bold mt-3 hero-cta-dash">
          <span className="dot-danger-dash"></span> Ver mis casos
        </a>
      </div>

      {/* KPI */}
      <div className="row g-3 mb-4">
        <KpiCard variante="panel" color="red"   valor={casos.length} label="Casos asignados"             icono="bi-file-earmark-text" />
        <KpiCard variante="panel" color="blue"  valor="18 min"       label="Tiempo promedio de atención" icono="bi-stopwatch" />
        <KpiCard variante="panel" color="green" valor={resueltos}    label="Casos resueltos hoy"         icono="bi-check2-circle" />
        <KpiCard variante="panel" color="amber" valor="Disponible"   label="Mi estado"                   icono="bi-shield-check" />
      </div>

      {/* mis casos asignados */}
      <div className="sec-head-ag">
        <h2>Mis casos asignados</h2>
        <a className="see-all-dash" href="#">Ver todos <i className="bi bi-chevron-right"></i></a>
      </div>
      <div className="panel-ag mb-4">
        <table className="tabla-ag">
          <thead>
            <tr><th>Tipo</th><th>Ubicación / reportante</th><th>Estado</th><th className="text-end">&nbsp;</th></tr>
          </thead>
          <tbody>
            {casos.map((c) => (
              <tr key={c.id} className="caso-row-ag">
                <td><span className={`badge-dash badge-${c.color}-dash`}>{c.tipo}</span></td>
                <td>
                  <div className="info-title-dash">{c.lugar}</div>
                  <div className="info-sub-dash">Reportado por {c.quien}</div>
                </td>
                <td><span className={`estado-badge-ag estado-${c.estado}-ag`}>{ETIQUETA[c.estado]}</span></td>
                <td className="text-end"><button className="avanzar-btn-ag" onClick={() => avanzar(c.id)}>{ACCION[c.estado]}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {casos.length === 0 && (
          <p className="text-center text-muted small mb-0" style={{ padding: 20 }}>No tienes casos pendientes por ahora.</p>
        )}
      </div>

      {/* mapa */}
      <div className="sec-head-ag"><h2 className="titulos-ag">Mapa en tiempo real</h2></div>
      <div className="panel-ag mb-4">
        <div className="mapa-canvas-ag">
          <svg className="base-ag" viewBox="0 0 600 320" preserveAspectRatio="none">
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
          <div className="map-pin-ag" style={{ left: '20%', top: '28%' }}><span className="dot-ag amber"></span></div>
          <div className="map-pin-ag" style={{ left: '44%', top: '20%' }}><span className="dot-ag blue"></span></div>
          <div className="map-pin-ag" style={{ left: '66%', top: '35%' }}><span className="dot-ag purple"></span></div>
          <div className="map-pin-ag" style={{ left: '35%', top: '62%' }}><span className="dot-ag green"></span></div>
        </div>
        <div className="map-legend-ag">
          <b>Mis casos</b>
          <ul>
            <li><span className="sw-ag" style={{ backgroundColor: 'var(--color-amber)' }}></span>Pendiente</li>
            <li><span className="sw-ag" style={{ backgroundColor: 'var(--color-blue)' }}></span>En camino</li>
            <li><span className="sw-ag" style={{ backgroundColor: '#7c4fc9' }}></span>En sitio</li>
            <li><span className="sw-ag" style={{ backgroundColor: 'var(--color-green)' }}></span>Resuelto</li>
          </ul>
        </div>
        <a href="#" className="map-cta-ag"><i className="bi bi-map"></i> Ver mapa completo</a>
      </div>

      {/* mi grupo */}
      <div className="sec-head-ag">
        <h2 className="titulos-ag">Mi grupo</h2>
        <a className="see-all-dash" href="#">Ver grupo <i className="bi bi-chevron-right"></i></a>
      </div>
      <div className="grupo-ag mb-4">
        {GRUPO.map((g) => (
          <div key={g.nombre} className="companero-row-ag">
            <span className="nombre-ag">{g.nombre}</span>
            <span className={`estado-mini-ag estado-${g.clase}-ag`}>{g.estado}</span>
          </div>
        ))}
      </div>

      {/* historial de casos */}
      <div className="sec-head-ag">
        <h2 className="titulos-ag">Historial de casos</h2>
        <a className="see-all-dash" href="#">Ver todos <i className="bi bi-chevron-right"></i></a>
      </div>
      <div className="tabs-ag">
        {TABS.map((t) => (
          <button key={t.id} className={`tab-ag ${tab === t.id ? 'active-ag' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="panel-ag">
        <table className="tabla-ag">
          <thead>
            <tr><th>Reportado por</th><th>Tipo</th><th>Barrio</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {filas.map((h) => (
              <tr key={h.fecha}>
                <td>
                  <div className="info-title-dash">{h.quien}</div>
                  <div className="info-sub-dash">{h.fecha}</div>
                </td>
                <td><span className={`badge-dash badge-${h.tc}-dash`}>{h.tipo}</span></td>
                <td>{h.barrio}</td>
                <td><span className={`badge-dash badge-${h.ec}-dash`}>{h.estado}</span></td>
                <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filas.length === 0 && (
          <p className="text-center text-muted small mb-0" style={{ padding: 20 }}>Ningún caso coincide con este filtro.</p>
        )}
        <div className="paginacion-ag">
          <span>Mostrando 1–4 de 12 casos</span>
          <div className="paginas-ag">
            <button className="active-ag">1</button>
            <button>2</button>
            <button>3</button>
            <button><i className="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </Layout>
  );
}