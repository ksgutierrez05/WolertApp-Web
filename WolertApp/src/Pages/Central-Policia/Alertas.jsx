import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";
import {
  cargarOperaciones,
  resumenOperativo,
  idAlerta,
  tipoAlerta,
  prioridadAlerta,
  ubicacionAlerta,
  fechaAlerta,
  fechaLegible,
  estadoAlerta,
  esCritica,
  esPendiente,
  esResuelta,
  esFinalizadaAsignacion,
  campo,
} from "../../Services/OperacionesCentralService.js";
import { nombreUnidad } from "../../Services/atencionUnidadesCentralService";
import { consultarCentral } from "../../Services/centralPoliciaApi";
import { zonaDelCaso } from "../../Services/ubicacionAlertaCentral";
import "../../css/Policia/central-policia/css/alertas.css";
const datosVacios = () => ({
  alertas: [],
  asignaciones: [],
  atenciones: [],
  unidades: [],
});

const clasePrioridadDetalle = (valor) => {
  const prioridad = String(valor || "").toUpperCase();
  if (["ALTA", "CRITICA", "CRÍTICA", "URGENTE"].includes(prioridad)) return "alta";
  if (prioridad === "MEDIA") return "media";
  if (prioridad === "BAJA") return "baja";
  return "neutral";
};

const claseEstadoDetalle = (alerta) => {
  if (esResuelta(alerta)) return "resuelta";
  if (esPendiente(alerta)) return "pendiente";
  return "atencion";
};

const etiquetaEstadoDetalle = (alerta) =>
  estadoAlerta(alerta)
    .replaceAll("_", " ")
    .toLocaleLowerCase("es")
    .replace(/^\p{L}/u, (letra) => letra.toLocaleUpperCase("es")) || "—";
function Alertas() {
  const [datos, setDatos] = useState(datosVacios);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [avisos, setAvisos] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);
  const [barrios, setBarrios] = useState([]);
  const [pagina, setPagina] = useState(1);
  const porPagina = 10;
  useEffect(() => {
    const controller = new AbortController();
    cargarOperaciones(controller.signal)
      .then(({ datos: resultado, errores }) => {
        if (controller.signal.aborted) return;
        setDatos(resultado);
        setAvisos(errores);
        setError("");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setDatos(datosVacios());
        setAvisos([]);
        setError(err.message || "No se pudieron cargar las alertas.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });
    return () => controller.abort();
  }, [recarga]);

  useEffect(() => {
    const controller = new AbortController();
    consultarCentral("/api/Barrios", { signal: controller.signal })
      .then((resultado) => {
        if (controller.signal.aborted) return;
        const lista = Array.isArray(resultado)
          ? resultado
          : resultado?.data || resultado?.barrios || resultado?.Barrios;
        setBarrios(Array.isArray(lista) ? lista : []);
      })
      .catch(() => {
        if (!controller.signal.aborted) setBarrios([]);
      });
    return () => controller.abort();
  }, []);

  const asignacionSeleccionada = useMemo(() => {
    if (!alertaSeleccionada) return null;
    return datos.asignaciones.find(
      (asignacion) =>
        String(campo(asignacion, "idAlerta", "IdAlerta", "ID_ALERTA")) ===
          String(idAlerta(alertaSeleccionada)) &&
        !esFinalizadaAsignacion(asignacion)
    ) || null;
  }, [alertaSeleccionada, datos.asignaciones]);

  const unidadSeleccionada = useMemo(() => {
    if (!asignacionSeleccionada) return "Sin unidad asignada";
    const idUnidad = campo(
      asignacionSeleccionada,
      "idUnidad", "IdUnidad", "ID_UNIDAD"
    );
    const unidad = datos.unidades.find(
      (item) => String(campo(item, "idUnidad", "IdUnidad", "ID_UNIDAD")) === String(idUnidad)
    );
    return unidad
      ? nombreUnidad(unidad)
      : idUnidad != null
        ? `Unidad #${idUnidad}`
        : "Sin unidad asignada";
  }, [asignacionSeleccionada, datos.unidades]);
  const valores = useMemo(() => resumenOperativo(datos).alertas, [datos]);
  const filtradas = useMemo(
    () =>
      datos.alertas
        .filter((a) => {
          const coincide =
            filtro === "todas" ||
            (filtro === "criticas" && esCritica(a)) ||
            (filtro === "pendientes" && esPendiente(a)) ||
            (filtro === "resueltas" && esResuelta(a));
          const coincideBusqueda = [
            idAlerta(a),
            tipoAlerta(a),
            prioridadAlerta(a),
            ubicacionAlerta(a),
            estadoAlerta(a),
          ]
            .join(" ")
            .toLowerCase()
            .includes(busqueda.trim().toLowerCase());
          return coincide && coincideBusqueda;
        })
        .sort(
          (a, b) =>
            new Date(fechaAlerta(b) || 0) - new Date(fechaAlerta(a) || 0),
        ),
    [datos.alertas, filtro, busqueda],
  );
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const alertasPagina = useMemo(
    () =>
      filtradas.slice((paginaActual - 1) * porPagina, paginaActual * porPagina),
    [filtradas, paginaActual],
  );
  useEffect(() => {
    setPagina(1);
  }, [filtro, busqueda]);
  function actualizar() {
    setAlertaSeleccionada(null);
    setCargando(true);
    setError("");
    setAvisos([]);
    setRecarga((n) => n + 1);
  }
  function cerrarModal() {
    setAlertaSeleccionada(null);
  }
  return (
    <>
      <Topbar
        placeholder="Buscar por caso, tipo, dirección o barrio..."
        iniciales="CR"
      />
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h1 className="page-title-dash">Alertas entrantes</h1>
          <p className="info-sub-dash mb-0">
            Consulta y filtra las alertas recibidas desde los ciudadanos.
          </p>
        </div>

      </div>
      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error al cargar las alertas: </strong>
          {error}
        </div>
      )}
      {avisos.length > 0 && (
        <div className="alert alert-warning" role="alert">
          <strong>Consultas parciales.</strong>
          <ul className="mb-0 mt-1">
            {avisos.map((aviso, i) => (
              <li key={i}>{aviso}</li>
            ))}
          </ul>
        </div>
      )}
      <Kpis grupo="alertas" valores={cargando || error ? {} : valores} />
      <section className="card-panel-dash p-4 mb-4">
        <div className="encabezado-panel-dash">
          <h2 className="section-title-dash">
            <i className="bi bi-funnel me-2" />
            Filtros de alertas
          </h2>
        </div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {[
            ["todas", "Todas"],
            ["criticas", "Críticas"],
            ["pendientes", "Pendientes"],
            ["resueltas", "Resueltas"],
          ].map(([clave, etiqueta]) => (
            <button
              key={clave}
              type="button"
              onClick={() => setFiltro(clave)}
              className={`btn btn-sm ${
                filtro === clave ? "btn-success" : "btn-outline-secondary"
              }`}
              aria-pressed={filtro === clave}
            >
              {etiqueta}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="form-control"
          placeholder="Buscar por caso, tipo, barrio o estado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar alertas"
        />
      </section>
      <section className="card-panel-dash p-4 mb-4">
        <div className="encabezado-panel-dash">
          <h2 className="section-title-dash">
            <i className="bi bi-inboxes me-2" />
            Listado de alertas
          </h2>
          <span className="see-all-dash">
            {cargando || error ? "—" : filtradas.length} registros
          </span>
        </div>
        <div className="table-responsive">
          <table className="table tabla-dash align-middle">
            <thead>
              <tr>
                <th>Caso</th>
                <th>Tipo</th>
                <th>Prioridad</th>
                <th>Ubicación</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cargando || error ? (
                <tr>
                  <td colSpan={7} className="estado-vacio-dash">
                    {cargando
                      ? "Cargando alertas..."
                      : "No fue posible cargar las alertas."}
                  </td>
                </tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="estado-vacio-dash">
                    No se encontraron alertas.
                  </td>
                </tr>
              ) : (
                alertasPagina.map((a, i) => (
                  <tr key={idAlerta(a) ?? i}>
                    <td className="fw-semibold">#{idAlerta(a)}</td>
                    <td>{tipoAlerta(a)}</td>
                    <td>
                      <span
                        className={`badge ${
                          esCritica(a)
                            ? "bg-danger"
                            : prioridadAlerta(a) === "MEDIA"
                              ? "bg-warning text-dark"
                              : "bg-secondary"
                        }`}
                      >
                        {prioridadAlerta(a) || "—"}
                      </span>
                    </td>
                    <td>{ubicacionAlerta(a)}</td>
                    <td>{fechaLegible(fechaAlerta(a))}</td>
                    <td>
                      <span
                        className={`badge ${
                          esResuelta(a)
                            ? "bg-success"
                            : esPendiente(a)
                              ? "bg-warning text-dark"
                              : "bg-primary"
                        }`}
                      >
                        {estadoAlerta(a).replaceAll("_", " ") || "—"}
                      </span>
                    </td>
                    <td className="ver-detalles-cell">
                      <button
                        type="button"
                        className="al-btn-ver btn-ver-detalles"
                        onClick={() => setAlertaSeleccionada(a)}
                        title="Ver detalles"
                        aria-label={`Ver detalles de la alerta ${idAlerta(a)}`}
                      >
                        <i className="bi bi-eye-fill" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!cargando && !error && filtradas.length > 0 && (
          <nav className="al-paginacion" aria-label="Paginación de alertas">
            <span className="al-paginacion-info">
              Mostrando {(paginaActual - 1) * porPagina + 1}–
              {Math.min(paginaActual * porPagina, filtradas.length)} de{" "}
              {filtradas.length} alertas
            </span>
            <div className="al-paginacion-controles">
              <button
                type="button"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
              >
                Anterior
              </button>
              <span>
                {paginaActual} / {totalPaginas}
              </span>
              <button
                type="button"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente
              </button>
            </div>
          </nav>
        )}
      </section>
      {alertaSeleccionada && (
        <div
          className="modal d-block alerta-detalle-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="alerta-detalle-titulo"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) cerrarModal();
          }}
        >
          <div className="modal-dialog modal-dialog-centered alerta-detalle-dialog">
            <div className="modal-content alerta-detalle-modal">
              <div className="modal-header alerta-detalle-header">
                <div>
                  <h2 className="modal-title" id="alerta-detalle-titulo">
                    Alerta #{idAlerta(alertaSeleccionada)}
                  </h2>
                  <p className="alerta-detalle-subtitulo">Información del reporte ciudadano</p>
                </div>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={cerrarModal} />
              </div>
              <div className="modal-body alerta-detalle-body">
                <div className="alerta-detalle-grid">
                  <div className="alerta-detalle-campo">
                    <div className="alerta-detalle-etiqueta"><i className="bi bi-bell" aria-hidden="true" />Tipo de alerta</div>
                    <p>{tipoAlerta(alertaSeleccionada)}</p>
                  </div>
                  <div className="alerta-detalle-campo">
                    <div className="alerta-detalle-etiqueta"><i className="bi bi-exclamation-triangle" aria-hidden="true" />Prioridad</div>
                    <p><span className={`alerta-detalle-chip alerta-detalle-chip--${clasePrioridadDetalle(prioridadAlerta(alertaSeleccionada))}`}>{prioridadAlerta(alertaSeleccionada) || "—"}</span></p>
                  </div>
                  <div className="alerta-detalle-campo">
                    <div className="alerta-detalle-etiqueta"><i className="bi bi-geo-alt" aria-hidden="true" />Zona o barrio</div>
                    <p>{zonaDelCaso({ alerta: alertaSeleccionada }, barrios)}</p>
                  </div>
                  <div className="alerta-detalle-campo">
                    <div className="alerta-detalle-etiqueta"><i className="bi bi-activity" aria-hidden="true" />Estado de la alerta</div>
                    <p><span className={`alerta-detalle-chip alerta-detalle-chip--${claseEstadoDetalle(alertaSeleccionada)}`}>{etiquetaEstadoDetalle(alertaSeleccionada)}</span></p>
                  </div>
                  <div className="alerta-detalle-campo">
                    <div className="alerta-detalle-etiqueta"><i className="bi bi-calendar3" aria-hidden="true" />Fecha y hora del reporte</div>
                    <p>{fechaLegible(fechaAlerta(alertaSeleccionada))}</p>
                  </div>
                  <div className="alerta-detalle-campo">
                    <div className="alerta-detalle-etiqueta"><i className="bi bi-truck" aria-hidden="true" />Unidad asignada</div>
                    <p>{unidadSeleccionada}</p>
                  </div>
                  <div className="alerta-detalle-campo alerta-detalle-campo--descripcion">
                    <div className="alerta-detalle-etiqueta"><i className="bi bi-card-text" aria-hidden="true" />Descripción</div>
                    <p>{alertaSeleccionada.descripcion || alertaSeleccionada.Descripcion || "Sin descripción registrada."}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer alerta-detalle-footer">
                <button type="button" className="btn alerta-detalle-btn-cerrar" onClick={cerrarModal}>Cerrar</button>
                <Link to="/Central-Policia/Asignaciones" className="btn alerta-detalle-btn-asignaciones">
                  Ir a asignaciones
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default Alertas;
