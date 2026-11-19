
import { useEffect, useMemo, useState } from "react";

import Kpis from "../../Components/Administrador-policia/Kpicard";
import { obtenerHistorial } from "../../Services/HistorialEstadisticasService";

import "../../css/Policia/administrador-policia/css/historial.css";

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function obtenerCampo(objeto, ...claves) {
  if (!objeto) return null;

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
    .replace(/_/g, " ");
}

function obtenerEstado(atencion) {
  return obtenerCampo(
    atencion,
    "estado",
    "Estado",
    "estadoAtencion",
    "EstadoAtencion",
    "estadoFinal",
    "EstadoFinal"
  ) || "SIN ESTADO";
}

function clasificarEstado(estado) {
  const valor = normalizar(estado);

  if (
    ["FINALIZADA", "FINALIZADO", "RESUELTA", "RESUELTO",
      "COMPLETADA", "COMPLETADO", "CERRADA", "CERRADO"].includes(valor)
  ) {
    return "finalizada";
  }

  if (
    ["EN PROCESO", "EN ATENCION", "EN CAMINO",
      "ASIGNADA", "ACTIVA", "EN SITIO"].includes(valor)
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

function formatearFecha(fecha) {
  if (!fecha) return "Fecha no disponible";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "Fecha no disponible";
  }

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
  if (!fecha) return false;

  const fechaRegistro = new Date(fecha);

  if (Number.isNaN(fechaRegistro.getTime())) return false;

  const hoy = new Date();

  if (filtro === "hoy") {
    return fechaRegistro.toDateString() === hoy.toDateString();
  }

  if (filtro === "semana") {
    const inicio = new Date(hoy);
    const dia = (hoy.getDay() + 6) % 7;

    inicio.setDate(hoy.getDate() - dia);
    inicio.setHours(0, 0, 0, 0);

    return fechaRegistro >= inicio && fechaRegistro <= hoy;
  }

  if (filtro === "mes") {
    return (
      fechaRegistro.getMonth() === hoy.getMonth() &&
      fechaRegistro.getFullYear() === hoy.getFullYear()
    );
  }

  return true;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

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
  // CONSULTAR API
  // ========================================

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarDatos() {
      try {
        const resultado = await obtenerHistorial(
          controlador.signal
        );

        if (!controlador.signal.aborted) {
          setDatos(resultado);
          setError("");
        }
      } catch (err) {
        if (
          !controlador.signal.aborted &&
          err.name !== "AbortError"
        ) {
          setError(
            err.message || "No se pudo cargar el historial."
          );
        }
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
  // PREPARAR REGISTROS
  // ========================================

  const registros = useMemo(() => {
    const atenciones = Array.isArray(datos.atenciones)
      ? datos.atenciones
      : [];

    const asignaciones = Array.isArray(datos.asignaciones)
      ? datos.asignaciones
      : [];

    const alertas = Array.isArray(datos.alertas)
      ? datos.alertas
      : [];

    return atenciones.map((atencion) => {
      const idAsignacion = obtenerCampo(
        atencion,
        "idAsignacion",
        "IdAsignacion"
      );

      const asignacion = asignaciones.find((item) =>
        String(
          obtenerCampo(item, "idAsignacion", "IdAsignacion")
        ) === String(idAsignacion)
      );

      const idAlerta =
        obtenerCampo(atencion, "idAlerta", "IdAlerta") ??
        obtenerCampo(asignacion, "idAlerta", "IdAlerta");

      const alerta = alertas.find((item) =>
        String(
          obtenerCampo(item, "idAlerta", "IdAlerta")
        ) === String(idAlerta)
      );

      const estado = obtenerEstado(atencion);

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
          atencion.Unidad || atencion.unidad,
          "nombre",
          "Nombre"
        ) ||
        obtenerCampo(
          asignacion?.Unidad || asignacion?.unidad,
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
        obtenerCampo(alerta, "nombreBarrio", "NombreBarrio") ||
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

      const fecha = obtenerFecha(atencion);

      const descripcion =
        obtenerCampo(
          atencion,
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

      return {
        original: atencion,
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
  // KPI DEL HISTORIAL
  // ========================================

  const valoresKpi = useMemo(() => ({
    total: registros.length,

    finalizadas: registros.filter(
      (r) => r.categoriaEstado === "finalizada"
    ).length,

    enProceso: registros.filter(
      (r) => r.categoriaEstado === "enProceso"
    ).length,

    pendientes: registros.filter(
      (r) => r.categoriaEstado === "pendiente"
    ).length,
  }), [registros]);

  // ========================================
  // OPCIONES DE UNIDADES
  // ========================================

  const unidades = useMemo(() => {
    return [...new Set(
      registros
        .map((r) => r.unidad)
        .filter((nombre) =>
          nombre && nombre !== "Unidad no disponible"
        )
    )].sort();
  }, [registros]);

  // ========================================
  // FILTRAR REGISTROS
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

        const contenido = normalizar([
          registro.nombreAlerta,
          registro.barrio,
          registro.unidad,
          registro.policia,
          registro.estadoReal,
          registro.descripcion,
        ].join(" "));

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
        const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0;
        const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0;

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
          <div className="historial-icono-principal">
            <i className="bi bi-clock-history" />
          </div>

          <div className="historial-titulo-bloque">
            <h1>Historial de Atenciones</h1>

            <p>
              Registro de las atenciones realizadas
              por las unidades policiales.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-primary ms-auto"
            onClick={actualizarHistorial}
            disabled={cargando}
          >
            <i className="bi bi-arrow-clockwise me-2" />
            Actualizar
          </button>
        </header>

        {/* ERROR */}

        {error && (
          <div className="historial-error" role="alert">
            <i className="bi bi-exclamation-triangle me-2" />

            {error}

            <button
              type="button"
              onClick={actualizarHistorial}
              className="ms-3"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* KPI */}

        <Kpis
          grupo="historial"
          valores={valoresKpi}
          cargando={cargando}
        />

        {/* FILTROS */}

        <section
          className="historial-panel-filtros"
          aria-label="Filtros de historial"
        >
          <div className="historial-panel-filtros-cabecera">
            <div className="historial-filtro-icono">
              <i className="bi bi-funnel" />
            </div>

            <div>
              <h2>Filtros de historial</h2>
              <p>Filtra los registros de atención.</p>
            </div>

            <button
              type="button"
              className="historial-limpiar"
              onClick={limpiarFiltros}
            >
              <i className="bi bi-arrow-counterclockwise me-1" />
              Limpiar filtros
            </button>
          </div>

          <div className="historial-panel-filtros-cuerpo">

            {/* FECHA */}

            <label className="historial-control-filtro">
              <i className="bi bi-calendar3" />

              <span>
                <small>Fecha</small>

                <select
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                >
                  <option value="todas">Todas las fechas</option>
                  <option value="hoy">Hoy</option>
                  <option value="semana">Esta semana</option>
                  <option value="mes">Este mes</option>
                </select>
              </span>
            </label>

            {/* UNIDAD */}

            <label className="historial-control-filtro">
              <i className="bi bi-people" />

              <span>
                <small>Unidad</small>

                <select
                  value={filtroUnidad}
                  onChange={(e) => setFiltroUnidad(e.target.value)}
                >
                  <option value="todas">Todas las unidades</option>

                  {unidades.map((unidad) => (
                    <option key={unidad} value={unidad}>
                      {unidad}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            {/* ESTADO */}

            <label className="historial-control-filtro">
              <i className="bi bi-clock" />

              <span>
                <small>Estado de atención</small>

                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="finalizada">Finalizadas</option>
                  <option value="enProceso">En proceso</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="otro">Otros estados</option>
                </select>
              </span>
            </label>

            {/* BUSCADOR */}

            <label className="historial-control-busqueda">
              <i className="bi bi-search" />

              <input
                type="search"
                placeholder="Buscar alerta, barrio, unidad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar en el historial"
              />
            </label>
          </div>
        </section>

        {/* LÍNEA DE TIEMPO */}

        <section className="historial-panel-timeline">
          <div className="historial-timeline-cabecera">
            <div className="historial-timeline-icono">
              <i className="bi bi-clock-history" />
            </div>

            <div>
              <h2>Línea de tiempo</h2>

              <p>
                {registrosFiltrados.length} registros encontrados
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
              <i className="bi bi-inbox" />

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
              {registrosFiltrados.map((registro, index) => {
                const finalizada =
                  registro.categoriaEstado === "finalizada";

                const pendiente =
                  registro.categoriaEstado === "pendiente";

                return (
                  <article
                    className="historial-registro"
                    key={
                      registro.idAsignacion ??
                      registro.idAlerta ??
                      index
                    }
                  >
                    <div className="historial-registro-icono">
                      <i
                        className={`bi ${
                          finalizada
                            ? "bi-check-circle-fill"
                            : pendiente
                              ? "bi-hourglass-split"
                              : "bi-arrow-repeat"
                        }`}
                      />
                    </div>

                    <div className="historial-registro-contenido">

                      <div className="historial-registro-superior">
                        <h3>{registro.nombreAlerta}</h3>

                        <span
                          className={`historial-estado ${
                            finalizada
                              ? "finalizada"
                              : "proceso"
                          }`}
                        >
                          {registro.estadoReal}
                        </span>
                      </div>

                      <p>
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
