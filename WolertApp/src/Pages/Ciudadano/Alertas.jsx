import { useEffect, useMemo, useState } from "react";
import "../../css/global.css";
import "../../css/temas.css";
import "../../css/ciudadano/vistas-bandeja.css";
import { listarAlertas } from "../../Services/AlertasAPI.js";

const PRIORIDADES = [
  { valor: "alta", etiqueta: "Alta" },
  { valor: "media", etiqueta: "Media" },
  { valor: "baja", etiqueta: "Baja" },
];

const fechaFormato = (valor) => {
  if (!valor) return "Fecha no disponible";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "Fecha no disponible";

  return fecha.toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const estiloPrioridad = (prioridad) => {
  if (prioridad === "alta") return "danger";
  if (prioridad === "media") return "amber";
  return "slate";
};

export default function Alertas() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroPrioridad, setFiltroPrioridad] = useState("");

  useEffect(() => {
    let activo = true;

    listarAlertas()
      .then((datos) => {
        if (activo) setAlertas(Array.isArray(datos) ? datos : []);
      })
      .catch((err) => {
        if (activo) setError(err.message || "No se pudieron cargar las alertas.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es-CO");

    return alertas.filter((alerta) => {
      const contenido = [
        alerta.tipo,
        alerta.reportadoPor,
        alerta.barrioNombre,
      ].join(" ").toLocaleLowerCase("es-CO");
      const prioridad = (alerta.prioridad || "").toLocaleLowerCase("es-CO");

      return (!texto || contenido.includes(texto))
        && (!filtroPrioridad || prioridad === filtroPrioridad);
    });
  }, [alertas, busqueda, filtroPrioridad]);

  const contarPrioridad = (prioridad) => alertas.filter(
    (alerta) => (alerta.prioridad || "").toLowerCase() === prioridad,
  ).length;

  return (
    <main className="ciudadano-bandeja">
      <header className="ciudadano-bandeja__hero">
        <div>
          <span className="ciudadano-bandeja__eyebrow">
            <i className="bi bi-exclamation-triangle-fill" /> ALERTAS DE LA COMUNIDAD
          </span>
          <h1>Alertas</h1>
          <p>Consulta los reportes recientes de tu comunidad y su prioridad.</p>
        </div>
      </header>

      <section className="ciudadano-bandeja__summary" aria-label="Resumen de alertas">
        <div className="ciudadano-bandeja__metric">
          <span className="ciudadano-bandeja__metric-icon danger">
            <i className="bi bi-exclamation-octagon-fill" />
          </span>
          <span className="ciudadano-bandeja__metric-copy">
            <small>Prioridad alta</small>
            <strong>{cargando ? "—" : contarPrioridad("alta")}</strong>
          </span>
        </div>
        <div className="ciudadano-bandeja__metric">
          <span className="ciudadano-bandeja__metric-icon amber">
            <i className="bi bi-exclamation-triangle-fill" />
          </span>
          <span className="ciudadano-bandeja__metric-copy">
            <small>Prioridad media</small>
            <strong>{cargando ? "—" : contarPrioridad("media")}</strong>
          </span>
        </div>
        <div className="ciudadano-bandeja__metric">
          <span className="ciudadano-bandeja__metric-icon slate">
            <i className="bi bi-info-circle-fill" />
          </span>
          <span className="ciudadano-bandeja__metric-copy">
            <small>Prioridad baja</small>
            <strong>{cargando ? "—" : contarPrioridad("baja")}</strong>
          </span>
        </div>
      </section>

      <section className="ciudadano-bandeja__panel" aria-label="Listado de alertas">
        <div className="ciudadano-bandeja__toolbar">
          <label className="ciudadano-bandeja__search">
            <i className="bi bi-search" />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por tipo, reportante o barrio..."
              aria-label="Buscar alertas"
            />
          </label>
          <div className="ciudadano-bandeja__filters">
            <label className="visually-hidden" htmlFor="filtro-prioridad-alerta">
              Filtrar por prioridad
            </label>
            <select
              id="filtro-prioridad-alerta"
              className="form-select"
              value={filtroPrioridad}
              onChange={(event) => setFiltroPrioridad(event.target.value)}
            >
              <option value="">Todas las prioridades</option>
              {PRIORIDADES.map((prioridad) => (
                <option key={prioridad.valor} value={prioridad.valor}>
                  {prioridad.etiqueta}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="ciudadano-bandeja__error" role="alert">
            <i className="bi bi-exclamation-circle-fill" />
            {error}
          </div>
        )}

        {cargando ? (
          <div className="ciudadano-bandeja__empty">
            <i className="bi bi-arrow-repeat" />
            <strong>Cargando alertas...</strong>
          </div>
        ) : !error && filtradas.length === 0 ? (
          <div className="ciudadano-bandeja__empty">
            <i className="bi bi-inboxes" />
            <strong>{alertas.length ? "No hay resultados" : "Aún no hay alertas registradas"}</strong>
            <span>
              {alertas.length
                ? "Prueba con otra búsqueda o prioridad."
                : "Los reportes de tu comunidad aparecerán aquí."}
            </span>
          </div>
        ) : (
          <div className="ciudadano-bandeja__list">
            {filtradas.map((alerta) => {
              const prioridad = (alerta.prioridad || "").toLowerCase();

              return (
                <article className="ciudadano-bandeja__item" key={alerta.idAlerta}>
                  <span className="ciudadano-bandeja__item-icon">
                    <i className="bi bi-exclamation-triangle-fill" />
                  </span>
                  <div className="ciudadano-bandeja__item-body">
                    <div className="ciudadano-bandeja__item-heading">
                      <h2>{alerta.tipo || "Alerta"} · #{alerta.idAlerta}</h2>
                      <span className={`ciudadano-bandeja__badge ${estiloPrioridad(prioridad)}`}>
                        <i className="bi bi-circle-fill" />
                        {prioridad || "Prioridad no indicada"}
                      </span>
                    </div>
                    <div className="ciudadano-bandeja__meta">
                      <span><i className="bi bi-flag" /> {alerta.estado || "Estado no disponible"}</span>
                      <span><i className="bi bi-person" /> {alerta.reportadoPor || "Reportante no disponible"}</span>
                      <span><i className="bi bi-geo-alt" /> {alerta.barrioNombre || "Barrio no disponible"}</span>
                      <span><i className="bi bi-clock" /> {fechaFormato(alerta.fecha)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <footer className="ciudadano-bandeja__footer">
          <span>Mostrando {filtradas.length} de {alertas.length} alertas</span>
          <span>Ordenadas según su registro</span>
        </footer>
      </section>
    </main>
  );
}
