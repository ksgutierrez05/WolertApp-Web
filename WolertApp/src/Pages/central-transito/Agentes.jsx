import { useState } from 'react';
import Layout from '../../Components/transito/Layout';
import KpiCard from '../../Components/transito/KpiCard';

const AGENTES = [
  { ini: 'AC', nombre: 'Andrea Cárdenas', cedula: 'CC 1.085.221.404', zona: 'Zona Norte', grupo: 'Grupo Alfa · Moto 14', estado: 'disponible', caso: '—', canal: 'Canal 2' },
  { ini: 'FO', nombre: 'Felipe Ossa', cedula: 'CC 1.085.330.118', zona: 'Zona Centro', grupo: 'Grupo Bravo · Moto 07', estado: 'atencion', caso: 'Accidente · Calle 33', canal: 'Canal 1' },
  { ini: 'MZ', nombre: 'Manuela Zapata', cedula: 'CC 1.085.447.592', zona: 'Zona Sur', grupo: 'Grupo Delta · Moto 22', estado: 'atencion', caso: 'Semáforo dañado · El Poblado', canal: 'Canal 3' },
  { ini: 'JR', nombre: 'Jorge Iván Ruiz', cedula: 'CC 1.085.502.761', zona: 'Zona Oriente', grupo: 'Grupo Eco · Moto 11', estado: 'disponible', caso: '—', canal: 'Canal 2' },
  { ini: 'PG', nombre: 'Paula Andrea Gómez', cedula: 'CC 1.085.618.025', zona: 'Zona Norte', grupo: 'Grupo Charlie · Moto 03', estado: 'no-disponible', caso: '—', canal: 'Canal 4' },
];

const ESTADO = {
  'disponible': { txt: 'Disponible', badge: 'green', avatar: 'green' },
  'atencion': { txt: 'En atención', badge: 'amber', avatar: 'amber' },
  'no-disponible': { txt: 'No disponible', badge: 'red', avatar: 'blue' },
};

export default function Agentes() {
  const [filtro, setFiltro] = useState('todos');
  const [buscar, setBuscar] = useState('');
  const [sel, setSel] = useState(null);

  const cuenta = (e) => AGENTES.filter((a) => a.estado === e).length;
  const filas = AGENTES.filter((a) =>
    (filtro === 'todos' || a.estado === filtro) &&
    `${a.nombre} ${a.zona}`.toLowerCase().includes(buscar.toLowerCase()));

  return (
    <Layout rol="central" titulo="Agentes" activo="agentes"
      busqueda={{ placeholder: 'Buscar por caso, barrio o agente...' }}>

      <div className="mb-4">
        <h1 className="section-title-dash">Agentes</h1>
        <p className="section-text-dash mb-0">Consulta el estado y la disponibilidad de los agentes de tránsito para asignar casos.</p>
      </div>

      <div className="row g-3 mb-5">
        <KpiCard color="blue" valor={AGENTES.length} label="Agentes totales" icono="bi-people" />
        <KpiCard color="green" valor={cuenta('disponible')} label="Disponibles ahora" icono="bi-person-check" />
        <KpiCard color="amber" valor={cuenta('atencion')} label="En atención" icono="bi-cone-striped" />
        <KpiCard color="red" valor={cuenta('no-disponible')} label="No disponibles" icono="bi-person-dash" />
      </div>

      <div className="table-card-dash">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div className="d-flex gap-2 tabs-dash">
            <button className={`tab-dash ${filtro === 'todos' ? 'active-dash' : ''}`} onClick={() => setFiltro('todos')}>Todos ({AGENTES.length})</button>
            <button className={`tab-dash ${filtro === 'disponible' ? 'active-dash' : ''}`} onClick={() => setFiltro('disponible')}>Disponibles ({cuenta('disponible')})</button>
            <button className={`tab-dash ${filtro === 'atencion' ? 'active-dash' : ''}`} onClick={() => setFiltro('atencion')}>En atención ({cuenta('atencion')})</button>
          </div>
          <div className="input-group search-panel-dash">
            <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
            <input type="text" className="form-control border-0" placeholder="Buscar agente o zona..."
              value={buscar} onChange={(e) => setBuscar(e.target.value)} />
          </div>
        </div>

        <table className="table align-middle mb-0">
          <thead>
            <tr><th>Agente</th><th>Zona</th><th>Estado</th><th>Caso actual</th><th className="text-end">&nbsp;</th></tr>
          </thead>
          <tbody>
            {filas.map((a) => (
              <tr key={a.ini}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`avatar-icon-dash avatar-${ESTADO[a.estado].avatar}-dash`}>{a.ini}</span>
                    <div className="info-title-dash">{a.nombre}</div>
                  </div>
                </td>
                <td>{a.zona}</td>
                <td><span className={`badge-dash badge-${ESTADO[a.estado].badge}-dash`}>{ESTADO[a.estado].txt}</span></td>
                <td>{a.caso}</td>
                <td className="text-end">
                  <a href="#" className="link-detalle-dash" data-bs-toggle="modal" data-bs-target="#modalPerfil"
                    onClick={(e) => { e.preventDefault(); setSel(a); }}>Ver perfil</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: PERFIL DEL AGENTE (SOLO LECTURA) */}
      <div className="modal fade" id="modalPerfil" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content modal-dash">
            <div className="modal-header border-0 pb-0">
              <h5 className="panel-title-dash mb-0">Perfil del agente</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              <div className="perfil-header-dash">
                <span className="avatar-icon-dash avatar-blue-dash avatar-grande-dash">{sel?.ini ?? '--'}</span>
                <div>
                  <div className="perfil-nombre-dash">{sel?.nombre ?? '—'}</div>
                  <div className="perfil-cedula-dash">{sel?.cedula ?? '—'}</div>
                </div>
              </div>
              <div className="perfil-datos-dash">
                <div className="perfil-fila-dash"><span className="perfil-label-dash">Zona</span><span className="perfil-valor-dash">{sel?.zona ?? '—'}</span></div>
                <div className="perfil-fila-dash"><span className="perfil-label-dash">Grupo</span><span className="perfil-valor-dash">{sel?.grupo ?? '—'}</span></div>
                <div className="perfil-fila-dash"><span className="perfil-label-dash">Estado</span><span className="perfil-valor-dash">{sel ? ESTADO[sel.estado].txt : '—'}</span></div>
                <div className="perfil-fila-dash"><span className="perfil-label-dash">Caso actual</span><span className="perfil-valor-dash">{sel?.caso ?? '—'}</span></div>
                <div className="perfil-fila-dash"><span className="perfil-label-dash">Canal de radio</span><span className="perfil-valor-dash">{sel?.canal ?? '—'}</span></div>
              </div>
              <p className="perfil-nota-dash">Solo el Director de Tránsito puede editar los datos del agente.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}