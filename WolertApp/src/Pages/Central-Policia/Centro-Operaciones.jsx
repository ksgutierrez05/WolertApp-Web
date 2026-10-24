import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../../Components/Central-policia/Topbar';
import Kpis from '../../Components/Central-policia/Kpicard';
import '../../css/Policia/central-policia/css/centro-operaciones.css';

function CentroOperaciones() {
  const [fechaHora, setFechaHora] = useState(new Date());

  /*
   * Conecta estas listas con tus datos reales cuando estén disponibles.
   * Mientras estén vacías, los KPI muestran 0 y las tablas muestran
   * su estado vacío.
   */
  const alertasRecientes = [];
  const atencionesActivas = [];
  const unidades = [];

  const alertasActivas = alertasRecientes.filter(
    (alerta) => alerta.estado !== 'Resuelta'
  ).length;

  const alertasCriticas = alertasRecientes.filter(
    (alerta) =>
      String(alerta.prioridad || '').toLowerCase() === 'crítica' ||
      String(alerta.prioridad || '').toLowerCase() === 'critica'
  ).length;

  const alertasSinAsignar = alertasRecientes.filter(
    (alerta) => !alerta.unidad
  ).length;

  const unidadesDisponibles = unidades.filter(
    (unidad) => unidad.estado === 'Disponible'
  ).length;

  // Valores que consume el componente <Kpis /> (grupo "centro-principal")
  const valoresKpis = {
    alertasActivas,
    prioridadCritica: alertasCriticas,
    sinAsignar: alertasSinAsignar,
    unidadesDisponibles,
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFechaHora(new Date());
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const fechaFormateada = fechaHora.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const horaFormateada = fechaHora.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

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
            CENTRAL DE RADIO · {fechaFormateada} · {horaFormateada}
          </div>

          <h1 className="hero-title-dash">
            Turno en línea,{' '}
            <span>{alertasActivas}</span>
            <br />
            alertas en curso
          </h1>

          <p className="hero-text-dash">
            {alertasSinAsignar} casos siguen sin unidad asignada y{' '}
            {atencionesActivas.length} unidades no han confirmado su atención.
          </p>

          <Link
            to="/central-policia/alertas"
            className="hero-cta-dash"
          >
            <span className="hero-cta-icon-dash" aria-hidden="true">
              <i className="bi bi-exclamation-lg" />
            </span>

            <span>Ver alertas críticas</span>

            <i
              className="bi bi-arrow-right hero-cta-arrow-dash"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>

      {/* KPI */}
      <Kpis grupo="centro-principal" valores={valoresKpis} />

      {/* Alertas recientes */}
      <section className="card-panel-dash p-4 mb-4">
        <div className="encabezado-panel-dash">
          <h2 className="section-title-dash">
            <i className="bi bi-exclamation-triangle" />
            Alertas recientes
          </h2>

          <Link
            to="/central-policia/alertas"
            className="see-all-dash"
          >
            Ver todas
            <i className="bi bi-chevron-right" />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table tabla-dash tabla-alertas-dash align-middle">
            <thead>
              <tr>
                <th className="col-caso">Caso</th>
                <th className="col-tipo">Tipo</th>
                <th className="col-prioridad">Prioridad</th>
                <th className="col-ubicacion">Ubicación</th>
                <th className="col-hora">Hora</th>
                <th className="col-estado">Estado</th>
                <th className="col-accion">Acción</th>
              </tr>
            </thead>

            <tbody>
              {alertasRecientes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="estado-vacio-dash">
                    <i className="bi bi-inbox" />
                    No hay alertas recientes para mostrar.
                  </td>
                </tr>
              ) : (
                alertasRecientes.map((alerta) => (
                  <tr key={alerta.id}>
                    <td className="caso-dash">
                      {alerta.codigo || `#${alerta.id}`}
                    </td>

                    <td>{alerta.tipo || 'Sin tipo'}</td>

                    <td>{alerta.prioridad || 'Sin prioridad'}</td>

                    <td className="meta-muted-dash">
                      {alerta.ubicacion || 'Sin ubicación'}
                    </td>

                    <td>{alerta.hora || '—'}</td>

                    <td>{alerta.estado || 'Pendiente'}</td>

                    <td>
                      <Link
                        to={`/central-policia/alertas/${alerta.id}`}
                        className="see-all-dash"
                        aria-label={`Ver alerta ${alerta.codigo || alerta.id}`}
                      >
                        Ver
                        <i className="bi bi-arrow-up-right" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Atenciones y mapa */}
      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <section className="card-panel-dash p-4 h-100">
            <div className="encabezado-panel-dash">
              <h2 className="section-title-dash">
                <i className="bi bi-shield-check" />
                Atenciones activas
              </h2>

              <Link
                to="/central-policia/asignaciones"
                className="see-all-dash"
              >
                Ver todas
                <i className="bi bi-chevron-right" />
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table tabla-dash tabla-atenciones-dash align-middle">
                <thead>
                  <tr>
                    <th>Caso</th>
                    <th>Unidad</th>
                    <th>Estado</th>
                    <th>Ubicación</th>
                    <th>Hora</th>
                  </tr>
                </thead>

                <tbody>
                  {atencionesActivas.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="estado-vacio-dash">
                        <i className="bi bi-clipboard-check" />
                        No hay atenciones activas.
                      </td>
                    </tr>
                  ) : (
                    atencionesActivas.map((atencion) => (
                      <tr key={atencion.id}>
                        <td className="caso-dash">
                          {atencion.codigo || `#${atencion.id}`}
                        </td>

                        <td>{atencion.unidad || 'Sin unidad'}</td>

                        <td>{atencion.estado || 'En proceso'}</td>

                        <td>{atencion.ubicacion || 'Sin ubicación'}</td>

                        <td>{atencion.hora || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="col-12 col-xl-5">
          <section className="card-panel-dash p-4 h-100">
            <div className="encabezado-panel-dash">
              <h2 className="section-title-dash">
                <i className="bi bi-geo-alt" />
                Mapa operativo
              </h2>

              <Link
                to="/central-policia/mapa"
                className="see-all-dash"
              >
                Ver mapa
                <i className="bi bi-chevron-right" />
              </Link>
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
                Consulta la ubicación de las alertas y unidades en el mapa operativo.
              </p>
            </div>

            <div className="mapa-grupo-dash">
              Estado de las unidades
            </div>

            <div className="mapa-fila-dash">
              <span className="dot dot-disponible-dash" />
              <span className="lbl-dash">Disponibles</span>
              <span className="num-dash">{unidadesDisponibles}</span>
            </div>

            <div className="mapa-fila-dash">
              <span className="dot dot-ocupada-dash" />
              <span className="lbl-dash">Atendiendo casos</span>
              <span className="num-dash">{atencionesActivas.length}</span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default CentroOperaciones;