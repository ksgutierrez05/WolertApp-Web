import { useState } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/ciudadano/panel-mis-alertas.css';

const misAlertas = [
  { id: 1, tipo: 'Riña en la vía pública', estado: 'activa', fecha: 'Hoy · 08:12 a.m.', ubicacion: 'Casimiro Raúl Maestre' },
  { id: 2, tipo: 'ACCIDENTE', estado: 'en_revision', fecha: 'Hoy · 07:47 a.m.', ubicacion: 'Casimiro Raúl Maestre' },
  { id: 3, tipo: 'CHOQUE', estado: 'cerrada', fecha: 'Ayer · 10:30 p.m.', ubicacion: 'Los Fundadores' },
];

export default function MisAlertas() {
  const [filtro, setFiltro] = useState('todas');

  const total = misAlertas.length;
  const activas = misAlertas.filter((a) => a.estado === 'activa').length;
  const cerradas = misAlertas.filter((a) => a.estado === 'cerrada').length;

  const filtradas = misAlertas.filter((a) => filtro === 'todas' || a.estado === filtro);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title-dash"><i className="bi bi-exclamation-triangle"></i> Mis Alertas</h1>
        <div className="d-flex align-items-center gap-3">
          <button className="btn icon-btn-dash rounded-circle border-0 bg-white">
            <i className="bi bi-search"></i>
          </button>
          <div className="avatar-dash">JC</div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4">
          <div className="kpi-dash kpi-blue-dash">
            <i className="bi bi-clipboard-data kpi-icon-dash"></i>
            <p className="kpi-num-dash mb-0">{total}</p>
            <p className="kpi-label-dash">Alertas que he reportado</p>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="kpi-dash kpi-amber-dash">
            <i className="bi bi-hourglass-split kpi-icon-dash"></i>
            <p className="kpi-num-dash mb-0">{activas}</p>
            <p className="kpi-label-dash">Activas / en atención</p>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="kpi-dash kpi-green-dash">
            <i className="bi bi-check2-circle kpi-icon-dash"></i>
            <p className="kpi-num-dash mb-0">{cerradas}</p>
            <p className="kpi-label-dash">Cerradas</p>
          </div>
        </div>
      </div>

      <div className="card-panel-dash p-0">
        <div className="misalertas-toolbar-dash">
          <div className="misalertas-tabs-dash">
            {['todas', 'activa', 'cerrada'].map((f) => (
              <button
                key={f}
                className={`misalertas-tab-dash ${filtro === f ? 'active' : ''}`}
                onClick={() => setFiltro(f)}
              >
                {f === 'todas' ? 'Todas' : f === 'activa' ? 'Activas' : 'Cerradas'}
              </button>
            ))}
          </div>
        </div>

        <div id="listaMisAlertas">
          {filtradas.map((a) => (
            <div key={a.id} className="card-panel-dash p-3 m-3">
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
                  backgroundColor: a.estado === 'activa' ? '#f59e0b' : a.estado === 'en_revision' ? '#3b82f6' : '#10b981',
                }}>
                  <i className={`bi ${a.estado === 'activa' ? 'bi-exclamation-triangle-fill' : a.estado === 'en_revision' ? 'bi-search' : 'bi-check-circle-fill'}`}></i>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="info-title-dash mb-1">{a.tipo}</h5>
                      <div className="info-sub-dash">{a.ubicacion} · {a.fecha}</div>
                    </div>
                    <span className={`badge-dash ${a.estado === 'activa' ? 'badge-amber-dash' : a.estado === 'en_revision' ? 'badge-blue-dash' : 'badge-green-dash'}`}>
                      <i className={`bi ${a.estado === 'activa' ? 'bi-hourglass-split' : a.estado === 'en_revision' ? 'bi-search' : 'bi-check2-circle'} me-1`}></i>
                      {a.estado === 'activa' ? 'Activa' : a.estado === 'en_revision' ? 'En revisión' : 'Cerrada'}
                    </span>
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