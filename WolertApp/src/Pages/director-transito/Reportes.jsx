import Layout from '../../Components/transito/Layout';
import KpiCard from '../../Components/transito/KpiCard';

export default function Reportes() {
  return (
    <Layout titulo="Reportes de Tránsito" activo="reportes"
      busqueda={{ placeholder: 'Buscar por caso, barrio o agente...' }}>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="section-title-dash">Reportes</h1>
          <p className="section-text-dash mb-0">Consulta y exporta la actividad registrada por el módulo de Tránsito.</p>
        </div>
        <button className="btn btn-primary rounded-pill fw-bold btn-nuevo-dash">
          <i className="bi bi-download me-2"></i>Exportar
        </button>
      </div>

      <div className="row g-3 mb-4">
        <KpiCard color="red" valor="20" label="Reportes últimas 24h" icono="bi-copy" />
        <KpiCard color="blue" valor="2.1h" label="Tiempo promedio de atención" icono="bi-clock" />
        <KpiCard color="green" valor="27" label="Casos resueltos este mes" icono="bi-check2" />
        <KpiCard color="amber" valor="6" label="Casos críticos activos" icono="bi-suitcase-lg" />
      </div>

      <div className="table-card-dash">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
          <div className="d-flex gap-2 tabs-dash">
            <button className="tab-dash active-dash">Todos</button>
            <button className="tab-dash">Casos</button>
            <button className="tab-dash">Agentes</button>
            <button className="tab-dash">Zonas</button>
          </div>
          <div className="d-flex gap-2">
            <select className="form-select input-dash select-filtro-dash" defaultValue="7">
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="mes">Este mes</option>
              <option value="todo">Personalizado</option>
            </select>
            <select className="form-select input-dash select-filtro-dash" defaultValue="todas">
              <option value="todas">Todas las zonas</option>
              <option value="Zona Norte">Zona Norte</option>
              <option value="Centro">Centro</option>
              <option value="Sector La Nevada">Sector La Nevada</option>
              <option value="Los Fundadores">Los Fundadores</option>
            </select>
          </div>
        </div>

        <table className="table align-middle mb-0">
          <thead>
            <tr><th>Fecha</th><th>Tipo de reporte</th><th>Zona</th><th>Agente</th><th>Estado</th><th className="text-end">Acciones</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>11/9/2026</td><td>Caso</td><td>Centro</td><td>Camilo Vega</td>
              <td><span className="badge-dash badge-amber-dash">En atención</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
            <tr>
              <td>10/9/2026</td><td>Agente</td><td>Zona Norte</td><td>Jorge Ramírez</td>
              <td><span className="badge-dash badge-green-dash">Resuelto</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
            <tr>
              <td>05/9/2026</td><td>Zona</td><td>Los Fundadores</td><td>Marta Ruiz</td>
              <td><span className="badge-dash badge-red-dash">Crítico</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
            <tr>
              <td>20/8/2026</td><td>Caso</td><td>Sector La Nevada</td><td>Camilo Vega</td>
              <td><span className="badge-dash badge-green-dash">Resuelto</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
