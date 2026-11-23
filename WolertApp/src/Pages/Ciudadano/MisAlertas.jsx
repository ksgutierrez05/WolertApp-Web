import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../css/global.css";
import "../../css/temas.css";
import "../../css/ciudadano/vistas-bandeja.css";
import { listarMisAlertas } from "../../Services/AlertasAPI.js";

const normalizar = (texto = "") => String(texto)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .trim()
  .toLowerCase()
  .replace(/\s+/g, "_");

const parsearFecha = (valor) => {
  if (!valor) return null;
  const fechaTexto = String(valor);
  const fecha = new Date(/(Z|[+-]\d{2}:\d{2})$/i.test(fechaTexto) ? fechaTexto : `${fechaTexto}Z`);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const hace = (fecha) => {
  if (!fecha) return "";
  const minutos = Math.max(0, Math.round((Date.now() - fecha.getTime()) / 60000));
  if (minutos < 1) return "Ahora";
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  return `Hace ${Math.round(horas / 24)} d`;
};

const formatoFecha = (fecha) => fecha
  ? fecha.toLocaleString("es-CO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  : "";

const estadoUI = (estado) => {
  const valor = normalizar(estado);
  if (["cancelada", "cancelado"].includes(valor)) return "cancelada";
  if (["resuelta", "resuelto"].includes(valor)) return "resuelta";
  if (["cerrada", "cerrado", "finalizada", "finalizado", "atendida", "completada"].includes(valor)) return "cerrada";
  if (["en_camino", "en_atencion", "atendiendo", "en_revision", "asignada", "asignado"].includes(valor)) return "en_revision";
  return "activa";
};

const mapearAlerta = (alerta) => {
  const fecha = parsearFecha(alerta.fechaCreacion ?? alerta.fecha ?? alerta.fechaAlerta);
  const latitud = alerta.latitud ?? alerta.Latitud;
  const longitud = alerta.longitud ?? alerta.Longitud;

  return {
    id: alerta.idAlerta ?? alerta.IdAlerta ?? alerta.id,
    tipo: alerta.tipo ?? alerta.tipoAlertaNombre ?? alerta.tipoAlerta?.nombre ?? alerta.tipoNombre ?? "Alerta",
    estado: estadoUI(alerta.estado ?? alerta.Estado),
    estadoOriginal: alerta.estado ?? alerta.Estado ?? "",
    prioridad: alerta.prioridad ?? alerta.Prioridad ?? "",
    descripcion: alerta.descripcion ?? "",
    barrio: alerta.barrioNombre ?? alerta.barrio?.nombre ?? "",
    comuna: alerta.comunaNombre ?? alerta.barrio?.comuna?.nombre ?? "",
    coordenadas: latitud != null && longitud != null
      ? `${Number(latitud).toFixed(5)}, ${Number(longitud).toFixed(5)}`
      : "",
    fechaObj: fecha,
    fecha: formatoFecha(fecha),
    tiempo: hace(fecha),
  };
};

const esCerrada = (estado) => ["resuelta", "cancelada", "cerrada"].includes(estado);
const etiquetaEstado = (estado) => ({
  activa: "Pendiente",
  en_revision: "En atención",
  resuelta: "Resuelta",
  cancelada: "Cancelada",
  cerrada: "Cerrada",
}[estado] || "Pendiente");
const iconoEstado = (estado) => ({
  activa: "bi-hourglass-split",
  en_revision: "bi-search",
  cancelada: "bi-x-circle",
  resuelta: "bi-check2-circle",
  cerrada: "bi-check2-circle",
}[estado] || "bi-hourglass-split");
const tonoEstado = (estado) => estado === "activa"
  ? "amber"
  : estado === "cancelada" || estado === "cerrada"
    ? "slate"
    : "";

export default function MisAlertas() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    let activo = true;

    listarMisAlertas()
      .then((datos) => {
        if (!activo) return;
        const lista = datos
          .map(mapearAlerta)
          .sort((a, b) => (b.fechaObj?.getTime() ?? 0) - (a.fechaObj?.getTime() ?? 0));
        setAlertas(lista);
      })
      .catch((err) => {
        if (activo) setError(err.message || "No se pudieron cargar tus alertas.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const total = alertas.length;
  const abiertas = alertas.filter((alerta) => !esCerrada(alerta.estado)).length;
  const cerradas = total - abiertas;
  const filtradas = alertas.filter((alerta) => {
    if (filtro === "activa") return !esCerrada(alerta.estado);
    if (filtro === "cerrada") return esCerrada(alerta.estado);
    return true;
  });

  return (
    <main className="ciudadano-bandeja ciudadano-mis-alertas">
      <header className="ciudadano-bandeja__hero">
        <div>
          <span className="ciudadano-bandeja__eyebrow">
            <i className="bi bi-clipboard-data" /> SEGUIMIENTO PERSONAL
          </span>
          <h1>Mis alertas</h1>
          <p>Consulta el estado y seguimiento de las emergencias que has reportado.</p>
        </div>
        <Link to="/ciudadano/reportar-emergencia" className="ciudadano-bandeja__action">
          <i className="bi bi-plus-lg" /> Nueva alerta
        </Link>
      </header>

      <section className="ciudadano-bandeja__summary" aria-label="Resumen de mis alertas">
        <Metric icon="bi-clipboard-data" label="Alertas reportadas" value={cargando ? "—" : total} />
        <Metric icon="bi-hourglass-split" label="Activas o en atención" value={cargando ? "—" : abiertas} tone="amber" />
        <Metric icon="bi-check2-circle" label="Resueltas o cerradas" value={cargando ? "—" : cerradas} tone="slate" />
      </section>

      <section className="ciudadano-bandeja__panel" aria-label="Historial de alertas">
        <div className="ciudadano-bandeja__toolbar">
          <div className="ciudadano-bandeja__filters" role="group" aria-label="Filtrar mis alertas">
            {[
              { id: "todas", etiqueta: "Todas" },
              { id: "activa", etiqueta: "Activas" },
              { id: "cerrada", etiqueta: "Cerradas" },
            ].map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                className={filtro === opcion.id ? "active" : ""}
                aria-pressed={filtro === opcion.id}
                onClick={() => setFiltro(opcion.id)}
              >
                {opcion.etiqueta}
              </button>
            ))}
          </div>
          <span className="ciudadano-bandeja__meta">Más recientes primero</span>
        </div>

        {error && (
          <div className="ciudadano-bandeja__error" role="alert">
            <i className="bi bi-exclamation-circle-fill" />
            {error}
          </div>
        )}

        {cargando ? (
          <Empty icon="bi-arrow-repeat" title="Cargando tus alertas..." />
        ) : !error && filtradas.length === 0 ? (
          <div className="ciudadano-bandeja__empty">
            <i className="bi bi-inboxes" />
            <strong>{total ? "No hay alertas en este filtro" : "Aún no has reportado alertas"}</strong>
            {!total && (
              <Link to="/ciudadano/reportar-emergencia">Reportar una emergencia</Link>
            )}
          </div>
        ) : (
          <div className="ciudadano-bandeja__list">
            {filtradas.map((alerta) => {
              const estaExpandida = expandido === alerta.id;
              const tono = tonoEstado(alerta.estado);

              return (
                <article className="ciudadano-bandeja__item" key={alerta.id}>
                  <span className={`ciudadano-bandeja__item-icon ${tono}`}>
                    <i className={`bi ${iconoEstado(alerta.estado)}`} />
                  </span>
                  <div className="ciudadano-bandeja__item-body">
                    <div className="ciudadano-bandeja__item-heading">
                      <h2>{alerta.tipo} · #{alerta.id}</h2>
                      <span className={`ciudadano-bandeja__badge ${tono}`}>
                        <i className={`bi ${iconoEstado(alerta.estado)}`} />
                        {etiquetaEstado(alerta.estado)}
                      </span>
                    </div>
                    {alerta.descripcion && <p>{alerta.descripcion}</p>}
                    <div className="ciudadano-bandeja__meta">
                      {(alerta.barrio || alerta.coordenadas) && (
                        <span>
                          <i className="bi bi-geo-alt" />
                          {alerta.barrio || alerta.coordenadas}
                        </span>
                      )}
                      {alerta.tiempo && (
                        <span><i className="bi bi-clock" /> {alerta.tiempo}</span>
                      )}
                      <button
                        type="button"
                        className="ciudadano-bandeja__expand"
                        aria-expanded={estaExpandida}
                        onClick={() => setExpandido(estaExpandida ? null : alerta.id)}
                      >
                        {estaExpandida ? "Ocultar detalles" : "Ver detalles"}
                        <i className={`bi ${estaExpandida ? "bi-chevron-up" : "bi-chevron-down"}`} />
                      </button>
                    </div>

                    {estaExpandida && (
                      <div className="ciudadano-bandeja__details">
                        <Detail label="Referencia" value={`Alerta #${alerta.id}`} />
                        <Detail label="Tipo de alerta" value={alerta.tipo} />
                        {alerta.prioridad && <Detail label="Prioridad" value={alerta.prioridad} />}
                        {alerta.estadoOriginal && <Detail label="Estado del sistema" value={alerta.estadoOriginal} />}
                        {alerta.descripcion && <Detail label="Descripción" value={alerta.descripcion} />}
                        {alerta.coordenadas && <Detail label="Coordenadas" value={alerta.coordenadas} />}
                        {(alerta.barrio || alerta.comuna) && (
                          <Detail label="Barrio / Comuna" value={[alerta.barrio, alerta.comuna].filter(Boolean).join(" · ")} />
                        )}
                        {alerta.fecha && <Detail label="Fecha del reporte" value={alerta.fecha} />}
                        <Detail label="Estado actual" value={etiquetaEstado(alerta.estado)} />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <footer className="ciudadano-bandeja__footer">
          <span>Mostrando {filtradas.length} de {total} alertas</span>
          <span>Seguimiento de tus reportes</span>
        </footer>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, tone = "" }) {
  return (
    <div className="ciudadano-bandeja__metric">
      <span className={`ciudadano-bandeja__metric-icon ${tone}`}>
        <i className={`bi ${icon}`} />
      </span>
      <span className="ciudadano-bandeja__metric-copy">
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}

function Empty({ icon, title }) {
  return (
    <div className="ciudadano-bandeja__empty">
      <i className={`bi ${icon}`} />
      <strong>{title}</strong>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <strong>{label}:</strong>
      <span>{value}</span>
    </div>
  );
}
