
import Kpis from '../../Components/Patrullero/Kpicard';
import usePatrullero from '../../Utlis/usePatrullero';
import {
  EsHoy,
  FormatearFecha
} from '../../Services/PoliciaService';

import '../../css/Policia/Patrullero/css/centro-operaciones.css';

export default function CentroOperaciones() {
  const { datos, cargando, error, recargar } = usePatrullero();

  const asignaciones = datos?.asignaciones || [];
  const atenciones = datos?.atenciones || [];
  const integrantes = datos?.unidad?.policias || [];

  const activa = asignaciones.find(
    a => a.estadoAsignacion === 'EN_ATENCION'
  );

  const nuevas = asignaciones.filter(
    a => a.estadoAsignacion === 'ASIGNADA'
  );

  const hoy = atenciones.filter(
    a => a.estadoFinal === 'FINALIZADA' &&
      EsHoy(a.fechaAtencion)
  );

  const valores = {
    alertasAsignadas: asignaciones.length,
    atencionActiva: asignaciones.filter(
      a => a.estadoAsignacion === 'EN_ATENCION'
    ).length,
    atendidasHoy: hoy.length,
    companeros: integrantes.filter(
      p => Number(p.idUsuario) !== Number(datos?.idUsuario)
    ).length
  };

  return (
    <div className="container-fluid centro-operaciones-patrullero">
      <section
        className="hero-dash co-hero"
        aria-labelledby="co-titulo"
      >
        <div className="co-hero-copy">
          <p className="eyebrow-dash">
            CENTRO DE OPERACIONES · PATRULLERO
          </p>

          <h1 className="hero-title-dash" id="co-titulo">
            Centro de Operaciones
          </h1>

          <p className="hero-text-dash">
            Consulta las alertas asignadas a tu unidad,
            da seguimiento a tus atenciones y revisa
            la actividad de tu unidad.
          </p>
        </div>
      </section>

      {cargando && (
        <p role="status">Cargando información...</p>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button type="button" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}

      <section aria-label="Indicadores operativos">
        <Kpis
          grupo="centro-operaciones"
          valores={valores}
        />
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
              {activa?.estadoAsignacion || 'Sin información activa'}
            </span>
          </div>

          <article className="card-panel-dash co-active h-100 d-flex flex-column">
            <div className="co-active-top">
              <div className="co-active-empty">
                <p className="co-active-title">
                  {activa
                    ? `Asignación #${activa.idAsignacion}`
                    : 'No hay una atención activa'}
                </p>

                <p className="co-empty-description">
                  {activa
                    ? `Alerta #${activa.idAlerta} · ${activa.observacion || 'Sin observaciones'}`
                    : 'Cuando tu unidad tenga una atención activa, aquí aparecerán sus detalles.'}
                </p>
              </div>
            </div>

            <div className="co-active-meta">
              <span>
                <i className="bi bi-geo-alt" aria-hidden="true" />
                {' '}Unidad: {activa?.unidadNombre ||
                  datos?.unidad?.nombre || '—'}
              </span>

              <span>
                <i className="bi bi-clock" aria-hidden="true" />
                {' '}Hora de asignación:{' '}
                {FormatearFecha(activa?.fecha)}
              </span>

              <span>
                <i className="bi bi-person" aria-hidden="true" />
                {' '}Alerta: {activa?.idAlerta ?? '—'}
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
                    Consulta el detalle de la alerta para
                    conocer su ubicación.
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
              {nuevas.length} asignadas
            </span>
          </div>

          <div className="card-panel-dash co-alert-list h-100">
            {nuevas.length ? (
              nuevas.slice(0, 5).map(a => (
                <div className="co-alarma-item" key={a.idAsignacion}>
                  <div className="co-alarma-icon">
                    <i className="bi bi-bell" aria-hidden="true" />
                  </div>

                  <div>
                    <p className="co-alarma-text mb-1">
                      Alerta #{a.idAlerta}
                    </p>

                    <span className="co-alarma-time">
                      {FormatearFecha(a.fecha)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="co-empty-state">
                <span className="co-empty-icon">
                  <i className="bi bi-inbox" aria-hidden="true" />
                </span>

                <h3>No hay alertas para mostrar</h3>

                <p>
                  Las alertas asignadas a tu unidad aparecerán aquí.
                </p>
              </div>
            )}
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

            <div className="co-timeline">
              {hoy.length ? (
                hoy.slice(0, 5).map(a => (
                  <div
                    className="co-timeline-item"
                    key={a.idAtencion}
                  >
                    <span className="co-timeline-time">
                      {FormatearFecha(a.fechaAtencion)}
                    </span>

                    <p className="co-timeline-text">
                      Alerta #{a.idAlerta} · {a.estadoFinal}
                    </p>
                  </div>
                ))
              ) : (
                <div className="co-timeline-item">
                  <span className="co-timeline-time">—</span>

                  <p className="co-timeline-text">
                    No hay atenciones finalizadas por ti hoy.
                  </p>
                </div>
              )}
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

              <span className="co-text-link">
                {integrantes.length} integrantes
              </span>
            </div>

            <p className="info-sub-dash mb-3">
              {datos?.unidad?.nombre ||
                'Información de la unidad asignada'}
            </p>

            {integrantes.length ? (
              integrantes.map(p => (
                <div
                  className="co-alarma-item"
                  key={p.idUsuario}
                >
                  <div className="co-alarma-icon">
                    <i
                      className="bi bi-person-badge"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <p className="co-alarma-text mb-1">
                      {p.nombreUsuario}
                    </p>

                    <span className="co-alarma-time">
                      {p.rango || 'Policía'} ·{' '}
                      {p.estado || 'Sin estado'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="co-empty-state co-empty-state-compact">
                <span className="co-empty-icon">
                  <i
                    className="bi bi-person-badge"
                    aria-hidden="true"
                  />
                </span>

                <h3>Sin información de integrantes</h3>

                <p>
                  Los integrantes de tu unidad aparecerán aquí.
                </p>
              </div>
            )}
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
                <i
                  className="bi bi-megaphone"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="co-alarma-text mb-1">
                  Consulta tus notificaciones.
                </p>

                <span className="co-alarma-time">
                  Las comunicaciones de la Central están
                  en Notificaciones.
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

