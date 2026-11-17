import { useState } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/ciudadano/panel-notificaciones.css';

const notifs = [
  { id: 1, tipo: 'alerta_vecino', titulo: 'Nueva alerta cerca', mensaje: 'Laura Peña reportó un accidente a 120m.', leida: false, tiempo: 'Hace 5 min' },
  { id: 2, tipo: 'cambio_estado', titulo: 'Tu alerta cambió de estado', mensaje: 'Tu alerta "Riña en la vía pública" pasó a En atención.', leida: true, tiempo: 'Hace 1 h' },
];

export default function Notificaciones() {
  const [filtro, setFiltro] = useState('todas');
  const [lista, setLista] = useState(notifs);

  const marcarTodas = () => setLista((prev) => prev.map((n) => ({ ...n, leida: true })));

  const filtradas = lista.filter((n) => {
    if (filtro === 'no_leidas') return !n.leida;
    if (filtro === 'alerta_vecino') return n.tipo === 'alerta_vecino';
    if (filtro === 'cambio_estado') return n.tipo === 'cambio_estado';
    return true;
  });

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title-dash"><i className="bi bi-bell"></i> Notificaciones</h1>
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
            <i className="bi bi-bell kpi-icon-dash"></i>
            <p className="kpi-num-dash mb-0">{lista.length}</p>
            <p className="kpi-label-dash">Total</p>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="kpi-dash kpi-amber-dash">
            <i className="bi bi-envelope kpi-icon-dash"></i>
            <p className="kpi-num-dash mb-0">{lista.filter((n) => !n.leida).length}</p>
            <p className="kpi-label-dash">No leídas</p>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="kpi-dash kpi-green-dash">
            <i className="bi bi-check2-circle kpi-icon-dash"></i>
            <p className="kpi-num-dash mb-0">{lista.filter((n) => n.leida).length}</p>
            <p className="kpi-label-dash">Leídas</p>
          </div>
        </div>
      </div>

      <div className="card-panel-dash p-0">
        <div className="notif-header-dash p-3">
          <div className="notif-tabs-dash" id="tabsNotif">
            {[
              { key: 'todas', label: 'Todas' },
              { key: 'no_leidas', label: 'No leídas' },
              { key: 'alerta_vecino', label: 'Vecinos' },
              { key: 'cambio_estado', label: 'Mis alertas' },
            ].map((t) => (
              <button
                key={t.key}
                className={`notif-tab-dash ${filtro === t.key ? 'active' : ''}`}
                onClick={() => setFiltro(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button className="notif-clear-dash" id="btnMarcarTodas" onClick={marcarTodas}>Marcar todas como leídas</button>
        </div>
        <div id="listaNotificaciones">
          {filtradas.map((n) => (
            <div key={n.id} className={`d-flex align-items-start gap-3 p-3 border-bottom ${n.leida ? '' : 'bg-light'}`}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                backgroundColor: n.tipo === 'alerta_vecino' ? '#3b82f6' : '#f59e0b',
              }}>
                <i className={`bi ${n.tipo === 'alerta_vecino' ? 'bi-people' : 'bi-bell'}`}></i>
              </div>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start">
                  <span className="fw-bold" style={{ fontSize: '14px' }}>{n.titulo}</span>
                  <span className="info-sub-dash">{n.tiempo}</span>
                </div>
                <span className="small d-block">{n.mensaje}</span>
                {!n.leida && <span className="badge bg-danger rounded-pill mt-1">Nueva</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}