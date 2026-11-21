
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

} from "../../Services/OperacionesCentralService.js";

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
        setError(err.message || "Error al cargar asignaciones.");
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
        (a) => !asignacionFinalizada(a)
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
      datos.alertas.map((a) => [String(idAlerta(a)), a])
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
        asig ? campo(asig, "unidadNombre", "UnidadNombre") : "",
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
    registros.find((r) => r.clave === seleccion) || null;

  function actualizar() {
    setCargando(true);
    setError("");
    setAvisos([]);
    setSeleccion(null);
    setRecarga((n) => n + 1);
  }

  function cambiarPestana(nueva) {
    setPestana(nueva);
    setSeleccion(null);
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
            <div className="asig-eyebrow">
              CENTRAL DE POLICÍA / OPERACIONES
            </div>

            <h1 className="page-title-dash">
              Gestión de asignaciones
            </h1>

            <p className="asig-description">
              Consulta alertas pendientes y realiza seguimiento
              a las unidades asignadas.
            </p>
          </div>

          <button
            type="button"
            className="asig-btn asig-btn-outline"
            onClick={actualizar}
            disabled={cargando}
          >
            <i className="bi bi-arrow-clockwise" />
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </header>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {avisos.length > 0 && (
          <div className="alert alert-warning" role="alert">
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
          valores={mostrarDatos ? valores : {}}
        />

        <div className="asig-layout">
          <section className="asig-col-list card-panel-dash">
            <div className="asig-list-header">
              <h2>Casos operativos</h2>
              <span className="asig-list-subtitle">
                Selecciona una alerta
              </span>
            </div>

            <div className="asig-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={pestana === "pendientes"}
                className={`asig-tab ${
                  pestana === "pendientes" ? "active" : ""
                }`}
                onClick={() => cambiarPestana("pendientes")}
              >
                Pendientes
                <span className="asig-tab-count">
                  {mostrarDatos ? pendientes.length : "—"}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={pestana === "seguimiento"}
                className={`asig-tab ${
                  pestana === "seguimiento" ? "active" : ""
                }`}
                onClick={() => cambiarPestana("seguimiento")}
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
                onChange={(e) => setBusqueda(e.target.value)}
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
                  const asignacion = item.asignacion;
                  const id = alerta
                    ? idAlerta(alerta)
                    : idAlertaAsignacion(asignacion);
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
                      data-prioridad={prioridad.toLowerCase()}
                      onClick={() => setSeleccion(item.clave)}
                      aria-pressed={seleccion === item.clave}
                    >
                      <div className="asig-card-top">
                        <span className="asig-card-caso">
                          CASO #{id ?? "—"}
                        </span>

                        <span
                          className={`asig-prioridad asig-prioridad-${prioridad.toLowerCase() || "normal"}`}
                        >
                          {prioridad || "SIN PRIORIDAD"}
                        </span>
                      </div>

                      <div className="asig-card-tipo">
                        {alerta
                          ? etiqueta(tipoAlerta(alerta))
                          : "Alerta no disponible"}
                      </div>

                      <div className="asig-card-meta">
                        <span>
                          <i className="bi bi-geo-alt" />
                          {alerta
                            ? ubicacionAlerta(alerta)
                            : "Ubicación no disponible"}
                        </span>
                      </div>

                      <div className="asig-card-footer">
                        <span>
                          {asignacion
                            ? etiqueta(estadoAsignacion(asignacion))
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
                  su prioridad y el estado de la asignación.
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
                        ? idAlerta(actual.alerta)
                        : idAlertaAsignacion(actual.asignacion)}
                    </h2>

                    <p className="asig-description mb-0">
                      {actual.alerta
                        ? etiqueta(tipoAlerta(actual.alerta))
                        : "Información del caso"}
                    </p>
                  </div>

                  <span className="asig-estado-pill">
                    {actual.asignacion
                      ? etiqueta(estadoAsignacion(actual.asignacion))
                      : "PENDIENTE"}
                  </span>
                </div>

                <div className="asig-detalle-grid">
                  <div className="asig-dato">
                    <span>Tipo de alerta</span>
                    <strong>
                      {actual.alerta
                        ? etiqueta(tipoAlerta(actual.alerta))
                        : "—"}
                    </strong>
                  </div>

                  <div className="asig-dato">
                    <span>Prioridad</span>
                    <strong>
                      {actual.alerta
                        ? prioridadAlerta(actual.alerta) || "—"
                        : "—"}
                    </strong>
                  </div>

                  <div className="asig-dato">
                    <span>Estado de la alerta</span>
                    <strong>
                      {actual.alerta
                        ? etiqueta(estadoAlerta(actual.alerta))
                        : "—"}
                    </strong>
                  </div>

                  <div className="asig-dato">
                    <span>Fecha del reporte</span>
                    <strong>
                      {actual.alerta
                        ? fechaLegible(fechaAlerta(actual.alerta))
                        : "—"}
                    </strong>
                  </div>

                  <div className="asig-dato asig-dato-full">
                    <span>Ubicación</span>
                    <strong>
                      {actual.alerta
                        ? ubicacionAlerta(actual.alerta)
                        : "No disponible"}
                    </strong>
                  </div>
                </div>

                {actual.asignacion ? (
                  <div className="asig-asignacion-info">
                    <h3>
                      <i className="bi bi-shield-check" />
                      Unidad asignada
                    </h3>

                    <div className="asig-detalle-grid">
                      <div className="asig-dato">
                        <span>Número de asignación</span>
                        <strong>
                          #{idAsignacion(actual.asignacion)}
                        </strong>
                      </div>

                      <div className="asig-dato">
                        <span>Unidad policial</span>
                        <strong>
                          {campo(
                            actual.asignacion,
                            "unidadNombre",
                            "UnidadNombre"
                          ) ||
                            `#${idUnidadAsignacion(actual.asignacion) ?? "—"}`}
                        </strong>
                      </div>

                      <div className="asig-dato">
                        <span>Participación</span>
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
                        <span>Estado de asignación</span>
                        <strong>
                          {etiqueta(
                            estadoAsignacion(actual.asignacion)
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
                        <span>Observaciones</span>
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
                  <div className="asig-aviso">
                    <i className="bi bi-info-circle" />
                    <div>
                      <strong>Alerta pendiente</strong>
                      <p>
                        Esta alerta no tiene una asignación
                        activa registrada. El despacho manual
                        estará disponible cuando se conecte
                        su endpoint autorizado.
                      </p>
                    </div>
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
