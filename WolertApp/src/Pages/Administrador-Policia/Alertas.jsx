import Topbar from '../../Components/Administrador-policia/Topbar';
import Kpis from '../../Components/Administrador-policia/Kpicard';
import '../../css/Policia/administrador-policia/css/alertas.css';

function Alertas({ kpis= {} }) {
  return (
    <>
      <Topbar placeholder="Buscar por ciudadano o barrio..." />

      {/* Encabezado de la vista */}
      <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <p className="page-title-dash fw-bold m-0">Alertas</p>
          <p className="info-sub-dash m-0">Seguimiento de las alertas reportadas por los ciudadanos.</p>
        </div>
      </div>

      {/* KPIs */}
     <Kpis grupo="alertas" valores={kpis} />

      {/* Filtros por tipo */}
      <div className="d-flex gap-2 flex-wrap mb-3" id="filtrosAlertas">
        <button className="chip-filtro-dash active" data-filtro="todas">
          Todas <span className="chip-count-dash">0</span>
        </button>
        <button className="chip-filtro-dash" data-filtro="ROBO">
          Robo / Hurto <span className="chip-count-dash">0</span>
        </button>
        <button className="chip-filtro-dash" data-filtro="ACCIDENTE">
          Accidente <span className="chip-count-dash">0</span>
        </button>
        <button className="chip-filtro-dash" data-filtro="INCENDIO">
          Incendio <span className="chip-count-dash">0</span>
        </button>
        <button className="chip-filtro-dash" data-filtro="SOSPECHOSO">
          Sospechoso <span className="chip-count-dash">0</span>
        </button>
      </div>

      {/* Tabla de alertas */}
      <div className="card-panel-dash p-3">
        <div className="table-responsive">
          <table className="table table-borderless align-middle tabla-alertas-dash mb-0">
            <thead>
              <tr>
                <th>Reportado por</th>
                <th>Tipo</th>
                <th>Barrio</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody id="filaAlertas"></tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-3 paginacion-alertas-dash">
          <span className="info-sub-dash m-0">Mostrando 0–0 de 0 alertas</span>
          <div className="d-flex align-items-center gap-1">
            <button className="pagina-btn-dash active">1</button>
            <button className="pagina-btn-dash" title="Siguiente"><i className="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>

      {/* Modal detalle de la alerta */}
      <div className="modal fade" id="modalDetalleAlerta" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content modal-alerta-dash">

            <div className="modal-header">
              <div>
                <h5 className="modal-title">Detalle de la alerta</h5>
                <p className="modal-subtitulo-dash">Información del reporte ciudadano</p>
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <div className="modal-body">
              <div className="detalle-principal-dash">
                <div>
                  <small>TIPO DE ALERTA</small>
                  <div id="detalleTipo"></div>
                </div>
                <div>
                  <small>ESTADO</small>
                  <div id="detalleEstado"></div>
                </div>
              </div>

              <div className="detalle-grid-dash">
                <div className="detalle-item-dash">
                  <i className="bi bi-person"></i>
                  <div>
                    <small>Ciudadano</small>
                    <strong id="detalleCiudadano"></strong>
                  </div>
                </div>
                <div className="detalle-item-dash">
                  <i className="bi bi-geo-alt"></i>
                  <div>
                    <small>Barrio</small>
                    <strong id="detalleBarrio"></strong>
                  </div>
                </div>
                <div className="detalle-item-dash">
                  <i className="bi bi-clock"></i>
                  <div>
                    <small>Fecha</small>
                    <strong id="detalleFecha"></strong>
                  </div>
                </div>
              </div>

              <div className="detalle-descripcion-dash">
                <small>DESCRIPCIÓN</small>
                <p id="detalleDescripcion"></p>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cerrar-detalle-dash" data-bs-dismiss="modal">Cerrar</button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Alertas;