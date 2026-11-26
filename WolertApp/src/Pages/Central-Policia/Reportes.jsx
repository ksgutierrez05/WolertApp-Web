import { useEffect, useMemo, useState } from "react";
import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";
import { useFeedback } from "../../Components/Feedback/useFeedback";
import {
  cargarCasosCentral,
  construirCasos,
  kpisReportes,
  fechaLegible,
  coincideFecha,
} from "../../Services/reportesCentralService";
import "../../css/Policia/central-policia/css/reportes.css";

const mostrar = (valor) =>
  valor === null || valor === undefined || String(valor).trim() === ""
    ? "No registrado"
    : String(valor).replaceAll("_", " ");

const codigoInforme = (caso) =>
  `WLT-POL-AL-${String(caso.id ?? "0").padStart(5, "0")}`;

function Reportes() {
  const { toast } = useFeedback();
  // Datos y carga
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  // Filtros
  const [tipo, setTipo] = useState("todos");
  const [prioridad, setPrioridad] = useState("todas");
  const [estado, setEstado] = useState("todos");
  const [resultado, setResultado] = useState("todos");
  const [unidad, setUnidad] = useState("todas");
  const [zona, setZona] = useState("todas");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  // Selección y paginación
  const [seleccion, setSeleccion] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 10;

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setError("");
    cargarCasosCentral(controller.signal)
      .then((respuesta) => {
        if (controller.signal.aborted) return;
        setDatos(respuesta);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setDatos(null);
        setSeleccion(null);
        setError(err?.message || "No se pudieron consultar los reportes.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false);
      });
    return () => controller.abort();
  }, [recarga]);

  // Casos, búsqueda y paginación
  const casos = useMemo(() => (datos ? construirCasos(datos) : []), [datos]);
  const opciones = (campo) =>
    [...new Set(casos.map((c) => c[campo]).filter(Boolean))].sort();
  const filtrados = useMemo(
    () =>
      casos.filter(
        (c) =>
          (!busqueda.trim() ||
            [
              c.id,
              c.tipo,
              c.descripcion,
              c.zona,
              c.unidadNombre,
              c.estado,
            ].some((v) =>
              String(v ?? "")
                .toLowerCase()
                .includes(busqueda.trim().toLowerCase()),
            )) &&
          (tipo === "todos" || c.tipo === tipo) &&
          (prioridad === "todas" || c.prioridad === prioridad) &&
          (estado === "todos" || c.estado === estado) &&
          (resultado === "todos" || c.resultado === resultado) &&
          (unidad === "todas" || c.unidadNombre === unidad) &&
          (zona === "todas" || c.zona === zona) &&
          coincideFecha(c.fecha, desde, hasta),
      ),
    [
      casos,
      busqueda,
      tipo,
      prioridad,
      estado,
      resultado,
      unidad,
      zona,
      desde,
      hasta,
    ],
  );
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );
  useEffect(() => {
    setPagina(1);
  }, [
    busqueda,
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
    () => casos.find((c) => c.clave === seleccion) || null,
    [casos, seleccion],
  );

  // Configuración de los selectores
  const filtros = [
    {
      id: "tipo",
      label: "Tipo de alerta",
      valor: tipo,
      setter: setTipo,
      base: "todos",
      texto: "Todos los tipos",
      campo: "tipo",
    },
    {
      id: "prioridad",
      label: "Prioridad",
      valor: prioridad,
      setter: setPrioridad,
      base: "todas",
      texto: "Todas las prioridades",
      campo: "prioridad",
    },
    {
      id: "estado",
      label: "Estado",
      valor: estado,
      setter: setEstado,
      base: "todos",
      texto: "Todos los estados",
      campo: "estado",
    },
    {
      id: "resultado",
      label: "Resultado",
      valor: resultado,
      setter: setResultado,
      base: "todos",
      texto: "Todos los resultados",
      campo: "resultado",
    },
    {
      id: "unidad",
      label: "Unidad",
      valor: unidad,
      setter: setUnidad,
      base: "todas",
      texto: "Todas las unidades",
      campo: "unidadNombre",
    },
    {
      id: "zona",
      label: "Zona",
      valor: zona,
      setter: setZona,
      base: "todas",
      texto: "Todas las zonas",
      campo: "zona",
    },
  ];

  // Acciones
  function limpiar() {
    setTipo("todos");
    setPrioridad("todas");
    setEstado("todos");
    setResultado("todos");
    setUnidad("todas");
    setZona("todas");
    setDesde("");
    setHasta("");
    setBusqueda("");
    setPagina(1);
  }

  function exportarCSV() {
    if (cargando || error) return;
    if (!filtrados.length) {
      toast.warning("No hay informes que coincidan con los filtros actuales.", "Sin datos para exportar");
      return;
    }
    const columnas = [
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
    const filas = filtrados.map((c) => [
      c.id,
      fechaLegible(c.fecha),
      c.tipo,
      c.prioridad,
      c.zona,
      c.unidadNombre,
      c.estado,
      c.resultado,
      c.descripcion,
      c.observaciones,
    ]);
    const escapar = (valor) => {
      let s = String(valor ?? "");
      if (/^\s*[=+\-@\t\r]/.test(s)) s = "'" + s;
      return '"' + s.replace(/"/g, '""') + '"';
    };
    const csv = [columnas, ...filas]
      .map((fila) => fila.map(escapar).join(";"))
      .join("\r\n");
    try {
      const url = URL.createObjectURL(
        new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "informes-central-policia.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("El archivo CSV se generó correctamente.", "Exportación lista");
    } catch (err) {
      toast.errorFrom(err, "No fue posible exportar los informes.", "Error al exportar");
    }
  }

  // Datos del informe imprimible
  const campos = seleccionado
    ? [
        ["Código de referencia", codigoInforme(seleccionado)],
        ["Número de alerta", seleccionado.id],
        ["Tipo de incidente", seleccionado.tipo],
        ["Ubicación registrada", seleccionado.zona],
        ["Fecha de alerta", fechaLegible(seleccionado.fecha)],
        ["Prioridad", seleccionado.prioridad],
        ["Estado de alerta", seleccionado.estado],
        ["Unidad policial", seleccionado.unidadNombre],
        ["Estado de asignación", seleccionado.estadoAsignacion],
        ["Resultado registrado", seleccionado.resultado],
        ["Asignaciones registradas", seleccionado.totalAsignaciones],
        ["Atenciones registradas", seleccionado.totalAtenciones],
        [
          "Última atención",
          seleccionado.fechaAtencion
            ? fechaLegible(seleccionado.fechaAtencion)
            : null,
        ],
        ["Informe registrado", seleccionado.conInforme ? "Sí" : "No"],
      ]
    : [];

  return (
    <>
      <Topbar placeholder="Buscar caso, unidad o zona..." />
      <main className="main-dash reportes-page">
        <div className="container-fluid">
          <header className="reportes-header">
            <div>
              <h1 className="reportes-titulo">Reportes</h1>
              <p>
                Consulta, analiza y genera informes de los casos gestionados por
                Central Policía.
              </p>
            </div>

          </header>
          {error && (
            <div className="alert alert-danger" role="alert">
              No se pudieron cargar los reportes: {error}
            </div>
          )}
          {datos?.errores?.length > 0 && (
            <div className="alert alert-warning" role="alert">
              Información complementaria incompleta: {datos.errores.join(" | ")}
            </div>
          )}
          <Kpis
            grupo="reportes"
            valores={cargando || error ? {} : kpisReportes(casos)}
          />

          {/* Barra de filtros: dos filas completas de cinco columnas */}
          <section
            className="card-panel-dash reportes-filtros"
            aria-label="Filtros de reportes"
          >
            <div className="reportes-barra-filtros">
              <div className="reportes-busqueda">
                <i className="bi bi-search" aria-hidden="true" />
                <input
                  aria-label="Buscar casos"
                  placeholder="Buscar caso, tipo o zona..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              {filtros.map((f) => (
                <select
                  key={f.id}
                  className="reportes-select"
                  aria-label={f.label}
                  title={f.label}
                  value={f.valor}
                  onChange={(e) => f.setter(e.target.value)}
                >
                  <option value={f.base}>{f.texto}</option>
                  {opciones(f.campo).map((v) => (
                    <option key={v} value={v}>
                      {mostrar(v)}
                    </option>
                  ))}
                </select>
              ))}
              <input
                className="reportes-fecha"
                aria-label="Fecha desde"
                title="Desde"
                type="date"
                value={desde}
                max={hasta || undefined}
                onChange={(e) => setDesde(e.target.value)}
              />
              <input
                className="reportes-fecha"
                aria-label="Fecha hasta"
                title="Hasta"
                type="date"
                value={hasta}
                min={desde || undefined}
                onChange={(e) => setHasta(e.target.value)}
              />
              <button
                type="button"
                className="reportes-btn reportes-btn-principal reportes-limpiar"
                onClick={limpiar}
              >
                <i
                  className="bi bi-arrow-counterclockwise"
                  aria-hidden="true"
                />{" "}
                Limpiar
              </button>
            </div>
          </section>

          {/* Tabla paginada e informe institucional */}
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
                  className="reportes-btn reportes-btn-principal"
                  onClick={exportarCSV}
                  disabled={cargando || Boolean(error) || !filtrados.length}
                >
                  <i
                    className="bi bi-file-earmark-spreadsheet"
                    aria-hidden="true"
                  />{" "}
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
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!cargando &&
                      !error &&
                      visibles.map((c) => (
                        <tr key={c.clave}>
                          <td className="reportes-id">#{c.id ?? "—"}</td>
                          <td className="reportes-tipo">{mostrar(c.tipo)}</td>
                          <td>
                            <span
                              className={`reportes-estado prioridad-${String(c.prioridad || "").toLowerCase()}`}
                            >
                              {mostrar(c.prioridad)}
                            </span>
                          </td>
                          <td>{mostrar(c.zona)}</td>
                          <td>{mostrar(c.unidadNombre)}</td>
                          <td>{mostrar(c.resultado)}</td>
                          <td>
                            <span className="reportes-estado estado-alerta">
                              {mostrar(c.estado)}
                            </span>
                          </td>
                          <td className="ver-detalles-cell">
                            <button
                              type="button"
                              className="reportes-btn-ver btn-ver-detalles"
                              onClick={() => setSeleccion(c.clave)}
                              aria-label={`Ver detalles del caso ${c.id}`}
                              title="Ver detalles"
                            >
                              <i className="bi bi-eye-fill" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {(cargando || error || !filtrados.length) && (
                <div className="reportes-vacio">
                  <i className="bi bi-file-earmark-text" aria-hidden="true" />
                  <strong>
                    {cargando
                      ? "Cargando casos..."
                      : error
                        ? "Error al consultar los casos"
                        : "No hay casos para mostrar"}
                  </strong>
                  <span>
                    {error
                      ? "Comprueba la conexión con el backend."
                      : "Modifica los filtros si es necesario."}
                  </span>
                </div>
              )}
              {!cargando && !error && filtrados.length > 0 && (
                <nav
                  className="reportes-paginacion"
                  aria-label="Paginación de casos"
                >
                  <span>
                    Mostrando {(paginaActual - 1) * POR_PAGINA + 1}–
                    {Math.min(paginaActual * POR_PAGINA, filtrados.length)} de{" "}
                    {filtrados.length} casos
                  </span>
                  <div className="reportes-paginacion-controles">
                    <button
                      type="button"
                      disabled={paginaActual === 1}
                      onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    >
                      <i className="bi bi-chevron-left" aria-hidden="true" />{" "}
                      Anterior
                    </button>
                    <strong>
                      {paginaActual} / {totalPaginas}
                    </strong>
                    <button
                      type="button"
                      disabled={paginaActual === totalPaginas}
                      onClick={() =>
                        setPagina((p) => Math.min(totalPaginas, p + 1))
                      }
                    >
                      Siguiente{" "}
                      <i className="bi bi-chevron-right" aria-hidden="true" />
                    </button>
                  </div>
                </nav>
              )}
            </section>

            <section className="card-panel-dash reportes-informe-preview">
              <div className="reportes-tabla-header">
                <div>
                  <h2>Vista previa del informe</h2>
                  <span>Detalle institucional del caso seleccionado</span>
                </div>
                <button
                  type="button"
                  className="reportes-btn reportes-btn-principal"
                  disabled={!seleccionado || cargando || Boolean(error)}
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer" aria-hidden="true" /> Imprimir
                  informe
                </button>
              </div>
              {!seleccionado || cargando || error ? (
                <div className="reportes-vacio">
                  <i className="bi bi-file-earmark-text" aria-hidden="true" />
                  <strong>Selecciona un caso</strong>
                  <span>Su informe aparecerá aquí.</span>
                </div>
              ) : (
                <article
                  className="reporte-documento"
                  aria-label="Informe institucional de Policía"
                >
                  <header className="reporte-documento-cabecera">
                    <div className="reporte-documento-sello">
                      <img src="/img/logopolicia.png" alt="Logo de Policía" />
                    </div>
                    <div>
                      <strong>WOLERTAPP</strong>
                      <h2>CENTRAL DE POLICÍA</h2>
                      <p>INFORME DE ATENCIÓN DE INCIDENTE</p>
                    </div>
                  </header>
                  <div className="reporte-documento-meta">
                    <span>
                      <b>Código de referencia:</b> {codigoInforme(seleccionado)}
                    </span>
                    <span>
                      <b>Fecha de emisión:</b>{" "}
                      {new Date().toLocaleString("es-CO", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div className="reporte-documento-franja">
                    INFORME INSTITUCIONAL DE ATENCIÓN
                  </div>
                  <h3 className="reporte-documento-seccion">
                    1. INFORMACIÓN GENERAL DEL CASO
                  </h3>
                  <table className="reporte-documento-datos">
                    <tbody>
                      {campos.map(([etiqueta, valor]) => (
                        <tr key={etiqueta}>
                          <th scope="row">{etiqueta}</th>
                          <td>{mostrar(valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h3 className="reporte-documento-seccion">
                    2. DESCRIPCIÓN DE LOS HECHOS
                  </h3>
                  <p className="reporte-documento-texto">
                    {mostrar(seleccionado.descripcion)}
                  </p>
                  <h3 className="reporte-documento-seccion">
                    3. ACTUACIONES REALIZADAS
                  </h3>
                  <p className="reporte-documento-texto">
                    {mostrar(
                      seleccionado.actuaciones ?? seleccionado.detalleAtencion,
                    )}
                  </p>
                  <h3 className="reporte-documento-seccion">
                    4. OBSERVACIONES REGISTRADAS
                  </h3>
                  <p className="reporte-documento-texto">
                    {mostrar(seleccionado.observaciones)}
                  </p>
                  <h3 className="reporte-documento-seccion">
                    5. RESULTADO DE LA ATENCIÓN
                  </h3>
                  <p className="reporte-documento-texto">
                    Resultado registrado:{" "}
                    <strong>{mostrar(seleccionado.resultado)}</strong>.
                  </p>
                  <h3 className="reporte-documento-seccion">
                    6. RESPONSABLE DE LA ENTREGA DEL INFORME
                  </h3>
                  <div className="reporte-documento-responsable">
                    <p>
                      <b>Dependencia:</b> Central de Policía
                    </p>
                    <p>
                      <b>Nombre completo:</b> __________________________
                    </p>
                    <p>
                      <b>Cargo:</b> __________________________
                    </p>
                    <div className="reporte-documento-firma">
                      Firma de quien entrega el informe
                    </div>
                  </div>
                  <footer className="reporte-documento-pie">
                    Generado mediante WOLERTAPP a partir de registros del
                    sistema.
                    <span>Documento sujeto a validación institucional.</span>
                  </footer>
                </article>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export default Reportes;
