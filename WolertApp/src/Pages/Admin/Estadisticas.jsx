import { useEffect, useMemo, useState } from "react";
import "../../css/admin/estadisticas.css";
import { obtenerDatosEstadisticas } from "../../Services/HistorialEstadisticasService";

const norm = (value) => String(value ?? "").trim().toLocaleUpperCase("es-CO");
const fechaDe = (item) => item?.fecha ?? item?.fechaCreacion ?? item?.fechaRegistro ?? item?.fechaAtencion ?? item?.fechaAsignacion ?? item?.createdAt ?? item?.created_at ?? null;
const resolved = (estado) => ["RESUELTA", "CERRADA", "ATENDIDA", "FINALIZADA", "COMPLETADA"].includes(norm(estado));
const number = (value) => new Intl.NumberFormat("es-CO").format(value);
const pct = (value) => `${Number(value || 0).toLocaleString("es-CO", { maximumFractionDigits: 1 })}%`;

function CountCard({ icon, label, value, note, tone = "blue", delay = 0 }) {
  return <article className={`stats-kpi stats-kpi--${tone}`} style={{ animationDelay: `${delay}ms` }}>
    <div className="stats-kpi__top"><span>{label}</span><i className={`bi ${icon}`} /></div>
    <strong>{value}</strong><small>{note}</small>
  </article>;
}

function Panel({ title, subtitle, icon, children, className = "" }) {
  return <section className={`stats-panel ${className}`}><header className="stats-panel__head"><div className="stats-panel__icon"><i className={`bi ${icon}`} /></div><div><h2>{title}</h2><p>{subtitle}</p></div></header>{children}</section>;
}

function Bars({ rows, total, empty = "Aún no hay datos para mostrar." }) {
  if (!rows.length) return <div className="stats-empty">{empty}</div>;
  const colors = ["#2563eb", "#0ea5a4", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b"];
  return <div className="stats-bars">{rows.map(([label, value], index) => <div className="stats-bar-row" key={label}>
    <div className="stats-bar-label"><span>{label.replaceAll("_", " ")}</span><b>{number(value)} <small>{pct(total ? value / total * 100 : 0)}</small></b></div>
    <div className="stats-track"><span style={{ width: `${total ? Math.max(value ? 2 : 0, value / total * 100) : 0}%`, background: colors[index % colors.length], animationDelay: `${index * 70}ms` }} /></div>
  </div>)}</div>;
}

function TrendChart({ alertas }) {
  const points = useMemo(() => {
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const start = new Date(end); start.setDate(start.getDate() - 13); start.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return { date: d, count: 0 }; });
    alertas.forEach((a) => { const d = new Date(fechaDe(a)); if (!Number.isNaN(d.getTime()) && d >= start && d <= end) days[Math.floor((d - start) / 86400000)].count += 1; });
    return days;
  }, [alertas]);
  const max = Math.max(1, ...points.map((p) => p.count));
  const coords = points.map((p, i) => `${24 + i * 42},${116 - p.count / max * 88}`).join(" ");
  return <div className="stats-trend"><svg viewBox="0 0 594 142" role="img" aria-label="Alertas registradas durante los últimos 14 días" preserveAspectRatio="none">
    {[28, 72, 116].map((y) => <line key={y} x1="24" y1={y} x2="570" y2={y} className="stats-gridline" />)}
    <polygon points={`24,116 ${coords} 570,116`} className="stats-area" />
    <polyline points={coords} className="stats-line" />
    {points.map((p, i) => <circle key={i} cx={24 + i * 42} cy={116 - p.count / max * 88} r="3.2" className="stats-dot"><title>{p.date.toLocaleDateString("es-CO")}: {p.count}</title></circle>)}
  </svg><div className="stats-trend__labels"><span>{points[0]?.date.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}</span><span>Últimos 14 días</span><span>{points.at(-1)?.date.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}</span></div></div>;
}

export default function Estadisticas() {
  const [datos, setDatos] = useState({}); const [errores, setErrores] = useState([]);
  const [cargando, setCargando] = useState(true); const [recarga, setRecarga] = useState(0); const [periodo, setPeriodo] = useState("30");
  useEffect(() => {
    const controller = new AbortController(); setCargando(true);
    obtenerDatosEstadisticas(controller.signal).then(({ datos: result, errores: issues }) => { if (!controller.signal.aborted) { setDatos(result); setErrores(issues); } })
      .catch((err) => { if (!controller.signal.aborted) { setErrores([err.message]); setDatos({}); } })
      .finally(() => { if (!controller.signal.aborted) setCargando(false); });
    return () => controller.abort();
  }, [recarga]);

  const base = { alertas: datos.alertas || [], atenciones: datos.atenciones || [], asignaciones: datos.asignaciones || [], policias: datos.policias || [], unidades: datos.unidades || [], alarmas: datos.alarmas || [] };
  const desde = useMemo(() => { if (periodo === "all") return null; const d = new Date(); d.setDate(d.getDate() - Number(periodo)); d.setHours(0, 0, 0, 0); return d; }, [periodo]);
  const alertas = useMemo(() => desde ? base.alertas.filter((a) => { const d = new Date(fechaDe(a)); return !Number.isNaN(d.getTime()) && d >= desde; }) : base.alertas, [base.alertas, desde]);
  const resueltas = alertas.filter((a) => resolved(a.estado)).length;
  const tasa = alertas.length ? resueltas / alertas.length * 100 : 0;
  const porPrioridad = useMemo(() => agrupar(alertas, (a) => a.prioridad || "Sin prioridad"), [alertas]);
  const porEstado = useMemo(() => agrupar(alertas, (a) => a.estado || "Sin estado"), [alertas]);
  const porDia = useMemo(() => {
    const days = new Map(); alertas.forEach((a) => { const d = new Date(fechaDe(a)); if (!Number.isNaN(d.getTime())) { const key = d.toLocaleDateString("es-CO"); days.set(key, (days.get(key) || 0) + 1); } });
    return [...days.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [alertas]);
  const activas = base.policias.filter((p) => ["ACTIVO", "DISPONIBLE"].includes(norm(p.estado))).length;
  const unidadesActivas = base.unidades.filter((u) => ["ACTIVO", "DISPONIBLE"].includes(norm(u.estado))).length;
  const promedioAtenciones = alertas.length ? base.atenciones.length / alertas.length : 0;
  const promedioAsignaciones = alertas.length ? base.asignaciones.length / alertas.length : 0;
  const actualizacion = new Date().toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });

  return <main className="stats-page">
    <div className="stats-hero"><div><span className="stats-eyebrow"><i className="bi bi-bar-chart-line-fill" /> ANALÍTICA DEL SISTEMA</span><h1>Estadísticas</h1><p>Una vista clara del comportamiento operativo y los recursos del sistema.</p></div>
      <div className="stats-actions"><label className="stats-select-label" htmlFor="stats-period">Periodo</label><select id="stats-period" value={periodo} onChange={(e) => setPeriodo(e.target.value)}><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option><option value="90">Últimos 90 días</option><option value="all">Todo el historial</option></select><button type="button" onClick={() => setRecarga((n) => n + 1)} disabled={cargando}><i className={`bi bi-arrow-clockwise ${cargando ? "stats-spin" : ""}`} /> Actualizar</button></div>
    </div>
    {errores.length > 0 && <div className="stats-alert"><i className="bi bi-exclamation-triangle-fill" /><span>Algunos datos no pudieron cargarse: {errores.join(" · ")}</span></div>}
    <div className="stats-kpis">
      <CountCard icon="bi-bell-fill" label="Alertas del periodo" value={cargando ? "—" : number(alertas.length)} note={`${number(resueltas)} resueltas`} tone="blue" delay={0} />
      <CountCard icon="bi-check-circle-fill" label="Tasa de resolución" value={cargando ? "—" : pct(tasa)} note="Alertas cerradas o atendidas" tone="green" delay={60} />
      <CountCard icon="bi-shield-fill-check" label="Atenciones registradas" value={cargando ? "—" : number(base.atenciones.length)} note={`${promedioAtenciones.toLocaleString("es-CO", { maximumFractionDigits: 2 })} por alerta`} tone="violet" delay={120} />
      <CountCard icon="bi-diagram-3-fill" label="Asignaciones" value={cargando ? "—" : number(base.asignaciones.length)} note={`${promedioAsignaciones.toLocaleString("es-CO", { maximumFractionDigits: 2 })} por alerta`} tone="amber" delay={180} />
    </div>
    <div className="stats-grid stats-grid--wide">
      <Panel title="Actividad de alertas" subtitle="Registros creados en los últimos 14 días" icon="bi-activity"><TrendChart alertas={base.alertas} /></Panel>
      <Panel title="Estado de las alertas" subtitle={`${number(alertas.length)} registros en el periodo seleccionado`} icon="bi-pie-chart-fill"><Bars rows={porEstado} total={alertas.length} /></Panel>
    </div>
    <div className="stats-grid">
      <Panel title="Alertas por prioridad" subtitle="Distribución según nivel de atención" icon="bi-exclamation-diamond-fill"><Bars rows={porPrioridad} total={alertas.length} /></Panel>
      <Panel title="Operación y promedios" subtitle="Volumen de respuesta asociado a las alertas" icon="bi-speedometer2">
        <div className="stats-average"><div><span>Atenciones promedio por alerta</span><strong>{promedioAtenciones.toLocaleString("es-CO", { maximumFractionDigits: 2 })}</strong></div><i className="bi bi-headset" /></div>
        <div className="stats-average"><div><span>Asignaciones promedio por alerta</span><strong>{promedioAsignaciones.toLocaleString("es-CO", { maximumFractionDigits: 2 })}</strong></div><i className="bi bi-send-check" /></div>
        <div className="stats-mini-summary"><span>Atenciones totales <b>{number(base.atenciones.length)}</b></span><span>Asignaciones totales <b>{number(base.asignaciones.length)}</b></span></div>
      </Panel>
    </div>
    <div className="stats-grid">
      <Panel title="Capacidad operativa" subtitle="Disponibilidad actual de personal y unidades" icon="bi-people-fill">
        <div className="stats-resource"><div><span>Policías activos</span><b>{number(activas)} <small>/ {number(base.policias.length)}</small></b></div><div className="stats-resource-track"><span style={{ width: `${base.policias.length ? activas / base.policias.length * 100 : 0}%` }} /></div></div>
        <div className="stats-resource"><div><span>Unidades activas</span><b>{number(unidadesActivas)} <small>/ {number(base.unidades.length)}</small></b></div><div className="stats-resource-track stats-resource-track--teal"><span style={{ width: `${base.unidades.length ? unidadesActivas / base.unidades.length * 100 : 0}%` }} /></div></div>
        <div className="stats-mini-summary"><span>Alarmas registradas <b>{number(base.alarmas.length)}</b></span></div>
      </Panel>
      <Panel title="Días con más alertas" subtitle="Los siete días de mayor actividad del periodo" icon="bi-calendar-week"><Bars rows={porDia} total={Math.max(1, ...porDia.map(([, value]) => value))} empty="No hay fechas disponibles en los registros." /></Panel>
    </div>
    <footer className="stats-footer"><span><i className="bi bi-shield-lock" /> Datos consultados desde el sistema</span><span>Actualizado: {actualizacion}</span></footer>
  </main>;
}

function agrupar(items, campo) {
  const counts = new Map(); items.forEach((item) => { const key = String(campo(item) || "Sin dato").trim(); counts.set(key, (counts.get(key) || 0) + 1); });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}
