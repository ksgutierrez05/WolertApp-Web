import { useState } from 'react';
import Layout from '../../Components/transito/Layout';
import KpiCard from '../../Components/transito/KpiCard';

const CASOS = [
  { id: 101, tipo: 'SEMÁFORO DAÑADO', color: 'amber', lugar: 'Barrio El Poblado', quien: 'Camila Restrepo', espera: '15 min', urgente: true },
  { id: 102, tipo: 'ACCIDENTE', color: 'red', lugar: 'Calle 33 con Av. Regional', quien: 'Andrés Salazar', espera: '6 min', urgente: true },
  { id: 103, tipo: 'CHOQUE', color: 'blue', lugar: 'Barrio Belén', quien: 'Mariana Ríos', espera: '4 min', urgente: false },
  { id: 104, tipo: 'EMBOTELLAMIENTO', color: 'amber', lugar: 'Barrio Laureles', quien: 'Julián Herrera', espera: '2 min', urgente: false },
  { id: 105, tipo: 'VÍA OBSTRUIDA', color: 'blue', lugar: 'Barrio Manrique', quien: 'Sofía Londoño', espera: '1 min', urgente: false },
];

const GRUPOS = [
  { nombre: 'Grupo Alfa', distancia: '0.8 km', disponible: true },
  { nombre: 'Grupo Bravo', distancia: '1.5 km', disponible: true },
  { nombre: 'Grupo Charlie', distancia: '2.3 km', disponible: false },
  { nombre: 'Grupo Delta', distancia: '3.1 km', disponible: true },
  { nombre: 'Grupo Eco', distancia: '4.0 km', disponible: true },
];

export default function CasosSinAsignar() {
  const [caso, setCaso] = useState(null);
  const [filtro, setFiltro] = useState('todos');
  const [buscar, setBuscar] = useState('');

  const grupos = GRUPOS.filter((g) => {
    if (filtro === 'disponible' && !g.disponible) return false;
    if (filtro === 'no-disponible' && g.disponible) return false;
    return g.nombre.toLowerCase().includes(buscar.toLowerCase());
  });

  return (
    <Layout rol="central" titulo="Casos sin asignar" activo="asignar"
      busqueda={{ placeholder: 'Buscar por caso, barrio o agente...' }}>

      <div className="mb-4">
        <h1 className="section-title-dash">Casos sin asignar</h1>
        <p className="section-text-dash mb-0">Asigna cada caso reportado al grupo de tránsito disponible más cercano.</p>
      </div>

      <div className="row g-3 mb-5">
        <KpiCard color="red" valor="6" label="Casos activos" icono="bi-geo-alt" />
        <KpiCard color="blue" valor="2.1 min" label="Tiempo de respuesta" icono="bi-clock" />
        <KpiCard color="green" valor="27" label="Casos cerrados hoy" icono="bi-check2" />
        <KpiCard color="amber" valor="4/5" label="Grupos disponibles" icono="bi-truck" />
      </div>

      <div className="table-card-dash">
        <table className="table align-middle mb-0">
          <thead>
            <tr><th>Tipo</th><th>Ubicación / reportante</th><th>Espera</th><th className="text-end">&nbsp;</th></tr>
          </thead>
          <tbody>
            {CASOS.map((c) => (
              <tr key={c.id}>
                <td><span className={`badge-dash badge-${c.color}-dash`}>{c.tipo}</span></td>
                <td>
                  <div className="info-title-dash">{c.lugar}</div>
                  <div className="info-sub-dash">Reportado por {c.quien}</div>
                </td>
                <td><span className={`wait-dash ${c.urgente ? 'wait-urgent-dash' : 'wait-warn-dash'}`}>{c.espera}</span></td>
                <td className="text-end">
                  <button className="btn-asignar-dash" data-bs-toggle="modal" data-bs-target="#modalAsignar"
                    onClick={() => setCaso(c)}>Asignar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: ASIGNAR GRUPO */}
      <div className="modal fade" id="modalAsignar" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content modal-dash">
            <div className="modal-header border-0 pb-0">
              <div>
                <h5 className="panel-title-dash mb-0">Asignar grupo</h5>
                <p className="modal-subtitulo-dash mb-0">{caso ? `${caso.tipo} · ${caso.lugar}` : 'Caso · Ubicación'}</p>
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div className="d-flex gap-2 tabs-dash">
                  {[['todos', 'Todos'], ['disponible', 'Disponibles'], ['no-disponible', 'No disponibles']].map(([id, txt]) => (
                    <button key={id} className={`tab-dash ${filtro === id ? 'active-dash' : ''}`} onClick={() => setFiltro(id)}>{txt}</button>
                  ))}
                </div>
                <div className="input-group search-panel-dash">
                  <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
                  <input type="text" className="form-control border-0" placeholder="Buscar grupo..."
                    value={buscar} onChange={(e) => setBuscar(e.target.value)} />
                </div>
              </div>

              <div className="tabla-grupos-modal-dash">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr><th>Grupo</th><th>Distancia</th><th>Estado</th><th className="text-end">&nbsp;</th></tr>
                  </thead>
                  <tbody>
                    {grupos.map((g) => (
                      <tr key={g.nombre}>
                        <td>{g.nombre}</td>
                        <td>{g.distancia}</td>
                        <td>
                          <span className={`badge-state-dash ${g.disponible ? 'badge-active-dash' : 'badge-inactive-dash'}`}>
                            {g.disponible ? 'Disponible' : 'No disponible'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button className="btn-asignar-fila-dash" disabled={!g.disponible} data-bs-dismiss="modal">Asignar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}