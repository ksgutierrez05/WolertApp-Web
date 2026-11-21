import { useEffect, useMemo, useState } from "react";
import "../../css/admin/reportes.css";
import { obtenerDatosEstadisticas } from "../../Services/HistorialEstadisticasService";

const FECHAS = ["fecha", "fechaReporte", "fechaCreacion", "fechaRegistro", "fechaAtencion", "fechaAsignacion", "createdAt", "created_at"];
const fechaDe = (item) => FECHAS.map((key) => item?.[key]).find(Boolean) ?? null;
const norm = (value) => String(value ?? "").trim().toLocaleUpperCase("es-CO");
const esCerrado = (value) => ["RESUELTA", "CERRADA", "ATENDIDA", "FINALIZADA", "COMPLETADA"].includes(norm(value));
const formato = (value) => new Intl.NumberFormat("es-CO").format(value || 0);

const REPORTES = [
  { id: "actividad", label: "Actividad ciudadana", icon: "bi-activity", description: "Volumen de alertas, prioridades y estados" },
  { id: "atencion", label: "Gestión de atención", icon: "bi-headset", description: "Atenciones y asignaciones registradas" },
  { id: "recursos", label: "Capacidad operativa", icon: "bi-people", description: "Disponibilidad de personal, unidades y alarmas" },
];

function agrupar(items, campo) {
  const cuenta = new Map();
  items.forEach((item) => {
    const nombre = String(campo(item) || "Sin dato").trim();
    cuenta.set(nombre, (cuenta.get(nombre) || 0) + 1);
  });
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1]);
}

function descargarCSV(nombre, filas) {
  const contenido = filas.map((fila) => fila.map((valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", contenido], { type: "text/csv;charset=utf-8" }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `wolert-${nombre}-${new Date().toISOString().slice(0, 10)}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}

function Indicador({ icon, label, value, detail, tone }) {
  return <article className="admin-reports__metric"><span className={`admin-reports__metric-icon ${tone}`}><i className={`bi ${icon}`} /></span><div><small>{label}</small><strong>{value}</strong><span>{detail}</span></div></article>;
}

function Distribucion({ titulo, detalle, filas, total }) {
  return <section className="admin-reports__distribution"><header><h3>{titulo}</h3><p>{detalle}</p></header>{filas.length ? <div className="admin-reports__bars">{filas.slice(0, 7).map(([label, count], index) => <div className="admin-reports__bar-row" key={label}><div><span>{label.replaceAll("_", " ")}</span><b>{formato(count)} <small>{total ? Math.round(count / total * 100) : 0}%</small></b></div><span className="admin-reports__track"><i style={{ width: `${total ? Math.max(2, count / total * 100) : 0}%`, animationDelay: `${index * 70}ms` }} /></span></div>)}</div> : <div className="admin-reports__empty">No hay registros para este periodo.</div>}</section>;
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
      .then((resultado) => { if (!controller.signal.aborted) { setDatos(resultado.datos); setErrores(resultado.errores); } })
      .catch((error) => { if (!controller.signal.aborted) setErrores([error.message || "No se pudieron cargar los datos."]); })
      .finally(() => { if (!controller.signal.aborted) setCargando(false); });
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
  const prioridades = useMemo(() => agrupar(alertas, (item) => item.prioridad), [alertas]);
  const estados = useMemo(() => agrupar(alertas, (item) => item.estado), [alertas]);
  const tiposAlerta = useMemo(() => agrupar(alertas, (item) => item.tipo ?? item.tipoAlerta ?? item.nombreTipoAlerta), [alertas]);
  const actualizacion = new Date().toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });

  const exportar = () => {
    if (tipo === "actividad") {
      descargarCSV("actividad", [["Indicador", "Registros"], ["Alertas", alertas.length], ["Prioridad alta", alertas.filter((a) => norm(a.prioridad) === "ALTA").length], ...estados.map(([nombre, total]) => [`Estado: ${nombre}`, total]), ...prioridades.map(([nombre, total]) => [`Prioridad: ${nombre}`, total]), ...tiposAlerta.map(([nombre, total]) => [`Tipo: ${nombre}`, total])]);
    } else if (tipo === "atencion") {
      descargarCSV("atencion", [["Indicador", "Registros"], ["Atenciones en el periodo", atenciones.length], ["Asignaciones en el periodo", asignaciones.length], ["Alertas relacionadas", alertas.length], ["Atenciones por alerta", alertas.length ? (atenciones.length / alertas.length).toFixed(2) : 0], ["Asignaciones por alerta", alertas.length ? (asignaciones.length / alertas.length).toFixed(2) : 0]]);
    } else {
      descargarCSV("capacidad-operativa", [["Recurso", "Estado", "Cantidad"], ...agrupar(datos.policias || [], (x) => x.estado).map(([estado, cantidad]) => ["Personal policial", estado, cantidad]), ...agrupar(datos.unidades || [], (x) => x.estado).map(([estado, cantidad]) => ["Unidades", estado, cantidad]), ["Alarmas registradas", "Total", (datos.alarmas || []).length]]);
    }
  };

  const pol = datos.policias || [];
  const unidades = datos.unidades || [];
  const alarmas = datos.alarmas || [];
  const personalDisponible = pol.filter((x) => ["ACTIVO", "DISPONIBLE"].includes(norm(x.estado))).length;
  const unidadesDisponibles = unidades.filter((x) => ["ACTIVO", "DISPONIBLE"].includes(norm(x.estado))).length;
  const resueltas = alertas.filter((x) => esCerrado(x.estado)).length;

  return <main className="admin-reports">
    <header className="admin-reports__hero"><div><span className="admin-reports__eyebrow"><i className="bi bi-file-earmark-bar-graph-fill" /> INFORMES Y ANÁLISIS</span><h1>Reportes</h1><p>Genera resúmenes para entender la actividad y el desempeño operativo.</p></div><div className="admin-reports__actions"><label htmlFor="reports-period">Periodo</label><select id="reports-period" value={periodo} onChange={(event) => setPeriodo(event.target.value)}><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option><option value="90">Últimos 90 días</option><option value="all">Todo el historial</option></select><button type="button" onClick={() => setRecarga((n) => n + 1)} disabled={cargando}><i className={`bi bi-arrow-clockwise ${cargando ? "admin-reports__spin" : ""}`} /> Actualizar</button></div></header>

    <nav className="admin-reports__types" aria-label="Tipo de informe">{REPORTES.map((reporte) => <button type="button" key={reporte.id} className={tipo === reporte.id ? "is-active" : ""} onClick={() => setTipo(reporte.id)}><i className={`bi ${reporte.icon}`} /><span><b>{reporte.label}</b><small>{reporte.description}</small></span><i className="bi bi-chevron-right" /></button>)}</nav>
    {errores.length > 0 && <div className="admin-reports__notice" role="status"><i className="bi bi-exclamation-triangle-fill" /><span>Algunos datos no pudieron consultarse: {errores.join(" · ")}</span></div>}
    <section className="admin-reports__report"><div className="admin-reports__report-head"><div><span className="admin-reports__report-kicker">INFORME · {periodo === "all" ? "HISTÓRICO" : `ÚLTIMOS ${periodo} DÍAS`}</span><h2><i className={`bi ${reporteActivo.icon}`} /> {reporteActivo.label}</h2><p>{reporteActivo.description}. Datos consolidados para el periodo seleccionado.</p></div><button type="button" className="admin-reports__export" onClick={exportar}><i className="bi bi-download" /> Exportar informe</button></div>
      {cargando ? <div className="admin-reports__loading"><span /> Preparando informe…</div> : <>
        {tipo === "actividad" && <><div className="admin-reports__metrics"><Indicador icon="bi-bell-fill" label="Alertas recibidas" value={formato(alertas.length)} detail="Total en el periodo" tone="blue" /><Indicador icon="bi-check-circle-fill" label="Cerradas o atendidas" value={formato(resueltas)} detail={`${alertas.length ? Math.round(resueltas / alertas.length * 100) : 0}% del total`} tone="green" /><Indicador icon="bi-exclamation-octagon-fill" label="Prioridad alta" value={formato(alertas.filter((a) => norm(a.prioridad) === "ALTA").length)} detail="Requieren atención prioritaria" tone="red" /></div><div className="admin-reports__grid"><Distribucion titulo="Alertas por tipo" detalle="Principales categorías reportadas" filas={tiposAlerta} total={alertas.length} /><Distribucion titulo="Alertas por estado" detalle="Estado actual de los registros" filas={estados} total={alertas.length} /><Distribucion titulo="Alertas por prioridad" detalle="Distribución según nivel de atención" filas={prioridades} total={alertas.length} /></div></>}
        {tipo === "atencion" && <><div className="admin-reports__metrics"><Indicador icon="bi-headset" label="Atenciones registradas" value={formato(atenciones.length)} detail="En el periodo seleccionado" tone="violet" /><Indicador icon="bi-send-check-fill" label="Asignaciones realizadas" value={formato(asignaciones.length)} detail="En el periodo seleccionado" tone="blue" /><Indicador icon="bi-arrow-repeat" label="Atenciones por alerta" value={alertas.length ? (atenciones.length / alertas.length).toLocaleString("es-CO", { maximumFractionDigits: 2 }) : "0"} detail="Promedio del periodo" tone="green" /></div><div className="admin-reports__grid admin-reports__grid--two"><Distribucion titulo="Atenciones por estado" detalle="Distribución de las intervenciones registradas" filas={agrupar(atenciones, (x) => x.estado)} total={atenciones.length} /><Distribucion titulo="Asignaciones por estado" detalle="Distribución de los despachos registrados" filas={agrupar(asignaciones, (x) => x.estado)} total={asignaciones.length} /></div></>}
        {tipo === "recursos" && <><div className="admin-reports__metrics"><Indicador icon="bi-people-fill" label="Personal registrado" value={formato(pol.length)} detail={`${formato(personalDisponible)} activos o disponibles`} tone="blue" /><Indicador icon="bi-truck-front-fill" label="Unidades registradas" value={formato(unidades.length)} detail={`${formato(unidadesDisponibles)} activas o disponibles`} tone="green" /><Indicador icon="bi-broadcast-pin" label="Alarmas registradas" value={formato(alarmas.length)} detail="Total en el sistema" tone="amber" /></div><div className="admin-reports__grid admin-reports__grid--two"><Distribucion titulo="Estado del personal" detalle="Disponibilidad del recurso policial" filas={agrupar(pol, (x) => x.estado)} total={pol.length} /><Distribucion titulo="Estado de las unidades" detalle="Disponibilidad de unidades operativas" filas={agrupar(unidades, (x) => x.estado)} total={unidades.length} /></div></>}
      </>}</section>
    <footer className="admin-reports__footer"><span><i className="bi bi-shield-check" /> Información consultada desde Wolert</span><span>Actualizado: {actualizacion}</span></footer>
  </main>;
}
