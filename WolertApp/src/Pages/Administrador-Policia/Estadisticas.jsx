import { useEffect, useState } from "react";
import Topbar from "../../Components/Administrador-policia/Topbar";
import { obtenerDatosEstadisticas } from "../../Services/HistorialEstadisticasService";
import "../../css/Policia/administrador-policia/css/estadisticas.css";

const norm = (v) =>
  String(v ?? "SIN INFORMACIÓN")
    .trim()
    .toUpperCase();
const label = (v) => v.replaceAll("_", " ");
const colors = [
  "#078568",
  "#e5a32e",
  "#5284bc",
  "#dc6673",
  "#9275bc",
  "#82948b",
];
const color = (s, i) =>
  ({
    RESUELTA: colors[0],
    PENDIENTE: colors[1],
    EN_ATENCION: colors[2],
    UNIDAD_ASIGNADA: "#7954b4",
    CANCELADA: colors[3],
    ALTA: colors[3],
    MEDIA: colors[1],
    BAJA: colors[0],
  })[s] || colors[i % colors.length];
const group = (rows, key) =>
  Object.entries(
    rows.reduce((a, r) => {
      const k = norm(r[key]);
      a[k] = (a[k] || 0) + 1;
      return a;
    }, Object.create(null)),
  ).sort((a, b) => b[1] - a[1]);
const count = (rows, key, value) =>
  rows.filter((r) => norm(r[key]) === value).length;
const date = (v) => (v ? new Date(v) : new Date(NaN));
function Panel({ title, sub, icon, children }) {
  return (
    <section className="es-panel">
      <header>
        <span className="es-icon">
          <i className={`bi ${icon}`} />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{sub}</p>
        </div>
      </header>
      {children}
    </section>
  );
}
function Bars({ items, total, icons = false }) {
  return items.length ? (
    <div className="es-bars">
      {items.map(([s, n], i) => (
        <div key={s}>
          <div className="es-bar-label">
            {icons && (
              <i
                className={`bi ${/ROBO|HURTO|ASALTO/.test(s) ? "bi-shield-exclamation" : /ACCIDENTE/.test(s) ? "bi-car-front-fill" : /MEDIC/.test(s) ? "bi-heart-pulse-fill" : /INCENDIO/.test(s) ? "bi-fire" : "bi-bell-fill"}`}
                style={{ color: color(s, i) }}
              />
            )}
            <span>{label(s)}</span>
            <strong>{n}</strong>
          </div>
          <div className="es-track">
            <div
              style={{
                width: `${total ? (n / total) * 100 : 0}%`,
                background: color(s, i),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="es-empty">Sin registros disponibles.</p>
  );
}
function Donut({ items, total }) {
  let offset = 0;
  return (
    <>
      <svg
        className="es-donut"
        viewBox="0 0 200 180"
        role="img"
        aria-label={`Total de alertas: ${total}`}
      >
        <circle
          cx="100"
          cy="90"
          r="65"
          fill="none"
          stroke="#edf2ef"
          strokeWidth="22"
        />
        {items.map(([s, n], i) => {
          const length = total ? (n / total) * 408.407 : 0;
          const start = offset;
          offset += length;
          return (
            <circle
              key={s}
              cx="100"
              cy="90"
              r="65"
              fill="none"
              stroke={color(s, i)}
              strokeWidth="22"
              strokeDasharray={`${length} ${408.407 - length}`}
              strokeDashoffset={-start}
              transform="rotate(-90 100 90)"
            />
          );
        })}
        <text
          x="100"
          y="90"
          textAnchor="middle"
          fontSize="30"
          fontWeight="700"
          fill="#173b32"
        >
          {total}
        </text>
        <text x="100" y="109" textAnchor="middle" fontSize="11" fill="#647770">
          Total de alertas
        </text>
      </svg>
      <div className="es-legend">
        {items.map(([s, n], i) => (
          <div key={s}>
            <span style={{ background: color(s, i) }} />
            <label>{label(s)}</label>
            <strong>{n}</strong>
          </div>
        ))}
      </div>
    </>
  );
}
function periodBuckets(period, now) {
  const buckets = [];
  const size =
    period === "semana"
      ? 7
      : period === "mes"
        ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        : 12;
  for (let i = 0; i < size; i++) {
    let start, end;
    if (period === "anio") {
      start = new Date(now.getFullYear(), i, 1);
      end = new Date(now.getFullYear(), i + 1, 1);
    } else {
      start =
        period === "mes"
          ? new Date(now.getFullYear(), now.getMonth(), i + 1)
          : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + i);
      end = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + 1,
      );
    }
    buckets.push({
      start,
      end,
      label: start.toLocaleDateString(
        "es-CO",
        period === "anio"
          ? { month: "short" }
          : period === "semana"
            ? { weekday: "short", day: "numeric" }
            : { day: "numeric" },
      ),
    });
  }
  return buckets;
}
function Trend({ buckets, rows }) {
  const values = buckets.map(
    (b) =>
      rows.filter((r) => date(r.fecha) >= b.start && date(r.fecha) < b.end)
        .length,
  );
  const max = Math.max(4, Math.ceil(Math.max(...values) / 4) * 4);
  const pts = values.map((n, i) => [
    42 + (i * 718) / Math.max(1, values.length - 1),
    190 - (n / max) * 165,
  ]);
  const line = pts.map((p) => p.join(",")).join(" ");
  return (
    <svg
      className="es-trend"
      viewBox="0 0 790 225"
      role="img"
      aria-label="Evolución de alertas registradas"
    >
      <defs>
        <linearGradient id="es-fill" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#078568" stopOpacity=".22" />
          <stop offset="100%" stopColor="#078568" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line
            x1="42"
            x2="760"
            y1={25 + i * 41.25}
            y2={25 + i * 41.25}
            stroke="#e4ebe7"
            strokeDasharray="4 4"
          />
          <text
            x="32"
            y={29 + i * 41.25}
            textAnchor="end"
            fontSize="11"
            fill="#647770"
          >
            {max - (i * max) / 4}
          </text>
        </g>
      ))}
      <polygon points={`42,190 ${line} 760,190`} fill="url(#es-fill)" />
      <polyline
        points={line}
        fill="none"
        stroke="#078568"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3" fill="#078568">
            <title>
              {buckets[i].label}: {values[i]} alertas
            </title>
          </circle>
          {(i % Math.ceil(pts.length / 8) === 0 || i === pts.length - 1) && (
            <text
              x={x}
              y="212"
              textAnchor="middle"
              fontSize="11"
              fill="#647770"
            >
              {buckets[i].label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
export default function Estadisticas() {
  const [data, setData] = useState({});
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [period, setPeriod] = useState("mes");
  const [updated, setUpdated] = useState(null);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    obtenerDatosEstadisticas(c.signal)
      .then((r) => {
        if (!c.signal.aborted) {
          setData(r.datos);
          setErrors(r.errores || []);
          setUpdated(new Date());
        }
      })
      .catch((e) => {
        if (!c.signal.aborted) {
          setData({});
          setErrors([e.message]);
        }
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [reload]);
  const now = new Date(),
    buckets = periodBuckets(period, now);
  const rows = (k) => (Array.isArray(data[k]) ? data[k] : []);
  const available = (k, route) =>
    Array.isArray(data[k]) &&
    !errors.some(
      (e) =>
        String(e).startsWith(route + ":") || String(e).startsWith(route + "?"),
    );
  const ok = available("alertas", "/api/Alertas");
  const alerts = rows("alertas").filter(
    (r) =>
      date(r.fecha) >= buckets[0].start &&
      date(r.fecha) < buckets.at(-1).end &&
      date(r.fecha) <= now,
  );
  const total = alerts.length,
    resolved = count(alerts, "estado", "RESUELTA");
  const show = (n) => (loading ? "…" : !ok ? "No disponible" : n);
  const resource = (k, route, fn) =>
    loading ? "…" : !available(k, route) ? "No disponible" : fn(rows(k));
  return (
    <>
      <Topbar placeholder="Consultar estadísticas..." />
      <main className="main-dash estadisticas-page">
        <div className="es-wrap">
          <header className="es-hero">
            <div>
              <small>ADMINISTRACIÓN POLICIAL</small>
              <h1>Estadísticas</h1>
              <p>Análisis de alertas y desempeño operativo.</p>
            </div>
            <i className="bi bi-graph-up-arrow" />
          </header>
          <div className="es-toolbar">
            <div>
              <i className="bi bi-calendar3" /> Periodo de análisis
            </div>
            <div className="es-period">
              {[
                ["semana", "Semana"],
                ["mes", "Mes"],
                ["anio", "Año"],
              ].map(([k, t]) => (
                <button
                  key={k}
                  aria-pressed={period === k}
                  onClick={() => setPeriod(k)}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              className="es-refresh"
              disabled={loading}
              onClick={() => setReload((v) => v + 1)}
            >
              <i className="bi bi-arrow-clockwise" />{" "}
              {loading ? "Actualizando..." : "Actualizar datos"}
            </button>
          </div>
          {errors.length > 0 && (
            <div className="es-error" role="alert">
              Algunas consultas no se completaron. Los indicadores afectados no
              están disponibles.
              <details>
                <summary>Ver errores</summary>
                {errors.map((e, i) => (
                  <p key={i}>{e}</p>
                ))}
              </details>
            </div>
          )}
          <div className="es-kpis">
            {[
              ["Total de alertas", total, "bi-bell-fill", "#2474ce", "#e4edfc"],
              [
                "Alertas resueltas",
                resolved,
                "bi-check-circle-fill",
                "#078568",
                "#dcf1e8",
              ],
              [
                "Alertas pendientes",
                count(alerts, "estado", "PENDIENTE"),
                "bi-hourglass-split",
                "#d88a08",
                "#fff0d8",
              ],
              [
                "En atención",
                count(alerts, "estado", "EN_ATENCION"),
                "bi-shield-check",
                "#7954b4",
                "#efe8fa",
              ],
            ].map(([t, n, i, c, b]) => (
              <article key={t} style={{ "--accent": c, "--soft": b }}>
                <span>
                  <i className={`bi ${i}`} />
                </span>
                <div>
                  <small>{t}</small>
                  <strong
                    className={!loading && !ok ? "es-unavailable" : undefined}
                  >
                    {show(n)}
                  </strong>
                </div>
              </article>
            ))}
          </div>
          {!loading && !ok && (
            <Panel
              title="Estadísticas de alertas"
              sub="Consulta no disponible"
              icon="bi-exclamation-circle"
            >
              <p className="es-empty">No se pudieron obtener las alertas.</p>
            </Panel>
          )}
          {!loading && ok && (
            <>
              <Panel
                title="Comportamiento de alertas"
                sub="Evolución de incidentes reportados"
                icon="bi-graph-up"
              >
                {alerts.length ? (
                  <Trend buckets={buckets} rows={alerts} />
                ) : (
                  <p className="es-empty">
                    Sin alertas registradas en este periodo.
                  </p>
                )}
              </Panel>
              <div className="es-grid">
                <Panel
                  title="Estado de alertas"
                  sub="Distribución del periodo"
                  icon="bi-pie-chart"
                >
                  {total ? (
                    <Donut items={group(alerts, "estado")} total={total} />
                  ) : (
                    <p className="es-empty">Sin registros en este periodo.</p>
                  )}
                </Panel>
                <Panel
                  title="Alertas por prioridad"
                  sub="Nivel de urgencia"
                  icon="bi-bar-chart"
                >
                  <div className="es-columns">
                    {["ALTA", "MEDIA", "BAJA"].map((s, i) => {
                      const n = count(alerts, "prioridad", s);
                      return (
                        <div key={s}>
                          <strong>{n}</strong>
                          <div className="es-column-track">
                            <div
                              style={{
                                height: `${total ? (n / total) * 100 : 0}%`,
                                background: color(s, i),
                              }}
                            />
                          </div>
                          <small>{s}</small>
                        </div>
                      );
                    })}
                  </div>
                  <Bars items={group(alerts, "prioridad")} total={total} />
                </Panel>
              </div>
              <Panel
                title="Tipos de alertas más frecuentes"
                sub="Incidentes registrados por categoría"
                icon="bi-list-ul"
              >
                <Bars items={group(alerts, "tipo")} total={total} icons />
              </Panel>
            </>
          )}
          <Panel
            title="Desempeño operativo"
            sub="Totales históricos y recursos actuales · no dependen del periodo"
            icon="bi-shield-check"
          >
            <div className="es-resources">
              {[
                [
                  "Total de policías",
                  resource("policias", "/api/Policias", (r) => r.length),
                  "bi-people-fill",
                ],
                [
                  "Policías activos",
                  resource("policias", "/api/Policias", (r) =>
                    count(r, "estado", "ACTIVO"),
                  ),
                  "bi-person-check-fill",
                ],
                [
                  "Total de alarmas",
                  resource("alarmas", "/api/Alarmas", (r) => r.length),
                  "bi-bell",
                ],
                [
                  "Total de atenciones",
                  resource(
                    "atenciones",
                    "/api/AtencionesAlerta",
                    (r) => r.length,
                  ),
                  "bi-clipboard-check",
                ],
                [
                  "Total de asignaciones",
                  resource(
                    "asignaciones",
                    "/api/Asignaciones",
                    (r) => r.length,
                  ),
                  "bi-list-check",
                ],
                [
                  "Unidades registradas",
                  resource("unidades", "/api/Unidades", (r) => r.length),
                  "bi-car-front-fill",
                ],
                [
                  "Unidades operativas",
                  resource("unidades", "/api/Unidades", (r) =>
                    count(r, "estado", "OPERATIVA"),
                  ),
                  "bi-shield-check",
                ],
                [
                  "Alarmas activas",
                  resource("alarmas", "/api/Alarmas", (r) =>
                    count(r, "estado", "ACTIVA"),
                  ),
                  "bi-bell-fill",
                ],
              ].map(([t, n, i]) => (
                <div key={t}>
                  <i className={`bi ${i}`} />
                  <strong
                    className={
                      n === "No disponible" ? "es-unavailable" : undefined
                    }
                  >
                    {n}
                  </strong>
                  <small>{t}</small>
                </div>
              ))}
            </div>
            <div className="es-resolution">
              <span>Tasa de resolución del periodo</span>
              <strong>
                {ok && !loading && total
                  ? `${((resolved / total) * 100).toFixed(1)}%`
                  : "—"}
              </strong>
            </div>
            <div className="es-track">
              <div
                style={{
                  width: `${ok && !loading && total ? (resolved / total) * 100 : 0}%`,
                  background: "#078568",
                }}
              />
            </div>
          </Panel>
          <div className="es-grid">
            {[
              ["Policías por estado", "policias", "estado", "/api/Policias"],
              [
                "Atenciones por estado",
                "atenciones",
                "estadoFinal",
                "/api/AtencionesAlerta",
              ],
              ["Alarmas por estado", "alarmas", "estado", "/api/Alarmas"],
              ["Unidades por estado", "unidades", "estado", "/api/Unidades"],
            ].map(([t, k, f, r]) => (
              <Panel
                key={k}
                title={t}
                sub="Todos los registros"
                icon="bi-activity"
              >
                {!loading && available(k, r) ? (
                  <Bars items={group(rows(k), f)} total={rows(k).length} />
                ) : (
                  <p className="es-empty">Datos no disponibles.</p>
                )}
              </Panel>
            ))}
          </div>
          <Panel
            title="Actividad de hoy"
            sub="Registros del día"
            icon="bi-calendar-check"
          >
            <div className="es-resources">
              {[
                ["Alertas", "alertas", "/api/Alertas"],
                ["Atenciones", "atenciones", "/api/AtencionesAlerta"],
                ["Asignaciones", "asignaciones", "/api/Asignaciones"],
              ].map(([t, k, r]) => (
                <div key={k}>
                  <strong
                    className={
                      !loading && !available(k, r)
                        ? "es-unavailable"
                        : undefined
                    }
                  >
                    {resource(
                      k,
                      r,
                      (list) =>
                        list.filter(
                          (a) =>
                            date(a.fechaAtencion ?? a.fecha).toDateString() ===
                            now.toDateString(),
                        ).length,
                    )}
                  </strong>
                  <small>{t}</small>
                </div>
              ))}
            </div>
          </Panel>
          <p className="es-updated">
            {updated
              ? `Última actualización: ${updated.toLocaleString("es-CO")}`
              : "Sin actualización disponible"}
          </p>
        </div>
      </main>
    </>
  );
}
