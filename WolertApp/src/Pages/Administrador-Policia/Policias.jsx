
import Topbar from '../../Components/Administrador-policia/Topbar';
import '../../css/Policia/administrador-policia/css/policias.css';

function Policias() {
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
                    <h1>Policías</h1>
                    <p>
                        Administra el personal policial y su asignación a unidades.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn-cv-verde"
                    id="btnNuevoPolicia"
                >
                    <i className="bi bi-plus-lg"></i>
                    Nuevo policía
                </button>
            </div>

            {/* KPIs */}
            <div className="row g-3 mb-4" id="kpisPolicias"></div>



            {/* Panel de filtros */}
            <div className="panel-filtros-policias mb-4">
                <div className="panel-filtros-header">
                    <div className="panel-filtros-icono">
                        <i className="bi bi-funnel"></i>
                    </div>

                    <div>
                        <h3>Filtros de policías</h3>
                        <p>Busca y organiza el personal policial</p>
                    </div>

                    <span className="filtros-etiqueta">
                        <i className="bi bi-shield-check"></i>
                        Gestión de personal
                    </span>
                </div>

                <div className="panel-filtros-body">
                    {/* Buscador */}
                    <div className="buscador-unidades">
                        <label htmlFor="buscarPolicia">
                            <i className="bi bi-search"></i>
                            Buscar policía
                        </label>

                        <div className="buscador-unidades-input">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                id="buscarPolicia"
                                placeholder="Nombre, cédula o placa..."
                            />
                        </div>
                    </div>

                    {/* Selectores */}
                    <div className="filtros-unidades-selects">
                        <div className="filtro-unidad-card">
                            <label htmlFor="filtroEstadoPolicia">
                                <span className="filtro-unidad-icono estado">
                                    <i className="bi bi-person-check"></i>
                                </span>
                                <span>
                                    <strong>Estado del policía</strong>
                                    <small>Filtra según su disponibilidad</small>
                                </span>
                            </label>

                            <select
                                id="filtroEstadoPolicia"
                                className="form-select"
                                defaultValue=""
                            >
                                <option value="">Todos los estados</option>
                                <option value="DISPONIBLE">Disponible</option>
                                <option value="EN_SERVICIO">En servicio</option>
                                <option value="OCUPADO">Ocupado</option>
                                <option value="FUERA_DE_SERVICIO">Fuera de servicio</option>
                            </select>
                        </div>

                        <div className="filtro-unidad-card">
                            <label htmlFor="filtroUnidadPolicia">
                                <span className="filtro-unidad-icono ubicacion">
                                    <i className="bi bi-geo-alt"></i>
                                </span>
                                <span>
                                    <strong>Unidad policial</strong>
                                    <small>Filtra por unidad asignada</small>
                                </span>
                            </label>

                            <select
                                id="filtroUnidadPolicia"
                                className="form-select"
                                defaultValue=""
                            >
                                <option value="">Todas las unidades</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>



            {/* Tabla */}
            <div className="card-panel-dash mb-4">
                <div className="tabla-header-dash">
                    <span className="flex-grow-1">Policía</span>
                    <span style={{ width: '110px' }}>Placa</span>
                    <span style={{ width: '130px' }}>Rango</span>
                    <span style={{ width: '150px' }}>Unidad</span>
                    <span style={{ width: '150px' }}>Estado</span>
                    <span style={{ width: '110px' }}>Acciones</span>
                </div>

                <table className="tabla-dash">
                    <tbody id="tablaPolicias"></tbody>
                </table>

                <div
                    className="tabla-vacio-dash d-none"
                    id="policiasVacio"
                >
                    No se encontraron policías con esos filtros.
                </div>
            </div>

            {/* Modal crear/editar policía */}
            <div
                className="modal fade"
                id="modalPolicia"
                tabIndex="-1"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header modal-header-dash">
                            <div>
                                <div
                                    className="modal-title"
                                    id="modalPoliciaTitulo"
                                >
                                    Nuevo policía
                                </div>

                                <div className="modal-subtitle">
                                    Registra un agente y asígnalo a una unidad
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Cerrar"
                            ></button>
                        </div>

                        <form id="formPolicia">
                            <div className="modal-body modal-body-dash">
                                <input type="hidden" id="policiaId" />

                                <div className="row g-3">
                                    <div className="col-md-6 form-field-dash">
                                        <label htmlFor="policiaCedula">
                                            Cédula *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="policiaCedula"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 form-field-dash">
                                        <label htmlFor="policiaPlaca">
                                            Placa *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="policiaPlaca"
                                            placeholder="Ej: P-1042"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 form-field-dash">
                                        <label htmlFor="policiaNombre1">
                                            Primer nombre *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="policiaNombre1"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 form-field-dash">
                                        <label htmlFor="policiaNombre2">
                                            Segundo nombre
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="policiaNombre2"
                                        />
                                    </div>

                                    <div className="col-md-6 form-field-dash">
                                        <label htmlFor="policiaApellido1">
                                            Primer apellido *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="policiaApellido1"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 form-field-dash">
                                        <label htmlFor="policiaApellido2">
                                            Segundo apellido
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="policiaApellido2"
                                        />
                                    </div>

                                    <div className="col-md-6 form-field-dash">
                                        <label htmlFor="policiaRango">
                                            Rango *
                                        </label>
                                        <select
                                            className="form-select"
                                            id="policiaRango"
                                            defaultValue="Patrullero"
                                            required
                                        >
                                            <option value="Patrullero">
                                                Patrullero
                                            </option>
                                            <option value="Subintendente">
                                                Subintendente
                                            </option>
                                            <option value="Intendente">
                                                Intendente
                                            </option>
                                            <option value="Comandante">
                                                Comandante
                                            </option>
                                        </select>
                                    </div>

                                    <div className="col-md-6 form-field-dash">
                                        <label htmlFor="policiaUnidad">
                                            Unidad asignada *
                                        </label>
                                        <select
                                            className="form-select"
                                            id="policiaUnidad"
                                            defaultValue=""
                                            required
                                        ></select>
                                    </div>

                                    <div className="col-md-6 form-field-dash">
                                        <label htmlFor="policiaEstado">
                                            Estado *
                                        </label>
                                        <select
                                            className="form-select"
                                            id="policiaEstado"
                                            defaultValue="DISPONIBLE"
                                            required
                                        >
                                            <option value="DISPONIBLE">
                                                Disponible
                                            </option>
                                            <option value="EN_SERVICIO">
                                                En servicio
                                            </option>
                                            <option value="OCUPADO">
                                                Ocupado
                                            </option>
                                            <option value="FUERA_DE_SERVICIO">
                                                Fuera de servicio
                                            </option>
                                        </select>
                                    </div>

                                    <div className="col-md-6 form-field-dash">
                                        <label htmlFor="policiaTelefono">
                                            Teléfono
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="policiaTelefono"
                                        />
                                    </div>

                                    <div className="col-md-6 form-field-dash">
                                        <label htmlFor="policiaCorreo">
                                            Correo
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="policiaCorreo"
                                        />
                                    </div>

                                    <div className="col-md-6 form-field-dash">
                                        <label htmlFor="policiaUsername">
                                            Username *
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="policiaUsername"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 form-field-dash">
                                        <label htmlFor="policiaPassword">
                                            Contraseña{' '}
                                            <span id="passwordHint">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="policiaPassword"
                                            placeholder="••••••••"
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

                                <button
                                    type="submit"
                                    className="btn-cv-verde"
                                >
                                    <i className="bi bi-check-lg"></i>
                                    Guardar policía
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal ver policía */}
            <div
                className="modal fade"
                id="modalVerPolicia"
                tabIndex="-1"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header modal-header-dash">
                            <div className="detalle-header-dash w-100">
                                <div
                                    className="avatar-lg-dash"
                                    id="verPoliciaAvatar"
                                >
                                    —
                                </div>

                                <div
                                    className="modal-title"
                                    id="verPoliciaNombre"
                                >
                                    —
                                </div>

                                <span
                                    className="badge-dash"
                                    id="verPoliciaEstado"
                                >
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
                                <span className="k">Cédula</span>
                                <span className="v" id="verPoliciaCedula">
                                    —
                                </span>
                            </div>

                            <div className="detalle-fila-dash">
                                <span className="k">Placa</span>
                                <span className="v" id="verPoliciaPlaca">
                                    —
                                </span>
                            </div>

                            <div className="detalle-fila-dash">
                                <span className="k">Rango</span>
                                <span className="v" id="verPoliciaRango">
                                    —
                                </span>
                            </div>

                            <div className="detalle-fila-dash">
                                <span className="k">Unidad</span>
                                <span className="v" id="verPoliciaUnidad">
                                    —
                                </span>
                            </div>

                            <div className="detalle-fila-dash">
                                <span className="k">Teléfono</span>
                                <span className="v" id="verPoliciaTelefono">
                                    —
                                </span>
                            </div>

                            <div className="detalle-fila-dash">
                                <span className="k">Correo</span>
                                <span className="v" id="verPoliciaCorreo">
                                    —
                                </span>
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

export default Policias;
