import PageHeader from '../../Components/Patrullero/Pageheader';
import Kpis from '../../Components/Patrullero/Kpicard';
import '../../css/Policia/Patrullero/css/unidad.css';

function MiUnidad() {
  return (
    <div className="container-fluid mi-unidad-patrullero">
      <PageHeader
        titulo="Mi Unidad"
        descripcion="Consulta tu unidad, quiénes la conforman y su estado operativo."
      />

      {/* Ficha de la unidad */}
      <section className="un-ficha" aria-label="Ficha de la unidad">
        <div className="un-ficha-izq">
          <div className="un-ficha-icono" aria-hidden="true">
            <i className="bi bi-shield-shaded" />
          </div>

          <div>
            <p className="un-ficha-eyebrow">Tu unidad</p>
            <h2 className="un-ficha-nombre">Sin unidad asignada</h2>
            <p className="un-ficha-sub">
              <i className="bi bi-geo-alt" aria-hidden="true" />
              CAI: —
            </p>
          </div>
        </div>

        <div className="un-ficha-der">
          <div className="un-ficha-dato">
            <span className="un-ficha-num">—</span>
            <span className="un-ficha-lbl">Alertas asignadas a la unidad</span>
          </div>

          <div className="un-ficha-dato">
            <span className="un-ficha-num">—</span>
            <span className="un-ficha-lbl">Asignaciones activas</span>
          </div>
        </div>
      </section>

      {/* Indicadores: las tarjetas se definen en Kpisconfig.js */}
      <section aria-label="Indicadores de la unidad">
        <Kpis grupo="unidad" />
      </section>

      <div className="row g-4 align-items-stretch">
        {/* Datos de la unidad */}
        <section className="col-lg-4 d-flex" aria-labelledby="un-datos-titulo">
          <div className="card-panel-dash un-panel w-100">
            <h2 className="un-titulo" id="un-datos-titulo">
              <i className="bi bi-info-circle" aria-hidden="true" />
              Datos de la unidad
            </h2>

            <dl className="un-datos">
              <div className="un-dato-fila">
                <dt>
                  <i className="bi bi-hash" aria-hidden="true" />
                  Código
                </dt>
                <dd>—</dd>
              </div>

              <div className="un-dato-fila">
                <dt>
                  <i className="bi bi-car-front" aria-hidden="true" />
                  Vehículo
                </dt>
                <dd>—</dd>
              </div>

              <div className="un-dato-fila">
                <dt>
                  <i className="bi bi-building" aria-hidden="true" />
                  Estación
                </dt>
                <dd>—</dd>
              </div>

              <div className="un-dato-fila">
                <dt>
                  <i className="bi bi-geo-alt" aria-hidden="true" />
                  CAI
                </dt>
                <dd>—</dd>
              </div>

              <div className="un-dato-fila">
                <dt>
                  <i className="bi bi-clock" aria-hidden="true" />
                  Turno
                </dt>
                <dd>—</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Integrantes */}
        <section className="col-lg-8 d-flex" aria-labelledby="un-integrantes-titulo">
          <div className="card-panel-dash un-panel w-100">
            <div className="un-panel-cabecera">
              <h2 className="un-titulo" id="un-integrantes-titulo">
                <i className="bi bi-people" aria-hidden="true" />
                Integrantes de la unidad
              </h2>

              <span className="un-solo-lectura">
                <i className="bi bi-lock" aria-hidden="true" />
                Solo lectura
              </span>
            </div>

            <div className="un-vacio">
              <span className="un-vacio-icono">
                <i className="bi bi-person-badge" aria-hidden="true" />
              </span>

              <h3>Sin información de integrantes</h3>

              <p>
                Los integrantes de tu unidad y su disponibilidad
                aparecerán aquí cuando estén disponibles.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default MiUnidad;