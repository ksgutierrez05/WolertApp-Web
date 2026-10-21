import { useState } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/ciudadano/panel-mis-alertas.css';

const misAlertas = [
  {
    id: 1,
    tipo: 'Robo a transeúnte',
    categoria: 'Robo',
    estado: 'activa',
    descripcion: 'Dos personas en moto me arrebataron el celular cuando salía de la tienda.',
    reportadoPor: 'María González',
    direccion: 'Cra 12 # 8-40',
    barrio: 'Los Fundadores',
    comuna: 'Comuna 3',
    fecha: '20 de oct de 2026, 07:30 p. m.',
    tiempo: 'Hace 4 h',
    notas: 'La moto era negra, sin placa visible. Dos hombres, uno con chaqueta roja.',
  },
  {
    id: 2,
    tipo: 'ACCIDENTE',
    estado: 'en_revision',
    categoria: 'Accidente',
    descripcion: 'Choque leve en la esquina principal.',
    reportadoPor: 'Laura Peña',
    direccion: 'Calle 9 con Cra 12',
    barrio: 'Casimiro Raúl Maestre',
    comuna: 'Comuna 1',
    fecha: 'Hoy · 07:47 a.m.',
    tiempo: 'Hace 3 h',
    notas: '',
  },
];

export default function MisAlertas() {
  const [filtro, setFiltro] = useState('todas');
  const [expandido, setExpandido] = useState(null);

  const total = misAlertas.length;
  const activas = misAlertas.filter((a) => a.estado === 'activa').length;
  const cerradas = misAlertas.filter((a) => a.estado === 'cerrada').length;

  const filtradas = misAlertas.filter((a) => filtro === 'todas' || a.estado === filtro);

  const colorEstado = (e) => (e === 'activa' ? '#f59e0b' : e === 'en_revision' ? '#3b82f6' : '#10b981');
  const labelEstado = (e) => (e === 'activa' ? 'Activa' : e === 'en_revision' ? 'En revisión' : 'Cerrada');
  const iconoEstado = (e) => (e === 'activa' ? 'bi-hourglass-split' : e === 'en_revision' ? 'bi-search' : 'bi-check2-circle');

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
            <div key={a.id} className="card-panel-dash p-3 m-3" style={{ cursor: 'pointer' }} onClick={() => setExpandido(expandido === a.id ? null : a.id)}>
              <div className="d-flex align-items-start gap-3">
                <div className="alerta-tipo-icono-dash" style={{
                  fontSize: '24px',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  backgroundColor: colorEstado(a.estado),
                }}>
                  <i className={`bi ${a.estado === 'activa' ? 'bi-exclamation-triangle-fill' : a.estado === 'en_revision' ? 'bi-search' : 'bi-check-circle-fill'}`}></i>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="info-title-dash mb-0" style={{ fontSize: '11.5px' }}>{a.tipo}</h5>
                      <span className="badge-dash badge-amber-dash me-2">{a.categoria}</span>
                      <span className={`badge-dash ${a.estado === 'activa' ? 'badge-amber-dash' : a.estado === 'en_revision' ? 'badge-blue-dash' : 'badge-green-dash'}`}>
                        <i className={`bi ${iconoEstado(a.estado)} me-1`}></i>
                        {labelEstado(a.estado)}
                      </span>
                      <p className="mb-2 mt-1">{a.descripcion}</p>
                      <div className="info-sub-dash"><i className="bi bi-geo-alt me-1"></i>{a.direccion} · {a.ubicacion}</div>
                    </div>
                    <div className="text-end">
                      <button
                        className="btn btn-link p-0"
                        aria-label="Ver detalle"
                        tabIndex={-1}
                      >
                        <i className={`bi ${expandido === a.id ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                      </button>
                      <div className="info-sub-dash mt-1">{a.tiempo}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      maxHeight: expandido === a.id ? '400px' : '0',
                      overflow: 'hidden',
                      transition: 'max-height 0.3s ease',
                    }}
                  >
                    <div className="mt-3 pt-3 border-top" style={{ fontSize: '13px' }}>
                      <table className="table table-sm mb-0">
                        <tbody>
                          <tr><td className="fw-bold" style={{ width: '40%' }}>Tipo de alerta</td><td>{a.categoria}</td></tr>
                          <tr><td className="fw-bold">Descripción</td><td>{a.descripcion}</td></tr>
                          <tr><td className="fw-bold">Dirección</td><td>{a.direccion}</td></tr>
                          <tr><td className="fw-bold">Barrio / Comuna</td><td>{a.barrio} · {a.comuna}</td></tr>
                          <tr><td className="fw-bold">Fecha del reporte</td><td>{a.fecha}</td></tr>
                          <tr><td className="fw-bold">Estado actual</td><td>{labelEstado(a.estado)}</td></tr>
                          {a.notas && <tr><td className="fw-bold">Notas que agregué</td><td>{a.notas}</td></tr>}
                        </tbody>
                      </table>
                    </div>
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