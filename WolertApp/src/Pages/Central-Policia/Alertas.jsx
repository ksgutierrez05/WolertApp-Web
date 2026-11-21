
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
} from "../../Services/OperacionesCentralService.js";

import "../../css/Policia/central-policia/css/alertas.css";

const datosVacios = () => ({
  alertas: [],
  asignaciones: [],
  atenciones: [],
  unidades: [],
});

function Alertas() {
  const [datos, setDatos] = useState(datosVacios);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [avisos, setAvisos] = useState([]);

  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);

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
        setError(
          err.message || "No se pudieron cargar las alertas."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, [recarga]);

  const valores = useMemo(
    () => resumenOperativo(datos).alertas,
    [datos]
  );

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
            new Date(fechaAlerta(b) || 0) -
            new Date(fechaAlerta(a) || 0)
        ),
    [datos.alertas, filtro, busqueda]
  );

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
          <h1 className="page-title-dash">
            Alertas entrantes
          </h1>

          <p className="info-sub-dash mb-0">
            Consulta y filtra las alertas recibidas
            desde los ciudadanos.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-success btn-sm"
          disabled={cargando}
          onClick={actualizar}
        >
          <i className="bi bi-arrow-clockwise me-1" />
          {cargando ? "Actualizando..." : "Actualizar"}
        </button>
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

      <Kpis
        grupo="alertas"
        valores={cargando || error ? {} : valores}
      />

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
                filtro === clave
                  ? "btn-success"
                  : "btn-outline-secondary"
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
                filtradas.map((a, i) => (
                  <tr key={idAlerta(a) ?? i}>
                    <td className="fw-semibold">
                      #{idAlerta(a)}
                    </td>

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

                    <td>
                      {fechaLegible(fechaAlerta(a))}
                    </td>

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

                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        onClick={() => setAlertaSeleccionada(a)}
                      >
                        <i className="bi bi-eye me-1" />
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {alertaSeleccionada && (
        <div
          className="modal d-block"
          role="dialog"
          aria-modal="true"
          aria-label="Detalle de alerta"
          style={{
            background: "rgba(0, 0, 0, 0.55)",
            overflowY: "auto",
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              cerrarModal();
            }
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">
                    Alerta #{idAlerta(alertaSeleccionada)}
                  </h5>
                  <small className="text-muted">
                    Información del reporte ciudadano
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={cerrarModal}
                />
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <small className="text-muted">
                      Tipo de alerta
                    </small>
                    <p className="fw-semibold mb-0">
                      {tipoAlerta(alertaSeleccionada)}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">
                      Prioridad
                    </small>
                    <p className="fw-semibold mb-0">
                      {prioridadAlerta(alertaSeleccionada) || "—"}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">
                      Ubicación
                    </small>
                    <p className="fw-semibold mb-0">
                      {ubicacionAlerta(alertaSeleccionada)}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">
                      Estado
                    </small>
                    <p className="fw-semibold mb-0">
                      {estadoAlerta(alertaSeleccionada)
                        .replaceAll("_", " ") || "—"}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <small className="text-muted">
                      Fecha del reporte
                    </small>
                    <p className="fw-semibold mb-0">
                      {fechaLegible(fechaAlerta(alertaSeleccionada))}
                    </p>
                  </div>

                  <div className="col-12">
                    <small className="text-muted">
                      Descripción
                    </small>
                    <p className="mb-0">
                      {alertaSeleccionada.descripcion ||
                        alertaSeleccionada.Descripcion ||
                        "Sin descripción registrada."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={cerrarModal}
                >
                  Cerrar
                </button>

                <Link
                  to="/Central-Policia/Asignaciones"
                  className="btn btn-success"
                >
                  <i className="bi bi-truck me-2" />
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
