import { useState } from 'react';
import Layout from '../../Components/transito/Layout';

const CASOS = [
  { tipo: 'semaforo', fecha: '10/9/2026 · 19:05 p.m.', barrio: 'Los Fundadores', quien: 'Diego Torres' },
  { tipo: 'accidente', fecha: '9/9/2026 · 14:20 p.m.', barrio: 'Casimiro Raúl Maestre', quien: 'Laura Peña' },
  { tipo: 'accidente', fecha: '8/9/2026 · 09:40 a.m.', barrio: 'Los Fundadores', quien: 'Jorge Martínez' },
  { tipo: 'semaforo', fecha: '7/9/2026 · 17:12 p.m.', barrio: 'Casimiro Raúl Maestre', quien: 'Diego Torres' },
];

const TIPO = {
  semaforo: { txt: 'Semáforo dañado', clase: 'tipo-semaforo-dash' },
  accidente: { txt: 'Accidente', clase: 'tipo-accidente-dash' },
};

export default function Historial() {
  const [filtro, setFiltro] = useState('todas');
  const filas = filtro === 'todas' ? CASOS : CASOS.filter((c) => c.tipo === filtro);

  return (
    <Layout rol="agente" titulo="Historial" activo="historial"
      busqueda={{ placeholder: 'Buscar por caso o barrio...' }}>

      <div className="mb-4">
        <h1 className="section-title-dash">Historial</h1>
        <p className="section-text-dash mb-0">Casos que tu grupo ya atendió.</p>
      </div>

      <div className="table-card-dash">
        <div className="d-flex gap-2 tabs-dash mb-3">
          <button className={`tab-dash ${filtro === 'todas' ? 'active-dash' : ''}`} onClick={() => setFiltro('todas')}>Todas (18)</button>
          <button className={`tab-dash ${filtro === 'accidente' ? 'active-dash' : ''}`} onClick={() => setFiltro('accidente')}>Accidente (11)</button>
          <button className={`tab-dash ${filtro === 'semaforo' ? 'active-dash' : ''}`} onClick={() => setFiltro('semaforo')}>Semáforo dañado (7)</button>
        </div>

        <table className="table align-middle mb-0">
          <thead>
            <tr><th>Fecha</th><th>Tipo</th><th>Barrio</th><th>Reportado por</th><th>Estado</th><th className="text-end">&nbsp;</th></tr>
          </thead>
          <tbody>
            {filas.map((c) => (
              <tr key={c.fecha}>
                <td className="text-muted small">{c.fecha}</td>
                <td><span className={`badge-tipo-dash ${TIPO[c.tipo].clase}`}>{TIPO[c.tipo].txt}</span></td>
                <td>{c.barrio}</td>
                <td>{c.quien}</td>
                <td><span className="badge-estado-dash estado-resuelta-dash">Resuelta</span></td>
                <td className="text-end"><a href="#" className="link-detalle-dash">Ver detalle</a></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">Mostrando 1–4 de 18 reportes</span>
          <div className="d-flex gap-1">
            <button className="page-btn-dash active-dash">1</button>
            <button className="page-btn-dash">2</button>
            <button className="page-btn-dash">3</button>
            <button className="page-btn-dash"><i className="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>
    </Layout>
  );
}