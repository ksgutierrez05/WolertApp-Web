import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import {
  fechaDe,
  fechaLegible,
  idNotificacion,
  mensajeNotificacion,
  noLeida,
} from "../../Services/notificacionesCentralService";
import {
  obtenerEstadoNotificacionesCentral,
  suscribirNotificacionesCentral,
} from "../../Services/notificacionesCentralStore";
import { leerIdsLeidos, guardarIdsLeidos } from "../../Services/notificacionesEstado";
import { obtenerPerfilCentral } from "../../Services/configuracionCentralService";
import { logOut } from "../../Services/UsuariosAPI";

const MODULOS = [
  ["Centro de Operaciones", "/Central-Policia"],
  ["Mapa", "/Central-Policia/Mapa"],
  ["Alertas", "/Central-Policia/Alertas"],
  ["Asignaciones", "/Central-Policia/Asignaciones"],
  ["Atención de alertas", "/Central-Policia/AtencionAlertas"],
  ["Unidades", "/Central-Policia/Unidades"],
  ["Historial", "/Central-Policia/Historial"],
  ["Informes", "/Central-Policia/Reportes"],
  ["Notificaciones", "/Central-Policia/Notificaciones"],
  ["Configuración", "/Central-Policia/Configuracion"],
];

const normalizar = (texto) => String(texto ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("es");

function Topbar({ iniciales = "CR", placeholder = "Buscar módulo..." }) {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [panel, setPanel] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const notificaciones = useSyncExternalStore(
    suscribirNotificacionesCentral,
    obtenerEstadoNotificacionesCentral,
    obtenerEstadoNotificacionesCentral
  );
  const [leidas, setLeidas] = useState(leerIdsLeidos);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const sincronizar = () => setLeidas(leerIdsLeidos());
    window.addEventListener("wolertapp:notificaciones", sincronizar);
    window.addEventListener("storage", sincronizar);
    return () => {
      window.removeEventListener("wolertapp:notificaciones", sincronizar);
      window.removeEventListener("storage", sincronizar);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    obtenerPerfilCentral(controller.signal)
      .then((resultado) => {
        if (!controller.signal.aborted) setPerfil(resultado);
      })
      .catch(() => {
        if (!controller.signal.aborted) setPerfil(null);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const cerrarFuera = (evento) => {
      if (!ref.current?.contains(evento.target)) setPanel("");
    };
    const cerrarEscape = (evento) => {
      if (evento.key === "Escape") setPanel("");
    };
    document.addEventListener("pointerdown", cerrarFuera);
    document.addEventListener("keydown", cerrarEscape);
    return () => {
      document.removeEventListener("pointerdown", cerrarFuera);
      document.removeEventListener("keydown", cerrarEscape);
    };
  }, []);

  const resultados = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    return MODULOS.filter(([nombre]) => !termino || normalizar(nombre).includes(termino));
  }, [busqueda]);
  const pendientes = notificaciones.lista.filter((item, index) =>
    noLeida(item, leidas, idNotificacion(item) ?? index)
  );
  const recientes = [...notificaciones.lista].sort((a, b) =>
    new Date(fechaDe(b) || 0) - new Date(fechaDe(a) || 0)
  ).slice(0, 6);
  const nombrePerfil = [perfil?.nombres, perfil?.apellidos]
    .filter((parte) => parte && parte !== "No disponible")
    .join(" ");
  const nombre = nombrePerfil || localStorage.getItem("nombre") ||
    localStorage.getItem("username") || "Usuario de Central Policía";
  const rol = perfil?.rol && perfil.rol !== "No disponible" ? perfil.rol : "Central Policía";
  const avatar = nombrePerfil
    ? nombrePerfil.split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase()
    : iniciales;

  const ir = (ruta) => {
    setPanel("");
    setBusqueda("");
    navigate(ruta);
  };
  const marcar = (ids) => setLeidas(guardarIdsLeidos([...leerIdsLeidos(), ...ids.map(String)]));

  return (
    <div ref={ref} className="topbar-dash cp-topbar d-flex align-items-center gap-3 mb-4">
      <div className="search-dash cp-search flex-grow-1 d-flex align-items-center input-group">
        <span className="input-group-text bg-transparent border-0"><i className="bi bi-search" /></span>
        <input
          type="search"
          className="form-control border-0 bg-transparent"
          placeholder={placeholder}
          value={busqueda}
          aria-label="Buscar módulos de Central Policía"
          aria-expanded={panel === "buscar"}
          onFocus={() => setPanel("buscar")}
          onChange={(evento) => { setBusqueda(evento.target.value); setPanel("buscar"); }}
          onKeyDown={(evento) => {
            if (evento.key === "Enter" && resultados.length) ir(resultados[0][1]);
          }}
        />
        {panel === "buscar" && (
          <div className="cp-pop cp-results" role="listbox">
            <strong className="cp-pop-heading">Módulos</strong>
            {resultados.length ? resultados.map(([etiqueta, ruta]) => (
              <button type="button" key={ruta} role="option" onClick={() => ir(ruta)}>
                <span>{etiqueta}</span><i className="bi bi-chevron-right" />
              </button>
            )) : <p className="cp-empty">Sin resultados para esa búsqueda.</p>}
          </div>
        )}
      </div>

      <div className="cp-anchor">
        <button
          type="button"
          className="icon-btn-dash btn btn-light cp-bell"
          aria-label={`Notificaciones: ${pendientes.length} sin leer`}
          aria-expanded={panel === "avisos"}
          onClick={() => setPanel(panel === "avisos" ? "" : "avisos")}
        >
          <i className="bi bi-bell" />
          {pendientes.length > 0 && <span className="cp-count">{pendientes.length > 99 ? "99+" : pendientes.length}</span>}
        </button>
        {panel === "avisos" && (
          <section className="cp-pop cp-notifications" aria-label="Notificaciones recientes">
            <header className="cp-pop-header">
              <strong>Notificaciones</strong>
              <button
                type="button"
                disabled={!pendientes.length}
                onClick={() => marcar(pendientes.map((item) => idNotificacion(item) ?? notificaciones.lista.indexOf(item)))}
              >
                Marcar todas como leídas
              </button>
            </header>
            <div className="cp-notification-list">
              {notificaciones.cargando ? <p className="cp-empty">Cargando notificaciones...</p> : null}
              {!notificaciones.cargando && notificaciones.error && <p className="cp-empty cp-error" role="alert">{notificaciones.error}</p>}
              {!notificaciones.cargando && !notificaciones.error && !notificaciones.lista.length && <p className="cp-empty">No tienes notificaciones.</p>}
              {!notificaciones.cargando && recientes.map((item, index) => {
                const id = idNotificacion(item) ?? index;
                const nueva = noLeida(item, leidas, id);
                return (
                  <article className={`cp-notification ${nueva ? "is-unread" : "is-read"}`} key={id}>
                    <button type="button" className="cp-notification-content" onClick={() => ir("/Central-Policia/Notificaciones")}>
                      <strong>{nueva && <span className="cp-unread-dot" />}Notificación #{id}</strong>
                      <span>{mensajeNotificacion(item)}</span>
                      <small>{fechaLegible(fechaDe(item))}</small>
                    </button>
                    {nueva && <button type="button" className="cp-mark-read" aria-label={`Marcar notificación ${id} como leída`} onClick={() => marcar([id])}><i className="bi bi-check2" /></button>}
                  </article>
                );
              })}
            </div>
            <button type="button" className="cp-view-all" onClick={() => ir("/Central-Policia/Notificaciones")}>Ver todas las notificaciones</button>
          </section>
        )}
      </div>

      <div className="cp-anchor">
        <button type="button" className="avatar-dash cp-avatar" aria-label="Menú de usuario" aria-expanded={panel === "perfil"} onClick={() => setPanel(panel === "perfil" ? "" : "perfil")}>{avatar}</button>
        {panel === "perfil" && (
          <section className="cp-pop cp-profile">
            <strong>{nombre}</strong>
            <span>{rol}</span>
            <button type="button" onClick={() => ir("/Central-Policia/Configuracion")}>Configuración</button>
            <button type="button" onClick={() => { logOut(); navigate("/", { replace: true }); }}>Cerrar sesión</button>
          </section>
        )}
      </div>
    </div>
  );
}

export default Topbar;
