import Layout from '../../Components/director-transito/Layout';
import KpiCard from '../../Components/director-transito/KpiCard';

export default function Casos() {
  return (
    <Layout titulo="Casos de Tránsito" activo="casos"
      busqueda={{ placeholder: 'Buscar por caso, barrio o agente...' }}>

      <div className="mb-4">
        <h1 className="section-title-dash">Casos de Tránsito</h1>
        <p className="section-text-dash mb-0">Consulta y supervisa los casos reportados en el módulo de tránsito.</p>
      </div>

      <div className="row g-3 mb-4">
        <KpiCard color="red" valor="6" label="Casos activos" icono="bi-geo-alt" />
        <KpiCard color="blue" valor="2.1 min" label="Tiempo de respuesta" icono="bi-clock" />
        <KpiCard color="green" valor="27" label="Casos cerrados hoy" icono="bi-check2" />
        <KpiCard color="amber" valor="11/15" label="Agentes disponibles" icono="bi-truck" />
      </div>

      <div className="table-card-dash">
        <div className="filtros-fila-dash mb-3">
          <div className="input-group search-dash filtros-busqueda-dash">
            <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
            <input type="text" className="form-control border-0" placeholder="Buscar por reportante, barrio..." />
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="pill-filtro-dash pill-atencion-dash">En atención</button>
            <button type="button" className="pill-filtro-dash pill-critica-dash">Crítica</button>
            <button type="button" className="pill-filtro-dash pill-camino-dash">En camino</button>
            <button type="button" className="pill-filtro-dash pill-resuelta-dash">Resuelta</button>
          </div>
          <button type="button" className="btn btn-light btn-sm">
            <i className="bi bi-x-circle me-1"></i> Limpiar
          </button>
        </div>

        <div className="d-flex gap-2 tabs-dash mb-3">
          <button className="tab-dash active-dash">Todas (20)</button>
          <button className="tab-dash">Accidente (13)</button>
          <button className="tab-dash">Semáforo dañado (7)</button>
        </div>

        <table className="table align-middle mb-0">
          <thead>
            <tr><th>Reportado por</th><th>Tipo</th><th>Barrio</th><th>Estado</th><th className="text-end">&nbsp;</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="info-title-dash">Katherine Gutiérrez</div>
                <div className="info-sub-dash">11/9/2026 · 08:12 a.m.</div>
              </td>
              <td><span className="badge-dash badge-amber-dash">SEMÁFORO DAÑADO</span></td>
              <td>Casimiro Raúl Maestre</td>
              <td><span className="badge-dash badge-amber-dash">En atención</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
            <tr>
              <td>
                <div className="info-title-dash">Katherine Gutiérrez</div>
                <div className="info-sub-dash">11/9/2026 · 07:47 a.m.</div>
              </td>
              <td><span className="badge-dash badge-red-dash">ACCIDENTE</span></td>
              <td>Casimiro Raúl Maestre</td>
              <td><span className="badge-dash badge-red-dash">Crítica</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
            <tr>
              <td>
                <div className="info-title-dash">Laura Peña</div>
                <div className="info-sub-dash">10/9/2026 · 10:30 p.m.</div>
              </td>
              <td><span className="badge-dash badge-red-dash">ACCIDENTE</span></td>
              <td>La Nevada</td>
              <td><span className="badge-dash badge-blue-dash">En camino</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
            <tr>
              <td>
                <div className="info-title-dash">Diego Torres</div>
                <div className="info-sub-dash">10/9/2026 · 07:05 p.m.</div>
              </td>
              <td><span className="badge-dash badge-amber-dash">SEMÁFORO DAÑADO</span></td>
              <td>Los Fundadores</td>
              <td><span className="badge-dash badge-green-dash">Resuelta</span></td>
              <td className="text-end"><a href="#" className="link-btn-dash">Ver detalle</a></td>
            </tr>
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">Mostrando 4 de 20 reportes</span>
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
