
import Topbar from '../../Components/Central-policia/Topbar';
import Kpis from '../../Components/Central-policia/Kpicard';
import '../../css/Policia/central-policia/css/atencion-alertas.css';

function AtencionAlertas() {


  return (
    <div className="atencion-page">
      <Topbar placeholder="Buscar por caso, tipo, dirección o barrio..." />

      <main className="atencion-contenido">
        <header className="atencion-encabezado">
          <div>
            <h1>Atención de alertas</h1>
            <p>
              Revisa los reportes enviados por la Policía, registra las
              observaciones de la Central y finaliza la atención.
            </p>
          </div>
        </header>

        <Kpis grupo="atencion-alertas" />

        <section className="atencion-layout">
          <div className="atencion-panel atencion-listado">
            <div className="atencion-panel-header">
              <div>
                <h2>Reportes policiales</h2>
                <p>Selecciona un reporte para revisar la atención.</p>
              </div>

              <span className="atencion-total">05</span>
            </div>

            <div className="atencion-filtros">
              <div className="atencion-tabs">
                <button type="button" className="activo">
                  Por revisar
                </button>
                <button type="button">En revisión</button>
                <button type="button">Finalizadas</button>
                <button type="button">Todas</button>
              </div>

              <div className="atencion-busqueda">
                <i className="bi bi-search" />
                <input
                  type="text"
                  placeholder="Buscar caso, unidad o zona..."
                  aria-label="Buscar reportes policiales"
                />
              </div>
            </div>

            <div className="atencion-lista">
              <div className="atencion-item">
                <span className="atencion-item-icono">
                  <i className="bi bi-file-earmark-text" aria-hidden="true" />
                </span>

                <span className="atencion-item-info">
                  <strong>#--- · Tipo de alerta</strong>

                  <small>
                    <i className="bi bi-geo-alt" aria-hidden="true" />
                    Ubicación de la alerta
                  </small>

                  <small>
                    <i className="bi bi-truck-front" aria-hidden="true" />
                    Unidad asignada
                  </small>
                </span>

                <span className="atencion-item-derecha">
                  <span className="atencion-estado por-revisar">
                    Por revisar
                  </span>
                  <i className="bi bi-chevron-right" aria-hidden="true" />
                </span>
              </div>
            </div>
          </div>

          <div className="atencion-panel atencion-detalle">
            <div className="atencion-detalle-header">
              <div>
                <span className="atencion-detalle-etiqueta">
                  ALERTA #---
                </span>

                <h2>Tipo de alerta</h2>

                <p>
                  <i className="bi bi-geo-alt" />
                  Ubicación de la alerta
                </p>
              </div>

              <span className="atencion-estado por-revisar">
                Por revisar
              </span>
            </div>

            <div className="atencion-unidad">
              <div className="atencion-unidad-icono">
                <i className="bi bi-truck-front" />
              </div>

              <div>
                <small>Unidad responsable</small>
                <strong>Unidad asignada</strong>
              </div>

              <div>
                <small>Patrullero</small>
                <strong>Nombre del patrullero</strong>
              </div>

              <div className="atencion-unidad-hora">
                <small>Reporte recibido</small>
                <strong>Fecha y hora</strong>
              </div>
            </div>

            <section className="atencion-seccion">
              <h3>
                <i className="bi bi-file-earmark-text" />
                Información de la alerta
              </h3>

              <p>
                Descripción detallada de lo ocurrido en la alerta.
                Aquí se muestra la información reportada por el ciudadano
                o la central de monitoreo.
              </p>
            </section>

            <section className="atencion-seccion">
              <h3>
                <i className="bi bi-broadcast" />
                Informe enviado por la Policía
              </h3>

              <div className="atencion-reporte-campo">
                <span>Descripción del resultado</span>
                <p>Texto del reporte policial...</p>
              </div>

              <div className="atencion-reporte-campo">
                <span>Acciones realizadas</span>
                <p>Detalle de las acciones de la unidad...</p>
              </div>

              <div className="atencion-reporte-campo">
                <span>Resultado informado</span>
                <p>Resultado de la intervención...</p>
              </div>

              <div className="atencion-reporte-campo">
                <span>Observaciones de la unidad</span>
                <p>Observaciones adicionales...</p>
              </div>
            </section>

            <section className="atencion-seccion atencion-seccion-central">
              <div className="atencion-seccion-titulo">
                <h3>
                  <i className="bi bi-pencil-square" />
                  Registro de la Central
                </h3>

                <span>Informe final</span>
              </div>

              <label htmlFor="observacion-central">
                Observaciones de la Central
              </label>

              <textarea
                id="observacion-central"
                rows={4}
                placeholder="Escribe aquí las observaciones finales..."
              />

              <div className="atencion-ayuda">
                <i className="bi bi-info-circle" />
                Revisa el informe policial antes de finalizar la atención.
              </div>
            </section>

            <div className="atencion-acciones">
              <button type="button" className="atencion-btn-secundario">
                <i className="bi bi-eye" />
                Iniciar revisión
              </button>

              <button type="button" className="atencion-btn-principal">
                <i className="bi bi-check-circle" />
                Finalizar atención
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AtencionAlertas;
