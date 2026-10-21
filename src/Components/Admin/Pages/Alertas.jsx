import { useState } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/admin/alertas.css';

const alertas = [
  { tipo: 'HOMICIDIO', barrio: 'Casimiro Raul Maestre', usuario: 'Katherine Gutierrez', estado: 'pendiente', fecha: '2026-06-13', descripcion: '' },
  { tipo: 'ROBO', barrio: 'Centro', usuario: 'Sofia Barliza', estado: 'unidad_asignada', fecha: '2026-06-10', descripcion: 'Test alerta H' },
  { tipo: 'ROBO', barrio: 'Centro', usuario: 'Sofia Barliza', estado: 'resuelta', fecha: '2026-06-10', descripcion: 'Test alerta G' },
  { tipo: 'ROBO', barrio: 'Centro', usuario: 'Sofia Barliza', estado: 'resuelta', fecha: '2026-06-10', descripcion: 'Test alerta G' },
  { tipo: 'ROBO', barrio: 'Centro', usuario: 'Sofia Barliza', estado: 'resuelta', fecha: '2026-06-10', descripcion: 'Test alerta H' },
  { tipo: 'ROBO', barrio: 'Centro', usuario: 'Sofia Barliza', estado: 'resuelta', fecha: '2026-06-10', descripcion: 'Test alerta F' },
  { tipo: 'ROBO', barrio: 'Centro', usuario: 'Sofia Barliza', estado: 'resuelta', fecha: '2026-06-10', descripcion: 'Test alerta E' },
  { tipo: 'ROBO', barrio: 'Centro', usuario: 'Sofia Barliza', estado: 'resuelta', fecha: '2026-06-10', descripcion: 'Test alerta D' },
  { tipo: 'ROBO', barrio: 'Centro', usuario: 'Sofia Barliza', estado: 'resuelta', fecha: '2026-06-10', descripcion: 'Test alerta C' },
  { tipo: 'ROBO', barrio: 'Centro', usuario: 'Sofia Barliza', estado: 'resuelta', fecha: '2026-06-10', descripcion: 'Test alerta B' },
  { tipo: 'ROBO', barrio: 'Centro', usuario: 'Sofia Barliza', estado: 'resuelta', fecha: '2026-06-10', descripcion: 'Test alerta A' },
  { tipo: 'ROBO', barrio: 'Casimiro Raul Maestre', usuario: 'Katherine Gutierrez', estado: 'resuelta', fecha: '2026-06-05', descripcion: '' },
  { tipo: 'ROBO', barrio: 'Casimiro Raul Maestre', usuario: 'Katherine Gutierrez', estado: 'unidad_asignada', fecha: '2026-06-05', descripcion: '' },
];

const estadoBadgeClase = {
  pendiente: 'alerta-badge-pendiente-dash',
  unidad_asignada: 'alerta-badge-asignada-dash',
  resuelta: 'alerta-badge-resuelta-dash',
};

const estadoLabel = {
  pendiente: 'Pendiente',
  unidad_asignada: 'Unidad asignada',
  resuelta: 'Resuelta',
};

const tipoIconoInfo = {
  HOMICIDIO: { clase: 'alerta-tipo-icono-grave-dash', icono: 'bi-exclamation-octagon-fill' },
  ROBO: { clase: 'alerta-tipo-icono-moderado-dash', icono: 'bi-exclamation-triangle-fill' },
};

const paletaAvatares = ['#1f5fa8', '#1f9d5b', '#7c4fd1', '#c81e2c', '#c9821c', '#0a2f5c'];

function colorParaNombre(nombre) {
  let suma = 0;
  for (let i = 0; i < nombre.length; i++) suma += nombre.charCodeAt(i);
  return paletaAvatares[suma % paletaAvatares.length];
}

function inicialesNombre(nombreCompleto) {
  const partes = nombreCompleto.trim().split(/\s+/);
  return (partes[0][0] + (partes[1] ? partes[1][0] : '')).toUpperCase();
}

function formatearFechaAlerta(fechaIso) {
  const fecha = new Date(fechaIso + 'T00:00:00');
  return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Alertas() {
  const [buscar, setBuscar] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const filtradas = alertas.filter((a) => {
    const texto = buscar.trim().toLowerCase();
    const coincideTexto = !texto ||
      a.barrio.toLowerCase().includes(texto) ||
      a.usuario.toLowerCase().includes(texto) ||
      (a.descripcion || '').toLowerCase().includes(texto);
    const coincideEstado = !filtroEstado || a.estado === filtroEstado;
    const coincideTipo = !filtroTipo || a.tipo === filtroTipo;
    return coincideTexto && coincideEstado && coincideTipo;
  });

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="hero-title-dash" style={{ color: 'var(--ink)', fontSize: '26px' }}>Gestión de Alertas</h1>
        <p className="hero-text-dash" style={{ color: 'var(--muted)' }}>Historial y seguimiento de alertas reportadas por la comunidad</p>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="kpi-dash kpi-amber-dash">
            <i className="bi bi-hourglass-split kpi-icon-dash" />
            <div className="kpi-num-dash">{alertas.filter((a) => a.estado === 'pendiente').length}</div>
            <div className="kpi-label-dash">Pendientes</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Sin unidad asignada</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-dash kpi-blue-dash">
            <i className="bi bi-shield-check kpi-icon-dash" />
            <div className="kpi-num-dash">{alertas.filter((a) => a.estado === 'unidad_asignada').length}</div>
            <div className="kpi-label-dash">Unidad asignada</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>En atención</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-dash kpi-green-dash">
            <i className="bi bi-check-circle kpi-icon-dash" />
            <div className="kpi-num-dash">{alertas.filter((a) => a.estado === 'resuelta').length}</div>
            <div className="kpi-label-dash">Resueltas</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Casos cerrados</div>
          </div>
        </div>
      </div>

      <div className="card-panel-dash p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-lg-6">
            <div className="search-dash d-flex align-items-center bg-white">
              <span className="input-group-text bg-white border-0"><i className="bi bi-search" /></span>
              <input type="text" id="buscador-alertas" className="form-control border-0" placeholder="Buscar por barrio, usuario o descripción..." value={buscar} onChange={(e) => setBuscar(e.target.value)} />
            </div>
          </div>
          <div className="col-lg-3 col-6">
            <select id="filtro-estado-alerta" className="filtro-select-dash form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Estado: Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="unidad_asignada">Unidad asignada</option>
              <option value="resuelta">Resuelta</option>
            </select>
          </div>
          <div className="col-lg-3 col-6">
            <select id="filtro-tipo-alerta" className="filtro-select-dash form-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Tipo: Todos</option>
              <option value="HOMICIDIO">Homicidio</option>
              <option value="ROBO">Robo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-panel-dash">
        <div className="table-responsive">
          <table className="tabla-alertas-dash" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Barrio</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Fecha / Hora</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="alertas-vacio-dash">
                      <i className="bi bi-inboxes" />
                      <p>No se encontraron alertas con esos filtros.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtradas.map((a, i) => {
                  const tipoInfo = tipoIconoInfo[a.tipo] || tipoIconoInfo.ROBO;
                  const colorAvatar = colorParaNombre(a.usuario);
                  return (
                    <tr key={i}>
                      <td>
                        <div className="alerta-tipo-celda-dash">
                          <div className={`alerta-tipo-icono-dash ${tipoInfo.clase}`}>
                            <i className={`bi ${tipoInfo.icono}`} />
                          </div>
                          <span className="alerta-tipo-texto-dash">{a.tipo}</span>
                        </div>
                      </td>
                      <td>{a.barrio.toUpperCase()}</td>
                      <td>
                        <div className="alerta-usuario-celda-dash">
                          <div className="alerta-avatar-dash" style={{ backgroundColor: colorAvatar }}>{inicialesNombre(a.usuario)}</div>
                          <span>{a.usuario.toUpperCase()}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`alerta-badge-dash ${estadoBadgeClase[a.estado]}`}>
                          <span className="dot" />{estadoLabel[a.estado]}
                        </span>
                      </td>
                      <td className="alerta-fecha-dash">{formatearFechaAlerta(a.fecha)} · 08:12 a.m.</td>
                      <td className="celda-desc" title={a.descripcion || ''}>{a.descripcion || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}