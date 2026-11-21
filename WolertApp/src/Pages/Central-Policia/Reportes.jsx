
import { useEffect, useMemo, useState } from "react";

import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";

import {
  cargarCasosCentral,
  construirCasos,
  kpisReportes,
  fechaLegible,
  coincideFecha,
} from "../../Services/reportesCentralService";

import "../../css/Policia/central-policia/css/reportes.css";

function Reportes() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  const [tipo, setTipo] = useState("todos");
  const [prioridad, setPrioridad] = useState("todas");
  const [estado, setEstado] = useState("todos");
  const [resultado, setResultado] = useState("todos");
  const [unidad, setUnidad] = useState("todas");
  const [zona, setZona] = useState("todas");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    setCargando(true);
    setError("");

    cargarCasosCentral(controller.signal)
      .then((respuesta) => {
        if (controller.signal.aborted) return;

        setDatos(respuesta);
        setError("");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;

        setDatos(null);
        setSeleccion(null);
        setError(
          err?.message ||
          "No se pudieron consultar los reportes."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, [recarga]);

  const casos = useMemo(
    () => (datos ? construirCasos(datos) : []),
    [datos]
  );

  const opciones = (nombreCampo) =>
    [
      ...new Set(
        casos
          .map((caso) => caso[nombreCampo])
          .filter(Boolean)
      ),
    ].sort();

  const filtrados = useMemo(() => {
    return casos.filter(
      (caso) =>
        (tipo === "todos" || caso.tipo === tipo) &&
        (prioridad === "todas" ||
          caso.prioridad === prioridad) &&
        (estado === "todos" || caso.estado === estado) &&
        (resultado === "todos" ||
          caso.resultado === resultado) &&
        (unidad === "todas" ||
          caso.unidadNombre === unidad) &&
        (zona === "todas" || caso.zona === zona) &&
        coincideFecha(caso.fecha, desde, hasta)
    );
  }, [
    casos,
    tipo,
    prioridad,
    estado,
    resultado,
    unidad,
    zona,
    desde,
    hasta,
  ]);

  const seleccionado = useMemo(
    () =>
      casos.find((caso) => caso.clave === seleccion) || null,
    [casos, seleccion]
  );

  function limpiar() {
    setTipo("todos");
    setPrioridad("todas");
    setEstado("todos");
    setResultado("todos");
    setUnidad("todas");
    setZona("todas");
    setDesde("");
    setHasta("");
  }

  function actualizar() {
    setCargando(true);
    setError("");
    setSeleccion(null);
    setRecarga((n) => n + 1);
  }

  function exportarCSV() {
    if (filtrados.length === 0 || cargando || error) {
      return;
    }

    const encabezados = [
      "Caso",
      "Fecha",
      "Tipo",
      "Prioridad",
      "Zona",
      "Unidad",
      "Estado",
      "Resultado",
      "Descripción",
      "Observaciones",
    ];

    const filas = filtrados.map((caso) => [
      caso.id,
      fechaLegible(caso.fecha),
      caso.tipo,
      caso.prioridad,
      caso.zona,
      caso.unidadNombre,
      caso.estado,
      caso.resultado,
      caso.descripcion,
      caso.observaciones,
    ]);

    function escaparCSV(valor) {
      let texto = String(valor ?? "");

      // Evita que Excel interprete valores
      // procedentes de la API como fórmulas.
      if (/^\s*[=+\-@\t\r]/.test(texto)) {
        texto = `'${texto}`;
      }

      return `"${texto.replace(/"/g, '""')}"`;
    }

    const contenido = [
      encabezados,
      ...filas,
    ]
      .map((fila) => fila.map(escaparCSV).join(";"))
      .join("\r\n");

    const archivo = new Blob(
      ["\uFEFF", contenido],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "informes-central-policia.csv";

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const filtros = [
    {
      id: "filtroTipo",
      label: "Tipo",
      value: tipo,
      setter: setTipo,
      defaultValue: "todos",
      defaultLabel: "Todos los tipos",
      opciones: opciones("tipo"),
    },
    {
      id: "filtroPrioridad",
      label: "Prioridad",
      value: prioridad,
      setter: setPrioridad,
      defaultValue: "todas",
      defaultLabel: "Todas",
      opciones: opciones("prioridad"),
    },
    {
      id: "filtroEstado",
      label: "Estado",
      value: estado,
      setter: setEstado,
      defaultValue: "todos",
      defaultLabel: "Todos",
      opciones: opciones("estado"),
    },
    {
      id: "filtroResultado",
      label: "Resultado",
      value: resultado,
      setter: setResultado,
      defaultValue: "todos",
      defaultLabel: "Todos",
      opciones: opciones("resultado"),
    },
    {
      id: "filtroUnidad",
      label: "Unidad",
      value: unidad,
      setter: setUnidad,
      defaultValue: "todas",
      defaultLabel: "Todas las unidades",
      opciones: opciones("unidadNombre"),
    },
    {
      id: "filtroZona",
      label: "Zona",
      value: zona,
      setter: setZona,
      defaultValue: "todas",
      defaultLabel: "Todas las zonas",
      opciones: opciones("zona"),
    },
  ];

  const puedeImprimir =
    Boolean(seleccionado) && !cargando && !error;

  return (
    <>
      <Topbar placeholder="Buscar caso, unidad o zona..." />

      <main className="main-dash reportes-page">
        <div className="container-fluid">
          <header className="reportes-header">
            <div>
              <h1 className="reportes-titulo">
                Reportes
              </h1>

              <p>
                Consulta, analiza y genera informes
                de los casos gestionados por Central Policía.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={actualizar}
              disabled={cargando}
            >
              <i className="bi bi-arrow-clockwise me-2" />
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>
          </header>

          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2" />
              No se pudieron cargar los reportes: {error}
            </div>
          )}

          {datos?.errores?.length > 0 && (
            <div className="alert alert-warning" role="alert">
              <strong>
                Información complementaria incompleta:
              </strong>{" "}
              {datos.errores.join(" | ")}
            </div>
          )}

          <Kpis
            grupo="reportes"
            valores={
              cargando || error
                ? {}
                : kpisReportes(casos)
            }
          />

          <section className="card-panel-dash reportes-filtros">
            <div className="reportes-filtros-titulo">
              <div>
                <i className="bi bi-funnel me-2" />
                Filtros de búsqueda

                <p>
                  Selecciona los criterios para consultar
                  los casos registrados.
                </p>
              </div>

              <button
                type="button"
                className="btn reportes-btn-limpiar"
                onClick={limpiar}
              >
                <i className="bi bi-arrow-counterclockwise me-1" />
                Limpiar
              </button>
            </div>

            <div className="reportes-filtros-grid">
              {filtros.map((filtro) => (
                <div key={filtro.id}>
                  <label htmlFor={filtro.id}>
                    {filtro.label}
                  </label>

                  <select
                    id={filtro.id}
                    className="form-select"
                    value={filtro.value}
                    onChange={(e) =>
                      filtro.setter(e.target.value)
                    }
                  >
                    <option value={filtro.defaultValue}>
                      {filtro.defaultLabel}
                    </option>

                    {filtro.opciones.map((opcion) => (
                      <option key={opcion} value={opcion}>
                        {String(opcion).replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <div>
                <label htmlFor="filtroDesde">
                  Desde
                </label>

                <input
                  id="filtroDesde"
                  type="date"
                  className="form-control"
                  value={desde}
                  max={hasta || undefined}
                  onChange={(e) =>
                    setDesde(e.target.value)
                  }
                />
              </div>

              <div>
                <label htmlFor="filtroHasta">
                  Hasta
                </label>

                <input
                  id="filtroHasta"
                  type="date"
                  className="form-control"
                  value={hasta}
                  min={desde || undefined}
                  onChange={(e) =>
                    setHasta(e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          <div className="reportes-contenido">
            <section className="card-panel-dash reportes-tabla-panel">
              <div className="reportes-tabla-header">
                <div>
                  <h2>Casos gestionados</h2>

                  <span>
                    {cargando
                      ? "Consultando casos..."
                      : `${filtrados.length} casos encontrados`}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn reportes-btn-principal"
                  onClick={exportarCSV}
                  disabled={
                    cargando ||
                    Boolean(error) ||
                    filtrados.length === 0
                  }
                >
                  <i className="bi bi-file-earmark-spreadsheet me-2" />
                  Exportar CSV
                </button>
              </div>

              <div className="table-responsive">
                <table className="table reportes-tabla">
                  <thead>
                    <tr>
                      <th>Caso</th>
                      <th>Tipo</th>
                      <th>Prioridad</th>
                      <th>Zona</th>
                      <th>Unidad</th>
                      <th>Resultado</th>
                      <th>Estado</th>
                      <th className="text-end">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {!cargando &&
                      !error &&
                      filtrados.map((caso) => (
                        <tr key={caso.clave}>
                          <td>
                            <strong>
                              #{caso.id ?? "—"}
                            </strong>
                          </td>

                          <td>{caso.tipo}</td>

                          <td>
                            {caso.prioridad || "—"}
                          </td>

                          <td>{caso.zona}</td>

                          <td>{caso.unidadNombre}</td>

                          <td>{caso.resultado}</td>

                          <td>
                            {caso.estado
                              ? caso.estado.replaceAll("_", " ")
                              : "—"}
                          </td>

                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                setSeleccion(caso.clave)
                              }
                            >
                              <i className="bi bi-eye me-1" />
                              Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {(cargando ||
                error ||
                filtrados.length === 0) && (
                <div className="reportes-vacio">
                  <i className="bi bi-file-earmark-x" />

                  <strong>
                    {cargando
                      ? "Cargando casos..."
                      : error
                        ? "Error al consultar los casos"
                        : "No hay reportes para mostrar"}
                  </strong>

                  <span>
                    {cargando
                      ? "Consultando información de la API."
                      : error
                        ? "Comprueba la conexión con el backend."
                        : "No hay casos que coincidan con los filtros."}
                  </span>
                </div>
              )}
            </section>

            <aside className="card-panel-dash reportes-informe-preview">
              <div className="reportes-tabla-header">
                <div>
                  <h2>Vista previa del informe</h2>
                  <span>
                    Detalle del caso seleccionado
                  </span>
                </div>

                <button
                  type="button"
                  className="btn reportes-btn-limpiar"
                  onClick={() => window.print()}
                  disabled={!puedeImprimir}
                >
                  <i className="bi bi-printer me-1" />
                  Imprimir
                </button>
              </div>

              <div className="reportes-informe-body">
                {!seleccionado || cargando || error ? (
                  <div className="reportes-vacio">
                    <i className="bi bi-file-earmark-text" />

                    <strong>
                      Selecciona un caso
                    </strong>

                    <span>
                      Su información aparecerá aquí.
                    </span>
                  </div>
                ) : (
                  <>
                    <section className="informe-seccion">
                      <h3 className="informe-titulo">
                        Información general
                      </h3>

                      <div className="informe-grid">
                        {[
                          [
                            "Número de caso",
                            `#${seleccionado.id ?? "—"}`,
                          ],
                          [
                            "Fecha y hora",
                            fechaLegible(seleccionado.fecha),
                          ],
                          [
                            "Tipo de alerta",
                            seleccionado.tipo,
                          ],
                          [
                            "Prioridad",
                            seleccionado.prioridad || "—",
                          ],
                          [
                            "Zona",
                            seleccionado.zona,
                          ],
                          [
                            "Unidad",
                            seleccionado.unidadNombre,
                          ],
                          [
                            "Estado de alerta",
                            seleccionado.estado?.replaceAll(
                              "_",
                              " "
                            ) || "—",
                          ],
                          [
                            "Estado de asignación",
                            seleccionado.estadoAsignacion?.replaceAll(
                              "_",
                              " "
                            ) || "—",
                          ],
                          [
                            "Resultado",
                            seleccionado.resultado,
                          ],
                        ].map(([etiqueta, valor]) => (
                          <div
                            className="informe-dato"
                            key={etiqueta}
                          >
                            <span className="informe-dato-label">
                              {etiqueta}
                            </span>

                            <strong className="informe-dato-valor">
                              {valor}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="informe-seccion">
                      <h3 className="informe-titulo">
                        Descripción del caso
                      </h3>

                      <div className="informe-texto">
                        {seleccionado.descripcion}
                      </div>
                    </section>

                    <section className="informe-seccion">
                      <h3 className="informe-titulo">
                        Observaciones de atención
                      </h3>

                      <div className="informe-texto informe-central">
                        {seleccionado.observaciones}
                      </div>
                    </section>

                    <section className="informe-seccion">
                      <h3 className="informe-titulo">
                        Información de atención
                      </h3>

                      <div className="informe-grid">
                        {[
                          [
                            "Atenciones registradas",
                            seleccionado.totalAtenciones,
                          ],
                          [
                            "Asignaciones registradas",
                            seleccionado.totalAsignaciones,
                          ],
                          [
                            "Última atención",
                            fechaLegible(
                              seleccionado.fechaAtencion
                            ),
                          ],
                          [
                            "Informe registrado",
                            seleccionado.conInforme
                              ? "Sí"
                              : "No",
                          ],
                        ].map(([etiqueta, valor]) => (
                          <div
                            className="informe-dato"
                            key={etiqueta}
                          >
                            <span className="informe-dato-label">
                              {etiqueta}
                            </span>

                            <strong className="informe-dato-valor">
                              {valor}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

export default Reportes;
