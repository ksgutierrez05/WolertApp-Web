
import { useEffect, useMemo, useState } from "react";
import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";

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

const mensajeError = (error) =>
  error?.message || "No fue posible completar la operación.";

export default function AtencionAlertas() {
  const [datos, setDatos] = useState({
    atenciones: [],
    alertas: [],
    asignaciones: [],
    unidades: [],
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [filtro, setFiltro] = useState("enRevision");
  const [busqueda, setBusqueda] = useState("");
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
          setError(mensajeError(err));
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
    setExito("");

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

  async function ejecutar(accion, mensaje) {
    setGuardando(true);
    setError("");
    setExito("");

    try {
      await accion();
      setExito(mensaje);
      refrescar();
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setGuardando(false);
    }
  }

  // Registrar informe
  function registrar(estadoFinal) {
    if (
      !seleccionActual ||
      !formulario.descripcion.trim()
    ) {
      setError("Escribe la descripción del informe.");
      return;
    }

    if (
      !window.confirm(
        `¿Registrar informe ${estadoFinal} para la alerta #${seleccionActual.idAlerta}?`
      )
    ) {
      return;
    }

    ejecutar(
      () =>
        crearAtencionCentral({
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
      "Informe registrado correctamente."
    );
  }

  // Finalizar informe existente
  function finalizarInforme() {
    if (
      !idAtencionActual ||
      !formulario.descripcion.trim()
    ) {
      setError("Escribe la descripción del informe.");
      return;
    }

    if (
      !window.confirm(
        `¿Finalizar el informe #${idAtencionActual}?`
      )
    ) {
      return;
    }

    ejecutar(
      () =>
        actualizarAtencionCentral(
          idAtencionActual,
          cuerpoInforme("FINALIZADA")
        ),
      "Informe finalizado correctamente."
    );
  }

  // Guardar cambios sin finalizar
  function guardarInforme() {
    if (
      !idAtencionActual ||
      !formulario.descripcion.trim()
    ) {
      setError("Escribe la descripción del informe.");
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
  function resolver() {
    if (
      !puedeCerrar ||
      !window.confirm(
        `¿Cerrar la alerta #${seleccionActual.idAlerta} como RESUELTA?`
      )
    ) {
      return;
    }

    ejecutar(
      () =>
        cerrarAlertaCentral(seleccionActual.idAlerta),
      "Alerta cerrada correctamente. Comprueba su estado actualizado."
    );
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

          <button
            type="button"
            className="btn btn-outline-success btn-sm"
            onClick={refrescar}
            disabled={cargando || guardando}
          >
            Actualizar
          </button>
        </header>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {exito && (
          <div className="alert alert-success" role="status">
            {exito}
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
                    onClick={() => setFiltro(valor)}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>

              <div className="atencion-busqueda">
                <i className="bi bi-search" />

                <input
                  value={busqueda}
                  onChange={(e) =>
                    setBusqueda(e.target.value)
                  }
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
                filtrados.map((c) => (
                  <button
                    key={c.clave}
                    type="button"
                    className="atencion-item w-100 text-start"
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
                        <i className="bi bi-truck-front" />{" "}
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
                      <span className="atencion-estado">
                        {estadoInforme(c.atencion) ||
                          "SIN INFORME"}
                      </span>

                      <i className="bi bi-chevron-right" />
                    </span>
                  </button>
                ))
              )}
            </div>
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

                  <span className="atencion-estado">
                    {estadoAlerta(
                      seleccionActual.alerta
                    ) || "Sin estado"}
                  </span>
                </div>

                <div className="atencion-unidad">
                  <div className="atencion-unidad-icono">
                    <i className="bi bi-truck-front" />
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

                <section className="atencion-seccion">
                  <h3>Estado de la participación</h3>

                  <p>
                    Asignación #
                    {idDeAsignacion(
                      seleccionActual.asignacion
                    )}
                    :{" "}
                    <strong>
                      {estadoAsignacion(
                        seleccionActual.asignacion
                      )}
                    </strong>
                  </p>

                  <p>
                    Informe:{" "}
                    <strong>
                      {estadoInforme(atencionActual) ||
                        "SIN REGISTRAR"}
                    </strong>

                    {idAtencionActual
                      ? ` (#${idAtencionActual})`
                      : ""}
                  </p>

                  {seleccionActual.asignaciones.length >
                    1 && (
                    <div>
                      <strong>
                        Otras asignaciones de esta alerta:
                      </strong>

                      {seleccionActual.asignaciones.map(
                        (a) => (
                          <p key={idDeAsignacion(a)}>
                            #{idDeAsignacion(a)}:{" "}
                            {estadoAsignacion(a)}
                          </p>
                        )
                      )}
                    </div>
                  )}
                </section>

                {/* FORMULARIO DEL INFORME */}
                <section className="atencion-seccion atencion-seccion-central">
                  <h3>Informe de atención policial</h3>

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
                              className="btn btn-outline-primary"
                              disabled={guardando}
                              onClick={() =>
                                registrar("EN_PROCESO")
                              }
                            >
                              Registrar informe
                            </button>

                            <button
                              className="btn btn-success"
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
                              className="btn btn-outline-primary"
                              disabled={guardando}
                              onClick={guardarInforme}
                            >
                              Guardar cambios
                            </button>

                            <button
                              className="btn btn-success"
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
                    <div>
                      <p>
                        <strong>Descripción:</strong>{" "}
                        {campo(
                          atencionActual,
                          "descripcion",
                          "Descripcion"
                        ) || "Sin informe registrado"}
                      </p>

                      <p>
                        <strong>Observaciones:</strong>{" "}
                        {campo(
                          atencionActual,
                          "observacion",
                          "Observacion"
                        ) || "Sin observaciones"}
                      </p>

                      {atencionActual && (
                        <small>
                          Registrado:{" "}
                          {formatearFecha(
                            campo(
                              atencionActual,
                              "fechaAtencion",
                              "FechaAtencion"
                            )
                          )}
                        </small>
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
                <section className="atencion-seccion atencion-seccion-central">
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
                        su módulo. Luego pulsa Actualizar.
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
                    <p className="text-success">
                      <strong>
                        Esta alerta ya está cerrada.
                      </strong>
                    </p>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-success"
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
