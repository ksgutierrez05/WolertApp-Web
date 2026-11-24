import { useEffect, useMemo, useState } from "react";
import "../../css/admin/reportes.css";
import { obtenerDatosEstadisticas } from "../../Services/HistorialEstadisticasService";

const FECHAS = [
  "fecha",
  "fechaReporte",
  "fechaCreacion",
  "fechaRegistro",
  "fechaAtencion",
  "fechaAsignacion",
  "createdAt",
  "created_at",
];
const fechaDe = (item) => FECHAS.map((key) => item?.[key]).find(Boolean) ?? null;
const norm = (value) => String(value ?? "").trim().toLocaleUpperCase("es-CO");
const leer = (item, ...keys) => {
  for (const key of keys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return null;
};
const idAlertaDe = (item) => leer(item, "idAlerta", "IdAlerta", "alertaId", "AlertaId") ??
  leer(item?.alerta ?? item?.Alerta, "idAlerta", "IdAlerta", "id", "Id");
const etiquetaEstado = (value) => {
  const estado = norm(value).replace(/[\s-]+/g, "_");
  const nombres = {
    ACTIVO: "Pendiente de atención",
    ACTIVA: "Pendiente de atención",
    RECIBIDA: "Recibida",
    PENDIENTE: "Pendiente",
    SIN_ASIGNAR: "Sin asignar",
    ASIGNADA: "Asignada",
    UNIDAD_ASIGNADA: "Unidad asignada",
    EN_ATENCION: "En atención",
    EN_PROCESO: "En proceso",
    EN_CAMINO: "En camino",
    EN_EL_SITIO: "En el sitio",
    ATENDIDA: "Atendida",
    FINALIZADA: "Finalizada",
    FINALIZADO: "Finalizada",
    CERRADA: "Cerrada",
    CERRADO: "Cerrada",
    RESUELTA: "Resuelta",
    RESUELTO: "Resuelta",
    CANCELADA: "Cancelada",
    CANCELADO: "Cancelada",
  };
  return nombres[estado] ?? (estado ? estado.replaceAll("_", " ").toLocaleLowerCase("es-CO").replace(/^\p{L}/u, (letra) => letra.toLocaleUpperCase("es-CO")) : null);
};
const esCerrado = (value) =>
  ["RESUELTA", "RESUELTO", "CERRADA", "CERRADO", "ATENDIDA", "ATENDIDO", "FINALIZADA", "FINALIZADO", "COMPLETADA", "COMPLETADO"].includes(norm(value));
const formato = (value) => new Intl.NumberFormat("es-CO").format(value || 0);

const REPORTES = [
  {
    id: "actividad",
    label: "Actividad ciudadana",
    icon: "bi-activity",
    description: "Volumen de alertas, prioridades y estados",
  },
  {
    id: "atencion",
    label: "Gestión de atención",
    icon: "bi-headset",
    description: "Atenciones y asignaciones registradas",
  },
  {
    id: "recursos",
    label: "Capacidad operativa",
    icon: "bi-people",
    description: "Disponibilidad de personal, unidades y alarmas",
  },
];

function agrupar(items, campo, sinDato = "Categoría no informada") {
  const cuenta = new Map();
  items.forEach((item) => {
    const nombre = String(campo(item) || sinDato).trim();
    cuenta.set(nombre, (cuenta.get(nombre) || 0) + 1);
  });
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1]);
}

function estadoDeAtencion(item) {
  return etiquetaEstado(leer(item,
    "estadoAtencion", "EstadoAtencion", "estadoFinalAtencion", "EstadoFinalAtencion",
    "estadoFinal", "EstadoFinal", "estado", "Estado"
  )) ?? "Atención registrada · estado no informado";
}

function estadoDeAsignacion(item) {
  return etiquetaEstado(leer(item,
    "estadoAsignacion", "EstadoAsignacion", "estado", "Estado", "estadoActual", "EstadoActual"
  )) ?? "Asignación registrada · estado no informado";
}

function tipoDeAlerta(item) {
  const tipo = leer(item, "tipo", "Tipo", "tipoAlerta", "TipoAlerta", "nombreTipoAlerta", "NombreTipoAlerta", "tipoAlertaNombre", "TipoAlertaNombre", "categoria", "Categoria");
  return tipo && typeof tipo === "object"
    ? leer(tipo, "nombre", "Nombre", "descripcion", "Descripcion", "tipo", "Tipo")
    : tipo;
}

function prioridadDeAlerta(item) {
  const prioridad = leer(item, "prioridad", "Prioridad", "nivelPrioridad", "NivelPrioridad", "prioridadNombre", "PrioridadNombre");
  return prioridad && typeof prioridad === "object"
    ? leer(prioridad, "nombre", "Nombre", "nivel", "Nivel", "descripcion", "Descripcion")
    : prioridad;
}

function estadoActividad(alerta, atenciones, asignaciones) {
  const id = idAlertaDe(alerta);
  const atencion = id == null ? null : atenciones.find((item) => String(idAlertaDe(item)) === String(id));
  const asignacion = id == null ? null : asignaciones.find((item) => String(idAlertaDe(item)) === String(id));
  const estadoAlerta = leer(alerta, "estadoAlerta", "EstadoAlerta", "estado", "Estado", "estadoActual", "EstadoActual");
  const estadoAtencion = atencion ? leer(atencion,
    "estadoAtencion", "EstadoAtencion", "estadoFinalAtencion", "EstadoFinalAtencion", "estadoFinal", "EstadoFinal", "estado", "Estado"
  ) : null;
  const estadoAsignacion = asignacion ? leer(asignacion,
    "estadoAsignacion", "EstadoAsignacion", "estado", "Estado", "estadoActual", "EstadoActual"
  ) : null;

  if ([estadoAlerta, estadoAtencion, estadoAsignacion].some((estado) => ["CANCELADA", "CANCELADO"].includes(norm(estado)))) return "Cancelada";
  if ([estadoAtencion, estadoAsignacion, estadoAlerta].some(esCerrado)) return "Atendida o cerrada";
  if (atencion) {
    if (estadoAtencion && !["ACTIVO", "ACTIVA", "PENDIENTE", "RECIBIDA"].includes(norm(estadoAtencion))) {
      return etiquetaEstado(estadoAtencion) ?? "En atención";
    }
    return "Atención iniciada";
  }
  if (asignacion) {
    if (estadoAsignacion && !["ACTIVO", "ACTIVA", "PENDIENTE", "RECIBIDA"].includes(norm(estadoAsignacion))) {
      return etiquetaEstado(estadoAsignacion) ?? "Asignada";
    }
    return "Asignada";
  }
  if (estadoAlerta && !["ACTIVO", "ACTIVA", "PENDIENTE", "RECIBIDA"].includes(norm(estadoAlerta))) {
    return etiquetaEstado(estadoAlerta);
  }
  return "Pendiente de atención";
}

function descargarCSV(nombre, filas) {
  const contenido = filas
    .map((fila) =>
      fila.map((valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`).join(",")
    )
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["﻿", contenido], { type: "text/csv;charset=utf-8" })
  );
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `wolert-${nombre}-${new Date().toISOString().slice(0, 10)}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}

function Indicador({ icon, label, value, detail, tone }) {
  return (
    <article className="admin-reports__metric">
      <span className={`admin-reports__metric-icon ${tone}`}>
        <i className={`bi ${icon}`} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </article>
  );
}

function Distribucion({ titulo, detalle, filas, total }) {
  return (
    <section className="admin-reports__distribution">
      <header>
        <h3>{titulo}</h3>
        <p>{detalle}</p>
      </header>
      {filas.length ? (
        <div className="admin-reports__bars">
          {filas.slice(0, 7).map(([label, count], index) => (
            <div className="admin-reports__bar-row" key={label}>
              <div>
                <span>{label.replaceAll("_", " ")}</span>
                <b>
                  {formato(count)} <small>{total ? Math.round((count / total) * 100) : 0}%</small>
                </b>
              </div>
              <span className="admin-reports__track">
                <i
                  style={{
                    width: `${total ? Math.max(2, (count / total) * 100) : 0}%`,
                    animationDelay: `${index * 70}ms`,
                  }}
                />
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-reports__empty">No hay registros para este periodo.</div>
      )}
    </section>
  );
}

export default function Reportes() {
  const [datos, setDatos] = useState({});
  const [errores, setErrores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [tipo, setTipo] = useState("actividad");
  const [periodo, setPeriodo] = useState("30");
  const reporteActivo = REPORTES.find((reporte) => reporte.id === tipo);

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);

    obtenerDatosEstadisticas(controller.signal)
      .then((resultado) => {
        if (!controller.signal.aborted) {
          setDatos(resultado.datos);
          setErrores(resultado.errores);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setErrores([error.message || "No se pudieron cargar los datos."]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false);
      });

    return () => controller.abort();
  }, [recarga]);

  const desde = useMemo(() => {
    if (periodo === "all") return null;
    const date = new Date();
    date.setDate(date.getDate() - Number(periodo));
    date.setHours(0, 0, 0, 0);
    return date;
  }, [periodo]);

  const dentroPeriodo = (item) => {
    if (!desde) return true;
    const date = new Date(fechaDe(item));
    return !Number.isNaN(date.getTime()) && date >= desde;
  };

  const alertas = useMemo(() => (datos.alertas || []).filter(dentroPeriodo), [datos.alertas, desde]);
  const atenciones = useMemo(() => (datos.atenciones || []).filter(dentroPeriodo), [datos.atenciones, desde]);
  const asignaciones = useMemo(() => (datos.asignaciones || []).filter(dentroPeriodo), [datos.asignaciones, desde]);
  const atencionesRelacionadas = datos.atenciones || [];
  const asignacionesRelacionadas = datos.asignaciones || [];
  const prioridades = useMemo(() => agrupar(alertas, prioridadDeAlerta, "Prioridad no informada"), [alertas]);
  const estados = useMemo(
    () => agrupar(alertas, (item) => estadoActividad(item, atencionesRelacionadas, asignacionesRelacionadas)),
    [alertas, atencionesRelacionadas, asignacionesRelacionadas]
  );
  const tiposAlerta = useMemo(() => agrupar(alertas, tipoDeAlerta, "Tipo de alerta no informado"), [alertas]);
  const actualizacion = new Date().toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const pol = datos.policias || [];
  const unidades = datos.unidades || [];
  const alarmas = datos.alarmas || [];
  const personalDisponible = pol.filter((x) => ["ACTIVO", "DISPONIBLE"].includes(norm(x.estado))).length;
  const unidadesDisponibles = unidades.filter((x) => ["ACTIVO", "DISPONIBLE"].includes(norm(x.estado))).length;
  const resueltas = alertas.filter((x) => ["Atendida o cerrada", "Cancelada"].includes(estadoActividad(x, atencionesRelacionadas, asignacionesRelacionadas))).length;

  return (
    <main className="admin-reports">
      <header className="admin-reports__hero">
        <div>
          <span className="admin-reports__eyebrow">
            <i className="bi bi-file-earmark-bar-graph-fill" /> INFORMES Y ANÁLISIS
          </span>
          <h1>Reportes</h1>
          <p>Genera resúmenes para entender la actividad y el desempeño operativo.</p>
        </div>
        <div className="admin-reports__actions">
          <label htmlFor="reports-period">Periodo</label>
          <select
            id="reports-period"
            value={periodo}
            onChange={(event) => setPeriodo(event.target.value)}
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="all">Todo el historial</option>
          </select>
          <button type="button" onClick={() => setRecarga((n) => n + 1)} disabled={cargando}>
            <i className={`bi bi-arrow-clockwise ${cargando ? "admin-reports__spin" : ""}`} /> Actualizar
          </button>
        </div>
      </header>

      <nav className="admin-reports__types" aria-label="Tipo de informe">
        {REPORTES.map((reporte) => (
          <button
            type="button"
            key={reporte.id}
            className={tipo === reporte.id ? "is-active" : ""}
            onClick={() => setTipo(reporte.id)}
          >
            <i className={`bi ${reporte.icon}`} />
            <span>
              <b>{reporte.label}</b>
              <small>{reporte.description}</small>
            </span>
            <i className="bi bi-chevron-right" />
          </button>
        ))}
      </nav>

      {errores.length > 0 && (
        <div className="admin-reports__notice" role="status">
          <i className="bi bi-exclamation-triangle-fill" />
          <span>Algunos datos no pudieron consultarse: {errores.join(" · ")}</span>
        </div>
      )}

      <section className="admin-reports__report">
        <div className="admin-reports__report-head">
          <div>
            <span className="admin-reports__report-kicker">
              INFORME · {periodo === "all" ? "HISTÓRICO" : `ÚLTIMOS ${periodo} DÍAS`}
            </span>
            <h2>
              <i className={`bi ${reporteActivo.icon}`} /> {reporteActivo.label}
            </h2>
            <p>{reporteActivo.description}. Datos consolidados para el periodo seleccionado.</p>
          </div>
        </div>

        {cargando ? (
          <div className="admin-reports__loading">
            <span /> Preparando informe…
          </div>
        ) : (
          <>
            {tipo === "actividad" && (
              <>
                <div className="admin-reports__metrics">
                  <Indicador
                    icon="bi-bell-fill"
                    label="Alertas recibidas"
                    value={formato(alertas.length)}
                    detail="Total en el periodo"
                    tone="blue"
                  />
                  <Indicador
                    icon="bi-check-circle-fill"
                    label="Cerradas o atendidas"
                    value={formato(resueltas)}
                    detail={`${alertas.length ? Math.round((resueltas / alertas.length) * 100) : 0}% del total`}
                    tone="green"
                  />
                  <Indicador
                    icon="bi-exclamation-octagon-fill"
                    label="Prioridad alta"
                    value={formato(alertas.filter((a) => norm(prioridadDeAlerta(a)) === "ALTA").length)}
                    detail="Requieren atención prioritaria"
                    tone="red"
                  />
                </div>
                <div className="admin-reports__grid">
                  <Distribucion
                    titulo="Alertas por tipo"
                    detalle="Principales categorías reportadas"
                    filas={tiposAlerta}
                    total={alertas.length}
                  />
                  <Distribucion
                    titulo="Alertas por estado"
                    detalle="Estado actual de los registros"
                    filas={estados}
                    total={alertas.length}
                  />
                  <Distribucion
                    titulo="Alertas por prioridad"
                    detalle="Distribución según nivel de atención"
                    filas={prioridades}
                    total={alertas.length}
                  />
                </div>
              </>
            )}

            {tipo === "atencion" && (
              <>
                <div className="admin-reports__metrics">
                  <Indicador
                    icon="bi-headset"
                    label="Atenciones registradas"
                    value={formato(atenciones.length)}
                    detail="En el periodo seleccionado"
                    tone="violet"
                  />
                  <Indicador
                    icon="bi-send-check-fill"
                    label="Asignaciones realizadas"
                    value={formato(asignaciones.length)}
                    detail="En el periodo seleccionado"
                    tone="blue"
                  />
                  <Indicador
                    icon="bi-arrow-repeat"
                    label="Atenciones por alerta"
                    value={
                      alertas.length
                        ? (atenciones.length / alertas.length).toLocaleString("es-CO", {
                            maximumFractionDigits: 2,
                          })
                        : "0"
                    }
                    detail="Promedio del periodo"
                    tone="green"
                  />
                </div>
                <div className="admin-reports__grid admin-reports__grid--two">
                  <Distribucion
                    titulo="Atenciones por estado"
                    detalle="Distribución de las intervenciones registradas"
                    filas={agrupar(atenciones, estadoDeAtencion, "Atención registrada · estado no informado")}
                    total={atenciones.length}
                  />
                  <Distribucion
                    titulo="Asignaciones por estado"
                    detalle="Distribución de los despachos registrados"
                    filas={agrupar(asignaciones, estadoDeAsignacion, "Asignación registrada · estado no informado")}
                    total={asignaciones.length}
                  />
                </div>
              </>
            )}

            {tipo === "recursos" && (
              <>
                <div className="admin-reports__metrics">
                  <Indicador
                    icon="bi-people-fill"
                    label="Personal registrado"
                    value={formato(pol.length)}
                    detail={`${formato(personalDisponible)} activos o disponibles`}
                    tone="blue"
                  />
                  <Indicador
                    icon="bi-truck-front-fill"
                    label="Unidades registradas"
                    value={formato(unidades.length)}
                    detail={`${formato(unidadesDisponibles)} activas o disponibles`}
                    tone="green"
                  />
                  <Indicador
                    icon="bi-broadcast-pin"
                    label="Alarmas registradas"
                    value={formato(alarmas.length)}
                    detail="Total en el sistema"
                    tone="amber"
                  />
                </div>
                <div className="admin-reports__grid admin-reports__grid--two">
                  <Distribucion
                    titulo="Estado del personal"
                    detalle="Disponibilidad del recurso policial"
                    filas={agrupar(pol, (x) => x.estado)}
                    total={pol.length}
                  />
                  <Distribucion
                    titulo="Estado de las unidades"
                    detalle="Disponibilidad de unidades operativas"
                    filas={agrupar(unidades, (x) => x.estado)}
                    total={unidades.length}
                  />
                </div>
              </>
            )}
          </>
        )}
      </section>

      <footer className="admin-reports__footer">
        <span>
          <i className="bi bi-shield-check" /> Información consultada desde Wolert
        </span>
        <span>Actualizado: {actualizacion}</span>
      </footer>
    </main>
  );
}
