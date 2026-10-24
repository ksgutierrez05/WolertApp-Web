import { Link } from 'react-router-dom';
import Topbar from '../../Components/Central-policia/Topbar';
import Kpis from '../../Components/Central-policia/Kpicard';
import '../../css/Policia/central-policia/css/centro-operaciones.css';

function CentroOperaciones() {
  return (
    <>
      <Topbar
        placeholder="Buscar por caso, unidad, barrio..."
        iniciales="CR"
      />

      {/* Banner principal */}
      <section className="hero-dash mb-4">
        <div className="hero-content-dash">
          <div className="eyebrow-dash">
            CENTRAL DE RADIO · CENTRO DE OPERACIONES
          </div>

          <h1 className="hero-title-dash">
            Turno en línea,
            <br />
            alertas en curso
          </h1>

          <p className="hero-text-dash">
            Panel de monitoreo de alertas, unidades y atenciones.
          </p>

          <Link
            to="/Central-Policia/Alertas"
            className="hero-cta-dash"
          >
            <span className="hero-cta-icon-dash">
              <i className="bi bi-exclamation-lg" />
            </span>

            <span>Ver alertas críticas</span>

            <i className="bi bi-arrow-right hero-cta-arrow-dash" />
          </Link>
        </div>
      </section>

      {/* KPI: se generan desde Kpisconfig.jsx */}
      <Kpis grupo="centro-principal" />

      {/* Tabla visual */}
      <section className="card-panel-dash p-4 mb-4">
        <div className="encabezado-panel-dash">
          <h2 className="section-title-dash">
            <i className="bi bi-exclamation-triangle" /> Alertas recientes
          </h2>

          <Link
            to="/Central-Policia/Alertas"
            className="see-all-dash"
          >
            Ver todas <i className="bi bi-chevron-right" />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table tabla-dash tabla-alertas-dash align-middle">
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
                  <i className="bi bi-inbox" />
                  Diseño de tabla de alertas
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Paneles inferiores */}
      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <section className="card-panel-dash p-4 h-100">
            <div className="encabezado-panel-dash">
              <h2 className="section-title-dash">
                <i className="bi bi-broadcast" /> Atenciones activas
              </h2>

              <span className="see-all-dash">Vista general</span>
            </div>

            <div className="estado-vacio-dash">
              <i className="bi bi-clipboard-check" />
              Panel de atenciones
            </div>
          </section>
        </div>

        <div className="col-12 col-xl-5">
          <section className="card-panel-dash p-4 h-100">
            <div className="encabezado-panel-dash">
              <h2 className="section-title-dash">
                <i className="bi bi-geo-alt" /> Mapa operativo
              </h2>

              <span className="see-all-dash">Vista general</span>
            </div>

            <div className="mapa-proximamente-dash">
              <span className="mapop-mini-badge-dash">
                <span className="mapop-mini-dot-dash" />
                Vista de referencia
              </span>

              <div className="mapop-mini-radar-dash">
                <span className="mapop-mini-ring-dash mapop-mini-ring-1-dash" />
                <span className="mapop-mini-ring-dash mapop-mini-ring-2-dash" />
                <span className="mapop-mini-sweep-dash" />
                <span className="mapop-mini-pin-halo-dash" />

                <span className="mapop-mini-pin-dash">
                  <i className="bi bi-geo-alt-fill" />
                </span>
              </div>

              <p className="mapop-mini-text-dash">
                Espacio visual para consultar alertas y unidades en el mapa.
              </p>
            </div>

            <div className="mapa-grupo-dash">
              Estado de las unidades
            </div>

            <div className="mapa-fila-dash">
              <span className="dot dot-disponible-dash" />
              <span className="lbl-dash">Disponibles</span>
              <span className="num-dash">—</span>
            </div>

            <div className="mapa-fila-dash">
              <span className="dot dot-ocupada-dash" />
              <span className="lbl-dash">Atendiendo casos</span>
              <span className="num-dash">—</span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default CentroOperaciones;