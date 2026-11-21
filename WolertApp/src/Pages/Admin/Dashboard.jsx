import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../css/global.css';
import '../../css/temas.css';
import '../../css/admin/dashboard-admin.css';
import '../../css/admin/dashboard-refinado.css';
import { obtenerDatosEstadisticas } from '../../Services/HistorialEstadisticasService.js';

const estiloPrioridad = {
  alta: { icon: 'bi-exclamation-triangle', color: 'var(--color-danger)' },
  media: { icon: 'bi-shield-exclamation', color: 'var(--color-amber)' },
  baja: { icon: 'bi-shield-exclamation', color: 'var(--color-green)' },
};

export default function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [alertas, setAlertas] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    obtenerDatosEstadisticas(controller.signal)
      .then(({ datos: resultado }) => {
        if (controller.signal.aborted) return;
        setDatos(resultado);
        setAlertas([...(resultado.alertas || [])]
          .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))
          .slice(0, 3));
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error('Error cargando resumen del dashboard:', err);
        setDatos({});
        setAlertas([]);
      });
    return () => controller.abort();
  }, []);
  const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  const h = new Date().getHours();
  const saludo = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';

  // Indicadores reales de distintas áreas del sistema.
  const cargando = datos === null;
  const alertasTotal = datos?.alertas?.length ?? 0;
  const atencionesTotal = datos?.atenciones?.length ?? 0;
  const personalDisponible = datos?.policias?.filter((p) => ['ACTIVO', 'DISPONIBLE'].includes((p.estado || '').toUpperCase())).length ?? 0;
  const unidadesDisponibles = datos?.unidades?.filter((u) => ['ACTIVO', 'DISPONIBLE'].includes((u.estado || '').toUpperCase())).length ?? 0;

  const kpis = [
    { color: 'kpi-blue-dash', icon: 'bi-bell', num: cargando ? '...' : String(alertasTotal), label: 'Alertas recibidas', sub: 'Total en el sistema' },
    { color: 'kpi-green-dash', icon: 'bi-headset', num: cargando ? '...' : String(atencionesTotal), label: 'Atenciones registradas', sub: 'Intervenciones realizadas' },
    { color: 'kpi-amber-dash', icon: 'bi-shield-check', num: cargando ? '...' : String(personalDisponible), label: 'Personal disponible', sub: 'Policías activos o disponibles' },
    { color: 'kpi-purple-dash', icon: 'bi-truck-front', num: cargando ? '...' : String(unidadesDisponibles), label: 'Unidades disponibles', sub: 'Activas o listas para operar' },
  ];
  const alertasRecientes = (alertas || []).map((a) => {
    const est = estiloPrioridad[(a.prioridad || '').toLowerCase()] || estiloPrioridad.baja;
    return {
      id: a.idAlerta,
      icon: est.icon,
      color: est.color,
      title: `${(a.tipo || '').toUpperCase()}${a.barrioNombre ? ' en ' + a.barrioNombre.toUpperCase() : ''}`,
      sub: `Reportado por ${(a.reportadoPor || '').toUpperCase()}`,
    };
  });

  // Actividad reciente: las mismas alertas, con su fecha
  const actividad = (alertas || []).map((a) => {
    const est = estiloPrioridad[(a.prioridad || '').toLowerCase()] || estiloPrioridad.baja;
    return {
      id: a.idAlerta,
      icon: 'bi-bell-fill',
      color: est.color,
      title: `${(a.tipo || '').toUpperCase()}${a.barrioNombre ? ' — ' + a.barrioNombre.toUpperCase() : ''}`,
      sub: a.fecha ? new Date(a.fecha).toLocaleDateString() : '—',
    };
  });

  return (
    <div className="container-fluid dashboard-admin-refinado">
      <div
        className="hero-dash hero-admin-adm mb-3"
        style={{ '--hero-img': 'url("/img/Hero-admin.jpg")' }}
      >
        <div className="eyebrow-dash">
          <i className="bi bi-shield-check" /> Panel de control · {fecha}
        </div>
        <h1 className="hero-title-dash">{saludo}, administrador</h1>
        <p className="hero-text-dash">Panel de control y monitoreo del sistema</p>
        <i className="bi bi-shield-check hero-icon-dash" style={{ fontSize: '90px' }} />
      </div>
      
      <div className="row g-3 mb-3">
        {kpis.map((k) => (
          <div key={k.label} className="col-md-3">
            <div className={`kpi-dash ${k.color}`}>
              <i className={`bi ${k.icon} kpi-icon-dash`} />
              <div className="kpi-num-dash">{k.num}</div>
              <div className="kpi-label-dash">{k.label}</div>
              <div className="kpi-label-dash" style={{ marginTop: '2px' }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card-panel-dash p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                <div className="side-cta-icon-dash" style={{ background: '#fce8e9', width: '32px', height: '32px' }}>
                  <i className="bi bi-bell-fill" style={{ color: 'var(--color-danger)', fontSize: '14px' }} />
                </div>
                <h3 className="section-title-dash">Alertas recientes</h3>
              </div>
              <Link to="/admin/alertas" className="see-all-dash">Ver todas <i className="bi bi-chevron-right" /></Link>
            </div>
            {alertas === null && <div className="info-sub-dash border-top pt-2">Cargando alertas...</div>}
            {alertas !== null && alertasRecientes.length === 0 && (
              <div className="info-sub-dash border-top pt-2">No hay alertas registradas.</div>
            )}
            {alertasRecientes.map((a) => (
              <div key={a.id} className="border-top pt-2 pb-2 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span className="dot-danger-dash" style={{ background: a.color }} />
                  <div className="icon-btn-dash d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                    <i className={`bi ${a.icon}`} style={{ color: a.color }} />
                  </div>
                  <div>
                    <div className="info-title-dash">{a.title}</div>
                    <div className="info-sub-dash">{a.sub}</div>
                  </div>
                </div>
                <i className="bi bi-chevron-right" style={{ color: 'var(--subtle)' }} />
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <div className="card-panel-dash p-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="side-cta-icon-dash" style={{ background: '#e8f0fb', width: '32px', height: '32px' }}>
                <i className="bi bi-clock-history" style={{ color: 'var(--color-blue)', fontSize: '14px' }} />
              </div>
              <h3 className="section-title-dash">Actividad reciente</h3>
            </div>
            {alertas !== null && actividad.length === 0 && (
              <div className="info-sub-dash border-top pt-2">Sin actividad reciente.</div>
            )}
            {actividad.map((a) => (
              <div key={a.id} className="border-top pt-2 pb-2 d-flex align-items-center gap-2">
                <div className="icon-btn-dash d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <i className={`bi ${a.icon}`} style={{ color: a.color }} />
                </div>
                <div>
                  <div className="info-title-dash">{a.title}</div>
                  <div className="info-sub-dash">{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
