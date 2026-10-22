
import Topbar from '../../Components/Administrador-policia/Topbar';
import '../../css/Policia/administrador-policia/css/unidades.css';

function Unidades() {
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
                    <h1>Unidades Policiales</h1>
                    <p>
                        Administra las patrullas, motos y CAI registrados en el sistema.
                    </p>
                </div>

                <button className="btn-cv-verde" id="btnNuevaUnidad">
                    <i className="bi bi-plus-lg"></i> Nueva unidad
                </button>
            </div>

            {/* KPI */}
            <div className="row g-3 mb-4" id="kpisUnidades"></div>


            {/* Panel de filtros */}
            <div className="panel-filtros-unidades mb-4">
                <div className="panel-filtros-header">
                    <div className="panel-filtros-icono">
                        <i className="bi bi-sliders"></i>
                    </div>

                    <div className="flex-grow-1">
                        <h3>Filtrar unidades</h3>
                        <p>Busca y organiza las unidades policiales</p>
                    </div>
                </div>

                <div className="panel-filtros-body">
                    <div className="buscador-unidades">
                        <label htmlFor="buscarUnidad">
                            <i className="bi bi-search"></i>
                            Buscar unidad
                        </label>

                        <div className="buscador-unidades-input">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                id="buscarUnidad"
                                placeholder="Nombre de unidad o barrio..."
                            />
                        </div>
                    </div>

                    <div className="filtros-unidades-selects">
                        <div className="filtro-unidad-card">
                            <label htmlFor="filtroEstadoUnidad">
                                <span className="filtro-unidad-icono estado">
                                    <i className="bi bi-activity"></i>
                                </span>
                                <span>
                                    <strong>Estado</strong>
                                    <small>Disponibilidad operativa</small>
                                </span>
                            </label>

                            <select id="filtroEstadoUnidad" className="form-select">
                                <option value="">Todos los estados</option>
                                <option value="OPERATIVA">Operativa</option>
                                <option value="ACTIVA">Activa</option>
                                <option value="INACTIVA">Inactiva</option>
                            </select>
                        </div>

                        <div className="filtro-unidad-card">
                            <label htmlFor="filtroBarrioUnidad">
                                <span className="filtro-unidad-icono ubicacion">
                                    <i className="bi bi-geo-alt"></i>
                                </span>
                                <span>
                                    <strong>Ubicación</strong>
                                    <small>Filtrar por barrio</small>
                                </span>
                            </label>

                            <select id="filtroBarrioUnidad" className="form-select">
                                <option value="">Todos los barrios</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>


            {/* Tabla */}
            <div className="card-panel-dash mb-4">
                <div className="tabla-header-dash">
                    <span className="flex-grow-1">Unidad</span>
                    <span style={{ width: '150px' }}>Barrio</span>
                    <span style={{ width: '130px' }}>Estado</span>
                    <span style={{ width: '110px' }}>Policías</span>
                    <span style={{ width: '150px' }}>Coordenadas</span>
                    <span style={{ width: '110px' }}>Acciones</span>
                </div>

                <table className="tabla-dash">
                    <tbody id="tablaUnidades"></tbody>
                </table>

                <div className="tabla-vacio-dash d-none" id="unidadesVacio">
                    No se encontraron unidades con esos filtros.
                </div>
            </div>

            {/* Modal crear/editar unidad */}
            <div
                className="modal fade"
                id="modalUnidad"
                tabIndex="-1"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header modal-header-dash">
                            <div>
                                <div className="modal-title" id="modalUnidadTitulo">
                                    Nueva unidad
                                </div>

                                <div className="modal-subtitle">
                                    Registra una patrulla, moto o CAI en el sistema
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"
                            ></button>
                        </div>

                        <form id="formUnidad">
                            <div className="modal-body modal-body-dash">
                                <input type="hidden" id="unidadId" />

                                <div className="row g-3">
                                    <div className="col-12 form-field-dash">
                                        <label htmlFor="unidadNombre">
                                            Nombre de la unidad *
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            id="unidadNombre"
                                            placeholder="Ej: Patrulla 101"
                                            required
                                        />
                                    </div>

                                    <div className="col-6 form-field-dash">
                                        <label htmlFor="unidadBarrio">Barrio *</label>

                                        <select
                                            className="form-select"
                                            id="unidadBarrio"
                                            required
                                        ></select>
                                    </div>

                                    <div className="col-6 form-field-dash">
                                        <label htmlFor="unidadEstado">Estado *</label>

                                        <select
                                            className="form-select"
                                            id="unidadEstado"
                                            required
                                        >
                                            <option value="OPERATIVA">Operativa</option>
                                            <option value="ACTIVA">Activa</option>
                                            <option value="INACTIVA">Inactiva</option>
                                        </select>
                                    </div>

                                    <div className="col-6 form-field-dash">
                                        <label htmlFor="unidadLat">Latitud *</label>

                                        <input
                                            type="number"
                                            step="0.0001"
                                            className="form-control"
                                            id="unidadLat"
                                            placeholder="10.4631"
                                            required
                                        />
                                    </div>

                                    <div className="col-6 form-field-dash">
                                        <label htmlFor="unidadLng">Longitud *</label>

                                        <input
                                            type="number"
                                            step="0.0001"
                                            className="form-control"
                                            id="unidadLng"
                                            placeholder="-73.2532"
                                            required
                                        />
                                    </div>
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
                                    <i className="bi bi-check-lg"></i> Guardar unidad
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal ver unidad */}
            <div
                className="modal fade"
                id="modalVerUnidad"
                tabIndex="-1"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header modal-header-dash">
                            <div className="detalle-header-dash w-100">
                                <div
                                    className="avatar-lg-dash"
                                    id="verUnidadAvatar"
                                    style={{ background: 'var(--color-primary-2)' }}
                                >
                                    <i className="bi bi-car-front"></i>
                                </div>

                                <div className="modal-title" id="verUnidadNombre">
                                    —
                                </div>

                                <span className="badge-dash" id="verUnidadEstado">
                                    —
                                </span>
                            </div>

                            <button
                                type="button"
                                className="btn-close position-absolute top-0 end-0 m-3"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"
                            ></button>
                        </div>

                        <div className="modal-body modal-body-dash">
                            <div className="detalle-fila-dash">
                                <span className="k">Barrio</span>
                                <span className="v" id="verUnidadBarrio">—</span>
                            </div>

                            <div className="detalle-fila-dash">
                                <span className="k">Coordenadas</span>
                                <span className="v" id="verUnidadCoords">—</span>
                            </div>

                            <div className="detalle-fila-dash">
                                <span className="k">Policías asignados</span>
                                <span className="v" id="verUnidadPolicias">—</span>
                            </div>
                        </div>

                        <div className="modal-footer modal-footer-dash">
                            <button
                                type="button"
                                className="btn-secundario-dash"
                                data-bs-dismiss="modal"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Unidades;
