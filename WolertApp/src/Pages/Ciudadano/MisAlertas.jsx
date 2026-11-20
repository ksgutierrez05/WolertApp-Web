import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../css/global.css';
import '../../css/temas.css';
import '../../css/ciudadano/panel-mis-alertas.css';
import { listarMisAlertas } from '../../Services/AlertasAPI.js';

// ---------- Utilidades ----------

const normalizar = (t = '') =>
  String(t)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

// El servidor guarda la fecha en UTC pero la manda sin la "Z" al final.
// Sin ella, el navegador la leería como hora local y saldría corrida 5 horas.
const parsearFecha = (valor) => {
  if (!valor) return null;
  const s = String(valor);
  const d = new Date(/(Z|[+-]\d{2}:\d{2})$/i.test(s) ? s : `${s}Z`);
  return isNaN(d) ? null : d;
};

const hace = (fecha) => {
  if (!fecha) return '';
  const min = Math.max(0, Math.round((Date.now() - fecha.getTime()) / 60000));
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Hace ${h} h`;
  return `Hace ${Math.round(h / 24)} d`;
};

const formatoFecha = (fecha) =>
  fecha
    ? fecha.toLocaleString('es-CO', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '';

// Convierte el estado que guarda la BD en uno de los 3 que dibuja la pantalla.
// Si en tu BD los estados se llaman distinto, agrégalos a estas listas.
const estadoUI = (estadoBD) => {
  const e = normalizar(estadoBD);
  if (['resuelto', 'resuelta', 'cerrada', 'cerrado', 'cancelada', 'cancelado', 'finalizada', 'finalizado'].includes(e)) return 'cerrada';
  if (['en_camino', 'en_atencion', 'atendiendo', 'en_revision', 'asignada', 'asignado'].includes(e)) return 'en_revision';
  return 'activa'; // pendiente, activa, nueva, etc.
};

// Traduce una alerta como la manda la API al formato que usa esta pantalla.
// Si algún campo sale vacío, mira en F12 > Network > respuesta de /api/alertas/mias
// cómo se llama de verdad y agrégalo al "??" correspondiente.
const mapearAlerta = (a) => {
  const fecha = parsearFecha(a.fechaCreacion ?? a.fecha ?? a.fechaAlerta);
  const lat = a.latitud ?? a.Latitud;
  const lng = a.longitud ?? a.Longitud;
  return {
    id: a.idAlerta ?? a.IdAlerta ?? a.id,
    tipo: a.tipo ?? a.tipoAlertaNombre ?? a.tipoAlerta?.nombre ?? a.tipoNombre ?? 'Alerta',
    estado: estadoUI(a.estado ?? a.Estado),
    estadoOriginal: a.estado ?? a.Estado ?? '',
    descripcion: a.descripcion ?? '',
    barrio: a.barrioNombre ?? a.barrio?.nombre ?? '',
    comuna: a.comunaNombre ?? a.barrio?.comuna?.nombre ?? '',
    coordenadas: lat != null && lng != null ? `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}` : '',
    fechaObj: fecha,
    fecha: formatoFecha(fecha),
    tiempo: hace(fecha),
  };
};

const colorEstado = (e) => (e === 'activa' ? '#f59e0b' : e === 'en_revision' ? '#3b82f6' : '#10b981');
const labelEstado = (e) => (e === 'activa' ? 'Pendiente' : e === 'en_revision' ? 'En atención' : 'Cerrada');
const iconoEstado = (e) => (e === 'activa' ? 'bi-hourglass-split' : e === 'en_revision' ? 'bi-search' : 'bi-check2-circle');

// ---------- Componente ----------

export default function MisAlertas() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    let activo = true;
    listarMisAlertas()
      .then((datos) => {
        if (!activo) return;
        const lista = datos
          .map(mapearAlerta)
          .sort((x, y) => (y.fechaObj?.getTime() ?? 0) - (x.fechaObj?.getTime() ?? 0));
        setAlertas(lista);
      })
      .catch((err) => {
        if (activo) setError(err.message || 'No se pudieron cargar tus alertas.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => { activo = false; };
  }, []);

  const total = alertas.length;
  const abiertas = alertas.filter((a) => a.estado !== 'cerrada').length;
  const cerradas = alertas.filter((a) => a.estado === 'cerrada').length;

  const filtradas = alertas.filter((a) => {
    if (filtro === 'activa') return a.estado !== 'cerrada';
    if (filtro === 'cerrada') return a.estado === 'cerrada';
    return true;
  });

  const iniciales = (localStorage.getItem('username') || '').slice(0, 2).toUpperCase();

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title-dash"><i className="bi bi-exclamation-triangle"></i> Mis Alertas</h1>
        <div className="d-flex align-items-center gap-3">
          <button className="btn icon-btn-dash rounded-circle border-0 bg-white">
            <i className="bi bi-search"></i>
          </button>
          <div className="avatar-dash">{iniciales}</div>
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
            <p className="kpi-num-dash mb-0">{abiertas}</p>
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
          {cargando && (
            <p className="text-center text-muted small m-4">Cargando tus alertas...</p>
          )}

          {!cargando && error && (
            <p className="text-center small m-4" role="alert" style={{ color: '#b42318' }}>{error}</p>
          )}

          {!cargando && !error && filtradas.length === 0 && (
            <p className="text-center text-muted small m-4">
              {total === 0 ? (
                <>Aún no has reportado alertas. <Link to="/ciudadano/reportar-emergencia">Reportar una emergencia</Link></>
              ) : (
                'No hay alertas en este filtro.'
              )}
            </p>
          )}

          {filtradas.map((a) => (
            <div
              key={a.id}
              className="card-panel-dash p-3 m-3"
              style={{ cursor: 'pointer' }}
              onClick={() => setExpandido(expandido === a.id ? null : a.id)}
            >
              <div className="d-flex align-items-start gap-3">
                <div
                  className="alerta-tipo-icono-dash"
                  style={{
                    fontSize: '24px',
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    backgroundColor: colorEstado(a.estado),
                  }}
                >
                  <i className={`bi ${a.estado === 'activa' ? 'bi-exclamation-triangle-fill' : a.estado === 'en_revision' ? 'bi-search' : 'bi-check-circle-fill'}`}></i>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="info-title-dash mb-1" style={{ fontSize: '11.5px' }}>{a.tipo}</h5>
                      <span className={`badge-dash ${a.estado === 'activa' ? 'badge-amber-dash' : a.estado === 'en_revision' ? 'badge-blue-dash' : 'badge-green-dash'}`}>
                        <i className={`bi ${iconoEstado(a.estado)} me-1`}></i>
                        {labelEstado(a.estado)}
                      </span>
                      {a.descripcion && <p className="mb-2 mt-1">{a.descripcion}</p>}
                      {(a.barrio || a.coordenadas) && (
                        <div className="info-sub-dash">
                          <i className="bi bi-geo-alt me-1"></i>{a.barrio || a.coordenadas}
                        </div>
                      )}
                    </div>
                    <div className="text-end">
                      <button className="btn btn-link p-0" aria-label="Ver detalle" tabIndex={-1}>
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
                          <tr><td className="fw-bold" style={{ width: '40%' }}>Tipo de alerta</td><td>{a.tipo}</td></tr>
                          {a.descripcion && <tr><td className="fw-bold">Descripción</td><td>{a.descripcion}</td></tr>}
                          {a.coordenadas && <tr><td className="fw-bold">Coordenadas</td><td>{a.coordenadas}</td></tr>}
                          {(a.barrio || a.comuna) && (
                            <tr><td className="fw-bold">Barrio / Comuna</td><td>{[a.barrio, a.comuna].filter(Boolean).join(' · ')}</td></tr>
                          )}
                          {a.fecha && <tr><td className="fw-bold">Fecha del reporte</td><td>{a.fecha}</td></tr>}
                          <tr><td className="fw-bold">Estado actual</td><td>{labelEstado(a.estado)}</td></tr>
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