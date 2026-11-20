
import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/transito/Layout";
import KpiCard from "../../Components/transito/KpiCard";

import {
  listarAlertasCentral,
  listarAtencionesCentral,
  listarUnidadesCentral,
  listarAgentesCentral,
  prepararColaCentral,
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

  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState([]);
  const [alertasCargadas, setAlertasCargadas] =
    useState(false);

  const [caso, setCaso] = useState(null);
  const [grupoSeleccionado, setGrupoSeleccionado] =
    useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [buscar, setBuscar] = useState("");
  const [buscarCaso, setBuscarCaso] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const resultados = await Promise.allSettled([
        listarAlertasCentral(),
        listarAtencionesCentral(),
        listarUnidadesCentral(),
        listarAgentesCentral(),
      ]);

      if (!activo) return;

      const [al, t, u, a] = resultados;
      const mensajes = [];

      if (al.status === "fulfilled") {
        setAlertas(al.value);
        setAlertasCargadas(true);
      } else {
        mensajes.push(
          "No se pudieron cargar las alertas. Confirma /api/Alertas en Swagger."
        );
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

      setErrores(mensajes);
      setCargando(false);
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  const casos = useMemo(
    () => prepararColaCentral(alertas, atenciones),
    [alertas, atenciones]
  );

  const grupos = useMemo(
    () =>
      prepararGruposCentral(
        unidades,
        agentes,
        atenciones
      ),
    [unidades, agentes, atenciones]
  );

  const casosFiltrados = casos.filter((item) => {
    const texto = normalizarCentral(
      [
        tipoCentral(item),
        lugarCentral(item),
        reportanteCentral(item),
        idAlertaCentral(item),
      ].join(" ")
    );

    return texto.includes(normalizarCentral(buscarCaso));
  });

  const gruposFiltrados = grupos.filter((grupo) => {
    if (
      filtro === "disponible" &&
      !grupo.disponible
    ) {
      return false;
    }

    if (
      filtro === "no-disponible" &&
      grupo.disponible
    ) {
      return false;
    }

    return normalizarCentral(
      `${grupo.nombre} ${grupo.zona}`
    ).includes(normalizarCentral(buscar));
  });

  const disponibles = grupos.filter(
    (grupo) => grupo.disponible
  ).length;

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
  }

  function cerrarAsignacion() {
    setCaso(null);
    setGrupoSeleccionado(null);
  }

  return (
    <Layout
      rol="central"
      titulo="Casos sin asignar"
      activo="asignar"
      busqueda={{
        placeholder: "Buscar por caso o barrio...",
      }}
    >
      <div className="mb-4">
        <h1 className="section-title-dash">
          Casos sin asignar
        </h1>
        <p className="section-text-dash mb-0">
          Consulta los casos pendientes y los grupos
          disponibles para su asignación.
        </p>
      </div>

      {cargando && (
        <div className="alert alert-info">
          Cargando casos y grupos...
        </div>
      )}

      {errores.length > 0 && (
        <div className="alert alert-warning">
          {errores.join(" ")}
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
          <h2 className="panel-title-dash mb-0">
            Cola de casos pendientes
          </h2>

          <div className="input-group search-panel-dash">
            <span className="input-group-text bg-white border-0">
              <i className="bi bi-search" />
            </span>
            <input
              type="search"
              className="form-control border-0"
              placeholder="Buscar caso, barrio o reportante..."
              value={buscarCaso}
              onChange={(e) =>
                setBuscarCaso(e.target.value)
              }
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Ubicación / reportante</th>
                <th>Espera</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {casosFiltrados.map((item, indice) => (
                <tr
                  key={idAlertaCentral(item) ?? indice}
                >
                  <td>
                    <span
                      className={`badge-dash badge-${badgeTipoCentral(
                        tipoCentral(item)
                      )}-dash`}
                    >
                      {tipoCentral(item)}
                    </span>
                  </td>

                  <td>
                    <div className="info-title-dash">
                      {lugarCentral(item)}
                    </div>
                    <div className="info-sub-dash">
                      Reportado por{" "}
                      {reportanteCentral(item)}
                    </div>
                  </td>

                  <td>
                    <span className="wait-dash wait-warn-dash">
                      {tiempoEsperaCentral(
                        fechaRegistroCentral(item)
                      )}
                    </span>
                  </td>

                  <td className="text-end">
                    <button
                      type="button"
                      className="btn-asignar-dash"
                      onClick={() =>
                        abrirAsignacion(item)
                      }
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
              ? "No hay casos pendientes que coincidan con la búsqueda."
              : "La cola de alertas no está disponible."}
          </p>
        )}

        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">
            Mostrando {casosFiltrados.length} de{" "}
            {casos.length} casos
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
                    {tipoCentral(caso)} ·{" "}
                    {lugarCentral(caso)}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
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
                          filtro === id
                            ? "active-dash"
                            : ""
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
                      onChange={(e) =>
                        setBuscar(e.target.value)
                      }
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
                          <th className="text-end">
                            Acción
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {gruposFiltrados.map(
                          (grupo, indice) => (
                            <tr
                              key={grupo.id ?? indice}
                            >
                              <td>
                                <div className="info-title-dash">
                                  {grupo.nombre}
                                </div>
                                <div className="info-sub-dash">
                                  {grupo.disponibles} de{" "}
                                  {grupo.totalAgentes} agentes
                                  disponibles
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
                                    ? "Disponible"
                                    : "No disponible"}
                                </span>
                              </td>

                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn-asignar-fila-dash"
                                  disabled={
                                    !grupo.disponible ||
                                    grupo.id == null
                                  }
                                  onClick={() =>
                                    setGrupoSeleccionado(
                                      grupo
                                    )
                                  }
                                >
                                  {grupoSeleccionado?.id ===
                                  grupo.id
                                    ? "Seleccionado"
                                    : "Seleccionar"}
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {gruposFiltrados.length === 0 && (
                    <p className="text-center text-muted py-4 mb-0">
                      No hay grupos disponibles
                      para esta búsqueda.
                    </p>
                  )}
                </div>

                {grupoSeleccionado && (
                  <div className="alert alert-info mt-3 mb-0">
                    Grupo seleccionado:{" "}
                    <strong>
                      {grupoSeleccionado.nombre}
                    </strong>
                  </div>
                )}

                <div className="alert alert-warning small mt-3 mb-0">
                  Para confirmar esta asignación,
                  necesitamos el endpoint y el DTO
                  de despacho de la API.
                </div>
              </div>

              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={cerrarAsignacion}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled
                >
                  Confirmar asignación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
