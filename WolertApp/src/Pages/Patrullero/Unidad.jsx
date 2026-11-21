
import PageHeader from '../../Components/Patrullero/Pageheader';
import Kpis from '../../Components/Patrullero/Kpicard';
import usePatrullero from '../../Utils/usePatrullero';

import '../../css/Policia/Patrullero/css/unidad.css';

export default function MiUnidad() {
  const { datos, cargando, error, recargar } = usePatrullero();

  const unidad = datos?.unidad;
  const integrantes = unidad?.policias || [];
  const asignaciones = datos?.asignaciones || [];

  const activas = asignaciones.filter(
    a => a.estadoAsignacion === 'EN_ATENCION'
  ).length;

  const disponibles = integrantes.filter(
    p => String(p.estado || '').toUpperCase() === 'DISPONIBLE'
  ).length;

  const valores = {
    integrantes: integrantes.length,
    disponibles,
    enAtencion: activas,
    enCamino: '—'
  };

  const fila = (icono, nombre, valor) => (
    <div className="un-dato-fila">
      <dt>
        <i
          className={`bi ${icono}`}
          aria-hidden="true"
        />
        {' '}{nombre}
      </dt>

      <dd>{valor ?? '—'}</dd>
    </div>
  );

  return (
    <div className="container-fluid mi-unidad-patrullero">
      <PageHeader
        titulo="Mi Unidad"
        descripcion="Consulta tu unidad, quiénes la conforman y su estado operativo."
      />

      {cargando && (
        <p role="status">Cargando unidad...</p>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button type="button" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}

      <section
        className="un-ficha"
        aria-label="Ficha de la unidad"
      >
        <div className="un-ficha-izq">
          <div
            className="un-ficha-icono"
            aria-hidden="true"
          >
            <i className="bi bi-shield-shaded" />
          </div>

          <div>
            <p className="un-ficha-eyebrow">
              Tu unidad
            </p>

            <h2 className="un-ficha-nombre">
              {unidad?.nombre || 'Sin unidad asignada'}
            </h2>

            <p className="un-ficha-sub">
              <i
                className="bi bi-geo-alt"
                aria-hidden="true"
              />
              {' '}Barrio: {unidad?.nombreBarrio || '—'}
            </p>
          </div>
        </div>

        <div className="un-ficha-der">
          <div className="un-ficha-dato">
            <span className="un-ficha-num">
              {asignaciones.length}
            </span>

            <span className="un-ficha-lbl">
              Asignaciones de la unidad
            </span>
          </div>

          <div className="un-ficha-dato">
            <span className="un-ficha-num">
              {activas}
            </span>

            <span className="un-ficha-lbl">
              Asignaciones activas
            </span>
          </div>
        </div>
      </section>

      <section aria-label="Indicadores de la unidad">
        <Kpis grupo="unidad" valores={valores} />
      </section>

      <div className="row g-4 align-items-stretch">
        {/* Datos de la unidad */}
        <section
          className="col-lg-4 d-flex"
          aria-labelledby="un-datos-titulo"
        >
          <div className="card-panel-dash un-panel w-100">
            <h2
              className="un-titulo"
              id="un-datos-titulo"
            >
              <i
                className="bi bi-info-circle"
                aria-hidden="true"
              />
              Datos de la unidad
            </h2>

            <dl className="un-datos">
              {fila('bi-hash', 'Código', unidad?.idUnidad)}
              {fila('bi-shield', 'Estado', unidad?.estado)}
              {fila('bi-geo-alt', 'Barrio', unidad?.nombreBarrio)}
              {fila('bi-pin-map', 'Latitud', unidad?.latitud)}
              {fila('bi-pin-map', 'Longitud', unidad?.longitud)}
            </dl>

            <small>
              El endpoint de unidad no incluye vehículo,
              estación, CAI ni turno.
            </small>
          </div>
        </section>

        {/* Integrantes */}
        <section
          className="col-lg-8 d-flex"
          aria-labelledby="un-integrantes-titulo"
        >
          <div className="card-panel-dash un-panel w-100">
            <div className="un-panel-cabecera">
              <h2
                className="un-titulo"
                id="un-integrantes-titulo"
              >
                <i
                  className="bi bi-people"
                  aria-hidden="true"
                />
                Integrantes de la unidad
              </h2>

              <span className="un-solo-lectura">
                <i
                  className="bi bi-lock"
                  aria-hidden="true"
                />
                {' '}Solo lectura
              </span>
            </div>

            {integrantes.length ? (
              <div className="d-grid gap-2">
                {integrantes.map(p => (
                  <article
                    key={p.idUsuario}
                    className="border rounded p-3"
                  >
                    <strong>
                      {p.nombreUsuario || 'Sin nombre'}
                    </strong>

                    <div>
                      {p.rango || 'Policía'}
                      {' · '}
                      {p.estado || 'Sin estado'}
                    </div>

                    <small>
                      Placa: {p.placa || '—'}
                    </small>
                  </article>
                ))}
              </div>
            ) : (
              <div className="un-vacio">
                <span className="un-vacio-icono">
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
      </div>
    </div>
  );
}
