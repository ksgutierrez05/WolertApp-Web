
import { useEffect, useMemo, useState } from "react";
import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";

import {
  cargarOperaciones,
  resumenOperativo,
  campo,
  texto,
  idAlerta,
  idAsignacion,
  tipoAlerta,
  prioridadAlerta,
  ubicacionAlerta,
  fechaAlerta,
  fechaLegible,
  estadoAlerta,
  esPendiente,
  esUnidadDisponible,
} from "../../Services/OperacionesCentralService.js";

import { consultarCentral } from "../../Services/centralPoliciaApi.js";

import "../../css/Policia/central-policia/css/asignaciones.css";

const datosVacios = () => ({
  alertas: [],
  asignaciones: [],
  atenciones: [],
  unidades: [],
});

const estadoAsignacion = (a) =>
  texto(
    campo(
      a,
      "estadoAsignacion",
      "EstadoAsignacion",
      "estado",
      "Estado"
    )
  );

const asignacionFinalizada = (a) =>
  ["FINALIZADA", "FINALIZADO", "CANCELADA"].includes(
    estadoAsignacion(a)
  );

const idAlertaAsignacion = (a) =>
  campo(a, "idAlerta", "IdAlerta");

const idUnidadAsignacion = (a) =>
  campo(a, "idUnidad", "IdUnidad");

const etiqueta = (valor) =>
  String(valor || "No disponible").replaceAll("_", " ");

function Asignaciones() {
  const [datos, setDatos] = useState(datosVacios);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [avisos, setAvisos] = useState([]);
  const [recarga, setRecarga] = useState(0);

  const [pestana, setPestana] = useState("pendientes");
  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState(null);

  const [unidadElegida, setUnidadElegida] = useState("");
  const [observacion, setObservacion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [errorAsignacion, setErrorAsignacion] = useState("");

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
          err.message || "Error al cargar asignaciones."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, [recarga]);

  const erroresCriticos = avisos.some(
    (aviso) =>
      aviso.includes("/api/Alertas?") ||
      aviso.includes("/api/Asignaciones:")
  );

  const asignacionesActivas = useMemo(
    () =>
      datos.asignaciones.filter(
        (a) =>
          !asignacionFinalizada(a) &&
          idUnidadAsignacion(a) != null
      ),
    [datos.asignaciones]
  );

  const idsAsignados = useMemo(
    () =>
      new Set(
        asignacionesActivas
          .map(idAlertaAsignacion)
          .filter((id) => id != null)
          .map(String)
      ),
    [asignacionesActivas]
  );

  const unidadesDisponibles = useMemo(
    () =>
      datos.unidades.filter(
        (u) =>
          esUnidadDisponible(u) &&
          campo(
            u,
            "idUnidad",
            "IdUnidad",
            "ID_UNIDAD"
          ) != null &&
          campo(u, "nombre", "Nombre", "NOMBRE")
      ),
    [datos.unidades]
  );

  const pendientes = useMemo(
    () =>
      datos.alertas.filter(
        (a) =>
          esPendiente(a) &&
          !idsAsignados.has(String(idAlerta(a)))
      ),
    [datos.alertas, idsAsignados]
  );

  const valores = useMemo(
    () => resumenOperativo(datos).asignaciones,
    [datos]
  );

  const registros = useMemo(() => {
    const alertasPorId = new Map(
      datos.alertas.map((a) => [
        String(idAlerta(a)),
        a,
      ])
    );

    const base =
      pestana === "pendientes"
        ? pendientes.map((a) => ({
            clave: `alerta-${idAlerta(a)}`,
            alerta: a,
            asignacion: null,
          }))
        : asignacionesActivas.map((a) => ({
            clave: `asignacion-${idAsignacion(a)}`,
            alerta: alertasPorId.get(
              String(idAlertaAsignacion(a))
            ),
            asignacion: a,
          }));

    const termino = busqueda.trim().toLowerCase();

    return base.filter((item) => {
      const a = item.alerta;
      const asig = item.asignacion;

      return [
        a ? idAlerta(a) : idAlertaAsignacion(asig),
        a ? tipoAlerta(a) : "",
        a ? ubicacionAlerta(a) : "",
        a ? prioridadAlerta(a) : "",
        asig ? idUnidadAsignacion(asig) : "",
        asig
          ? campo(
              asig,
              "unidadNombre",
              "UnidadNombre"
            )
          : "",
        asig ? estadoAsignacion(asig) : "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(termino);
    });
  }, [
    datos.alertas,
    pendientes,
    asignacionesActivas,
    pestana,
    busqueda,
  ]);

  const actual =
    registros.find(
      (r) => r.clave === seleccion
    ) || null;

  // ==========================================
  // ASIGNACIÓN MANUAL - CENTRAL DE POLICÍA
  // ==========================================

  async function asignarManual(e) {
    e.preventDefault();

    if (
      !actual?.alerta ||
      actual.asignacion ||
      guardando
    ) {
      return;
    }

    const unidad = unidadesDisponibles.find(
      (u) =>
        String(
          campo(
            u,
            "idUnidad",
            "IdUnidad",
            "ID_UNIDAD"
          )
        ) === unidadElegida
    );

    const nombreUnidad = campo(
      unidad,
      "nombre",
      "Nombre",
      "NOMBRE"
    );

    if (!nombreUnidad) {
      setErrorAsignacion(
        "Selecciona una unidad policial operativa."
      );
      return;
    }

    setGuardando(true);
    setErrorAsignacion("");
    setMensaje("");

    try {
      // Ruta real del controlador ASP.NET Core
      await consultarCentral(
        "/api/Asignaciones/manual",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idAlerta: Number(
              idAlerta(actual.alerta)
            ),
            nombreUnidad: String(
              nombreUnidad
            ).trim(),
            observacion:
              observacion.trim() || null,
          }),
        }
      );

      setMensaje(
        "Unidad policial asignada correctamente."
      );

      setUnidadElegida("");
      setObservacion("");
      setSeleccion(null);

      // Recargar alertas, asignaciones y unidades
      setRecarga((n) => n + 1);
    } catch (err) {
      setErrorAsignacion(
        err.message ||
          "No se pudo registrar la asignación."
      );
    } finally {
      setGuardando(false);
    }
  }

  function actualizar() {
    setCargando(true);
    setError("");
    setAvisos([]);
    setSeleccion(null);
    setRecarga((n) => n + 1);
  }

  function elegirCaso(clave) {
    setSeleccion(clave);
    setUnidadElegida("");
    setObservacion("");
    setErrorAsignacion("");
    setMensaje("");
  }

  function cambiarPestana(nueva) {
    setPestana(nueva);
    setSeleccion(null);
    setErrorAsignacion("");
  }

  const mostrarDatos =
    !cargando && !error && !erroresCriticos;

  return (
    <>
      <Topbar
        placeholder="Buscar casos o unidades..."
        iniciales="CR"
      />

      <div className="asig-page">
        <header className="asig-page-header">
          <div>

            <h1 className="page-title-dash">
              Gestión de asignaciones
            </h1>

            <p className="asig-description">
              Asigna manualmente unidades policiales
              operativas y realiza seguimiento a
              los casos.
            </p>
          </div>

          <button
            type="button"
            className="asig-btn asig-btn-outline"
            onClick={actualizar}
            disabled={cargando}
          >
            <i className="bi bi-arrow-clockwise" />
            {cargando
              ? "Actualizando..."
              : "Actualizar"}
          </button>
        </header>

        {mensaje && (
          <div
            className="alert alert-success"
            role="status"
          >
            {mensaje}
          </div>
        )}

        {error && (
          <div
            className="alert alert-danger"
            role="alert"
          >
            {error}
          </div>
        )}

        {avisos.length > 0 && (
          <div
            className="alert alert-warning"
            role="alert"
          >
            <strong>Información parcial</strong>

            <ul className="mb-0 mt-2">
              {avisos.map((aviso, i) => (
                <li key={i}>{aviso}</li>
              ))}
            </ul>
          </div>
        )}

        <Kpis
          grupo="asignaciones"
          valores={
            mostrarDatos ? valores : {}
          }
        />

        <div className="asig-layout">
          {/* LISTADO DE CASOS */}
          <section className="asig-col-list card-panel-dash">
            <div className="asig-list-header">
              <h2>Casos operativos</h2>

              <span className="asig-list-subtitle">
                Selecciona una alerta
              </span>
            </div>

            <div
              className="asig-tabs"
              role="tablist"
            >
              <button
                type="button"
                role="tab"
                aria-selected={
                  pestana === "pendientes"
                }
                className={`asig-tab ${
                  pestana === "pendientes"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  cambiarPestana("pendientes")
                }
              >
                Pendientes

                <span className="asig-tab-count">
                  {mostrarDatos
                    ? pendientes.length
                    : "—"}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={
                  pestana === "seguimiento"
                }
                className={`asig-tab ${
                  pestana === "seguimiento"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  cambiarPestana("seguimiento")
                }
              >
                Seguimiento

                <span className="asig-tab-count">
                  {mostrarDatos
                    ? asignacionesActivas.length
                    : "—"}
                </span>
              </button>
            </div>

            <div className="asig-search">
              <i className="bi bi-search" />

              <input
                type="search"
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
                placeholder="Buscar caso, tipo o unidad..."
                aria-label="Filtrar asignaciones"
              />
            </div>

            <div className="asig-lista">
              {!mostrarDatos ? (
                <div className="asig-empty">
                  <i className="bi bi-arrow-repeat" />

                  {cargando
                    ? "Cargando registros..."
                    : "No se pueden mostrar los registros."}
                </div>
              ) : registros.length === 0 ? (
                <div className="asig-empty">
                  <i className="bi bi-inbox" />
                  No hay registros para mostrar.
                </div>
              ) : (
                registros.map((item) => {
                  const alerta = item.alerta;
                  const asignacion =
                    item.asignacion;

                  const id = alerta
                    ? idAlerta(alerta)
                    : idAlertaAsignacion(
                        asignacion
                      );

                  const prioridad = alerta
                    ? prioridadAlerta(alerta)
                    : "";

                  return (
                    <button
                      key={item.clave}
                      type="button"
                      className={`asig-card ${
                        seleccion === item.clave
                          ? "selected"
                          : ""
                      }`}
                      data-prioridad={String(
                        prioridad || ""
                      ).toLowerCase()}
                      onClick={() =>
                        elegirCaso(item.clave)
                      }
                      aria-pressed={
                        seleccion === item.clave
                      }
                    >
                      <div className="asig-card-top">
                        <span className="asig-card-caso">
                          CASO #{id ?? "—"}
                        </span>

                        <span
                          className={`asig-prioridad asig-prioridad-${
                            String(
                              prioridad || "normal"
                            ).toLowerCase()
                          }`}
                        >
                          {prioridad ||
                            "SIN PRIORIDAD"}
                        </span>
                      </div>

                      <div className="asig-card-tipo">
                        {alerta
                          ? etiqueta(
                              tipoAlerta(alerta)
                            )
                          : "Alerta no disponible"}
                      </div>

                      <div className="asig-card-meta">
                        <span>
                          <i className="bi bi-geo-alt" />

                          {alerta
                            ? ubicacionAlerta(
                                alerta
                              )
                            : "Ubicación no disponible"}
                        </span>
                      </div>

                      <div className="asig-card-footer">
                        <span>
                          {asignacion
                            ? etiqueta(
                                estadoAsignacion(
                                  asignacion
                                )
                              )
                            : "Pendiente de asignación"}
                        </span>

                        <i className="bi bi-chevron-right" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* DETALLE DE LA ALERTA */}
          <section
            className="asig-col-detalle card-panel-dash"
            aria-live="polite"
          >
            {!actual ? (
              <div className="asig-detalle-empty">
                <div className="asig-empty-icon">
                  <i className="bi bi-clipboard2-check" />
                </div>

                <h2>Selecciona un caso</h2>

                <p>
                  Consulta los datos de la alerta,
                  su prioridad y el estado de la
                  asignación.
                </p>
              </div>
            ) : (
              <>
                <div className="asig-detalle-header">
                  <div>
                    <div className="asig-eyebrow">
                      DETALLE OPERATIVO
                    </div>

                    <h2 className="asig-detalle-titulo">
                      Alerta #
                      {actual.alerta
                        ? idAlerta(
                            actual.alerta
                          )
                        : idAlertaAsignacion(
                            actual.asignacion
                          )}
                    </h2>

                    <p className="asig-description mb-0">
                      {actual.alerta
                        ? etiqueta(
                            tipoAlerta(
                              actual.alerta
                            )
                          )
                        : "Información del caso"}
                    </p>
                  </div>

                  <span className="asig-estado-pill">
                    {actual.asignacion
                      ? etiqueta(
                          estadoAsignacion(
                            actual.asignacion
                          )
                        )
                      : "PENDIENTE"}
                  </span>
                </div>

                <div className="asig-detalle-grid">
                  <div className="asig-dato">
                    <span>Tipo de alerta</span>

                    <strong>
                      {actual.alerta
                        ? etiqueta(
                            tipoAlerta(
                              actual.alerta
                            )
                          )
                        : "—"}
                    </strong>
                  </div>

                  <div className="asig-dato">
                    <span>Prioridad</span>

                    <strong>
                      {actual.alerta
                        ? prioridadAlerta(
                            actual.alerta
                          ) || "—"
                        : "—"}
                    </strong>
                  </div>

                  <div className="asig-dato">
                    <span>
                      Estado de la alerta
                    </span>

                    <strong>
                      {actual.alerta
                        ? etiqueta(
                            estadoAlerta(
                              actual.alerta
                            )
                          )
                        : "—"}
                    </strong>
                  </div>

                  <div className="asig-dato">
                    <span>
                      Fecha del reporte
                    </span>

                    <strong>
                      {actual.alerta
                        ? fechaLegible(
                            fechaAlerta(
                              actual.alerta
                            )
                          )
                        : "—"}
                    </strong>
                  </div>

                  <div className="asig-dato asig-dato-full">
                    <span>Ubicación</span>

                    <strong>
                      {actual.alerta
                        ? ubicacionAlerta(
                            actual.alerta
                          )
                        : "No disponible"}
                    </strong>
                  </div>
                </div>

                {/* ASIGNACIÓN EXISTENTE */}
                {actual.asignacion ? (
                  <div className="asig-asignacion-info">
                    <h3>
                      <i className="bi bi-shield-check" />
                      Unidad asignada
                    </h3>

                    <div className="asig-detalle-grid">
                      <div className="asig-dato">
                        <span>
                          Número de asignación
                        </span>

                        <strong>
                          #
                          {idAsignacion(
                            actual.asignacion
                          )}
                        </strong>
                      </div>

                      <div className="asig-dato">
                        <span>
                          Unidad policial
                        </span>

                        <strong>
                          {campo(
                            actual.asignacion,
                            "unidadNombre",
                            "UnidadNombre"
                          ) ||
                            `#${
                              idUnidadAsignacion(
                                actual.asignacion
                              ) ?? "—"
                            }`}
                        </strong>
                      </div>

                      <div className="asig-dato">
                        <span>
                          Participación
                        </span>

                        <strong>
                          {etiqueta(
                            campo(
                              actual.asignacion,
                              "tipoParticipacion",
                              "TipoParticipacion"
                            )
                          )}
                        </strong>
                      </div>

                      <div className="asig-dato">
                        <span>
                          Estado de asignación
                        </span>

                        <strong>
                          {etiqueta(
                            estadoAsignacion(
                              actual.asignacion
                            )
                          )}
                        </strong>
                      </div>
                    </div>

                    {campo(
                      actual.asignacion,
                      "observacion",
                      "Observacion"
                    ) && (
                      <div className="asig-observacion">
                        <span>
                          Observaciones
                        </span>

                        <p>
                          {campo(
                            actual.asignacion,
                            "observacion",
                            "Observacion"
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* FORMULARIO MANUAL */
                  <form
                    className="asig-asignacion-info"
                    onSubmit={asignarManual}
                  >
                    <h3>
                      <i className="bi bi-shield-check" />
                      Asignación manual
                    </h3>

                    <p>
                      Selecciona una unidad policial
                      en estado OPERATIVA.
                    </p>

                    <label
                      htmlFor="asig-unidad"
                      style={{
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      <strong>
                        Unidad policial disponible
                      </strong>
                    </label>

                    <select
                      id="asig-unidad"
                      className="form-select"
                      value={unidadElegida}
                      onChange={(e) =>
                        setUnidadElegida(
                          e.target.value
                        )
                      }
                      required
                      disabled={
                        guardando ||
                        unidadesDisponibles.length === 0
                      }
                    >
                      <option value="">
                        Selecciona una unidad
                      </option>

                      {unidadesDisponibles.map(
                        (u) => {
                          const id = campo(
                            u,
                            "idUnidad",
                            "IdUnidad",
                            "ID_UNIDAD"
                          );

                          const nombre = campo(
                            u,
                            "nombre",
                            "Nombre",
                            "NOMBRE"
                          );

                          return (
                            <option
                              key={id}
                              value={String(id)}
                            >
                              {nombre} (#{id})
                            </option>
                          );
                        }
                      )}
                    </select>

                    {unidadesDisponibles.length ===
                      0 && (
                      <p className="text-warning mt-2">
                        No hay unidades policiales
                        OPERATIVA disponibles.
                      </p>
                    )}

                    <label
                      htmlFor="asig-observacion"
                      style={{
                        display: "block",
                        marginTop: 16,
                        marginBottom: 6,
                      }}
                    >
                      <strong>
                        Observación (opcional)
                      </strong>
                    </label>

                    <textarea
                      id="asig-observacion"
                      className="form-control"
                      rows={3}
                      maxLength={180}
                      value={observacion}
                      onChange={(e) =>
                        setObservacion(
                          e.target.value
                        )
                      }
                      disabled={guardando}
                      placeholder="Indicaciones para la unidad..."
                    />

                    {errorAsignacion && (
                      <div
                        className="alert alert-danger mt-3"
                        role="alert"
                      >
                        {errorAsignacion}
                      </div>
                    )}

                    <button
                      className="asig-btn mt-3"
                      type="submit"
                      disabled={
                        guardando ||
                        !unidadElegida ||
                        unidadesDisponibles.length === 0
                      }
                    >
                      {guardando
                        ? "Asignando..."
                        : "Asignar unidad policial"}
                    </button>
                  </form>
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
