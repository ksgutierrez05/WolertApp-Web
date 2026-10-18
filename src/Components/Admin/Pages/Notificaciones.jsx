import { useState, useMemo } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/admin/notificaciones.css';

const STORAGE_KEY_NOTI = 'wolertapp_notificaciones';

const notificacionesSemilla = [
  { mensaje: 'Una unidad policial ha sido asignada a tu alerta reportada en el barrio Centro.', destinatario: 'sofia@gmail.com', fecha: '2026-06-10T05:42:00', tipo: 'asignacion', estado: 'pendiente' },
  { mensaje: 'Nueva alerta asignada a tu unidad. Revisa el mapa para más detalles.', destinatario: 'miigue05@gmail.com', fecha: '2026-06-10T05:45:00', tipo: 'asignacion', estado: 'error' },
  { mensaje: 'Una unidad policial ha sido asignada a tu alerta reportada en el barrio Centro.', destinatario: 'sofia@gmail.com', fecha: '2026-06-10T05:49:00', tipo: 'asignacion', estado: 'pendiente' },
  { mensaje: 'Nueva alerta asignada a tu unidad. Revisa el mapa para más detalles.', destinatario: 'miigue05@gmail.com', fecha: '2026-06-10T05:55:00', tipo: 'asignacion', estado: 'error' },
  { mensaje: 'Nueva alerta de robo reportada en el barrio San José, a 200 metros de tu ubicación.', destinatario: 'gutierrezkatherine015@gmail.com', fecha: '2026-06-05T12:03:00', tipo: 'alerta', estado: 'enviado' },
  { mensaje: 'Tu cuenta ha sido verificada correctamente. Ya puedes reportar alertas.', destinatario: 'yamil@gmail.com', fecha: '2026-06-04T09:15:00', tipo: 'sistema', estado: 'enviado' },
];

const iconoPorTipo = {
  alerta: { clase: 'noti-icono-alerta-dash', icono: 'bi-exclamation-triangle-fill' },
  asignacion: { clase: 'noti-icono-asignacion-dash', icono: 'bi-shield-check' },
  sistema: { clase: 'noti-icono-sistema-dash', icono: 'bi-gear-fill' },
};

const tipoLabel = { alerta: 'Alerta', asignacion: 'Asignación', sistema: 'Sistema' };
const estadoBadgeClase = { enviado: 'noti-badge-enviado-dash', pendiente: 'noti-badge-pendiente-dash', error: 'noti-badge-error-dash' };
const estadoLabel = { enviado: 'Enviado', pendiente: 'Pendiente', error: 'Error' };

const paletaAvatares = ['#1f5fa8', '#1f9d5b', '#7c4fd1', '#c81e2c', '#c9821c', '#0a2f5c'];

function colorParaCorreo(correo) {
  let suma = 0;
  for (let i = 0; i < correo.length; i++) suma += correo.charCodeAt(i);
  return paletaAvatares[suma % paletaAvatares.length];
}

function inicialesCorreo(correo) {
  return correo.trim()[0].toUpperCase();
}

function formatearFecha(fechaIso) {
  const fecha = new Date(fechaIso);
  const fechaTexto = fecha.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const horaTexto = fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${fechaTexto} · ${horaTexto}`;
}

function tiempoRelativo(fechaIso) {
  const ahora = new Date();
  const fecha = new Date(fechaIso);
  const diffMs = ahora - fecha;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHoras / 24);

  if (diffMin < 1) return 'Hace un momento';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHoras < 24) return `Hace ${diffHoras} h`;
  if (diffDias === 1) return 'Ayer';
  return `Hace ${diffDias} días`;
}

function cargarNotificaciones() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY_NOTI);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {}
  localStorage.setItem(STORAGE_KEY_NOTI, JSON.stringify(notificacionesSemilla));
  return notificacionesSemilla;
}

export default function Notificaciones() {
  const [notificaciones] = useState(() => cargarNotificaciones());
  const [buscar, setBuscar] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const filtradas = useMemo(() => {
    const texto = buscar.trim().toLowerCase();
    const filtradas = notificaciones.filter((n) => {
      const coincideTexto = !texto || n.mensaje.toLowerCase().includes(texto) || n.destinatario.toLowerCase().includes(texto);
      const coincideEstado = !filtroEstado || n.estado === filtroEstado;
      const coincideTipo = !filtroTipo || n.tipo === filtroTipo;
      return coincideTexto && coincideEstado && coincideTipo;
    });
    filtradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    return filtradas;
  }, [notificaciones, buscar, filtroEstado, filtroTipo]);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h1 className="hero-title-dash" style={{ color: 'var(--ink)', fontSize: '26px' }}>Notificaciones del sistema</h1>
          <p className="hero-text-dash" style={{ color: 'var(--muted)' }}>Historial de mensajes enviados a los usuarios</p>
        </div>
        <button type="button" className="btn btn-cv-azul d-inline-flex align-items-center gap-2 px-3 py-2" style={{ borderRadius: '12px', fontSize: '13.5px', fontWeight: '700' }}>
          <i className="bi bi-arrow-clockwise" /> Reintentar fallidas
        </button>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="kpi-dash kpi-blue-dash">
            <i className="bi bi-bell kpi-icon-dash" />
            <div className="kpi-num-dash">{notificaciones.length}</div>
            <div className="kpi-label-dash">Total enviadas</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Últimos registros</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-dash kpi-amber-dash">
            <i className="bi bi-hourglass-split kpi-icon-dash" />
            <div className="kpi-num-dash">{notificaciones.filter((n) => n.estado === 'pendiente').length}</div>
            <div className="kpi-label-dash">Pendientes</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Por confirmar entrega</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-dash kpi-red-dash">
            <i className="bi bi-exclamation-triangle kpi-icon-dash" />
            <div className="kpi-num-dash">{notificaciones.filter((n) => n.estado === 'error').length}</div>
            <div className="kpi-label-dash">Con error</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Necesitan reintento</div>
          </div>
        </div>
      </div>

      <div className="card-panel-dash p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-lg-6">
            <div className="search-dash d-flex align-items-center bg-white">
              <span className="input-group-text bg-white border-0"><i className="bi bi-search" /></span>
              <input type="text" className="form-control border-0" placeholder="Buscar por mensaje o destinatario..." value={buscar} onChange={(e) => setBuscar(e.target.value)} />
            </div>
          </div>
          <div className="col-lg-3 col-6">
            <select className="filtro-select-dash form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Estado: Todos</option>
              <option value="enviado">Enviado</option>
              <option value="pendiente">Pendiente</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="col-lg-3 col-6">
            <select className="filtro-select-dash form-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Tipo: Todos</option>
              <option value="alerta">Alerta</option>
              <option value="asignacion">Asignación</option>
              <option value="sistema">Sistema</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-panel-dash">
        <div className="table-responsive">
          <table className="tabla-noti-dash">
            <thead>
              <tr>
                <th>Mensaje</th>
                <th>Destinatario</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length > 0 ? (
                filtradas.map((n, idx) => {
                  const tipoInfo = iconoPorTipo[n.tipo] || iconoPorTipo.sistema;
                  const color = colorParaCorreo(n.destinatario);
                  return (
                    <tr key={n.mensaje + n.fecha + idx}>
                      <td>
                        <div className="noti-mensaje-celda-dash">
                          <div className={`noti-icono-tipo-dash ${tipoInfo.clase}`}>
                            <i className={`bi ${tipoInfo.icono}`} />
                          </div>
                          <div>
                            <div className="noti-mensaje-texto-dash">{n.mensaje}</div>
                            <div className="noti-mensaje-tipo-dash">{tipoLabel[n.tipo] || 'Sistema'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="noti-destinatario-dash">
                          <div className="noti-avatar-dash" style={{ backgroundColor: color }}>{inicialesCorreo(n.destinatario)}</div>
                          <span className="noti-correo-dash">{n.destinatario}</span>
                        </div>
                      </td>
                      <td>
                        <div className="noti-fecha-dash">{formatearFecha(n.fecha)}</div>
                        <div className="noti-fecha-relativa-dash">{tiempoRelativo(n.fecha)}</div>
                      </td>
                      <td>
                        <span className={`noti-badge-dash ${estadoBadgeClase[n.estado]}`}>
                          <span className="dot" />{estadoLabel[n.estado]}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4}>
                    <div className="noti-vacio-dash">
                      <i className="bi bi-bell-slash" />
                      <p>No se encontraron notificaciones con esos filtros.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}