import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/global.css";
import "../../css/temas.css";
import "../../css/ciudadano/encabezados-ciudadano.css";
import "../../css/ciudadano/panel-notificaciones.css";
import { destinoNotificacion, guardarNotificacionesLeidas, listarMisNotificaciones, obtenerNotificacionesLeidas } from "../../Services/NotificacionesAPI";
import { notificacionPermitidaCiudadano, obtenerPreferenciasCiudadano } from "../../Services/PreferenciasCiudadano";

function fechaFormato(valor) {
  if (!valor) return "Fecha no disponible";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? "Fecha no disponible" : fecha.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export default function Notificaciones() {
  const navigate = useNavigate();
  const [lista, setLista] = useState([]);
  const [leidas, setLeidas] = useState(() => obtenerNotificacionesLeidas());
  const [preferencias, setPreferencias] = useState(() => obtenerPreferenciasCiudadano());
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    listarMisNotificaciones(controller.signal)
      .then((notificaciones) => {
        if (!controller.signal.aborted) {
          if (!Array.isArray(notificaciones)) throw new Error("La API no devolvió una lista válida de notificaciones.");
          setLista(notificaciones);
          setError("");
        }
      })
      .catch((err) => { if (!controller.signal.aborted) setError(err.message || "No se pudieron cargar tus notificaciones."); })
      .finally(() => { if (!controller.signal.aborted) setCargando(false); });
    return () => controller.abort();
  }, [recarga]);

  useEffect(() => {
    const sincronizar = (event) => setPreferencias(event.detail || obtenerPreferenciasCiudadano());
    window.addEventListener("wolert:preferencias-ciudadano", sincronizar);
    return () => window.removeEventListener("wolert:preferencias-ciudadano", sincronizar);
  }, []);

  const marcarLeidas = useCallback((ids) => {
    const nuevas = [...new Set([...leidas, ...ids.map(Number)])];
    setLeidas(nuevas);
    guardarNotificacionesLeidas(nuevas);
  }, [leidas]);
  const visibles = lista.filter((item) => notificacionPermitidaCiudadano(item, preferencias));
  const pendientes = visibles.filter((item) => !leidas.includes(Number(item.idNotificacion))).length;
  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLocaleLowerCase("es-CO");
    return [...visibles].filter((item) => {
      const leida = leidas.includes(Number(item.idNotificacion));
      const coincideEstado = filtro === "todas" || (filtro === "no-leidas" && !leida) || (filtro === "leidas" && leida);
      return coincideEstado && (!q || `${item.mensaje || ""} ${item.idAlerta ?? ""}`.toLocaleLowerCase("es-CO").includes(q));
    }).sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  }, [visibles, leidas, filtro, busqueda]);

  function abrir(item) {
    marcarLeidas([item.idNotificacion]);
    navigate(destinoNotificacion(item, "ciudadano").ruta);
  }

  return <main className="ciudadano-notifications ciudadano-pagina-refinada">
    <header className="ciudadano-page-heading ciudadano-notifications__hero"><div><span className="ciudadano-notifications__eyebrow"><i className="bi bi-bell-fill" /> CENTRO DE AVISOS</span><h1>Notificaciones</h1><p>Novedades de tu comunidad y seguimiento de tus alertas, con acceso directo a cada sección.</p></div><button type="button" onClick={() => setRecarga((n) => n + 1)} disabled={cargando}><i className={`bi bi-arrow-clockwise ${cargando ? "ciudadano-notifications__spin" : ""}`} /> Actualizar</button></header>
    <section className="ciudadano-notifications__summary"><div><span className="ciudadano-notifications__summary-icon"><i className="bi bi-bell" /></span><span><small>Avisos visibles</small><strong>{visibles.length}</strong></span></div><div><span className="ciudadano-notifications__summary-icon unread"><i className="bi bi-envelope-exclamation" /></span><span><small>Sin leer</small><strong>{pendientes}</strong></span></div><button type="button" onClick={() => marcarLeidas(visibles.map((item) => item.idNotificacion))} disabled={!pendientes}><i className="bi bi-check2-all" /> Marcar todas como leídas</button></section>
    <section className="ciudadano-notifications__panel" aria-label="Bandeja de notificaciones">
      <div className="ciudadano-notifications__toolbar"><label className="ciudadano-notifications__search"><i className="bi bi-search" /><input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar en tus notificaciones…" aria-label="Buscar notificaciones" /></label><div className="ciudadano-notifications__filters"><button type="button" className={filtro === "todas" ? "active" : ""} onClick={() => setFiltro("todas")}>Todas</button><button type="button" className={filtro === "no-leidas" ? "active" : ""} onClick={() => setFiltro("no-leidas")}>Sin leer ({pendientes})</button><button type="button" className={filtro === "leidas" ? "active" : ""} onClick={() => setFiltro("leidas")}>Leídas</button></div></div>
      {error && <div className="ciudadano-notifications__error" role="alert"><i className="bi bi-exclamation-triangle-fill" /><span>{error}</span><button type="button" onClick={() => setRecarga((n) => n + 1)}>Reintentar</button></div>}
      {cargando ? <div className="ciudadano-notifications__empty"><span className="ciudadano-notifications__loader" /><b>Cargando notificaciones…</b></div> : !error && filtradas.length === 0 ? <div className="ciudadano-notifications__empty"><i className="bi bi-bell-slash" /><b>{filtro === "no-leidas" ? "No tienes avisos sin leer" : "No hay notificaciones"}</b><span>Los avisos de la comunidad y de tus alertas aparecerán aquí.</span></div> : <div className="ciudadano-notifications__list">{filtradas.map((item) => {
        const leida = leidas.includes(Number(item.idNotificacion));
        const destino = destinoNotificacion(item, "ciudadano");
        return <article key={item.idNotificacion} className={`ciudadano-notifications__item ${leida ? "is-read" : "is-unread"}`}><span className="ciudadano-notifications__item-icon"><i className={`bi ${item.idAlerta != null ? "bi-exclamation-triangle-fill" : "bi-info-circle-fill"}`} /></span><div className="ciudadano-notifications__item-content"><div className="ciudadano-notifications__item-meta"><span>{item.idAlerta != null ? `Alerta #${item.idAlerta}` : "Aviso de Wolert"}</span><time>{fechaFormato(item.fecha)}</time></div><p>{item.mensaje || "Tienes una nueva notificación."}</p><button type="button" className="ciudadano-notifications__open" onClick={() => abrir(item)}>Ver en {destino.menu}<i className="bi bi-arrow-up-right" /></button></div><span className={`ciudadano-notifications__state ${leida ? "" : "unread"}`}>{leida ? "Leída" : "Sin leer"}</span></article>;
      })}</div>}
      <footer className="ciudadano-notifications__footer"><span>Mostrando {filtradas.length} de {visibles.length} avisos</span><span>El estado de lectura se guarda en este navegador.</span></footer>
    </section>
  </main>;
}
