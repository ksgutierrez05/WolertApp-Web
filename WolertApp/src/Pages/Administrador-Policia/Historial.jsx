
import { useEffect, useMemo, useState } from "react";
import { obtenerHistorial } from "../../Services/HistorialEstadisticasService";
import "../../css/Policia/administrador-policia/css/historial.css";

// ========================================
// FUNCIONES AUXILIARES
// ========================================

function obtenerCampo(objeto, ...claves) {
  if (!objeto || typeof objeto !== "object") return null;

  for (const clave of claves) {
    const valor = objeto[clave];

    if (valor !== undefined && valor !== null && valor !== "") {
      return valor;
    }
  }

  return null;
}

function normalizar(valor) {
  return String(valor ?? "")
    .trim()
    .toUpperCase()
    .replace(/_/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obtenerEstado(atencion, asignacion, alerta) {
  return (
    obtenerCampo(
      atencion,
      "estado",
      "Estado",
      "estadoAtencion",
      "EstadoAtencion",
      "estadoFinal",
      "EstadoFinal"
    ) ||
    obtenerCampo(
      asignacion,
      "estadoAsignacion",
      "EstadoAsignacion",
      "estado",
      "Estado"
    ) ||
    obtenerCampo(alerta, "estado", "Estado") ||
    "SIN ESTADO"
  );
}

function clasificarEstado(estado) {
  const valor = normalizar(estado);

  if (
    [
      "FINALIZADA",
      "FINALIZADO",
      "RESUELTA",
      "RESUELTO",
      "COMPLETADA",
      "COMPLETADO",
      "CERRADA",
      "CERRADO",
      "CANCELADA",
      "CANCELADO",
    ].includes(valor)
  ) {
    return "finalizada";
  }

  if (
    [
      "EN PROCESO",
      "EN ATENCION",
      "EN CAMINO",
      "ASIGNADA",
      "ACTIVA",
      "EN SITIO",
      "UNIDAD ASIGNADA",
    ].includes(valor)
  ) {
    return "enProceso";
  }

  if (
    ["PENDIENTE", "NUEVA", "SIN ASIGNAR"].includes(valor)
  ) {
    return "pendiente";
  }

  return "otro";
}

function obtenerFecha(atencion) {
  return obtenerCampo(
    atencion,
    "fechaAtencion",
    "FechaAtencion",
    "fechaInicio",
    "FechaInicio",
    "fechaCreacion",
    "FechaCreacion",
    "fechaAsignacion",
    "FechaAsignacion",
    "fecha",
    "Fecha"
  );
}

function fechaValida(fecha) {
  if (!fecha) return null;

  const resultado = new Date(fecha);

  return Number.isNaN(resultado.getTime())
    ? null
    : resultado;
}

function formatearFecha(fecha) {
  const valor = fechaValida(fecha);

  if (!valor) return "Fecha no disponible";

  return valor.toLocaleString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function coincideFecha(fecha, filtro) {
  if (filtro === "todas") return true;

  const registro = fechaValida(fecha);

  if (!registro) return false;

  const hoy = new Date();

  if (filtro === "hoy") {
    return registro.toDateString() === hoy.toDateString();
  }

  if (filtro === "semana") {
    const inicio = new Date(hoy);
    const dia = (hoy.getDay() + 6) % 7;

    inicio.setDate(hoy.getDate() - dia);
    inicio.setHours(0, 0, 0, 0);

    return registro >= inicio && registro <= hoy;
  }

  if (filtro === "mes") {
    return (
      registro.getMonth() === hoy.getMonth() &&
      registro.getFullYear() === hoy.getFullYear()
    );
  }

  return true;
}

const TARJETAS = [
  {
    clave: "total",
    titulo: "Total de atenciones",
    icono: "bi-clock-history",
    tono: "azul",
  },
  {
    clave: "finalizadas",
    titulo: "Finalizadas",
    icono: "bi-check-circle-fill",
    tono: "verde",
  },
  {
    clave: "enProceso",
    titulo: "En proceso",
    icono: "bi-arrow-repeat",
    tono: "ambar",
  },
  {
    clave: "pendientes",
    titulo: "Pendientes",
    icono: "bi-hourglass-split",
    tono: "rojo",
  },
];

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

function Historial() {
  const [datos, setDatos] = useState({
    atenciones: [],
    asignaciones: [],
    alertas: [],
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  const [filtroFecha, setFiltroFecha] = useState("todas");
  const [filtroUnidad, setFiltroUnidad] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // ========================================
  // CONSULTAR HISTORIAL REAL
  // ========================================

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarDatos() {
      try {
        const resultado = await obtenerHistorial(
          controlador.signal
        );

        if (controlador.signal.aborted) return;

        setDatos({
          atenciones: Array.isArray(resultado?.atenciones)
            ? resultado.atenciones
            : [],
          asignaciones: Array.isArray(resultado?.asignaciones)
            ? resultado.asignaciones
            : [],
          alertas: Array.isArray(resultado?.alertas)
            ? resultado.alertas
            : [],
        });

        setError("");
      } catch (err) {
        if (
          controlador.signal.aborted ||
          err.name === "AbortError"
        ) {
          return;
        }

        setError(
          err.message || "No se pudo cargar el historial."
        );
      } finally {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => controlador.abort();
  }, [recarga]);

  function actualizarHistorial() {
    if (cargando) return;

    setCargando(true);
    setError("");
    setRecarga((anterior) => anterior + 1);
  }

  function limpiarFiltros() {
    setFiltroFecha("todas");
    setFiltroUnidad("todas");
    setFiltroEstado("todos");
    setBusqueda("");
  }

  // ========================================
  // RELACIONAR ATENCIONES CON ASIGNACIONES
  // Y ALERTAS
  // ========================================

  const registros = useMemo(() => {
    const { atenciones, asignaciones, alertas } = datos;

    return atenciones.map((atencion, indice) => {
      const idAsignacion = obtenerCampo(
        atencion,
        "idAsignacion",
        "IdAsignacion"
      );

      const idAlertaAtencion = obtenerCampo(
        atencion,
        "idAlerta",
        "IdAlerta"
      );

      const asignacion =
        asignaciones.find((item) => {
          const id = obtenerCampo(
            item,
            "idAsignacion",
            "IdAsignacion"
          );

          return (
            idAsignacion != null &&
            id != null &&
            String(id) === String(idAsignacion)
          );
        }) ||
        (idAlertaAtencion != null
          ? asignaciones.find((item) => {
              const id = obtenerCampo(
                item,
                "idAlerta",
                "IdAlerta"
              );

              return (
                id != null &&
                String(id) === String(idAlertaAtencion)
              );
            })
          : null);

      const idAlerta =
        idAlertaAtencion ??
        obtenerCampo(
          asignacion,
          "idAlerta",
          "IdAlerta"
        );

      const alerta = alertas.find((item) => {
        const id = obtenerCampo(
          item,
          "idAlerta",
          "IdAlerta"
        );

        return (
          idAlerta != null &&
          id != null &&
          String(id) === String(idAlerta)
        );
      });

      const estado = obtenerEstado(
        atencion,
        asignacion,
        alerta
      );

      const unidad =
        obtenerCampo(
          atencion,
          "nombreUnidad",
          "NombreUnidad",
          "unidadNombre",
          "UnidadNombre"
        ) ||
        obtenerCampo(
          asignacion,
          "nombreUnidad",
          "NombreUnidad",
          "unidadNombre",
          "UnidadNombre"
        ) ||
        obtenerCampo(
          atencion.unidad || atencion.Unidad,
          "nombre",
          "Nombre"
        ) ||
        obtenerCampo(
          asignacion?.unidad || asignacion?.Unidad,
          "nombre",
          "Nombre"
        ) ||
        "Unidad no disponible";

      const barrio =
        obtenerCampo(
          atencion,
          "nombreBarrio",
          "NombreBarrio",
          "barrioNombre",
          "BarrioNombre"
        ) ||
        obtenerCampo(
          alerta,
          "nombreBarrio",
          "NombreBarrio"
        ) ||
        "Barrio no disponible";

      const nombreAlerta =
        obtenerCampo(
          atencion,
          "nombreAlerta",
          "NombreAlerta",
          "tipoAlerta",
          "TipoAlerta"
        ) ||
        obtenerCampo(
          alerta,
          "nombreTipoAlerta",
          "NombreTipoAlerta",
          "tipoAlerta",
          "TipoAlerta",
          "nombre",
          "Nombre"
        ) ||
        "Atención policial";

      const descripcion =
        obtenerCampo(
          atencion,
          "detalle",
          "Detalle",
          "descripcion",
          "Descripcion",
          "observaciones",
          "Observaciones"
        ) || "";

      const policia =
        obtenerCampo(
          atencion,
          "nombrePolicia",
          "NombrePolicia",
          "policiaNombre",
          "PoliciaNombre"
        ) ||
        obtenerCampo(
          asignacion,
          "nombrePolicia",
          "NombrePolicia"
        ) ||
        "No disponible";

      const fecha = obtenerFecha(atencion);

      const idAtencion = obtenerCampo(
        atencion,
        "idAtencion",
        "IdAtencion",
        "idAtencionAlerta",
        "IdAtencionAlerta"
      );

      return {
        clave:
          idAtencion != null
            ? `atencion-${idAtencion}`
            : `registro-${indice}`,
        estadoReal: estado,
        categoriaEstado: clasificarEstado(estado),
        fecha,
        unidad,
        barrio,
        nombreAlerta,
        descripcion,
        policia,
        idAlerta,
        idAsignacion,
      };
    });
  }, [datos]);

  // ========================================
  // INDICADORES
  // ========================================

  const valoresKpi = useMemo(
    () => ({
      total: registros.length,

      finalizadas: registros.filter(
        (registro) =>
          registro.categoriaEstado === "finalizada"
      ).length,

      enProceso: registros.filter(
        (registro) =>
          registro.categoriaEstado === "enProceso"
      ).length,

      pendientes: registros.filter(
        (registro) =>
          registro.categoriaEstado === "pendiente"
      ).length,
    }),
    [registros]
  );

  // ========================================
  // UNIDADES DISPONIBLES EN LOS REGISTROS
  // ========================================

  const unidades = useMemo(() => {
    return [
      ...new Set(
        registros
          .map((registro) => registro.unidad)
          .filter(
            (nombre) =>
              nombre &&
              nombre !== "Unidad no disponible"
          )
      ),
    ].sort((a, b) => a.localeCompare(b, "es"));
  }, [registros]);

  // ========================================
  // FILTRAR Y ORDENAR
  // ========================================

  const registrosFiltrados = useMemo(() => {
    const texto = normalizar(busqueda);

    return registros
      .filter((registro) => {
        const cumpleFecha = coincideFecha(
          registro.fecha,
          filtroFecha
        );

        const cumpleUnidad =
          filtroUnidad === "todas" ||
          registro.unidad === filtroUnidad;

        const cumpleEstado =
          filtroEstado === "todos" ||
          registro.categoriaEstado === filtroEstado;

        const contenido = normalizar(
          [
            registro.idAlerta,
            registro.idAsignacion,
            registro.nombreAlerta,
            registro.barrio,
            registro.unidad,
            registro.policia,
            registro.estadoReal,
            registro.descripcion,
          ].join(" ")
        );

        const cumpleBusqueda =
          !texto || contenido.includes(texto);

        return (
          cumpleFecha &&
          cumpleUnidad &&
          cumpleEstado &&
          cumpleBusqueda
        );
      })
      .sort((a, b) => {
        const fechaA =
          fechaValida(a.fecha)?.getTime() ?? 0;

        const fechaB =
          fechaValida(b.fecha)?.getTime() ?? 0;

        return fechaB - fechaA;
      });
  }, [
    registros,
    filtroFecha,
    filtroUnidad,
    filtroEstado,
    busqueda,
  ]);

  // ========================================
  // RENDERIZADO
  // ========================================

  return (
    <div className="historial-page">
      <div className="historial-contenido">

        {/* ENCABEZADO */}

        <header className="historial-encabezado">
          <div className="historial-encabezado-texto">
            <h1>Historial de Atenciones</h1>

            <p>
              Consulta las atenciones realizadas por las
              unidades policiales.
            </p>
          </div>

          <button
            type="button"
            className="btn-cv-verde"
            onClick={actualizarHistorial}
            disabled={cargando}
          >
            <i
              className={`bi bi-arrow-clockwise ${
                cargando ? "historial-girando" : ""
              }`}
              aria-hidden="true"
            />

            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </header>

        {/* ERROR */}

        {error && (
          <div className="historial-error" role="alert">
            <div>
              <i className="bi bi-exclamation-triangle me-2" />
              {error}
            </div>

            <button
              type="button"
              onClick={actualizarHistorial}
              disabled={cargando}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* TARJETAS KPI */}

        <div className="row g-3 mb-4">
          {TARJETAS.map((tarjeta) => (
            <div
              className="col-6 col-xl-3"
              key={tarjeta.clave}
            >
              <article
                className={`kpi-card-policial tono-${tarjeta.tono}`}
              >
                <div className="kpi-card-icono">
                  <i
                    className={`bi ${tarjeta.icono}`}
                    aria-hidden="true"
                  />
                </div>

                <div className="kpi-card-info">
                  <span className="kpi-card-titulo">
                    {tarjeta.titulo}
                  </span>

                  <strong className="kpi-card-valor">
                    {cargando
                      ? "..."
                      : valoresKpi[tarjeta.clave]}
                  </strong>
                </div>
              </article>
            </div>
          ))}
        </div>

        {/* FILTROS */}

        <section
          className="historial-panel-filtros"
          aria-label="Filtros de historial"
        >
          <div className="historial-panel-filtros-cabecera">
            <div className="historial-filtro-icono">
              <i
                className="bi bi-funnel"
                aria-hidden="true"
              />
            </div>

            <div className="historial-panel-titulos">
              <h2>Filtros de historial</h2>
              <p>
                Encuentra atenciones por fecha, unidad o estado.
              </p>
            </div>

            <button
              type="button"
              className="historial-limpiar"
              onClick={limpiarFiltros}
            >
              <i
                className="bi bi-arrow-counterclockwise"
                aria-hidden="true"
              />
              Limpiar filtros
            </button>
          </div>

          <div className="historial-panel-filtros-cuerpo">
            <label className="historial-control-filtro">
              <i
                className="bi bi-calendar3"
                aria-hidden="true"
              />

              <span>
                <small>Fecha</small>

                <select
                  value={filtroFecha}
                  onChange={(e) =>
                    setFiltroFecha(e.target.value)
                  }
                >
                  <option value="todas">
                    Todas las fechas
                  </option>
                  <option value="hoy">Hoy</option>
                  <option value="semana">
                    Esta semana
                  </option>
                  <option value="mes">
                    Este mes
                  </option>
                </select>
              </span>
            </label>

            <label className="historial-control-filtro">
              <i
                className="bi bi-people"
                aria-hidden="true"
              />

              <span>
                <small>Unidad policial</small>

                <select
                  value={filtroUnidad}
                  onChange={(e) =>
                    setFiltroUnidad(e.target.value)
                  }
                >
                  <option value="todas">
                    Todas las unidades
                  </option>

                  {unidades.map((unidad) => (
                    <option
                      key={unidad}
                      value={unidad}
                    >
                      {unidad}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <label className="historial-control-filtro">
              <i
                className="bi bi-check2-circle"
                aria-hidden="true"
              />

              <span>
                <small>Estado</small>

                <select
                  value={filtroEstado}
                  onChange={(e) =>
                    setFiltroEstado(e.target.value)
                  }
                >
                  <option value="todos">
                    Todos los estados
                  </option>
                  <option value="finalizada">
                    Finalizadas
                  </option>
                  <option value="enProceso">
                    En proceso
                  </option>
                  <option value="pendiente">
                    Pendientes
                  </option>
                  <option value="otro">
                    Otros estados
                  </option>
                </select>
              </span>
            </label>

            <label className="historial-control-busqueda">
              <i
                className="bi bi-search"
                aria-hidden="true"
              />

              <input
                type="search"
                placeholder="Buscar alerta, barrio, unidad..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
                aria-label="Buscar en el historial"
              />
            </label>
          </div>
        </section>

        {/* LÍNEA DE TIEMPO */}

        <section className="historial-panel-timeline">
          <div className="historial-timeline-cabecera">
            <div className="historial-timeline-icono">
              <i
                className="bi bi-clock-history"
                aria-hidden="true"
              />
            </div>

            <div>
              <h2>Línea de tiempo</h2>
              <p>
                {cargando
                  ? "Consultando registros..."
                  : `${registrosFiltrados.length} registros encontrados`}
              </p>
            </div>
          </div>

          {cargando ? (
            <div className="historial-mensaje">
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              />
              Cargando historial...
            </div>
          ) : registrosFiltrados.length === 0 ? (
            <div className="historial-vacio">
              <i
                className="bi bi-inbox"
                aria-hidden="true"
              />

              <h3>
                {error
                  ? "No se pudo consultar el historial"
                  : "No se encontraron atenciones"}
              </h3>

              <p>
                {error
                  ? "Comprueba la conexión con el servidor."
                  : "Prueba cambiando los filtros de búsqueda."}
              </p>
            </div>
          ) : (
            <div className="historial-registros">
              {registrosFiltrados.map((registro) => {
                const categoria =
                  registro.categoriaEstado;

                const icono =
                  categoria === "finalizada"
                    ? "bi-check-circle-fill"
                    : categoria === "pendiente"
                      ? "bi-hourglass-split"
                      : categoria === "enProceso"
                        ? "bi-arrow-repeat"
                        : "bi-info-circle";

                return (
                  <article
                    className={`historial-registro estado-${categoria}`}
                    key={registro.clave}
                  >
                    <div className="historial-registro-icono">
                      <i
                        className={`bi ${icono}`}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="historial-registro-contenido">
                      <div className="historial-registro-superior">
                        <h3>
                          {registro.nombreAlerta}
                        </h3>

                        <span
                          className={`historial-estado ${categoria}`}
                        >
                          {registro.estadoReal}
                        </span>
                      </div>

                      <p className="historial-registro-barrio">
                        <i
                          className="bi bi-geo-alt"
                          aria-hidden="true"
                        />
                        {registro.barrio}
                      </p>

                      <div className="historial-registro-detalles">
                        <span>
                          <i className="bi bi-calendar3" />
                          {formatearFecha(registro.fecha)}
                        </span>

                        <span>
                          <i className="bi bi-shield-check" />
                          {registro.unidad}
                        </span>

                        <span>
                          <i className="bi bi-person-badge" />
                          {registro.policia}
                        </span>

                        {registro.idAlerta != null && (
                          <span>
                            <i className="bi bi-hash" />
                            Alerta {registro.idAlerta}
                          </span>
                        )}
                      </div>

                      {registro.descripcion && (
                        <p className="historial-descripcion">
                          {registro.descripcion}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Historial;
