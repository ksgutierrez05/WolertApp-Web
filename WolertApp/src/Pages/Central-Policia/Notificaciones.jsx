import Topbar from '../../Components/Central-policia/Topbar';
import Kpis from '../../Components/Central-policia/Kpicard';
import '../../css/Policia/central-policia/css/notificaciones.css';

function Notificaciones() {
  return (
    <div className="notificaciones-page">
      <Topbar placeholder="Buscar notificación o caso..." />

      <main className="main-dash">
        <div className="container-fluid">
          <div className="notificaciones-header d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
            <div>
              <h1 className="page-title-dash">Notificaciones</h1>
              <p className="notif-subtitle-dash">
                Todo lo que necesitas saber sobre alertas, unidades e informes,
                en un solo lugar.
              </p>
            </div>

            <button
              className="btn btn-cv-azul rounded-pill px-3"
              type="button"
              disabled
            >
              <i className="bi bi-check2-all me-1" />
              Marcar todas como leídas
            </button>
          </div>

          <Kpis
            grupo="notificaciones"
            valores={{
              total: 0,
              noLeidas: 0,
              urgentes: 0,
              resueltas: 0,
            }}
          />

          <div className="notif-tabs-dash mb-3">
            <button className="notif-tab-dash active" type="button">
              Todas
            </button>
            <button className="notif-tab-dash" type="button">
              No leídas
            </button>
            <button className="notif-tab-dash" type="button">
              Alertas
            </button>
            <button className="notif-tab-dash" type="button">
              Unidades
            </button>
            <button className="notif-tab-dash" type="button">
              Informes y cierre
            </button>
          </div>

          <section className="card-panel-dash p-2 p-md-3">
            <div className="notif-empty-dash">
              <i className="bi bi-bell-slash" />
              <strong>No hay notificaciones para mostrar</strong>
              <span>Aquí aparecerán las notificaciones del sistema.</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Notificaciones;