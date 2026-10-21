import { useState } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/ciudadano/panel-alertas.css';

export default function Alertas() {
  const [filtro, setFiltro] = useState('todas');

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
            <p className="kpi-num-dash mb-0" id="kpiAlertasTotal">0</p>
            <p className="kpi-label-dash">Alertas reportadas</p>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="kpi-dash kpi-blue-dash">
            <i className="bi bi-geo kpi-icon-dash"></i>
            <p className="kpi-num-dash mb-0" id="kpiAlertasComuna">0</p>
            <p className="kpi-label-dash" id="kpiAlertasComunaLabel">Alertas en mi comuna</p>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="kpi-dash kpi-amber-dash">
            <i className="bi bi-geo-alt kpi-icon-dash"></i>
            <p className="kpi-num-dash mb-0" id="kpiAlertasBarrio">0</p>
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
          <p className="text-center text-muted small" style={{ padding: '20px' }}>Sin alertas por ahora.</p>
        </div>
      </div>
    </div>
  );
}