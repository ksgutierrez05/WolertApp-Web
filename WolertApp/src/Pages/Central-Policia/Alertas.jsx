import Topbar from '../../Components/Central-policia/Topbar';
import Kpis from '../../Components/Central-policia/Kpicard';
import '../../css/policia/central-policia/css/alertas.css';

function Alertas() {
  return (
    <>
      <Topbar
        placeholder="Buscar por caso, tipo, dirección o barrio..."
        iniciales="CR"
      />

      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h1 className="page-title-dash">
            Alertas entrantes
          </h1>

          <p className="info-sub-dash mb-0">
            Reportes recibidos desde los ciudadanos, listos para analizar,
            clasificar y despachar.
          </p>
        </div>

        <span className="badge-dash badge-red-dash">
          Alertas nuevas
        </span>
      </div>

      {/* KPI: se generan desde Kpisconfig.jsx */}
      <Kpis grupo="alertas" />

      {/* Filtros visuales */}
      <section className="card-panel-dash p-4 mb-4">
        <div className="encabezado-panel-dash">
          <h2 className="section-title-dash">
            <i className="bi bi-funnel me-2" />
            Filtros de alertas
          </h2>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline-secondary">
            Todas
          </button>

          <button type="button" className="btn btn-outline-danger">
            Críticas
          </button>

          <button type="button" className="btn btn-outline-warning">
            Pendientes
          </button>

          <button type="button" className="btn btn-outline-success">
            Resueltas
          </button>
        </div>
      </section>

      {/* Tabla visual de alertas */}
      <section className="card-panel-dash p-4 mb-4">
        <div className="encabezado-panel-dash">
          <h2 className="section-title-dash">
            <i className="bi bi-inboxes me-2" />
            Listado de alertas
          </h2>

          <span className="see-all-dash">
            Vista general
          </span>
        </div>

        <div className="table-responsive">
          <table className="table tabla-dash align-middle">
            <thead>
              <tr>
                <th>Caso</th>
                <th>Tipo</th>
                <th>Prioridad</th>
                <th>Ubicación</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan="7" className="estado-vacio-dash">
                  <i className="bi bi-inbox me-2" />
                  Diseño de tabla de alertas
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default Alertas;