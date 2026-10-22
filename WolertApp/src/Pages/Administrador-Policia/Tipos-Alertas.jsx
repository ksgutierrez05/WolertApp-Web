
import Topbar from '../../Components/Administrador-policia/Topbar';
import '../../css/Policia/administrador-policia/css/tipo-alertas.css';

function TiposAlertas() {
  return (
    <>
      {/* Topbar */}
      <Topbar
        iniciales="SG"
        placeholder="Buscar por alerta, barrio, unidad, policía…"
      />

      {/* Encabezado */}
      <div className="header-vista-dash mb-4">
        <div>
          <h1>Tipo de Alertas</h1>
          <p>
            Administra las categorías de alerta del sistema y su nivel de
            prioridad.
          </p>
        </div>

        <button className="btn-cv-verde" id="btnNuevoTipo">
          <i className="bi bi-plus-lg"></i> Nuevo tipo de alerta
        </button>
      </div>

      {/* KPI */}
      <div className="row g-3 mb-4" id="kpisTipoAlertas"></div>

      {/* Filtros */}
      <div className="filtros-toolbar-dash mb-3">
        <div className="search-dash flex-grow-1 d-flex align-items-center input-group">
          <span className="input-group-text bg-transparent border-0">
            <i className="bi bi-search"></i>
          </span>

          <input
            type="text"
            id="buscarTipo"
            className="form-control border-0 bg-transparent"
            placeholder="Buscar tipo de alerta…"
          />
        </div>

        <div className="chips-prioridad-dash" id="chipsPrioridad">
          <button className="chip-prioridad-dash activo" data-prioridad="">
            Todas
          </button>
          <button className="chip-prioridad-dash" data-prioridad="ALTA">
            Alta
          </button>
          <button className="chip-prioridad-dash" data-prioridad="MEDIA">
            Media
          </button>
          <button className="chip-prioridad-dash" data-prioridad="BAJA">
            Baja
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="card-panel-dash mb-4">
        <div className="tabla-header-dash">
          <span className="flex-grow-1">Tipo de alerta</span>
          <span style={{ width: '150px' }}>Prioridad</span>
          <span style={{ width: '160px' }}>Categoría sugerida</span>
          <span style={{ width: '110px' }}>Acciones</span>
        </div>

        <table className="tabla-dash">
          <tbody id="tablaTipos"></tbody>
        </table>

        <div className="tabla-vacio-dash d-none" id="tiposVacio">
          No se encontraron tipos de alerta con esos filtros.
        </div>
      </div>

      {/* Modal crear/editar tipo de alerta */}
      <div
        className="modal fade"
        id="modalTipo"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header modal-header-dash">
              <div>
                <div className="modal-title" id="modalTipoTitulo">
                  Nuevo tipo de alerta
                </div>
                <div className="modal-subtitle">
                  Define el nombre y el nivel de prioridad con el que se atenderá
                </div>
              </div>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Cerrar"
              ></button>
            </div>

            <form id="formTipo">
              <div className="modal-body modal-body-dash">
                <input type="hidden" id="tipoId" />

                <div className="form-field-dash mb-3">
                  <label htmlFor="tipoNombre">
                    Nombre del tipo de alerta *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="tipoNombre"
                    placeholder="Ej: Robo / Asalto, Incendio…"
                    required
                  />
                </div>

                <div className="form-field-dash">
                  <label>Prioridad *</label>
                  <input type="hidden" id="tipoPrioridad" required />

                  <div className="prioridad-picker-dash" id="prioridadPicker">
                    <label
                      className="prioridad-opcion-dash alta"
                      data-valor="ALTA"
                    >
                      <input
                        type="radio"
                        name="prioridadRadio"
                        value="ALTA"
                      />
                      <span
                        className="dot"
                        style={{ background: 'var(--color-danger)' }}
                      ></span>
                      <span className="txt">Alta</span>
                    </label>

                    <label
                      className="prioridad-opcion-dash media"
                      data-valor="MEDIA"
                    >
                      <input
                        type="radio"
                        name="prioridadRadio"
                        value="MEDIA"
                      />
                      <span
                        className="dot"
                        style={{ background: 'var(--color-amber)' }}
                      ></span>
                      <span className="txt">Media</span>
                    </label>

                    <label
                      className="prioridad-opcion-dash baja"
                      data-valor="BAJA"
                    >
                      <input
                        type="radio"
                        name="prioridadRadio"
                        value="BAJA"
                      />
                      <span
                        className="dot"
                        style={{ background: 'var(--color-green)' }}
                      ></span>
                      <span className="txt">Baja</span>
                    </label>
                  </div>

                  <p className="celda-sub-dash mt-2 mb-0" id="prioridadAyuda">
                    La prioridad define qué tan rápido debe responder la unidad
                    asignada.
                  </p>
                </div>
              </div>

              <div className="modal-footer modal-footer-dash">
                <button
                  type="button"
                  className="btn-secundario-dash"
                  data-bs-dismiss="modal"
                >
                  Cancelar
                </button>

                <button type="submit" className="btn-cv-verde">
                  <i className="bi bi-check-lg"></i> Guardar tipo
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default TiposAlertas;
