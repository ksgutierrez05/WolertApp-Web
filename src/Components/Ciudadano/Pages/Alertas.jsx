import { useState } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/ciudadano/panel-alertas.css';

const alertasEjemplo = [
  { id: 1, tipo: 'Riña en la vía pública', categoria: 'Disturbio', estado: 'En atención', descripcion: 'Discusión entre varias personas frente al parque principal.', reportadoPor: 'Carlos Ramírez', ubicacion: 'Calle 9 con Cra 12 · Los Fundadores', tiempo: 'Hace 2 h' },
  { id: 2, tipo: 'Semáforo dañado', categoria: 'Infraestructura', estado: 'Pendiente', descripcion: 'Semáforo sin funcionar en la esquina principal.', reportadoPor: 'Laura Peña', ubicacion: 'Casimiro Raúl Maestre', tiempo: 'Hace 1 h' },
];

export default function Alertas() {
  const [filtro, setFiltro] = useState('todas');
  const total = alertasEjemplo.length;
  const miComuna = alertasEjemplo.length;
  const miBarrio = alertasEjemplo.length;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title-dash"><i className="bi bi-broadcast"></i> Alertas</h1>
        <div className="d-flex align-items-center gap-3">
          <button className="btn icon-btn-dash rounded-circle border-0 bg-white">
            <i className="bi bi-search"></i>
          </button>
          <div className="avatar-dash">JC</div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4">
          <div className="kpi-dash kpi-red-dash">
            <i className="bi bi-broadcast kpi-icon-dash"></i>
            <p className="kpi-num-dash mb-0" id="kpiAlertasTotal">{total}</p>
            <p className="kpi-label-dash">Alertas reportadas</p>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="kpi-dash kpi-blue-dash">
            <i className="bi bi-geo kpi-icon-dash"></i>
            <p className="kpi-num-dash mb-0" id="kpiAlertasComuna">{miComuna}</p>
            <p className="kpi-label-dash" id="kpiAlertasComunaLabel">Alertas en mi comuna</p>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="kpi-dash kpi-amber-dash">
            <i className="bi bi-geo-alt kpi-icon-dash"></i>
            <p className="kpi-num-dash mb-0" id="kpiAlertasBarrio">{miBarrio}</p>
            <p className="kpi-label-dash" id="kpiAlertasBarrioLabel">Alertas en mi barrio</p>
          </div>
        </div>
      </div>

      <div className="card-panel-dash p-0">
        <div className="alertas-toolbar-dash">
          <div className="alertas-tabs-dash">
            {['todas','mi_barrio','mi_comuna'].map((f) => (
              <button
                key={f}
                className={`alertas-tab-dash ${filtro === f ? 'active' : ''}`}
                onClick={() => setFiltro(f)}
              >
                {f === 'todas' ? 'Todas' : f === 'mi_barrio' ? 'Mi barrio' : 'Mi comuna'}
              </button>
            ))}
          </div>
        </div>
        <div id="listaAlertas">
          {alertasEjemplo.map((a) => (
            <div key={a.id} className="card-panel-dash p-3 mb-3">
              <div className="d-flex align-items-start gap-3">
                <div className="alerta-tipo-icono-dash" style={{
                  fontSize: '28px',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  backgroundColor: a.estado === 'Pendiente' ? '#f59e0b' : a.estado === 'En atención' ? '#3b82f6' : '#10b981',
                }}>
                  <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="info-title-dash mb-0" style={{ fontSize: '11.5px' }}>{a.tipo}</h5>
                      <span className="badge-dash badge-amber-dash me-2">{a.categoria}</span>
                      <span className="badge-dash badge-blue-dash">{a.estado}</span>
                    </div>
                    <div className="info-sub-dash">{a.tiempo}</div>
                  </div>
                  <p className="mb-2">{a.descripcion}</p>
                  <div className="info-sub-dash">
                    Reportado por {a.reportadoPor}<br />
                    <i className="bi bi-geo-alt me-1"></i>{a.ubicacion}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}