import { useEffect, useMemo, useState } from "react";
import "../../css/admin/reportes.css";
import { obtenerDatosEstadisticas } from "../../Services/HistorialEstadisticasService";

const fechaDe = (item) => item?.fecha ?? item?.fechaReporte ?? item?.fechaCreacion ?? item?.createdAt ?? null;
const fmtFecha = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
};
const text = (value) => String(value ?? "").trim();

function exportarCSV(items) {
  const columnas = ["Tipo", "Prioridad", "Estado", "Reportado por", "Barrio", "Fecha"];
  const filas = items.map((item) => [item.tipo ?? item.tipoAlerta ?? item.nombreTipoAlerta, item.prioridad, item.estado, item.reportadoPor ?? item.nombreUsuario, item.barrioNombre ?? item.barrio, fmtFecha(fechaDe(item))]);
  const csv = [columnas, ...filas].map((fila) => fila.map((valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  enlace.download = `wolert-reportes-${new Date().toISOString().slice(0, 10)}.csv`;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

export default function Reportes() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    obtenerDatosEstadisticas(controller.signal)
      .then(({ datos, errores }) => {
        if (controller.signal.aborted) return;
        setReportes(datos.alertas || []);
        setError(errores.length ? `No fue posible consultar todos los datos. ${errores.join(" · ")}` : "");
      })
      .catch((err) => { if (!controller.signal.aborted) setError(err.message || "No se pudieron cargar los reportes."); })
      .finally(() => { if (!controller.signal.aborted) setCargando(false); });
    return () => controller.abort();
  }, [recarga]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLocaleLowerCase("es-CO");
    const inicio = desde ? new Date(`${desde}T00:00:00`) : null;
    const fin = hasta ? new Date(`${hasta}T23:59:59.999`) : null;
    return reportes.filter((item) => {
      const fecha = new Date(fechaDe(item));
      const coincideTexto = !q || [item.tipo, item.tipoAlerta, item.nombreTipoAlerta, item.reportadoPor, item.barrioNombre, item.barrio, item.descripcion].some((v) => text(v).toLocaleLowerCase("es-CO").includes(q));
      return coincideTexto && (!estado || text(item.estado).toLowerCase() === estado.toLowerCase()) && (!prioridad || text(item.prioridad).toLowerCase() === prioridad.toLowerCase()) && (!inicio || (!Number.isNaN(fecha.getTime()) && fecha >= inicio)) && (!fin || (!Number.isNaN(fecha.getTime()) && fecha <= fin));
    }).sort((a, b) => new Date(fechaDe(b) || 0) - new Date(fechaDe(a) || 0));
  }, [reportes, busqueda, estado, prioridad, desde, hasta]);

  const totalActivas = reportes.filter((r) => !["resuelta", "cerrada", "atendida", "finalizada", "completada"].includes(text(r.estado).toLowerCase())).length;
  const altas = reportes.filter((r) => text(r.prioridad).toLowerCase() === "alta").length;
  const limpiar = () => { setBusqueda(""); setEstado(""); setPrioridad(""); setDesde(""); setHasta(""); };

  return <main className="admin-reports">
    <header className="admin-reports__hero">
      <div><span className="admin-reports__eyebrow"><i className="bi bi-file-earmark-bar-graph-fill" /> CENTRO DE INFORMES</span><h1>Reportes</h1><p>Consulta, filtra y descarga los reportes de alertas registrados en Wolert.</p></div>
      <button type="button" className="admin-reports__refresh" onClick={() => setRecarga((n) => n + 1)} disabled={cargando}><i className={`bi bi-arrow-clockwise ${cargando ? "admin-reports__spin" : ""}`} /> Actualizar</button>
    </header>

    {error && <div className="admin-reports__notice" role="status"><i className="bi bi-exclamation-triangle-fill" /><span>{error}</span></div>}

    <section className="admin-reports__summary" aria-label="Resumen de reportes">
      <article><span className="admin-reports__summary-icon blue"><i className="bi bi-inboxes-fill" /></span><div><small>Reportes registrados</small><strong>{cargando ? "—" : reportes.length.toLocaleString("es-CO")}</strong></div></article>
      <article><span className="admin-reports__summary-icon amber"><i className="bi bi-hourglass-split" /></span><div><small>En seguimiento</small><strong>{cargando ? "—" : totalActivas.toLocaleString("es-CO")}</strong></div></article>
      <article><span className="admin-reports__summary-icon red"><i className="bi bi-exclamation-octagon-fill" /></span><div><small>Prioridad alta</small><strong>{cargando ? "—" : altas.toLocaleString("es-CO")}</strong></div></article>
    </section>

    <section className="admin-reports__panel">
      <div className="admin-reports__panel-head"><div><h2>Listado de reportes</h2><p>{filtrados.length.toLocaleString("es-CO")} resultados con los filtros actuales</p></div><button type="button" className="admin-reports__export" onClick={() => exportarCSV(filtrados)} disabled={!filtrados.length}><i className="bi bi-download" /> Descargar CSV</button></div>
      <div className="admin-reports__filters">
        <label className="admin-reports__search"><i className="bi bi-search" /><input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar tipo, barrio o reportante" aria-label="Buscar reportes" /></label>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Filtrar por estado"><option value="">Todos los estados</option>{[...new Set(reportes.map((r) => text(r.estado)).filter(Boolean))].sort().map((v) => <option key={v}>{v}</option>)}</select>
        <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)} aria-label="Filtrar por prioridad"><option value="">Todas las prioridades</option>{[...new Set(reportes.map((r) => text(r.prioridad)).filter(Boolean))].sort().map((v) => <option key={v}>{v}</option>)}</select>
        <label className="admin-reports__date"><span>Desde</span><input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
        <label className="admin-reports__date"><span>Hasta</span><input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></label>
        <button type="button" className="admin-reports__clear" onClick={limpiar}>Limpiar</button>
      </div>
      <div className="admin-reports__table-wrap"><table><thead><tr><th>Tipo de alerta</th><th>Prioridad</th><th>Estado</th><th>Reportado por</th><th>Barrio</th><th>Fecha</th></tr></thead><tbody>
        {cargando && <tr><td colSpan="6" className="admin-reports__empty">Cargando reportes…</td></tr>}
        {!cargando && filtrados.map((r, i) => <tr key={r.idAlerta ?? r.IdAlerta ?? `${fechaDe(r)}-${i}`}><td><strong>{r.tipo ?? r.tipoAlerta ?? r.nombreTipoAlerta ?? "Alerta"}</strong></td><td><span className={`admin-reports__badge admin-reports__badge--${text(r.prioridad).toLowerCase() || "neutral"}`}>{r.prioridad || "Sin prioridad"}</span></td><td>{r.estado || "Sin estado"}</td><td>{r.reportadoPor ?? r.nombreUsuario ?? "—"}</td><td>{r.barrioNombre ?? r.barrio ?? "—"}</td><td>{fmtFecha(fechaDe(r))}</td></tr>)}
        {!cargando && filtrados.length === 0 && <tr><td colSpan="6" className="admin-reports__empty"><i className="bi bi-inbox" /><strong>No hay reportes para mostrar</strong><span>Ajusta los filtros o vuelve a consultar más tarde.</span></td></tr>}
      </tbody></table></div>
      <footer className="admin-reports__footer"><span><i className="bi bi-shield-check" /> Información consultada desde Wolert</span><span>Mostrando {filtrados.length} de {reportes.length} reportes</span></footer>
    </section>
  </main>;
}
