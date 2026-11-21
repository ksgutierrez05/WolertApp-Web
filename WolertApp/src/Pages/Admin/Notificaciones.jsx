import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/admin/notificaciones.css";
import { destinoNotificacion, listarNotificaciones } from "../../Services/NotificacionesAPI";

function fechaFormato(valor) {
  if (!valor) return "Fecha no disponible";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? "Fecha no disponible" : fecha.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export default function Notificaciones() {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    listarNotificaciones(controller.signal).then((lista) => {
      if (!controller.signal.aborted) {
        if (!Array.isArray(lista)) throw new Error("La API no devolvio una lista valida.");
        setNotificaciones(lista);
        setError("");
      }
    }).catch((err) => { if (!controller.signal.aborted) setError(err.message || "No se pudieron cargar las notificaciones."); })
      .finally(() => { if (!controller.signal.aborted) setCargando(false); });
    return () => controller.abort();
  }, [recarga]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLocaleLowerCase("es-CO");
    return [...notificaciones].filter((item) => !q || `${item.mensaje || ""} ${item.idAlerta ?? ""} ${item.idNotificacion}`.toLocaleLowerCase("es-CO").includes(q))
      .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  }, [notificaciones, busqueda]);

  return <main className="admin-notifications">
    <header className="admin-notifications__hero"><div><span className="admin-notifications__eyebrow"><i className="bi bi-bell-fill" /> CENTRO DE ACTIVIDAD</span><h1>Notificaciones</h1><p>Avisos del sistema con acceso directo a la seccion del dashboard relacionada.</p></div><button type="button" onClick={() => setRecarga((n) => n + 1)} disabled={cargando}><i className={`bi bi-arrow-clockwise ${cargando ? "admin-notifications__spin" : ""}`} /> Actualizar</button></header>
    <section className="admin-notifications__summary"><div><span className="admin-notifications__summary-icon"><i className="bi bi-bell" /></span><span><small>Avisos recibidos</small><strong>{notificaciones.length}</strong></span></div><p>Selecciona un aviso para abrir la seccion relacionada.</p></section>
    <section className="admin-notifications__panel">
      <div className="admin-notifications__toolbar"><label className="admin-notifications__search"><i className="bi bi-search" /><input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar en notificaciones..." aria-label="Buscar notificaciones" /></label><span className="admin-notifications__sort"><i className="bi bi-clock-history" /> Mas recientes primero</span></div>
      {error && <div className="admin-notifications__error" role="alert"><i className="bi bi-exclamation-triangle-fill" />{error}<button type="button" onClick={() => setRecarga((n) => n + 1)}>Reintentar</button></div>}
      {cargando ? <div className="admin-notifications__empty"><span className="admin-notifications__loader" /><b>Cargando notificaciones...</b></div> : !error && filtradas.length === 0 ? <div className="admin-notifications__empty"><i className="bi bi-bell-slash" /><b>No hay notificaciones</b><span>Los avisos del sistema apareceran aqui.</span></div> : <div className="admin-notifications__list">{filtradas.map((item) => {
        const destino = destinoNotificacion(item);
        return <article key={item.idNotificacion} className="admin-notifications__item"><span className="admin-notifications__item-icon"><i className={`bi ${item.idAlerta != null ? "bi-exclamation-triangle-fill" : "bi-info-circle-fill"}`} /></span><div className="admin-notifications__item-content"><div className="admin-notifications__item-meta"><span>{item.idAlerta != null ? `Alerta #${item.idAlerta}` : "Aviso del sistema"}</span><time>{fechaFormato(item.fecha)}</time></div><p>{item.mensaje || "Nueva notificacion"}</p><button type="button" className="admin-notifications__open" onClick={() => navigate(destino.ruta)}>Ver en {destino.menu}<i className="bi bi-arrow-up-right" /></button></div></article>;
      })}</div>}
      <footer className="admin-notifications__footer"><span>Mostrando {filtradas.length} de {notificaciones.length} avisos</span><span>Registro de notificaciones del sistema</span></footer>
    </section>
  </main>;
}
