
import { useEffect, useMemo, useState } from "react";
import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";
import { useFeedback } from "../../Components/Feedback/useFeedback";

import {
  cargarAtencionesCentral,
  obtenerCampo,
  normalizar,
  formatearFecha,
  idDeAlerta,
  idDeUnidad,
  idDeAtencion,
  idDeAsignacion,
  nombreUnidad,
  tipoDeAlerta,
  ubicacionDeAlerta,
  crearAtencionCentral,
  actualizarAtencionCentral,
  cerrarAlertaCentral,
} from "../../Services/atencionUnidadesCentralService";

import "../../css/Policia/central-policia/css/atencion-alertas.css";

const campo = (obj, ...keys) => obtenerCampo(obj, ...keys);

const estadoInforme = (a) =>
  normalizar(
    campo(a, "estadoFinal", "EstadoFinal", "estado", "Estado")
  );

const estadoAsignacion = (a) =>
  normalizar(
    campo(a, "estadoAsignacion", "EstadoAsignacion")
  );

const estadoAlerta = (a) =>
  normalizar(campo(a, "estado", "Estado"));

const claseEstado = (valor) => {
  const estado = normalizar(valor);
  if (["FINALIZADA", "RESUELTA", "CANCELADA"].includes(estado)) return "finalizada";
  if (!estado || ["PENDIENTE", "SIN INFORME"].includes(estado)) return "por-revisar";
  return "en-revision";
};

const idAlertaAtencion = (a) =>
  campo(a, "idAlerta", "IdAlerta");

const idAlertaAsignacion = (a) =>
  campo(a, "idAlerta", "IdAlerta");

const iguales = (a, b) =>
  a != null && b != null && String(a) === String(b);

const nuevaForma = () => ({
  descripcion: "",
  observacion: "",
  idTipoArma: "",
  idMedioTransporte: "",
});

export default function AtencionAlertas() {
  const { confirm, toast } = useFeedback();
  const [datos, setDatos] = useState({
    atenciones: [],
    alertas: [],
    asignaciones: [],
    unidades: [],
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [filtro, setFiltro] = useState("enRevision");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const registrosPorPagina = 6;
  const [seleccion, setSeleccion] = useState(null);
  const [formulario, setFormulario] = useState(nuevaForma);

  useEffect(() => {
    const controller = new AbortController();

    setCargando(true);

    cargarAtencionesCentral(controller.signal)
      .then((resultado) => {
        if (!controller.signal.aborted) {
          setDatos(resultado);
          setError("");
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.userMessage || "No se pudieron cargar los informes.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, [recarga]);

  // Unir alertas, asignaciones e informes
  const casos = useMemo(() => {
    const lista = [];
    const claves = new Set();

    const alertasPorId = new Map(
      datos.alertas.map((a) => [
        String(idDeAlerta(a)),
        a,
      ])
    );

    const unidadesPorId = new Map(
      datos.unidades.map((u) => [
        String(idDeUnidad(u)),
        u,
      ])
    );

    const asignacionesPorAlerta = new Map();

    for (const a of datos.asignaciones) {
      const id = String(idAlertaAsignacion(a));

      if (!asignacionesPorAlerta.has(id)) {
        asignacionesPorAlerta.set(id, []);
      }

      asignacionesPorAlerta.get(id).push(a);
    }

    const agregar = (id, asignacion) => {
      const clave =
        `${id}:${idDeAsignacion(asignacion) ?? "sin-asignacion"}`;

      if (claves.has(clave)) return;

      claves.add(clave);

      const asignaciones =
        asignacionesPorAlerta.get(String(id)) || [];

      const atencion =
        datos.atenciones.find((at) =>
          iguales(idAlertaAtencion(at), id) &&
          (
            iguales(
              campo(at, "idAsignacion", "IdAsignacion"),
              idDeAsignacion(asignacion)
            ) ||
            (
              campo(at, "idAsignacion", "IdAsignacion") == null &&
              iguales(
                campo(at, "idUnidad", "IdUnidad"),
                campo(asignacion, "idUnidad", "IdUnidad")
              )
            )
          )
        ) ||
        (
          asignaciones.length === 1
            ? datos.atenciones.find((at) =>
                iguales(idAlertaAtencion(at), id)
              )
            : null
        );

      const unidad = unidadesPorId.get(
        String(campo(asignacion, "idUnidad", "IdUnidad"))
      );

      lista.push({
        clave,
        idAlerta: id,
        alerta: alertasPorId.get(String(id)),
        asignacion,
        asignaciones,
        atencion,
        unidad,
      });
    };

    for (const asignacion of datos.asignaciones) {
      const id = idAlertaAsignacion(asignacion);

      if (id == null) continue;

      const alerta = alertasPorId.get(String(id));

      if (
        ["EN_ATENCION", "FINALIZADA"].includes(
          estadoAsignacion(asignacion)
        ) ||
        ["EN_ATENCION", "RESUELTA"].includes(
          estadoAlerta(alerta)
        ) ||
        datos.atenciones.some((at) =>
          iguales(idAlertaAtencion(at), id)
        )
      ) {
        agregar(id, asignacion);
      }
    }

    return lista.sort(
      (a, b) => Number(b.idAlerta) - Number(a.idAlerta)
    );
  }, [datos]);

  const seleccionActual =
    casos.find((c) => c.clave === seleccion) || null;

  const atencionActual = seleccionActual?.atencion;
  const idAtencionActual = idDeAtencion(atencionActual);

  const informeFinalizado =
    estadoInforme(atencionActual) === "FINALIZADA";

  const asignacionesTerminadas =
    !!seleccionActual?.asignaciones.length &&
    seleccionActual.asignaciones.every((a) =>
      ["FINALIZADA", "CANCELADA"].includes(
        estadoAsignacion(a)
      )
    );

  const alertaResuelta =
    ["RESUELTA", "CANCELADA"].includes(
      estadoAlerta(seleccionActual?.alerta)
    );

  const puedeCerrar =
    !!seleccionActual &&
    informeFinalizado &&
    asignacionesTerminadas &&
    !alertaResuelta;

  const puedeRegistrar =
    !!seleccionActual &&
    !atencionActual &&
    estadoAsignacion(seleccionActual.asignacion) ===
      "EN_ATENCION";

  const puedeEditar =
    !!atencionActual &&
    !informeFinalizado &&
    !alertaResuelta;

  // Filtros de alertas
  const filtrados = casos.filter((c) => {
    const estado = estadoAlerta(c.alerta);
    const estInforme = estadoInforme(c.atencion);

    const coincide =
      filtro === "todas" ||
      (
        filtro === "finalizadas" &&
        ["RESUELTA", "CANCELADA"].includes(estado)
      ) ||
      (
        filtro === "porRevisar" &&
        !c.atencion &&
        !["RESUELTA", "CANCELADA"].includes(estado)
      ) ||
      (
        filtro === "enRevision" &&
        !["RESUELTA", "CANCELADA"].includes(estado) &&
        (
          estado === "EN_ATENCION" ||
          estInforme === "EN_PROCESO" ||
          estInforme === "FINALIZADA"
        )
      );

    const texto = [
      c.idAlerta,
      idDeAsignacion(c.asignacion),
      tipoDeAlerta(c.alerta),
      ubicacionDeAlerta(c.alerta),
      nombreUnidad(c.unidad),
      estado,
      estInforme,
    ]
      .join(" ")
      .toLowerCase();

    return (
      coincide &&
      texto.includes(busqueda.trim().toLowerCase())
    );
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / registrosPorPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const registrosVisibles = filtrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  const valores = {
    porRevisar: casos.filter(
      (c) =>
        !c.atencion &&
        !["RESUELTA", "CANCELADA"].includes(
          estadoAlerta(c.alerta)
        )
    ).length,

    enRevision: casos.filter(
      (c) =>
        !["RESUELTA", "CANCELADA"].includes(
          estadoAlerta(c.alerta)
        ) &&
        !!c.atencion
    ).length,

    finalizadas: casos.filter((c) =>
      ["RESUELTA", "CANCELADA"].includes(
        estadoAlerta(c.alerta)
      )
    ).length,
  };

  function seleccionar(c) {
    setSeleccion(c.clave);
    setError("");

    setFormulario({
      descripcion:
        campo(c.atencion, "descripcion", "Descripcion") || "",
      observacion:
        campo(c.atencion, "observacion", "Observacion") || "",
      idTipoArma:
        campo(c.atencion, "idTipoArma", "IdTipoArma") ?? "",
      idMedioTransporte:
        campo(
          c.atencion,
          "idMedioTransporte",
          "IdMedioTransporte"
        ) ?? "",
    });
  }

  function refrescar() {
    setRecarga((x) => x + 1);
  }

  function valorOpcional(v) {
    return v === "" ? null : Number(v);
  }

  function cuerpoInforme(estadoFinal) {
    return {
      estadoFinal,
      descripcion: formulario.descripcion.trim(),
      observacion: formulario.observacion.trim(),
      idTipoArma: valorOpcional(formulario.idTipoArma),
      idMedioTransporte: valorOpcional(
        formulario.idMedioTransporte
      ),
    };
  }

  async function ejecutar(accion, mensaje, mostrarError = true) {
    setGuardando(true);
    setError("");

    try {
      await accion();
      toast.success(mensaje);
      refrescar();
    } catch (err) {
      if (!mostrarError) throw err;
      toast.errorFrom(err, "No fue posible completar la operación.");
    } finally {
      setGuardando(false);
    }
  }

  // Registrar informe
  async function registrar(estadoFinal) {
    if (
      !seleccionActual ||
      !formulario.descripcion.trim()
    ) {
      toast.warning("Escribe la descripción del informe antes de continuar.", "Falta la descripción");
      return;
    }

    await confirm({
      title: "¿Registrar informe?",
      description: `Confirma el registro del informe ${estadoFinal.replaceAll("_", " ").toLowerCase()} para la alerta #${seleccionActual.idAlerta}.`,
      confirmLabel: "Registrar informe",
      failureMessage: "No fue posible registrar el informe.",
      onConfirm: () => ejecutar(
        () => crearAtencionCentral({
          idAlerta: Number(seleccionActual.idAlerta),
          idUnidad: Number(
            campo(
              seleccionActual.asignacion,
              "idUnidad",
              "IdUnidad"
            )
          ),
          ...cuerpoInforme(estadoFinal),
          idPolicia: null,
        }),
        "Informe registrado correctamente.",
        false
      ),
    });
  }

  // Finalizar informe existente
  async function finalizarInforme() {
    if (
      !idAtencionActual ||
      !formulario.descripcion.trim()
    ) {
      toast.warning("Escribe la descripción del informe antes de finalizarlo.", "Falta la descripción");
      return;
    }

    await confirm({
      title: "¿Finalizar informe?",
      description: `Confirma que deseas finalizar el informe #${idAtencionActual}.`,
      confirmLabel: "Finalizar informe",
      failureMessage: "No fue posible finalizar el informe.",
      onConfirm: () => ejecutar(
        () => actualizarAtencionCentral(
          idAtencionActual,
          cuerpoInforme("FINALIZADA")
        ),
        "Informe finalizado correctamente.",
        false
      ),
    });
  }

  // Guardar cambios sin finalizar
  function guardarInforme() {
    if (
      !idAtencionActual ||
      !formulario.descripcion.trim()
    ) {
      toast.warning("Escribe la descripción del informe antes de guardar.", "Falta la descripción");
      return;
    }

    ejecutar(
      () =>
        actualizarAtencionCentral(
          idAtencionActual,
          cuerpoInforme("EN_PROCESO")
        ),
      "Informe actualizado correctamente."
    );
  }

  // Cerrar alerta
  async function resolver() {
    if (!puedeCerrar) {
      toast.warning("Finaliza el informe y las asignaciones antes de resolver la alerta.", "La alerta aún está en atención");
      return;
    }

    await confirm({
      title: "¿Resolver alerta?",
      description: `Confirma que deseas cerrar la alerta #${seleccionActual.idAlerta} como resuelta.`,
      confirmLabel: "Resolver alerta",
      failureMessage: "No fue posible resolver la alerta.",
      onConfirm: () => ejecutar(
        () => cerrarAlertaCentral(seleccionActual.idAlerta),
        "Alerta resuelta correctamente.",
        false
      ),
    });
  }

  return (
    <div className="atencion-page">
      <Topbar placeholder="Buscar caso, unidad o zona..." />

      <main className="atencion-contenido">
        <header className="atencion-encabezado">
          <div>
            <h1>Atención de alertas</h1>
            <p>
              Registra informes y cierra alertas cuando
              las unidades hayan finalizado su participación.
            </p>
          </div>


        </header>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <Kpis
          grupo="atencion-alertas"
          valores={cargando ? {} : valores}
        />

        <section className="atencion-layout">
          {/* LISTADO DE ALERTAS */}
          <div className="atencion-panel atencion-listado">
            <div className="atencion-panel-header">
              <div>
                <h2>Alertas policiales</h2>
                <p>
                  Incluye casos en atención sin informe.
                </p>
              </div>

              <span className="atencion-total">
                {filtrados.length}
              </span>
            </div>

            <div className="atencion-filtros">
              <div className="atencion-tabs">
                {[
                  ["porRevisar", "Sin informe"],
                  ["enRevision", "En atención"],
                  ["finalizadas", "Cerradas"],
                  ["todas", "Todas"],
                ].map(([valor, etiqueta]) => (
                  <button
                    key={valor}
                    type="button"
                    className={
                      filtro === valor ? "activo" : ""
                    }
                    onClick={() => {
                      setFiltro(valor);
                      setPagina(1);
                    }}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>

              <div className="atencion-busqueda">
                <i className="bi bi-search" />

                <input
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPagina(1);
                  }}
                  placeholder="Buscar alerta, unidad o barrio"
                  aria-label="Buscar alertas"
                />
              </div>
            </div>

            <div className="atencion-lista">
              {cargando ? (
                <div className="p-4 text-muted">
                  Cargando alertas...
                </div>
              ) : filtrados.length === 0 ? (
                <div className="p-4 text-muted">
                  No hay casos para mostrar.
                </div>
              ) : (
                registrosVisibles.map((c) => (
                  <button
                    key={c.clave}
                    type="button"
                    className={`atencion-item w-100 text-start ${seleccion === c.clave ? "seleccionado" : ""}`}
                    onClick={() => seleccionar(c)}
                    aria-pressed={
                      seleccion === c.clave
                    }
                  >
                    <span className="atencion-item-icono">
                      <i className="bi bi-file-earmark-text" />
                    </span>

                    <span className="atencion-item-info">
                      <strong>
                        #{c.idAlerta} ·{" "}
                        {tipoDeAlerta(c.alerta)}
                      </strong>

                      <small>
                        <i className="bi bi-geo-alt" />{" "}
                        {ubicacionDeAlerta(c.alerta)}
                      </small>

                      <small>
                        <i className="bi bi-car-front" />{" "}
                        {c.unidad
                          ? nombreUnidad(c.unidad)
                          : campo(
                              c.asignacion,
                              "unidadNombre",
                              "UnidadNombre"
                            ) || "Unidad no disponible"}
                      </small>
                    </span>

                    <span className="atencion-item-derecha">
                      <span className={`atencion-estado ${claseEstado(estadoInforme(c.atencion))}`}>
                        {estadoInforme(c.atencion) ||
                          "SIN INFORME"}
                      </span>

                      <i className="bi bi-chevron-right" />
                    </span>
                  </button>
                ))
              )}
            </div>
            {!cargando && filtrados.length > 0 && (
              <nav className="atencion-paginacion" aria-label="Paginación de alertas">
                <span>
                  Mostrando {(paginaActual - 1) * registrosPorPagina + 1}–{Math.min(paginaActual * registrosPorPagina, filtrados.length)} de {filtrados.length} alertas
                </span>
                <div className="atencion-paginacion-controles">
                  <button type="button" onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={paginaActual === 1}>
                    <i className="bi bi-chevron-left" aria-hidden="true" /> Anterior
                  </button>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                    <button
                      type="button"
                      key={numero}
                      className={numero === paginaActual ? "activa" : ""}
                      aria-current={numero === paginaActual ? "page" : undefined}
                      aria-label={`Página ${numero}`}
                      onClick={() => setPagina(numero)}
                    >
                      {numero}
                    </button>
                  ))}
                  <button type="button" onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}>
                    Siguiente <i className="bi bi-chevron-right" aria-hidden="true" />
                  </button>
                </div>
              </nav>
            )}
          </div>

          {/* DETALLE DE ALERTA */}
          <div className="atencion-panel atencion-detalle">
            {!seleccionActual ? (
              <div className="text-center text-muted p-5">
                <i className="bi bi-file-earmark-text fs-1 d-block mb-3" />

                <h2 className="fs-5">
                  Selecciona una alerta
                </h2>

                <p>
                  Consulta el caso y registra el informe.
                </p>
              </div>
            ) : (
              <>
                <div className="atencion-detalle-header">
                  <div>
                    <span className="atencion-detalle-etiqueta">
                      ALERTA #{seleccionActual.idAlerta}
                    </span>

                    <h2>
                      {tipoDeAlerta(seleccionActual.alerta)}
                    </h2>

                    <p>
                      {ubicacionDeAlerta(
                        seleccionActual.alerta
                      )}
                    </p>
                  </div>

                  <span className={`atencion-estado ${claseEstado(estadoAlerta(seleccionActual.alerta))}`}>
                    {estadoAlerta(
                      seleccionActual.alerta
                    ) || "Sin estado"}
                  </span>
                </div>

                <div className="atencion-unidad">
                  <div className="atencion-unidad-icono">
                    <i className="bi bi-car-front" />
                  </div>

                  <div>
                    <small>Unidad responsable</small>

                    <strong>
                      {seleccionActual.unidad
                        ? nombreUnidad(
                            seleccionActual.unidad
                          )
                        : campo(
                            seleccionActual.asignacion,
                            "unidadNombre",
                            "UnidadNombre"
                          ) || "No disponible"}
                    </strong>
                  </div>

                  <div className="atencion-unidad-hora">
                    <small>Asignación</small>

                    <strong>
                      #{idDeAsignacion(
                        seleccionActual.asignacion
                      )}
                    </strong>
                  </div>
                </div>

                <section className="atencion-seccion">
                  <h3>Información de la alerta</h3>

                  <p>
                    {campo(
                      seleccionActual.alerta,
                      "descripcion",
                      "Descripcion"
                    ) || "Sin descripción"}
                  </p>
                </section>

                <section className="atencion-seccion atencion-participacion">
                  <h3>Estado de la participación</h3>
                  <div className="atencion-participacion-resumen">
                    <div className="atencion-participacion-fila">
                      <span>Asignación #{idDeAsignacion(seleccionActual.asignacion)}</span>
                      <strong className={`atencion-estado ${claseEstado(estadoAsignacion(seleccionActual.asignacion))}`}>
                        {estadoAsignacion(seleccionActual.asignacion)}
                      </strong>
                    </div>
                    <div className="atencion-participacion-fila">
                      <span>Informe {idAtencionActual ? `#${idAtencionActual}` : ""}</span>
                      <strong className={`atencion-estado ${claseEstado(estadoInforme(atencionActual))}`}>
                        {estadoInforme(atencionActual) || "SIN REGISTRAR"}
                      </strong>
                    </div>
                  </div>

                  {seleccionActual.asignaciones.length >
                    1 && (
                    <details className="atencion-otras-asignaciones">
                      <summary>Otras asignaciones de esta alerta ({seleccionActual.asignaciones.length})</summary>
                      <div className="atencion-asignaciones-lista">
                        {seleccionActual.asignaciones.map((a) => (
                          <div className="atencion-asignacion-fila" key={idDeAsignacion(a)}>
                            <span className="atencion-asignacion-identificador">
                              <i className="bi bi-file-earmark-check" aria-hidden="true" />
                              Asignación #{idDeAsignacion(a)}
                            </span>
                            <span className={`atencion-estado ${claseEstado(estadoAsignacion(a))}`}>
                              {estadoAsignacion(a)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </section>

                {/* FORMULARIO DEL INFORME */}
                <section className="atencion-seccion atencion-seccion-central">
                  <h3>Informe de atención policial</h3>

                  {atencionActual && (puedeRegistrar || puedeEditar) && (
                    <div className="atencion-informe-registrado atencion-informe-resumen">
                      <div className="atencion-informe-dato">
                        <span>Descripción registrada</span>
                        <p>{campo(atencionActual, "descripcion", "Descripcion") || "Sin informe registrado"}</p>
                      </div>
                      <div className="atencion-informe-dato">
                        <span>Observaciones registradas</span>
                        <p>{campo(atencionActual, "observacion", "Observacion") || "Sin observaciones"}</p>
                      </div>
                      <div className="atencion-informe-dato atencion-informe-fecha">
                        <span>Fecha de registro</span>
                        <p>{formatearFecha(campo(atencionActual, "fechaAtencion", "FechaAtencion"))}</p>
                      </div>
                    </div>
                  )}

                  {puedeRegistrar || puedeEditar ? (
                    <div className="d-grid gap-3">
                      <label>
                        Descripción de la atención

                        <textarea
                          className="form-control"
                          rows={4}
                          value={formulario.descripcion}
                          onChange={(e) =>
                            setFormulario((f) => ({
                              ...f,
                              descripcion: e.target.value,
                            }))
                          }
                          placeholder="Describe la atención realizada"
                        />
                      </label>

                      <label>
                        Observaciones

                        <textarea
                          className="form-control"
                          rows={3}
                          value={formulario.observacion}
                          onChange={(e) =>
                            setFormulario((f) => ({
                              ...f,
                              observacion: e.target.value,
                            }))
                          }
                          placeholder="Observaciones del informe"
                        />
                      </label>

                      <div className="d-flex flex-wrap gap-2">
                        {puedeRegistrar && (
                          <>
                            <button
                              className="btn atencion-btn atencion-btn-registro"
                              disabled={guardando}
                              onClick={() =>
                                registrar("EN_PROCESO")
                              }
                            >
                              Registrar informe
                            </button>

                            <button
                              className="btn atencion-btn atencion-btn-finalizar"
                              disabled={guardando}
                              onClick={() =>
                                registrar("FINALIZADA")
                              }
                            >
                              Registrar y finalizar informe
                            </button>
                          </>
                        )}

                        {puedeEditar && (
                          <>
                            <button
                              className="btn atencion-btn atencion-btn-registro"
                              disabled={guardando}
                              onClick={guardarInforme}
                            >
                              Guardar cambios
                            </button>

                            <button
                              className="btn atencion-btn atencion-btn-finalizar"
                              disabled={guardando}
                              onClick={finalizarInforme}
                            >
                              Finalizar informe
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="atencion-informe-registrado">
                      <div className="atencion-informe-dato">
                        <span>Descripción de la atención</span>
                        <p>{campo(atencionActual, "descripcion", "Descripcion") || "Sin informe registrado"}</p>
                      </div>
                      <div className="atencion-informe-dato">
                        <span>Observaciones</span>
                        <p>{campo(atencionActual, "observacion", "Observacion") || "Sin observaciones"}</p>
                      </div>
                      {atencionActual && (
                        <div className="atencion-informe-dato atencion-informe-fecha">
                          <span>Fecha de registro</span>
                          <p>{formatearFecha(campo(atencionActual, "fechaAtencion", "FechaAtencion"))}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!atencionActual &&
                    !puedeRegistrar && (
                      <p className="text-muted">
                        Para registrar el informe,
                        la asignación debe estar
                        EN_ATENCION.
                      </p>
                    )}
                </section>

                {/* CIERRE DE ALERTA */}
                <section className="atencion-seccion atencion-seccion-central atencion-cierre">
                  <h3>Cierre de la alerta</h3>

                  {!informeFinalizado && (
                    <p className="text-muted">
                      Primero debe finalizarse el informe.
                    </p>
                  )}

                  {informeFinalizado &&
                    !asignacionesTerminadas && (
                      <div className="atencion-ayuda">
                        El informe ya está finalizado.
                        El policía autorizado debe
                        finalizar su asignación desde
                        su módulo. Los datos se cargan automáticamente al entrar.
                      </div>
                    )}

                  {asignacionesTerminadas &&
                    !informeFinalizado && (
                      <p className="text-muted">
                        Las asignaciones terminaron,
                        pero falta finalizar el informe.
                      </p>
                    )}

                  {alertaResuelta ? (
                    <div className="atencion-alerta-cerrada" role="status">
                      <span className="atencion-alerta-cerrada-icono"><i className="bi bi-check-lg" aria-hidden="true" /></span>
                      <strong>Esta alerta ya está cerrada.</strong>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn atencion-btn atencion-btn-resolver"
                      onClick={resolver}
                      disabled={
                        !puedeCerrar || guardando
                      }
                    >
                      Resolver alerta
                    </button>
                  )}
                </section>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
