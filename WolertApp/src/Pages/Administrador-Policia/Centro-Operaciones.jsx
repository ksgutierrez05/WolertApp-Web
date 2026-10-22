
import Topbar from '../../Components/Administrador-policia/Topbar';
import Kpis from '../../Components/Administrador-policia/Kpicard';
import '../../css/Policia/administrador-policia/css/centro-operaciones.css';

function CentroOperaciones({
  usuario = null,
  kpis = {},
  alertasRecientes = [],
}) {
  const nombre = usuario?.nombre;

  const iniciales = nombre
    ? nombre
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((palabra) => palabra[0].toUpperCase())
        .join('')
    : '';

  const fecha = new Date()
    .toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase();

  const textoHero =
    kpis.alertasActivas != null
      ? `${kpis.alertasActivas} alertas activas y el sistema operativo con monitoreo en tiempo real.`
      : 'Sistema operativo con monitoreo en tiempo real.';

  return (
    <>
      <Topbar iniciales={iniciales} />

      
   {/* Encabezado principal */}
   <div className="hero-dash mb-4">
   <p className="eyebrow-dash">
    <i className="bi bi-shield-check me-2" aria-hidden="true"></i>
    CENTRO DE OPERACIONES · {fecha}
    </p>

   <h1 className="hero-title-dash">
    ¡Bienvenido, administrador policial!
   </h1>

   <p className="hero-text-dash">
    {textoHero}
   </p>

   <i
    className="bi bi-shield-fill-check hero-icon-dash"
    aria-hidden="true"
    ></i>
   </div>

      {/* Indicadores principales */}
      <Kpis grupo="centro-principal" valores={kpis} />

      {/* Alertas recientes y mapa policial */}
      <div className="row g-3 mb-4">
        {/* Panel de alertas recientes */}
        <div className="col-lg-6">
          <div className="card-panel-dash p-3 h-100">
            <div className="encabezado-panel-dash">
              <h2 className="section-title-dash">
                <i className="bi bi-bell-fill" aria-hidden="true"></i>
                <span>Alertas recientes</span>
              </h2>

              <a href="#" className="see-all-dash">
                Ver todas
                <i className="bi bi-arrow-right" aria-hidden="true"></i>
              </a>
            </div>

            <div id="alerts">
              {alertasRecientes.length === 0 && (
                <p className="m-0">
                  No hay alertas recientes.
                </p>
              )}

              {alertasRecientes.map((alerta) => (
                <div className="alert-row-dash" key={alerta.id}>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{alerta.tipo}</div>
                    <div className="small">{alerta.barrio}</div>
                  </div>

                  <span className="alert-time-dash">
                    {alerta.hora}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel del mapa policial */}
        <div className="col-lg-6">
          <div className="card-panel-dash p-3 h-100">
            <h2 className="section-title-dash mb-3">
              <i className="bi bi-geo-alt-fill" aria-hidden="true"></i>
              <span>Mapa policial en tiempo real</span>
            </h2>

            <div className="map-box-dash">
              <div className="map-placeholder-dash">
                <i className="bi bi-map" aria-hidden="true"></i>

                <p className="mb-0 fw-semibold">
                  Mapa en tiempo real
                </p>

                <p className="mb-0 map-placeholder-texto-dash">
                  Muy pronto vas a poder ver aquí la ubicación de tus
                  unidades y alertas sobre el mapa.
                </p>

                <span className="badge-soon-dash mt-2">
                  Próximamente
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estado operativo */}
      <div className="card-panel-dash p-3 mb-4">
        <h2 className="section-title-dash mb-3">
          <i className="bi bi-activity" aria-hidden="true"></i>
          <span>Estado operativo</span>
        </h2>

        <Kpis grupo="centro-operativo" valores={kpis} />
      </div>
    </>
  );
}

export default CentroOperaciones;
