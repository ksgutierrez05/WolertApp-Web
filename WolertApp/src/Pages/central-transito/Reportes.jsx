import { useState } from 'react';
import Layout from '../../Components/transito/Layout';

const INICIAL = [
  { id: 1, caso: 'Choque · Calle 33 con Av. Regional', barrio: 'Av. Regional', agente: 'Felipe Ossa', cierre: '09:35 a.m.', informe: null },
  { id: 2, caso: 'Semáforo dañado · El Poblado', barrio: 'El Poblado', agente: 'Andrea Cárdenas', cierre: '09:20 a.m.', informe: null },
  { id: 3, caso: 'Accidente · Belén', barrio: 'Belén', agente: 'Manuela Zapata', cierre: '08:50 a.m.', informe: null },
  { id: 4, caso: 'Embotellamiento · Laureles', barrio: 'Laureles', agente: 'Jorge Iván Ruiz', cierre: '08:10 a.m.', informe: 'Resuelta: tráfico normalizado tras desvío.' },
  { id: 5, caso: 'Vía obstruida · Manrique', barrio: 'Manrique', agente: 'Andrea Cárdenas', cierre: '07:45 a.m.', informe: 'Remitida a otra entidad: limpieza vial.' },
];

export default function Informes() {
  const [casos, setCasos] = useState(INICIAL);
  const [pestania, setPestania] = useState('pendiente');
  const [sel, setSel] = useState(null);
  const [estado, setEstado] = useState('Resuelta');
  const [texto, setTexto] = useState('');

  const pendientes = casos.filter((c) => !c.informe);
  const completados = casos.filter((c) => c.informe);
  const filas = pestania === 'pendiente' ? pendientes : completados;

  const abrir = (c) => { setSel(c); setEstado('Resuelta'); setTexto(''); };
  const cerrar = () => setSel(null);
  const guardar = () => {
    if (!texto.trim()) return;
    setCasos((prev) => prev.map((c) => (c.id === sel.id ? { ...c, informe: `${estado}: ${texto.trim()}` } : c)));
    cerrar();
  };

  return (
    <Layout rol="central" titulo="Informes de casos" activo="reportes"
      busqueda={{ placeholder: 'Buscar por caso, barrio o agente...' }}>

      <div className="mb-4">
        <h1 className="section-title-dash">Informes de casos</h1>
        <p className="section-text-dash mb-0">Registra lo que el agente reportó por radio en cada caso ya atendido.</p>
      </div>

      <div className="table-card-dash">
        <div className="d-flex gap-2 tabs-dash mb-3">
          <button className={`tab-dash ${pestania === 'pendiente' ? 'active-dash' : ''}`} onClick={() => setPestania('pendiente')}>
            Pendientes de informe ({pendientes.length})
          </button>
          <button className={`tab-dash ${pestania === 'completado' ? 'active-dash' : ''}`} onClick={() => setPestania('completado')}>
            Completados hoy ({completados.length})
          </button>
        </div>

        <table className="table align-middle mb-0">
          <thead>
            <tr><th>Caso</th><th>Barrio</th><th>Agente</th><th>Hora de cierre</th><th className="text-end">&nbsp;</th></tr>
          </thead>
          <tbody>
            {filas.map((c) => (
              <tr key={c.id}>
                <td>{c.caso}</td>
                <td>{c.barrio}</td>
                <td>{c.agente}</td>
                <td>{c.cierre}</td>
                <td className="text-end">
                  {c.informe
                    ? <span className="text-muted small">{c.informe}</span>
                    : <button className="btn-asignar-dash" onClick={() => abrir(c)}>Completar informe</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filas.length === 0 && (
          <p className="text-center text-muted small mb-0" style={{ padding: 20 }}>No hay casos en esta pestaña.</p>
        )}
      </div>

      {sel && (
        <div className="panel-card-dash mt-4">
          <h2 className="panel-title-dash">Completar informe · {sel.caso}</h2>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="config-field-label-dash">Agente que atendió</label>
              <input type="text" className="form-control" value={sel.agente} disabled readOnly />
            </div>
            <div className="col-md-6">
              <label className="config-field-label-dash">Estado final del caso</label>
              <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option>Resuelta</option>
                <option>Remitida a otra entidad</option>
                <option>Falsa alarma</option>
              </select>
            </div>
            <div className="col-12">
              <label className="config-field-label-dash">Lo reportado por el agente (vía radio)</label>
              <textarea className="form-control" rows="4" value={texto} onChange={(e) => setTexto(e.target.value)}
                placeholder="Ej: Choque leve entre dos vehículos, sin heridos, tránsito restablecido a las 09:35 a.m."></textarea>
            </div>
            <div className="col-12 d-flex justify-content-end gap-2">
              <button className="btn-secundario-dash" onClick={cerrar}>Cancelar</button>
              <button className="btn-asignar-dash" onClick={guardar}>Guardar informe</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}