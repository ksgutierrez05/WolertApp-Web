
import { useEffect, useMemo, useState } from "react";

import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";

import {
  cargarOperaciones,
  resumenOperativo,
  campo,
  idAlerta,
  idAsignacion,
  tipoAlerta,
  prioridadAlerta,
  ubicacionAlerta,
  fechaAlerta,
  fechaLegible,
  estadoAlerta,
  esResuelta,
  esFinalizadaAsignacion,
} from "../../Services/OperacionesCentralService.js";

import "../../css/Policia/central-policia/css/asignaciones.css";

function Asignaciones() {
  const [datos, setDatos] = useState({
    alertas: [],
    asignaciones: [],
    atenciones: [],
    unidades: [],
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [avisos, setAvisos] = useState([]);
  const [recarga, setRecarga] = useState(0);

  const [pestanaActiva, setPestanaActiva] =
    useState("pendientes");

  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    cargarOperaciones(controller.signal)
      .then(({ datos: resultado, errores }) => {
        if (!controller.signal.aborted) {
          setDatos(resultado);
          setAvisos(errores);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setError(e.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, [recarga]);

  const asignacionesActivas = useMemo(
    () =>
      datos.asignaciones.filter(
        (a) => !esFinalizadaAsignacion(a)
      ),
    [datos.asignaciones]
  );

  const asignadas = useMemo(
    () =>
      new Set(
        asignacionesActivas.map((a) =>
          String(
            campo(a, "idAlerta", "IdAlerta")
          )
        )
      ),
    [asignacionesActivas]
  );

  const pendientes = useMemo(
    () =>
      datos.alertas.filter(
        (a) =>
          !esResuelta(a) &&
          !asignadas.has(String(idAlerta(a)))
      ),
    [datos.alertas, asignadas]
  );

  const valores = useMemo(
    () => resumenOperativo(datos).asignaciones,
    [datos]
  );

  const lista = (
    pestanaActiva === "pendientes"
      ? pendientes.map((a) => ({
          clave: `a-${idAlerta(a)}`,
          alerta: a,
          asignacion: null,
        }))
      : asignacionesActivas.map((a) => ({
          clave: `s-${idAsignacion(a)}`,
          asignacion: a,
          alerta: datos.alertas.find(
            (al) =>
              String(idAlerta(al)) ===
              String(
                campo(a, "idAlerta", "IdAlerta")
              )
          ),
        }))
  ).filter((item) =>
    [
      item.clave,
      tipoAlerta(item.alerta),
      ubicacionAlerta(item.alerta),
      campo(
        item.asignacion,
        "idUnidad",
        "IdUnidad"
      ),
    ]
      .join(" ")
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const actual = lista.find(
    (item) => item.clave === seleccion
  );

  function actualizar() {
    setCargando(true);
    setError("");
    setRecarga((n) => n + 1);
  }

  return (
    <>
      <Topbar
        placeholder="Buscar caso, patrullero o zona..."
        iniciales="CR"
      />

      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <div>
            <h1 className="page-title-dash">
              Asignaciones
            </h1>

            <p
              className="text-muted mb-0"
              style={{ fontSize: "13.5px" }}
            >
              Consulta las alertas por asignar y
              las asignaciones en seguimiento.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-success btn-sm"
            onClick={actualizar}
            disabled={cargando}
          >
            Actualizar
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {avisos.length > 0 && (
          <div className="alert alert-warning">
            Consultas parciales: {avisos.join(" | ")}
          </div>
        )}

        <Kpis
          grupo="asignaciones"
          valores={cargando ? {} : valores}
        />

        <div className="asig-layout">
          <section className="asig-col-list card-panel-dash">
            <div
              className="asig-tabs"
              role="tablist"
            >
              <button
                type="button"
                className={`asig-tab ${
                  pestanaActiva === "pendientes"
                    ? "active"
                    : ""
                }`}
                role="tab"
                aria-selected={
                  pestanaActiva === "pendientes"
                }
                onClick={() => {
                  setPestanaActiva("pendientes");
                  setSeleccion(null);
                }}
              >
                Por asignar

                <span className="asig-tab-count">
                  {cargando
                    ? "—"
                    : pendientes.length}
                </span>
              </button>

              <button
                type="button"
                className={`asig-tab ${
                  pestanaActiva === "seguimiento"
                    ? "active"
                    : ""
                }`}
                role="tab"
                aria-selected={
                  pestanaActiva === "seguimiento"
                }
                onClick={() => {
                  setPestanaActiva("seguimiento");
                  setSeleccion(null);
                }}
              >
                En seguimiento

                <span className="asig-tab-count">
                  {cargando
                    ? "—"
                    : asignacionesActivas.length}
                </span>
              </button>
            </div>

            <div className="asig-search">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-funnel" />
                </span>

                <input
                  type="text"
                  className="form-control"
                  value={busqueda}
                  onChange={(e) =>
                    setBusqueda(e.target.value)
                  }
                  placeholder="Filtrar por caso, tipo o zona..."
                  aria-label="Filtrar asignaciones"
                />
              </div>
            </div>

            <div className="asig-lista">
              {cargando ? (
                <div className="estado-vacio-dash">
                  Cargando...
                </div>
              ) : lista.length === 0 ? (
                <div className="estado-vacio-dash">
                  <i className="bi bi-inbox" />

                  <p className="mb-0">
                    No hay registros para mostrar.
                  </p>
                </div>
              ) : (
                lista.map((item) => (
                  <button
                    key={item.clave}
                    type="button"
                    onClick={() =>
                      setSeleccion(item.clave)
                    }
                    className={`w-100 text-start border-0 border-bottom bg-white p-3 ${
                      seleccion === item.clave
                        ? "border-start border-success border-4"
                        : ""
                    }`}
                  >
                    <strong>
                      #
                      {item.alerta
                        ? idAlerta(item.alerta)
                        : campo(
                            item.asignacion,
                            "idAlerta",
                            "IdAlerta"
                          )}
                    </strong>

                    {" · "}

                    {item.alerta
                      ? tipoAlerta(item.alerta)
                      : "Alerta no disponible"}

                    <div className="small text-muted">
                      {item.alerta
                        ? ubicacionAlerta(item.alerta)
                        : "Ubicación no disponible"}
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          <section
            className="asig-col-detalle card-panel-dash p-4"
            aria-live="polite"
          >
            {!actual ? (
              <div className="estado-vacio-dash">
                <i className="bi bi-broadcast-pin" />

                <p className="mb-0">
                  Selecciona un registro para
                  ver su detalle.
                </p>
              </div>
            ) : (
              <>
                <h2 className="section-title-dash">
                  Detalle del caso
                </h2>

                <dl className="row mt-3">
                  <dt className="col-5">
                    Alerta
                  </dt>

                  <dd className="col-7">
                    #
                    {actual.alerta
                      ? idAlerta(actual.alerta)
                      : campo(
                          actual.asignacion,
                          "idAlerta",
                          "IdAlerta"
                        )}
                  </dd>

                  <dt className="col-5">
                    Tipo
                  </dt>

                  <dd className="col-7">
                    {actual.alerta
                      ? tipoAlerta(actual.alerta)
                      : "—"}
                  </dd>

                  <dt className="col-5">
                    Ubicación
                  </dt>

                  <dd className="col-7">
                    {actual.alerta
                      ? ubicacionAlerta(actual.alerta)
                      : "—"}
                  </dd>

                  <dt className="col-5">
                    Prioridad
                  </dt>

                  <dd className="col-7">
                    {actual.alerta
                      ? prioridadAlerta(
                          actual.alerta
                        ) || "—"
                      : "—"}
                  </dd>

                  <dt className="col-5">
                    Estado
                  </dt>

                  <dd className="col-7">
                    {actual.alerta
                      ? estadoAlerta(
                          actual.alerta
                        ) || "—"
                      : "—"}
                  </dd>

                  <dt className="col-5">
                    Fecha
                  </dt>

                  <dd className="col-7">
                    {actual.alerta
                      ? fechaLegible(
                          fechaAlerta(
                            actual.alerta
                          )
                        )
                      : "—"}
                  </dd>

                  {actual.asignacion && (
                    <>
                      <dt className="col-5">
                        Asignación
                      </dt>

                      <dd className="col-7">
                        #
                        {idAsignacion(
                          actual.asignacion
                        )}
                      </dd>

                      <dt className="col-5">
                        Unidad
                      </dt>

                      <dd className="col-7">
                        #
                        {campo(
                          actual.asignacion,
                          "idUnidad",
                          "IdUnidad"
                        ) || "—"}
                      </dd>
                    </>
                  )}
                </dl>

                {!actual.asignacion && (
                  <div className="alert alert-info small">
                    El despacho queda pendiente
                    de confirmar el endpoint y
                    los campos requeridos para
                    crear asignaciones.
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default Asignaciones;
