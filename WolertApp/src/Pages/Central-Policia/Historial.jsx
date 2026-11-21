
import { useEffect, useMemo, useState } from "react";

import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";

import {
  cargarCasosCentral,
  construirCasos,
  kpisHistorial,
  fechaLegible,
  coincideFecha,
} from "../../Services/historialCentralService";

import "../../css/Policia/central-policia/css/historial.css";

function Historial() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("todos");
  const [categoria, setCategoria] = useState("todas");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    setCargando(true);
    setError("");

    cargarCasosCentral(controller.signal)
      .then((resultado) => {
        if (controller.signal.aborted) return;

        setDatos(resultado);
        setError("");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;

        setDatos(null);
        setSeleccion(null);
        setError(
          err?.message ||
          "No se pudo consultar el historial."
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

  const categorias = useMemo(
    () =>
      [...new Set(casos.map((c) => c.tipo).filter(Boolean))]
        .sort(),
    [casos]
  );

  const estados = useMemo(
    () =>
      [...new Set(casos.map((c) => c.estado).filter(Boolean))]
        .sort(),
    [casos]
  );

  const filtrados = useMemo(() => {
    const consulta = busqueda.trim().toLowerCase();

    return casos.filter((caso) => {
      const texto = [
        caso.id,
        caso.descripcion,
        caso.tipo,
        caso.zona,
        caso.unidadNombre,
      ]
        .join(" ")
        .toLowerCase();

      return (
        texto.includes(consulta) &&
        (estado === "todos" || caso.estado === estado) &&
        (categoria === "todas" || caso.tipo === categoria) &&
        coincideFecha(caso.fecha, desde, hasta)
      );
    });
  }, [
    casos,
    busqueda,
    estado,
    categoria,
    desde,
    hasta,
  ]);

  const seleccionado = useMemo(
    () =>
      casos.find((caso) => caso.clave === seleccion) || null,
    [casos, seleccion]
  );

  function actualizar() {
    setCargando(true);
    setError("");
    setSeleccion(null);
    setRecarga((n) => n + 1);
  }

  function limpiar() {
    setBusqueda("");
    setEstado("todos");
    setCategoria("todas");
    setDesde("");
    setHasta("");
  }

  function claseEstado(valor) {
    switch (valor) {
      case "RESUELTA":
        return "historial-estado-resuelta";

      case "CANCELADA":
        return "historial-estado-cancelada";

      case "PENDIENTE":
        return "historial-estado-pendiente";

      case "UNIDAD_ASIGNADA":
      case "EN_ATENCION":
        return "historial-estado-proceso";

      default:
        return "historial-estado-neutral";
    }
  }

  return (
    <>
      <Topbar placeholder="Buscar caso..." />

      <main className="historial-main">
        <header className="historial-header">
          <div>
            <span className="historial-kicker">
              <i className="bi bi-record-circle-fill me-2" />
              CENTRAL DE RADIO
            </span>

            <h1>
              <i className="bi bi-clock-history me-2" />
              Historial
            </h1>

            <p>
              Consulta el registro histórico de alertas,
              asignaciones y atenciones de Central Policía.
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
            No se pudo cargar el historial: {error}
          </div>
        )}

        {datos?.errores?.length > 0 && (
          <div className="alert alert-warning" role="alert">
            <strong>Información complementaria incompleta.</strong>
            <div className="mt-1">
              {datos.errores.join(" | ")}
            </div>
          </div>
        )}

        <Kpis
          grupo="historial"
          valores={
            cargando || error
              ? {}
              : kpisHistorial(casos)
          }
        />

        <section className="historial-panel historial-filtros-panel">
          <div className="historial-filtros">
            <div className="historial-field historial-busqueda">
              <i className="bi bi-search" />

              <input
                type="search"
                className="form-control historial-input"
                placeholder="Buscar caso, descripción o zona..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="historial-field">
              <i className="bi bi-folder2" />

              <select
                className="form-select historial-input"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                aria-label="Estado"
              >
                <option value="todos">
                  Todos los estados
                </option>

                {estados.map((valor) => (
                  <option key={valor} value={valor}>
                    {valor.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="historial-field">
              <i className="bi bi-list-ul" />

              <select
                className="form-select historial-input"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                aria-label="Categoría"
              >
                <option value="todas">
                  Todas las categorías
                </option>

                {categorias.map((valor) => (
                  <option key={valor} value={valor}>
                    {valor}
                  </option>
                ))}
              </select>
            </div>

            <div className="historial-field">
              <input
                type="date"
                className="form-control historial-input"
                aria-label="Desde"
                value={desde}
                max={hasta || undefined}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>

            <div className="historial-field">
              <input
                type="date"
                className="form-control historial-input"
                aria-label="Hasta"
                value={hasta}
                min={desde || undefined}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn historial-btn-filtrar"
              onClick={limpiar}
            >
              <i className="bi bi-arrow-counterclockwise me-2" />
              Limpiar
            </button>
          </div>
        </section>

        <section className="historial-contenido">
          <div className="historial-table-panel">
            <div className="table-responsive">
              <table className="table historial-table mb-0">
                <thead>
                  <tr>
                    <th>FECHA / HORA</th>
                    <th>NÚMERO DE CASO</th>
                    <th>DESCRIPCIÓN</th>
                    <th>ESTADO</th>
                    <th>CATEGORÍA</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>

                <tbody>
                  {!cargando &&
                    !error &&
                    filtrados.map((caso) => (
                      <tr key={caso.clave}>
                        <td>
                          {fechaLegible(caso.fecha)}
                        </td>

                        <td>
                          <strong>
                            #{caso.id ?? "—"}
                          </strong>
                        </td>

                        <td>
                          {caso.descripcion}
                        </td>

                        <td>
                          <span
                            className={`badge historial-badge-estado ${claseEstado(
                              caso.estado
                            )}`}
                          >
                            {caso.estado
                              ? caso.estado.replaceAll("_", " ")
                              : "Sin estado"}
                          </span>
                        </td>

                        <td>{caso.tipo}</td>

                        <td>
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

            {(cargando || error || filtrados.length === 0) && (
              <div className="historial-empty">
                <i className="bi bi-file-earmark-text historial-empty-icon" />

                <h3>
                  {cargando
                    ? "Cargando historial..."
                    : error
                      ? "Error al consultar"
                      : "No hay resultados"}
                </h3>

                <p>
                  {cargando
                    ? "Consultando los casos registrados."
                    : error
                      ? "Comprueba la conexión con la API."
                      : "No hay casos que coincidan con los filtros."}
                </p>
              </div>
            )}
          </div>

          <aside className="historial-detalle-panel">
            <div className="historial-detalle-header">
              <h2>Detalle del caso</h2>

              <button
                type="button"
                className="historial-detalle-cerrar"
                aria-label="Cerrar detalle"
                onClick={() => setSeleccion(null)}
                disabled={!seleccionado}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="historial-detalle-body">
              {!seleccionado || cargando || error ? (
                <p className="text-muted">
                  Selecciona un caso de la tabla para
                  consultar su información.
                </p>
              ) : (
                [
                  [
                    "Número de caso",
                    `#${seleccionado.id ?? "—"}`,
                  ],
                  [
                    "Fecha / Hora",
                    fechaLegible(seleccionado.fecha),
                  ],
                  [
                    "Descripción",
                    seleccionado.descripcion,
                  ],
                  [
                    "Estado",
                    seleccionado.estado?.replaceAll("_", " ") || "—",
                  ],
                  ["Categoría", seleccionado.tipo],
                  [
                    "Prioridad",
                    seleccionado.prioridad || "—",
                  ],
                  ["Zona", seleccionado.zona],
                  [
                    "Unidad asignada",
                    seleccionado.unidadNombre,
                  ],
                  [
                    "Estado de asignación",
                    seleccionado.estadoAsignacion?.replaceAll(
                      "_",
                      " "
                    ) || "—",
                  ],
                  [
                    "Resultado de atención",
                    seleccionado.resultado,
                  ],
                  [
                    "Observaciones",
                    seleccionado.observaciones,
                  ],
                  [
                    "Atenciones registradas",
                    seleccionado.totalAtenciones,
                  ],
                  [
                    "Asignaciones registradas",
                    seleccionado.totalAsignaciones,
                  ],
                ].map(([etiqueta, valor]) => (
                  <div
                    className="historial-detalle-item"
                    key={etiqueta}
                  >
                    <span>{etiqueta}:</span>
                    <strong>{valor}</strong>
                  </div>
                ))
              )}
            </div>

            <div className="historial-detalle-footer">
              <button
                type="button"
                className="btn historial-btn-cerrar"
                onClick={() => setSeleccion(null)}
                disabled={!seleccionado}
              >
                Cerrar
              </button>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}

export default Historial;
