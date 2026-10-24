
import Topbar from '../../Components/Central-policia/Topbar';
import Kpis from '../../Components/Central-policia/Kpicard';

import '../../css/Policia/central-policia/css/unidades.css';

function Unidad() {
  return (
    <div className="unidad-page">
      <Topbar placeholder="Buscar patrullero, unidad o caso..." />

      <main className="main-dash">
        <div className="container-fluid">
          {/* Encabezado */}
          <header className="unidad-header mb-4">
            <div className="unidad-titulo">
              <div className="unidad-icono">
                <i className="bi bi-car-front-fill" />
              </div>

              <div>
                <h1 className="page-title-dash">Unidades</h1>
                <p className="unidad-descripcion mb-0">
                  Consulta la disponibilidad y el estado operativo de los
                  patrulleros.
                </p>
              </div>
            </div>
          </header>

          {/* KPI */}
          <div className="unidad-kpis">
            <Kpis grupo="unidad" />
          </div>

          {/* Aviso informativo */}
          <div className="unidad-aviso">
            <i className="bi bi-info-circle-fill" />
            <span>
              Esta información es solo de consulta. La administración de
              patrulleros corresponde al Comandante de Estación.
            </span>
          </div>

          {/* Filtros visuales */}
          <section className="unidad-filtros card-panel-dash">
            <div className="unidad-search">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search" />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre o identificación..."
                  aria-label="Buscar patrulleros"
                />
              </div>
            </div>

            <select
              className="form-select unidad-select"
              defaultValue="todas"
              aria-label="Filtrar por unidad"
            >
              <option value="todas">Todas las unidades</option>
            </select>

            <select
              className="form-select unidad-select"
              defaultValue="todos"
              aria-label="Filtrar por estado"
            >
              <option value="todos">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="en_camino">En camino</option>
              <option value="en_sitio">En el sitio</option>
              <option value="ocupado">Ocupado</option>
              <option value="fuera_servicio">Fuera de servicio</option>
            </select>
          </section>

          {/* Tabla de unidades */}
          <section className="card-panel-dash unidad-panel-tabla">
            <div className="unidad-tabla-encabezado">
              <div>
                <h2>Estado de las unidades</h2>
                <p>Información general de los patrulleros registrados.</p>
              </div>

              <span className="unidad-tabla-icono">
                <i className="bi bi-shield-check" />
              </span>
            </div>

            <div className="unidad-tabla-wrap">
              <table className="table unidad-tabla">
                <thead>
                  <tr>
                    <th>Patrullero</th>
                    <th>Unidad / CAI</th>
                    <th>Estado</th>
                    <th>Atención actual</th>
                    <th className="text-end">Detalle</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      <div className="unidad-patrullero">
                        <div className="unidad-avatar">
                          <i className="bi bi-person-fill" />
                        </div>

                        <div>
                          <strong>Nombre del patrullero</strong>
                          <small>Identificación</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="unidad-nombre-cai">
                        <i className="bi bi-geo-alt" />
                        Unidad asignada
                      </span>
                    </td>

            

                    <td>
                      <span className="unidad-sin-atencion">
                        Sin atención asignada
                      </span>
                    </td>

                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-light btn-sm unidad-btn-detalle"
                        data-bs-toggle="modal"
                        data-bs-target="#modalDetallePatrullero"
                        aria-label="Ver detalle del patrullero"
                      >
                        <i className="bi bi-eye" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="unidad-empty d-none">
                <i className="bi bi-search" />
                <p>No se encontraron patrulleros con esos filtros.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Modal visual */}
      <div
        className="modal fade"
        id="modalDetallePatrullero"
        tabIndex="-1"
        aria-labelledby="modalDetallePatrulleroTitulo"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content unidad-modal">
            <div className="modal-header">
              <div>
                <span className="unidad-modal-subtitulo">
                  INFORMACIÓN OPERATIVA
                </span>

                <h5
                  className="modal-title"
                  id="modalDetallePatrulleroTitulo"
                >
                  Detalle del patrullero
                </h5>
              </div>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Cerrar"
              />
            </div>

            <div className="modal-body">
              <div className="unidad-modal-identidad">
                <div className="unidad-avatar unidad-avatar-grande">
                  <i className="bi bi-person-fill" />
                </div>

                <div>
                  <h6>Nombre del patrullero</h6>
                  <span>Personal policial</span>
                </div>
              </div>

              <div className="unidad-detalle-lista">
                <div className="unidad-detalle-fila">
                  <span>Identificación</span>
                  <strong>---</strong>
                </div>

                <div className="unidad-detalle-fila">
                  <span>Unidad / CAI</span>
                  <strong>Unidad asignada</strong>
                </div>

                <div className="unidad-detalle-fila">
                  <span>Estado operativo</span>
                  <strong className="unidad-detalle-disponible">
                    Disponible
                  </strong>
                </div>

                <div className="unidad-detalle-fila">
                  <span>Atención actual</span>
                  <strong>Sin atención asignada</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light unidad-btn-cerrar"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Unidad;
