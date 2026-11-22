import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/admin/notificaciones.css";
import { destinoNotificacion, listarNotificaciones } from "../../Services/NotificacionesAPI";
import { listarAlertas } from "../../Services/AlertasAPI";

const TERMINALES = ["RESUELTA", "CERRADA", "ATENDIDA", "FINALIZADA", "COMPLETADA", "CANCELADA"];
const PENDIENTES = ["PENDIENTE", "REPORTADA", "RECIBIDA", "NUEVA"];
const normalizar = (valor) => String(valor ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
const valor = (obj, ...claves) => claves.map((clave) => obj?.[clave]).find((dato) => dato != null && dato !== "") ?? null;
const estadoDe = (alerta) => valor(alerta, "estado", "Estado") ?? "Estado no informado";
const idDe = (alerta) => valor(alerta, "idAlerta", "IdAlerta", "id");
const fechaDe = (item) => valor(item, "fecha", "Fecha", "fechaReporte", "createdAt");
const parsearFecha = (fecha) => {
  if (!fecha) return null;
  const texto = String(fecha);
  const date = new Date(/(Z|[+-]\d{2}:\d{2})$/i.test(texto) ? texto : `${texto}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

function fechaFormato(fecha) {
  const date = parsearFecha(fecha);
  return date ? date.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "Fecha no disponible";
}

function crearAvisos(alertas) {
  const abiertas = alertas.filter((a) => {
    const estado = normalizar(estadoDe(a));
    return estado && !TERMINALES.includes(estado);
  });
  const altas = abiertas.filter((a) => normalizar(valor(a, "prioridad", "Prioridad")) === "ALTA");
  const idsAltas = new Set(altas.map((a) => String(idDe(a))));
  const pendientes = abiertas.filter((a) => PENDIENTES.includes(normalizar(estadoDe(a))) && !idsAltas.has(String(idDe(a))));
  const corte = Date.now() - 24 * 60 * 60 * 1000;
  const reportesRecientes = alertas.filter((a) => {
    const fecha = parsearFecha(fechaDe(a))?.getTime();
    return fecha != null && fecha >= corte;
  });
  const avisos = [];

  if (altas.length) {
    const referencia = [...altas].sort((a, b) => (parsearFecha(fechaDe(a))?.getTime() ?? 0) - (parsearFecha(fechaDe(b))?.getTime() ?? 0))[0];
    avisos.push({
      idNotificacion: "gestion-altas", idAlerta: idDe(referencia), categoria: "Prioridad alta", origen: "operativo", fecha: new Date().toISOString(),
      mensaje: `${altas.length} alerta${altas.length === 1 ? "" : "s"} de prioridad alta permanece${altas.length === 1 ? "" : "n"} abierta${altas.length === 1 ? "" : "s"}. La referencia más antigua es #${idDe(referencia) ?? "sin código"}: ${valor(referencia, "tipo", "Tipo") ?? "tipo no informado"}, ${estadoDe(referencia).toLowerCase()}${valor(referencia, "barrioNombre", "BarrioNombre") ? ` en ${valor(referencia, "barrioNombre", "BarrioNombre")}` : ""}. Revisa su atención y asignación.`,
    });
  }
  if (pendientes.length) {
    const referencia = [...pendientes].sort((a, b) => (parsearFecha(fechaDe(a))?.getTime() ?? 0) - (parsearFecha(fechaDe(b))?.getTime() ?? 0))[0];
    avisos.push({
      idNotificacion: "gestion-pendientes", idAlerta: idDe(referencia), categoria: "Alertas por revisar", origen: "operativo", fecha: new Date().toISOString(),
      mensaje: `${pendientes.length} alerta${pendientes.length === 1 ? "" : "s"} está${pendientes.length === 1 ? "" : "n"} en estado pendiente o recién reportada. Prioriza la #${idDe(referencia) ?? "sin código"} (${valor(referencia, "tipo", "Tipo") ?? "tipo no informado"}) para definir su atención.`,
    });
  }
  if (reportesRecientes.length) {
    const resueltas = reportesRecientes.filter((a) => normalizar(estadoDe(a)) === "RESUELTA").length;
    const canceladas = reportesRecientes.filter((a) => normalizar(estadoDe(a)) === "CANCELADA").length;
    avisos.push({
      idNotificacion: "gestion-actividad-reciente", categoria: "Actividad reciente", origen: "operativo", fecha: new Date().toISOString(),
      mensaje: `En las últimas 24 horas se reportaron ${reportesRecientes.length} alerta${reportesRecientes.length === 1 ? "" : "s"}. De ese grupo, ${resueltas} figura${resueltas === 1 ? "" : "n"} como resuelta${resueltas === 1 ? "" : "s"} y ${canceladas} como cancelada${canceladas === 1 ? "" : "s"} al consultar el estado actual.`,
    });
  }
  return avisos;
}

export default function Notificaciones() {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorAlertas, setErrorAlertas] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    Promise.allSettled([listarNotificaciones(controller.signal), listarAlertas(controller.signal)]).then(([notis, listaAlertas]) => {
      if (controller.signal.aborted) return;
      if (notis.status === "fulfilled" && Array.isArray(notis.value)) {
        setNotificaciones(notis.value);
        setError("");
      } else {
        setNotificaciones([]);
        setError(notis.status === "rejected" ? notis.reason?.message : "El servicio devolvió notificaciones con formato no válido.");
      }
      if (listaAlertas.status === "fulfilled" && Array.isArray(listaAlertas.value)) {
        setAlertas(listaAlertas.value);
        setErrorAlertas("");
      } else {
        setAlertas([]);
        setErrorAlertas("No se pudieron consultar las alertas actuales; se muestran solo los avisos guardados.");
      }
    }).finally(() => { if (!controller.signal.aborted) setCargando(false); });
    return () => controller.abort();
  }, [recarga]);

  const avisos = useMemo(() => {
    const alertasPorId = new Map(alertas.map((a) => [String(idDe(a)), a]));
    const guardadas = notificaciones.map((n, index) => {
      const idAlerta = valor(n, "idAlerta", "IdAlerta");
      const alerta = idAlerta == null ? null : alertasPorId.get(String(idAlerta));
      const base = valor(n, "mensaje", "Mensaje") ?? "Aviso del sistema";
      const contexto = alerta
        ? ` Alerta #${idAlerta}: ${valor(alerta, "tipo", "Tipo") ?? "tipo no informado"}, prioridad ${String(valor(alerta, "prioridad", "Prioridad") ?? "no informada").toLowerCase()}, estado ${String(estadoDe(alerta)).toLowerCase()}${valor(alerta, "barrioNombre", "BarrioNombre") ? `, barrio ${valor(alerta, "barrioNombre", "BarrioNombre")}` : ""}.`
        : idAlerta != null ? ` Referencia: alerta #${idAlerta}.` : "";
      return { ...n, idNotificacion: valor(n, "idNotificacion", "IdNotificacion", "id") ?? `sistema-${index}`, idAlerta, fecha: fechaDe(n), mensaje: `${base}${contexto}`, categoria: idAlerta != null ? `Alerta #${idAlerta}` : "Aviso del sistema", origen: "sistema" };
    });
    return [...guardadas, ...crearAvisos(alertas)].sort((a, b) => (parsearFecha(b.fecha)?.getTime() ?? 0) - (parsearFecha(a.fecha)?.getTime() ?? 0));
  }, [alertas, notificaciones]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLocaleLowerCase("es-CO");
    return avisos.filter((item) => !q || `${item.categoria} ${item.mensaje} ${item.idAlerta ?? ""}`.toLocaleLowerCase("es-CO").includes(q));
  }, [avisos, busqueda]);

  return (
    <main className="admin-notifications">
      <header className="admin-notifications__hero">
        <div><span className="admin-notifications__eyebrow"><i className="bi bi-bell-fill" /> CENTRO DE ACTIVIDAD ADMINISTRATIVA</span><h1>Notificaciones</h1><p>Seguimiento de prioridades, cierres y alertas que requieren gestión.</p></div>
        <button type="button" onClick={() => setRecarga((n) => n + 1)} disabled={cargando}><i className={`bi bi-arrow-clockwise ${cargando ? "admin-notifications__spin" : ""}`} /> Actualizar</button>
      </header>
      <section className="admin-notifications__summary"><div><span className="admin-notifications__summary-icon"><i className="bi bi-bell" /></span><span><small>Avisos guardados</small><strong>{notificaciones.length}</strong></span></div><div><span className="admin-notifications__summary-icon admin-notifications__summary-icon--action"><i className="bi bi-clipboard2-check" /></span><span><small>Seguimientos actuales</small><strong>{crearAvisos(alertas).length}</strong></span></div><p>Los seguimientos se basan en las alertas devueltas por el sistema.</p></section>
      <section className="admin-notifications__panel">
        <div className="admin-notifications__toolbar"><label className="admin-notifications__search"><i className="bi bi-search" /><input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por alerta, estado, barrio o mensaje..." aria-label="Buscar notificaciones" /></label><span className="admin-notifications__sort"><i className="bi bi-clock-history" /> Más recientes primero</span></div>
        {error && <div className="admin-notifications__error" role="alert"><i className="bi bi-exclamation-triangle-fill" /><span>{error}</span><button type="button" onClick={() => setRecarga((n) => n + 1)}>Reintentar</button></div>}
        {errorAlertas && !cargando && <div className="admin-notifications__data-note" role="status"><i className="bi bi-info-circle" />{errorAlertas}</div>}
        {cargando ? <div className="admin-notifications__empty"><span className="admin-notifications__loader" /><b>Consultando actividad...</b></div> : filtradas.length === 0 ? <div className="admin-notifications__empty"><i className="bi bi-bell-slash" /><b>{busqueda ? "No hay coincidencias" : "No hay avisos"}</b><span>{busqueda ? "Prueba con otro término de búsqueda." : "Los avisos de gestión aparecerán cuando haya alertas que revisar."}</span></div> : <div className="admin-notifications__list">{filtradas.map((item) => {
          const destino = item.origen === "operativo" ? { ruta: "/admin/alertas", menu: "Alertas" } : destinoNotificacion(item);
          return <article key={item.idNotificacion} className={`admin-notifications__item ${item.origen === "operativo" ? "is-operational" : ""}`}><span className="admin-notifications__item-icon"><i className={`bi ${item.origen === "operativo" ? "bi-clipboard2-check-fill" : item.idAlerta != null ? "bi-exclamation-triangle-fill" : "bi-info-circle-fill"}`} /></span><div className="admin-notifications__item-content"><div className="admin-notifications__item-meta"><span>{item.categoria}</span><time>{fechaFormato(item.fecha)}</time></div><p>{item.mensaje}</p><button type="button" className="admin-notifications__open" onClick={() => navigate(destino.ruta)}>Revisar en {destino.menu}<i className="bi bi-arrow-up-right" /></button></div>{item.origen === "operativo" && <span className="admin-notifications__tag">GESTIÓN</span>}</article>;
        })}</div>}
        <footer className="admin-notifications__footer"><span>Mostrando {filtradas.length} de {avisos.length} avisos</span><span>Los cierres distinguen alertas resueltas y canceladas</span></footer>
      </section>
    </main>
  );
}
