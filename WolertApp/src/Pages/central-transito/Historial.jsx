import { useRef, useState } from 'react';
import Layout from '../../Components/transito/Layout';

const CASOS = [
  { tipo: 'semaforo', reporta: 'Camila Restrepo', barrio: 'El Poblado', agente: 'Andrea Cárdenas', fecha: '2026-09-14', cierre: '14/9/2026 · 09:20 a.m.', informe: 'Semáforo reparado por cuadrilla de mantenimiento, intersección operando con normalidad.' },
  { tipo: 'accidente', reporta: 'Andrés Salazar', barrio: 'Calle 33 con Av. Regional', agente: 'Felipe Ossa', fecha: '2026-09-14', cierre: '14/9/2026 · 08:55 a.m.', informe: 'Choque leve entre dos vehículos, sin heridos, tránsito restablecido.' },
  { tipo: 'accidente', reporta: 'Mariana Ríos', barrio: 'Belén', agente: 'Manuela Zapata', fecha: '2026-09-13', cierre: '13/9/2026 · 10:05 p.m.', informe: 'Atropello de ciclista, remitido a ambulancia. Se levantó croquis del siniestro.' },
  { tipo: 'semaforo', reporta: 'Julián Herrera', barrio: 'Laureles', agente: 'Jorge Iván Ruiz', fecha: '2026-09-13', cierre: '13/9/2026 · 07:45 p.m.', informe: 'Semáforo sin luz verde por falla eléctrica. Se desvió el tráfico manualmente.' },
  { tipo: 'accidente', reporta: 'Sofía Londoño', barrio: 'Manrique', agente: 'Andrea Cárdenas', fecha: '2026-09-13', cierre: '13/9/2026 · 04:30 p.m.', informe: 'Colisión múltiple sin lesionados, vehículos retirados de la vía.' },
  { tipo: 'semaforo', reporta: 'Laura Peña', barrio: 'La Nevada', agente: 'Paula Andrea Gómez', fecha: '2026-09-12', cierre: '12/9/2026 · 06:15 p.m.', informe: 'Semáforo intermitente, se reportó a mantenimiento y se reguló el paso.' },
];

const TIPO = {
  semaforo: { txt: 'SEMÁFORO DAÑADO', clase: 'tipo-semaforo-dash' },
  accidente: { txt: 'ACCIDENTE', clase: 'tipo-accidente-dash' },
};

export default function Historial() {
  const [filtro, setFiltro] = useState('todos');
  const [buscar, setBuscar] = useState('');
  const [fecha, setFecha] = useState('');
  const [sel, setSel] = useState(null);
  const fechaRef = useRef(null);

  const abrirCalendario = () => {
    const el = fechaRef.current;
    if (el?.showPicker) el.showPicker();
    else el?.focus();
  };
  const fechaTexto = fecha ? fecha.split('-').reverse().map(Number).join('/') : '';

  const cuenta = (t) => CASOS.filter((c) => c.tipo === t).length;
  const filas = CASOS.filter((c) =>
    (filtro === 'todos' || c.tipo === filtro) &&
    (!fecha || c.fecha === fecha) &&
    `${c.barrio} ${c.agente} ${c.cierre}`.toLowerCase().includes(buscar.toLowerCase()));

  return (
    <Layout rol="central" titulo="Historial de casos" activo="historial"
      busqueda={{ placeholder: 'Buscar por caso, barrio o agente...' }}>

      <div className="mb-4">
        <h1 className="section-title-dash">Historial de casos</h1>
        <p className="section-text-dash mb-0">Consulta los casos de tránsito ya despachados y cerrados.</p>
      </div>

      <div className="table-card-dash">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div className="d-flex gap-2 tabs-dash">
            <button className={`tab-dash ${filtro === 'todos' ? 'active-dash' : ''}`} onClick={() => setFiltro('todos')}>Todos ({CASOS.length})</button>
            <button className={`tab-dash ${filtro === 'accidente' ? 'active-dash' : ''}`} onClick={() => setFiltro('accidente')}>Accidente ({cuenta('accidente')})</button>
            <button className={`tab-dash ${filtro === 'semaforo' ? 'active-dash' : ''}`} onClick={() => setFiltro('semaforo')}>Semáforo dañado ({cuenta('semaforo')})</button>
          </div>
          <div className="d-flex align-items-center flex-wrap gap-2">
            <div className="input-group search-panel-dash">
              <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
              <input type="text" className="form-control border-0" placeholder="Barrio, agente o fecha (13/9/2026)..."
                value={buscar} onChange={(e) => setBuscar(e.target.value)} />
            </div>
            <div className="fecha-wrap-dash">
              <button type="button" className={`btn-fecha-dash ${fecha ? 'activo-dash' : ''}`}
                onClick={abrirCalendario} title="Filtrar por fecha" aria-label="Filtrar por fecha">
                <i className="bi bi-calendar3"></i>
              </button>
              <input ref={fechaRef} type="date" className="fecha-oculta-dash" value={fecha}
                onChange={(e) => setFecha(e.target.value)} tabIndex={-1} aria-hidden="true" />
            </div>
            {fecha && (
              <span className="chip-fecha-dash">
                {fechaTexto}
                <button type="button" onClick={() => setFecha('')} aria-label="Quitar fecha"><i className="bi bi-x"></i></button>
              </span>
            )}
          </div>
        </div>

        <table className="table align-middle mb-0">
          <thead>
            <tr><th>Reportado por</th><th>Tipo</th><th>Barrio</th><th>Agente asignado</th><th>Cierre</th><th className="text-end">&nbsp;</th></tr>
          </thead>
          <tbody>
            {filas.map((c) => (
              <tr key={c.cierre + c.reporta}>
                <td>{c.reporta}</td>
                <td><span className={`badge-tipo-dash ${TIPO[c.tipo].clase}`}>{TIPO[c.tipo].txt}</span></td>
                <td>{c.barrio}</td>
                <td>{c.agente}</td>
                <td>{c.cierre}</td>
                <td className="text-end">
                  <a href="#" className="link-detalle-dash" data-bs-toggle="modal" data-bs-target="#modalDetalle"
                    onClick={(e) => { e.preventDefault(); setSel(c); }}>Ver detalle</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">Mostrando {filas.length} casos cerrados</span>
          <div className="d-flex gap-1">
            <button className="page-btn-dash active-dash">1</button>
          </div>
        </div>
      </div>

      {/* MODAL: DETALLE DEL CASO (SOLO LECTURA) */}
      <div className="modal fade" id="modalDetalle" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content modal-dash">
            <div className="modal-header border-0 pb-0">
              <h5 className="panel-title-dash mb-0">Detalle del caso</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              <span className={`badge-tipo-dash mb-2 d-inline-block ${sel ? TIPO[sel.tipo].clase : ''}`}>{sel ? TIPO[sel.tipo].txt : '—'}</span>
              <div className="perfil-datos-dash">
                <div className="perfil-fila-dash"><span className="perfil-label-dash">Barrio</span><span className="perfil-valor-dash">{sel?.barrio ?? '—'}</span></div>
                <div className="perfil-fila-dash"><span className="perfil-label-dash">Reportado por</span><span className="perfil-valor-dash">{sel?.reporta ?? '—'}</span></div>
                <div className="perfil-fila-dash"><span className="perfil-label-dash">Agente asignado</span><span className="perfil-valor-dash">{sel?.agente ?? '—'}</span></div>
                <div className="perfil-fila-dash"><span className="perfil-label-dash">Cierre</span><span className="perfil-valor-dash">{sel?.cierre ?? '—'}</span></div>
              </div>
              <p className="config-field-label-dash mt-3 mb-1">Informe</p>
              <p className="detalle-descripcion-dash">{sel?.informe ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}