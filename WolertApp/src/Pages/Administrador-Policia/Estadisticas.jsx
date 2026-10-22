
import Topbar from '../../Components/Administrador-policia/Topbar';
import Kpis from '../../Components/Administrador-policia/Kpicard';
import '../../css/Policia/administrador-policia/css/estadisticas.css';

function Estadisticas() {
  return (
    <>
      <Topbar placeholder="Buscar por alerta, barrio, unidad, policía..." />

      <main className="main-dash estadisticas-page">
        <div className="container-fluid">

          {/* Encabezado */}
          <div className="header-vista-dash mb-4">
            <div>
              <h1>Estadísticas</h1>
              <p>Métricas operacionales del sistema policial.</p>
            </div>
          </div>

          {/* KPI compartidos */}
          <section className="mb-4" id="kpisEstadisticas">
            <Kpis grupo="estadisticas" />
          </section>

          {/* Alertas y policías por estado */}
          <div className="row g-3 mb-4">
            <div className="col-lg-6">
              <section className="card-panel-dash p-3 h-100">
                <p className="section-title-dash fw-bold mb-3">
                  <i className="bi bi-bell me-2" />
                  Alertas por estado
                </p>

                <div id="barrasAlertas" />
              </section>
            </div>

            <div className="col-lg-6">
              <section className="card-panel-dash p-3 h-100">
                <p className="section-title-dash fw-bold mb-3">
                  <i className="bi bi-people me-2" />
                  Policías por estado
                </p>

                <div id="barrasPolicias" />
              </section>
            </div>
          </div>

          {/* Evolución y tipos de alerta */}
          <div className="row g-3 mb-4">
            <div className="col-lg-6">
              <section className="card-panel-dash p-3 h-100">
                <p className="section-title-dash fw-bold mb-3">
                  <i className="bi bi-graph-up me-2" />
                  Evolución de las alertas
                </p>

                <div id="graficaEvolucionAlertas" />
              </section>
            </div>

            <div className="col-lg-6">
              <section className="card-panel-dash p-3 h-100">
                <p className="section-title-dash fw-bold mb-3">
                  <i className="bi bi-geo-alt me-2" />
                  Alertas por tipo
                </p>

                <div id="graficaAlertasTipo" />
              </section>
            </div>
          </div>

          {/* Alarmas y unidades */}
          <section className="card-panel-dash p-3 mb-4">
            <p className="section-title-dash fw-bold mb-2">
              <i className="bi bi-activity me-2" />
              Estado de alarmas y unidades
            </p>

            <div id="filasEstado" />
          </section>

        </div>
      </main>
    </>
  );
}

export default Estadisticas;
