import SolicitudesApoyoCentral from "../../Components/Central-policia/SolicitudesApoyoCentral";
import { useFeedback } from "../../Components/Feedback/useFeedback";
import SelectUnidad from "../../Components/Central-policia/SelectUnidad";

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
  const { confirm, toast } = useFeedback();
  const [datos, setDatos] = useState(datosVacios);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [avisos, setAvisos] = useState([]);
  const [recarga, setRecarga] = useState(0);

  const [pestana, setPestana] = useState("pendientes");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const porPagina = 6;
  const [seleccion, setSeleccion] = useState(null);

  const [unidadElegida, setUnidadElegida] = useState("");
  const [observacion, setObservacion] = useState("");
  const [guardando, setGuardando] = useState(false);


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
      aviso.ruta.includes("/api/Alertas?") ||
      aviso.ruta === "/api/Asignaciones"
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

  const opcionesUnidad = useMemo(
    () => unidadesDisponibles.map((unidad) => {
      const id = campo(unidad, "idUnidad", "IdUnidad", "ID_UNIDAD");
      const nombre = campo(unidad, "nombre", "Nombre", "NOMBRE");
      return { valor: String(id), etiqueta: `${nombre} (#${id})` };
    }),
    [unidadesDisponibles]
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

  const totalPaginas = Math.max(1, Math.ceil(registros.length / porPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const registrosPagina = registros.slice(
    (paginaActual - 1) * porPagina,
    paginaActual * porPagina
  );

  const actual =
    registros.find(
      (r) => r.clave === seleccion
    ) || null;

  // ==========================================
  // ASIGNACIÓN MANUAL - CENTRAL DE POLICÍA
  // ==========================================

  async function asignarManual(e) {
    e.preventDefault();

    if (!actual?.alerta || actual.asignacion || guardando) return;

    const unidad = unidadesDisponibles.find(
      (item) => String(campo(item, "idUnidad", "IdUnidad", "ID_UNIDAD")) === unidadElegida
    );
    const nombreUnidad = campo(unidad, "nombre", "Nombre", "NOMBRE");

    if (!nombreUnidad) {
      toast.warning("Selecciona una unidad policial operativa.", "Falta seleccionar una unidad");
      return;
    }

    await confirm({
      title: "¿Asignar unidad policial?",
      description: `Confirma la asignación de ${String(nombreUnidad).trim()} a la alerta #${idAlerta(actual.alerta)}.`,
      confirmLabel: "Asignar unidad",
      failureMessage: "No se pudo registrar la asignación.",
      onConfirm: async () => {
        setGuardando(true);
        try {
          await consultarCentral("/api/Asignaciones/manual", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idAlerta: Number(idAlerta(actual.alerta)),
              nombreUnidad: String(nombreUnidad).trim(),
              observacion: observacion.trim() || null,
            }),
          });

          toast.success("La unidad policial se asignó correctamente.", "Asignación exitosa");
          setUnidadElegida("");
          setObservacion("");
          setSeleccion(null);
          setRecarga((n) => n + 1);
        } finally {
          setGuardando(false);
        }
      },
    });
  }
  function elegirCaso(clave) {
    setSeleccion(clave);
    setUnidadElegida("");
    setObservacion("");
  }

  function cambiarPestana(nueva) {
    setPestana(nueva);
    setPagina(1);
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

            <h1 className="page-title-dash">
              Gestión de asignaciones
            </h1>

            <p className="asig-description">
              Asigna manualmente unidades policiales
              operativas y realiza seguimiento a
              los casos.
            </p>
          </div>


        </header>

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
                <li key={i}>{aviso.mensaje}</li>
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
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(1);
                }}
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
                registrosPagina.map((item) => {
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
            {mostrarDatos && registros.length > 0 && (
              <nav className="asig-pagination" aria-label="Paginación de casos operativos">
                <span className="asig-pagination-summary">
                  Mostrando {(paginaActual - 1) * porPagina + 1}–{Math.min(paginaActual * porPagina, registros.length)} de {registros.length} registros
                </span>
                <div className="asig-pagination-controls">
                  <button type="button" aria-label="Página anterior" disabled={paginaActual === 1} onClick={() => setPagina(Math.max(1, paginaActual - 1))}>
                    <i className="bi bi-chevron-left" aria-hidden="true" /> Anterior
                  </button>
                  <div className="asig-pagination-pages">
                    {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => (
                      <button
                        key={numero}
                        type="button"
                        aria-label={`Página ${numero}`}
                        aria-current={paginaActual === numero ? "page" : undefined}
                        className={paginaActual === numero ? "is-current" : ""}
                        onClick={() => setPagina(numero)}
                      >
                        {numero}
                      </button>
                    ))}
                  </div>
                  <button type="button" aria-label="Página siguiente" disabled={paginaActual === totalPaginas} onClick={() => setPagina(Math.min(totalPaginas, paginaActual + 1))}>
                    Siguiente <i className="bi bi-chevron-right" aria-hidden="true" />
                  </button>
                </div>
              </nav>
            )}
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

                <div className="asig-detalle-grid asig-alert-info">
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

                  <div className="asig-dato asig-priority-value" data-prioridad={actual.alerta ? prioridadAlerta(actual.alerta).toLowerCase() : ""}>
                    <span>Prioridad</span>

                    <strong>
                      {actual.alerta
                        ? prioridadAlerta(
                            actual.alerta
                          ) || "—"
                        : "—"}
                    </strong>
                  </div>

                  <div className="asig-dato asig-state-value" data-estado={actual.alerta ? estadoAlerta(actual.alerta).toLowerCase() : ""}>
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
                    <span><i className="bi bi-geo-alt" aria-hidden="true" /> Ubicación</span>

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
                      className="asig-field-label"
                      style={{
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      <strong>
                        Unidad policial disponible
                      </strong>
                    </label>

                    <SelectUnidad
                      id="asig-unidad"
                      valor={unidadElegida}
                      opciones={opcionesUnidad}
                      onChange={setUnidadElegida}
                      deshabilitado={guardando}
                    />

                    {unidadesDisponibles.length === 0 && (
                      <div className="asig-no-unidades" role="status">
                        <i className="bi bi-info-circle" aria-hidden="true" />
                        <div>
                          <strong>Sin unidades disponibles</strong>
                          <span>Actualmente no hay unidades policiales operativas</span>
                        </div>
                      </div>
                    )}

                    <label
                      htmlFor="asig-observacion"
                      className="asig-field-label asig-observation-label"
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
        <div className="asig-support-section">
          <SolicitudesApoyoCentral mostrarActualizar={false} />
        </div>
      </div>
    </>
  );
}

export default Asignaciones;
