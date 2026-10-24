import Kpis from '../../Components/Patrullero/Kpicard';
import '../../css/Policia/Patrullero/css/centro-operaciones.css';

function CentroOperaciones() {
  return (
    <div className="container-fluid centro-operaciones-patrullero">
      <section className="hero-dash co-hero" aria-labelledby="co-titulo">
        <div className="co-hero-copy">
          <p className="eyebrow-dash">
            CENTRO DE OPERACIONES · PATRULLERO
          </p>

          <h1 className="hero-title-dash" id="co-titulo">
            Centro de Operaciones
          </h1>

          <p className="hero-text-dash">
            Consulta tus alertas asignadas, da seguimiento a tus
            atenciones y revisa la actividad de tu unidad.
          </p>

        </div>


      </section>

      {/* Las tarjetas se definen en Kpisconfig.js; aquí solo se llama al componente */}
      <section aria-label="Indicadores operativos">
        <Kpis grupo="centro-operaciones" />
      </section>

      <div className="row g-3 mb-4 align-items-stretch">
        {/* Atención activa */}
        <section
          className="col-lg-7 d-flex flex-column"
          aria-labelledby="co-atencion-titulo"
        >
          <div className="co-section-head">
            <h2
              className="section-title-dash fw-bold m-0"
              id="co-atencion-titulo"
            >
              <i
                className="bi bi-lightning-charge me-2"
                aria-hidden="true"
              />
              Atención activa
            </h2>

            <span className="wait-dash co-estado-vacio">
              Sin información activa
            </span>
          </div>

          <article className="card-panel-dash co-active h-100 d-flex flex-column">
            <div className="co-active-top">
              <div className="co-active-empty">
                <p className="co-active-title">
                  No hay una atención seleccionada
                </p>

                <p className="co-empty-description">
                  Cuando tengas una atención asignada, aquí aparecerán
                  sus detalles y estado.
                </p>
              </div>
            </div>

            <div className="co-active-meta">
              <span>
                <i className="bi bi-geo-alt" aria-hidden="true" />
                Ubicación: —
              </span>

              <span>
                <i className="bi bi-clock" aria-hidden="true" />
                Hora de asignación: —
              </span>

              <span>
                <i className="bi bi-person" aria-hidden="true" />
                Origen del reporte: —
              </span>
            </div>

            <div className="co-route-box mt-auto">
              <div className="co-route-info">
                <div className="co-route-icon">
                  <i
                    className="bi bi-signpost-split"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <b>Ruta de atención</b>
                  <span>
                    La información de ruta aparecerá cuando exista
                    una atención activa.
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-cv-azul btn-sm px-3"
                disabled
              >
                Iniciar ruta
              </button>
            </div>
          </article>
        </section>

        {/* Alertas nuevas */}
        <section
          className="col-lg-5 d-flex flex-column"
          aria-labelledby="co-alertas-titulo"
        >
          <div className="co-section-head">
            <h2
              className="section-title-dash fw-bold m-0"
              id="co-alertas-titulo"
            >
              <i className="bi bi-bell me-2" aria-hidden="true" />
              Alertas nuevas
            </h2>

            <span className="co-text-link">
              Alertas asignadas
            </span>
          </div>

          <div className="card-panel-dash co-alert-list h-100">
            <div className="co-empty-state">
              <span className="co-empty-icon">
                <i className="bi bi-inbox" aria-hidden="true" />
              </span>

              <h3>No hay alertas para mostrar</h3>

              <p>
                Las alertas asignadas estarán disponibles aquí
                para consultar sus detalles.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="row g-3 align-items-stretch">
        {/* Resumen del día */}
        <section
          className="col-lg-4 d-flex"
          aria-labelledby="co-resumen-titulo"
        >
          <div className="card-panel-dash co-panel p-3 h-100 w-100">
            <h2
              className="section-title-dash fw-bold mb-3"
              id="co-resumen-titulo"
            >
              <i
                className="bi bi-clock-history me-2"
                aria-hidden="true"
              />
              Resumen del día
            </h2>

            <div className="co-timeline co-timeline-empty">
              <div className="co-timeline-item">
                <span className="co-timeline-time">—</span>
                <p className="co-timeline-text">
                  Aquí aparecerá el inicio del turno.
                </p>
              </div>

              <div className="co-timeline-item">
                <span className="co-timeline-time">—</span>
                <p className="co-timeline-text">
                  Aquí aparecerán las atenciones registradas.
                </p>
              </div>

              <div className="co-timeline-item">
                <span className="co-timeline-time">—</span>
                <p className="co-timeline-text">
                  Aquí se mostrará la actividad más reciente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mi unidad */}
        <section
          className="col-lg-4 d-flex"
          aria-labelledby="co-unidad-titulo"
        >
          <div className="card-panel-dash co-panel p-3 h-100 w-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h2
                className="section-title-dash fw-bold m-0"
                id="co-unidad-titulo"
              >
                <i className="bi bi-people me-2" aria-hidden="true" />
                Mi unidad
              </h2>

              <span className="co-text-link">Personal</span>
            </div>

            <p className="info-sub-dash mb-3">
              Información de la unidad asignada
            </p>

            <div className="co-empty-state co-empty-state-compact">
              <span className="co-empty-icon">
                <i
                  className="bi bi-person-badge"
                  aria-hidden="true"
                />
              </span>

              <h3>Sin información de integrantes</h3>

              <p>
                Los integrantes y su disponibilidad aparecerán aquí
                cuando estén disponibles.
              </p>
            </div>
          </div>
        </section>

        {/* Alarmas */}
        <section
          className="col-lg-4 d-flex"
          aria-labelledby="co-alarmas-titulo"
        >
          <div className="card-panel-dash co-panel p-3 h-100 w-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h2
                className="section-title-dash fw-bold m-0"
                id="co-alarmas-titulo"
              >
                <i
                  className="bi bi-megaphone me-2"
                  aria-hidden="true"
                />
                Alarmas
              </h2>

              <span className="co-text-link">Avisos</span>
            </div>

            <div className="co-alarma-item">
              <div className="co-alarma-icon">
                <i className="bi bi-megaphone" aria-hidden="true" />
              </div>

              <div>
                <p className="co-alarma-text mb-1">
                  No hay avisos nuevos.
                </p>

                <span className="co-alarma-time">
                  Las comunicaciones de la Central aparecerán aquí.
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CentroOperaciones;