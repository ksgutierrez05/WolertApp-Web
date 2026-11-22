import { useEffect, useMemo, useState } from "react";

import Layout from "../../Components/transito/Layout";

import KpiCard from "../../Components/transito/KpiCard";

import {
  listarAlertasCentral,
  listarAtencionesCentral,
  listarUnidadesCentral,
  listarAgentesCentral,
  asignarGrupoCentral,
  prepararCasosAsignablesCentral,
  listarTiposAlertaCentral,
  estadoAlertaCentral,
  prepararGruposCentral,
  finalizadaCentral,
  idAlertaCentral,
  tipoCentral,
  lugarCentral,
  reportanteCentral,
  badgeTipoCentral,
  fechaRegistroCentral,
  tiempoEsperaCentral,
  normalizarCentral,
} from "../../Services/centralTransitoService";

export default function Casos() {
  const [alertas, setAlertas] = useState([]);

  const [atenciones, setAtenciones] = useState([]);

  const [unidades, setUnidades] = useState([]);

  const [agentes, setAgentes] = useState([]);
  const [tiposAlerta, setTiposAlerta] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  const [cargando, setCargando] = useState(true);

  const [errores, setErrores] = useState([]);

  const [alertasCargadas, setAlertasCargadas] = useState(false);

  const [caso, setCaso] = useState(null);

  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

  const [filtro, setFiltro] = useState("todos");

  const [buscar, setBuscar] = useState("");

  const [buscarCaso, setBuscarCaso] = useState("");

  const [guardandoAsignacion, setGuardandoAsignacion] = useState(false);

  const [errorAsignacion, setErrorAsignacion] = useState("");

  const [mensajeAsignacion, setMensajeAsignacion] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const resultados = await Promise.allSettled([
        listarAlertasCentral(),

        listarAtencionesCentral(),

        listarUnidadesCentral(),

        listarAgentesCentral(),
        listarTiposAlertaCentral(),
      ]);

      if (!activo) return;

      const [al, t, u, a, tipos] = resultados;

      const mensajes = [];

      if (al.status === "fulfilled") {
        setAlertas(al.value);

        setAlertasCargadas(true);
      } else {
        mensajes.push("No se pudieron cargar las alertas.");
      }

      if (t.status === "fulfilled") {
        setAtenciones(t.value);
      } else {
        mensajes.push("No se cargaron las atenciones.");
      }

      if (u.status === "fulfilled") {
        setUnidades(u.value);
      } else {
        mensajes.push("No se cargaron las unidades.");
      }

      if (a.status === "fulfilled") {
        setAgentes(a.value);
      } else {
        mensajes.push("No se cargaron los agentes.");
      }

      if (tipos.status === "fulfilled") {
        setTiposAlerta(tipos.value);
      } else {
        mensajes.push(
          "No se pudieron cargar los tipos de alerta; solo se mostrarán casos con central identificada.",
        );
      }

      setErrores(mensajes);

      setCargando(false);
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  const casos = useMemo(
    () => prepararCasosAsignablesCentral(alertas, tiposAlerta),
    [alertas, tiposAlerta],
  );

  const grupos = useMemo(
    () =>
      prepararGruposCentral(
        unidades,

        agentes,

        atenciones,
      ),

    [unidades, agentes, atenciones],
  );

  const casosFiltrados = casos.filter((item) => {
    if (filtroEstado !== "TODOS" && estadoAlertaCentral(item) !== filtroEstado)
      return false;

    const texto = normalizarCentral(
      [
        tipoCentral(item),

        lugarCentral(item),

        reportanteCentral(item),

        idAlertaCentral(item),
      ].join(" "),
    );

    return texto.includes(normalizarCentral(buscarCaso));
  });

  const gruposFiltrados = grupos.filter((grupo) => {
    if (filtro === "disponible" && !grupo.disponible) {
      return false;
    }

    if (filtro === "no-disponible" && grupo.disponible) {
      return false;
    }

    return normalizarCentral(`${grupo.nombre} ${grupo.zona}`).includes(
      normalizarCentral(buscar),
    );
  });

  const disponibles = grupos.filter((grupo) => grupo.disponible).length;

  const cerradosHoy = atenciones.filter((atencion) => {
    if (!finalizadaCentral(atencion)) return false;

    const valor =
      atencion.fechaFinalizacion ||
      atencion.fechaCierre ||
      atencion.fechaAtencion;

    if (!valor) return false;

    const fecha = new Date(valor);

    return (
      !Number.isNaN(fecha.getTime()) &&
      fecha.toDateString() === new Date().toDateString()
    );
  }).length;

  function abrirAsignacion(item) {
    setCaso(item);

    setGrupoSeleccionado(null);

    setBuscar("");

    setFiltro("todos");

    setErrorAsignacion("");

    setMensajeAsignacion("");
  }

  function cerrarAsignacion() {
    if (guardandoAsignacion) return;

    setCaso(null);

    setGrupoSeleccionado(null);

    setErrorAsignacion("");
  }

  async function confirmarAsignacion() {
    if (!caso || !grupoSeleccionado || guardandoAsignacion) {
      return;
    }

    if (!grupoSeleccionado.disponible) {
      setErrorAsignacion("El grupo seleccionado no está disponible.");

      return;
    }

    const idAlerta = idAlertaCentral(caso);

    if (idAlerta == null) {
      setErrorAsignacion("No se encontró el identificador del caso.");

      return;
    }

    setGuardandoAsignacion(true);

    setErrorAsignacion("");

    setMensajeAsignacion("");

    let asignacionRegistrada = false;

    try {
      await asignarGrupoCentral(
        idAlerta,

        grupoSeleccionado.nombre,

        "Asignación manual desde Central de Tránsito",
      );

      asignacionRegistrada = true;

      //* Actualización local para evitar que el caso*

      //* siga apareciendo mientras se recarga la API.*

      setAlertas((anteriores) =>
        anteriores.map((alerta) =>
          String(idAlertaCentral(alerta)) === String(idAlerta)
            ? {
                ...alerta,

                estado: "UNIDAD_ASIGNADA",

                estadoAlerta: "UNIDAD_ASIGNADA",
              }
            : alerta,
        ),
      );

      setCaso(null);

      setGrupoSeleccionado(null);

      setMensajeAsignacion(
        `Caso #${idAlerta} asignado correctamente al grupo ${grupoSeleccionado.nombre}.`,
      );

      //* Sincronizar con los datos reales del backend.*

      const resultados = await Promise.allSettled([
        listarAlertasCentral(),

        listarAtencionesCentral(),

        listarUnidadesCentral(),

        listarAgentesCentral(),
        listarTiposAlertaCentral(),
      ]);

      const [al, at, un, ag, tipos] = resultados;

      if (al.status === "fulfilled") {
        setAlertas(al.value);
      }

      if (at.status === "fulfilled") {
        setAtenciones(at.value);
      }

      if (un.status === "fulfilled") {
        setUnidades(un.value);
      }

      if (ag.status === "fulfilled") {
        setAgentes(ag.value);
      }
      if (tipos.status === "fulfilled") {
        setTiposAlerta(tipos.value);
      }

      if (al.status === "rejected") {
        setMensajeAsignacion(
          `Caso #${idAlerta} asignado. No se pudo actualizar la lista; recarga la página para consultar el estado.`,
        );
      }
    } catch (error) {
      if (!asignacionRegistrada) {
        setErrorAsignacion(
          error.message || "No se pudo registrar la asignación.",
        );
      }
    } finally {
      setGuardandoAsignacion(false);
    }
  }

  return (
    <Layout
      rol="central"
      titulo="Asignación de casos"
      activo="asignar"
      busqueda={{
        placeholder: "Buscar por caso o barrio...",
      }}
    >
      <div className="mb-4">
        <h1 className="section-title-dash">Casos pendientes de Tránsito</h1>

        <p className="section-text-dash mb-0">
          Consulta los casos pendientes y los grupos disponibles para su
          asignación.
        </p>
      </div>

      {cargando && (
        <div className="alert alert-info">Cargando casos y grupos...</div>
      )}

      {errores.length > 0 && (
        <div className="alert alert-warning">{errores.join(" ")}</div>
      )}

      {mensajeAsignacion && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-check-circle me-2" />

          {mensajeAsignacion}

          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar mensaje"
            onClick={() => setMensajeAsignacion("")}
          />
        </div>
      )}

      <div className="row g-3 mb-5">
        <KpiCard
          color="red"
          valor={alertasCargadas ? casos.length : "—"}
          label="Casos sin asignar"
          icono="bi-geo-alt"
        />

        <KpiCard
          color="blue"
          valor="—"
          label="Tiempo de respuesta"
          icono="bi-clock"
        />

        <KpiCard
          color="green"
          valor={cerradosHoy}
          label="Casos cerrados hoy"
          icono="bi-check2"
        />

        <KpiCard
          color="amber"
          valor={`${disponibles}/${grupos.length}`}
          label="Grupos disponibles"
          icono="bi-truck"
        />
      </div>

      <div className="table-card-dash">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h2 className="panel-title-dash mb-0">Casos que puedes asignar</h2>

          <div className="input-group search-panel-dash">
            <span className="input-group-text bg-white border-0">
              <i className="bi bi-search" />
            </span>

            <input
              type="search"
              className="form-control border-0"
              placeholder="Buscar caso, barrio o reportante..."
              value={buscarCaso}
              onChange={(e) => setBuscarCaso(e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-3 tabs-dash">
          {[
            ["TODOS", "Todos"],
            ["PENDIENTE", "Pendientes"],
          ].map(([valor, etiqueta]) => (
            <button
              key={valor}
              type="button"
              className={`tab-dash ${filtroEstado === valor ? "active-dash" : ""}`}
              onClick={() => setFiltroEstado(valor)}
            >
              {etiqueta} ({casos.length})
            </button>
          ))}
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Tipo</th>

                <th>Ubicación / reportante</th>

                <th>Estado</th>

                <th>Espera</th>

                <th className="text-end">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {casosFiltrados.map((item, indice) => (
                <tr key={idAlertaCentral(item) ?? indice}>
                  <td>
                    <span
                      className={`badge-dash badge-${badgeTipoCentral(
                        tipoCentral(item),
                      )}-dash`}
                    >
                      {tipoCentral(item)}
                    </span>
                  </td>

                  <td>
                    <div className="info-title-dash">{lugarCentral(item)}</div>

                    <div className="info-sub-dash">
                      Reportado por {reportanteCentral(item)}
                    </div>
                  </td>

                  <td>
                    <span className="badge-estado-alerta-dash estado-pendiente-dash">
                      <span className="estado-punto-dash" />
                      Pendiente
                    </span>
                  </td>

                  <td>
                    <span className="wait-dash wait-warn-dash">
                      {tiempoEsperaCentral(fechaRegistroCentral(item))}
                    </span>
                  </td>

                  <td className="text-end">
                    <button
                      type="button"
                      className="btn-asignar-dash"
                      onClick={() => abrirAsignacion(item)}
                    >
                      Asignar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {casosFiltrados.length === 0 && (
          <p className="text-center text-muted py-4 mb-0">
            {alertasCargadas
              ? "No hay alertas pendientes de Tránsito que puedas asignar."
              : "La cola de alertas no está disponible."}
          </p>
        )}

        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">
            Mostrando {casosFiltrados.length} de {casos.length} casos
          </span>
        </div>
      </div>

      {caso && (
        <div
          className="modal fade show"
          id="modalAsignar"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tituloAsignarCentral"
          style={{
            display: "block",

            backgroundColor: "rgba(0,0,0,.5)",
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content modal-dash">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5
                    id="tituloAsignarCentral"
                    className="panel-title-dash mb-0"
                  >
                    Asignar grupo
                  </h5>

                  <p className="modal-subtitulo-dash mb-0">
                    {tipoCentral(caso)} · {lugarCentral(caso)}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  disabled={guardandoAsignacion}
                  onClick={cerrarAsignacion}
                />
              </div>

              <div className="modal-body">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <div className="d-flex gap-2 tabs-dash flex-wrap">
                    {[
                      ["todos", "Todos"],

                      ["disponible", "Disponibles"],

                      ["no-disponible", "No disponibles"],
                    ].map(([id, texto]) => (
                      <button
                        key={id}
                        type="button"
                        className={`tab-dash ${
                          filtro === id ? "active-dash" : ""
                        }`}
                        onClick={() => setFiltro(id)}
                      >
                        {texto}
                      </button>
                    ))}
                  </div>

                  <div className="input-group search-panel-dash">
                    <span className="input-group-text bg-white border-0">
                      <i className="bi bi-search" />
                    </span>

                    <input
                      type="search"
                      className="form-control border-0"
                      placeholder="Buscar grupo..."
                      value={buscar}
                      onChange={(e) => setBuscar(e.target.value)}
                    />
                  </div>
                </div>

                <div className="tabla-grupos-modal-dash">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Grupo</th>

                          <th>Zona</th>

                          <th>Estado</th>

                          <th className="text-end">Acción</th>
                        </tr>
                      </thead>

                      <tbody>
                        {gruposFiltrados.map((grupo, indice) => (
                          <tr key={grupo.id ?? indice}>
                            <td>
                              <div className="info-title-dash">
                                {grupo.nombre}
                              </div>

                              <div className="info-sub-dash">
                                {grupo.disponibles} de {grupo.totalAgentes}{" "}
                                agentes disponibles
                              </div>
                            </td>

                            <td>{grupo.zona}</td>

                            <td>
                              <span
                                className={`badge-state-dash ${
                                  grupo.disponible
                                    ? "badge-active-dash"
                                    : "badge-inactive-dash"
                                }`}
                              >
                                {grupo.disponible
                                  ? "Operativa"
                                  : "No operativa"}
                              </span>
                            </td>

                            <td className="text-end">
                              <button
                                type="button"
                                className="btn-asignar-fila-dash"
                                disabled={
                                  !grupo.disponible ||
                                  grupo.id == null ||
                                  guardandoAsignacion
                                }
                                onClick={() => {
                                  setGrupoSeleccionado(grupo);

                                  setErrorAsignacion("");
                                }}
                              >
                                {grupoSeleccionado?.id === grupo.id
                                  ? "Seleccionado"
                                  : "Seleccionar"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {gruposFiltrados.length === 0 && (
                    <p className="text-center text-muted py-4 mb-0">
                      No hay grupos disponibles para esta búsqueda.
                    </p>
                  )}
                </div>

                {grupoSeleccionado && (
                  <div className="alert alert-info mt-3 mb-0">
                    <i className="bi bi-check-circle me-2" />
                    Grupo seleccionado:{" "}
                    <strong>{grupoSeleccionado.nombre}</strong>
                  </div>
                )}

                {errorAsignacion && (
                  <div className="alert alert-danger mt-3 mb-0" role="alert">
                    <i className="bi bi-exclamation-triangle me-2" />

                    {errorAsignacion}
                  </div>
                )}
              </div>

              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={cerrarAsignacion}
                  disabled={guardandoAsignacion}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={
                    !grupoSeleccionado ||
                    !grupoSeleccionado.disponible ||
                    guardandoAsignacion
                  }
                  onClick={confirmarAsignacion}
                >
                  {guardandoAsignacion ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                      Asignando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle me-2" />
                      Confirmar asignación
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
