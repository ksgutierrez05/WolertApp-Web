import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/global.css";
import "../../css/temas.css";
import "../../css/ciudadano/encabezados-ciudadano.css";
import "../../css/ciudadano/panel-notificaciones.css";
import "../../css/ciudadano/vistas-bandeja.css";
import { destinoNotificacion, listarMisNotificaciones } from "../../Services/NotificacionesAPI";
import { notificacionPermitidaCiudadano, obtenerPreferenciasCiudadano } from "../../Services/PreferenciasCiudadano";

function fechaFormato(valor) {
  if (!valor) return "Fecha no disponible";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "Fecha no disponible";

  return fecha.toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Notificaciones() {
  const navigate = useNavigate();
  const [lista, setLista] = useState([]);
  const [preferencias, setPreferencias] = useState(() => obtenerPreferenciasCiudadano());
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const recargar = () => {
    setCargando(true);
    setRecarga((n) => n + 1);
  };

  useEffect(() => {
    const controller = new AbortController();
    listarMisNotificaciones(controller.signal)
      .then((notificaciones) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(notificaciones)) {
          throw new Error("La API no devolvió una lista válida de notificaciones.");
        }
        setLista(notificaciones);
        setError("");
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message || "No se pudieron cargar tus notificaciones.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setCargando(false); });
    return () => controller.abort();
  }, [recarga]);

  useEffect(() => {
    const sincronizar = (event) => setPreferencias(event.detail || obtenerPreferenciasCiudadano());
    window.addEventListener("wolert:preferencias-ciudadano", sincronizar);
    return () => window.removeEventListener("wolert:preferencias-ciudadano", sincronizar);
  }, []);

  useEffect(() => {
    const cambioSesion = (event) => {
      if (event.key && !["token", "idUsuario"].includes(event.key)) return;
      setLista([]);
      setCargando(true);
      setRecarga((actual) => actual + 1);
    };
    window.addEventListener("storage", cambioSesion);
    return () => window.removeEventListener("storage", cambioSesion);
  }, []);

  const visibles = lista.filter((item) =>
    notificacionPermitidaCiudadano(item, preferencias),
  );
  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLocaleLowerCase("es-CO");
    return [...visibles]
      .filter((item) => {
        const contenido = `${item.mensaje || ""} ${item.idAlerta ?? ""}`;
        return !q || contenido.toLocaleLowerCase("es-CO").includes(q);
      })
      .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  }, [visibles, busqueda]);

  return (
    <main className="ciudadano-notifications ciudadano-pagina-refinada">
      <header className="ciudadano-page-heading ciudadano-notifications__hero">
        <div>
          <span className="ciudadano-notifications__eyebrow">
            <i className="bi bi-bell-fill" /> CENTRO DE AVISOS
          </span>
          <h1>Notificaciones</h1>
          <p>Novedades de tu comunidad y seguimiento de tus alertas.</p>
        </div>
        <button
          type="button"
          onClick={recargar}
          disabled={cargando}
        >
          <i className={`bi bi-arrow-clockwise ${cargando ? "ciudadano-notifications__spin" : ""}`} />
          Actualizar
        </button>
      </header>

      <section className="ciudadano-notifications__summary">
        <div>
          <span className="ciudadano-notifications__summary-icon">
            <i className="bi bi-bell" />
          </span>
          <span><small>Avisos visibles</small><strong>{visibles.length}</strong></span>
        </div>
        <p>Los avisos se ordenan del más reciente al más antiguo.</p>
      </section>

    <section className="ciudadano-notifications__panel" aria-label="Bandeja de notificaciones">
        <div className="ciudadano-notifications__toolbar">
          <label className="ciudadano-notifications__search">
            <i className="bi bi-search" />
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar en tus notificaciones..."
              aria-label="Buscar notificaciones"
            />
          </label>
          <span className="ciudadano-notifications__sort">
            <i className="bi bi-clock-history" /> Más recientes primero
          </span>
        </div>

        {error && (
          <div className="ciudadano-notifications__error" role="alert">
            <i className="bi bi-exclamation-triangle-fill" />
            <span>{error}</span>
            <button type="button" onClick={recargar}>
              Reintentar
            </button>
          </div>
        )}

        {cargando ? (
          <div className="ciudadano-notifications__empty">
            <span className="ciudadano-notifications__loader" />
            <b>Cargando notificaciones...</b>
          </div>
        ) : !error && filtradas.length === 0 ? (
          <div className="ciudadano-notifications__empty">
            <i className="bi bi-bell-slash" />
            <b>No hay notificaciones</b>
            <span>Los avisos de tu comunidad y de tus alertas aparecerán aquí.</span>
          </div>
        ) : (
          <div className="ciudadano-notifications__list">
            {filtradas.map((item) => {
              const destino = destinoNotificacion(item, "ciudadano");
              const icono = item.idAlerta != null
                ? "bi-exclamation-triangle-fill"
                : "bi-info-circle-fill";

              return (
                <article
                  key={item.idNotificacion}
                  className="ciudadano-notifications__item"
                >
                  <span className="ciudadano-notifications__item-icon">
                    <i className={`bi ${icono}`} />
                  </span>
                  <div className="ciudadano-notifications__item-content">
                    <div className="ciudadano-notifications__item-meta">
                      <span>
                        {item.idAlerta != null
                          ? `Alerta #${item.idAlerta}`
                          : "Aviso de Wolert"}
                      </span>
                      <time>{fechaFormato(item.fecha)}</time>
                    </div>
                    <p>{item.mensaje || "Tienes una nueva notificación."}</p>
                    <button
                      type="button"
                      className="ciudadano-notifications__open"
                      onClick={() => navigate(destino.ruta)}
                    >
                      Ver en {destino.menu}
                      <i className="bi bi-arrow-up-right" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <footer className="ciudadano-notifications__footer">
          <span>Mostrando {filtradas.length} de {visibles.length} avisos</span>
          <span>Preferencias aplicadas a esta bandeja</span>
        </footer>
      </section>
    </main>
  );
}
