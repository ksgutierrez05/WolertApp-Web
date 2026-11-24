import { useEffect, useMemo, useState } from "react";
import "../../css/global.css";
import "../../css/temas.css";
import "../../css/admin/usuarios.css";
import "../../css/admin/alertas.css";
import "../../css/admin/tipos.css";
import "../../css/admin/paneles-listado.css";
import { listarAlertas, eliminarAlerta } from "../../Services/AlertasAPI.js";

const PRIORIDADES = [
  { valor: "alta", etiqueta: "Alta" },
  { valor: "media", etiqueta: "Media" },
  { valor: "baja", etiqueta: "Baja" },
];

const prioridadBadgeClase = {
  alta: "alerta-badge-pendiente-dash",
  media: "alerta-badge-asignada-dash",
  baja: "alerta-badge-resuelta-dash",
};

const prioridadEtiqueta = { alta: "Alta", media: "Media", baja: "Baja" };

const mensajeAmigable = (err) => {
  const msg = (err?.message || "").trim();
  if (msg.endsWith(":")) {
    return `${msg} verifica que tu sesión siga activa y que tengas rol Admin.`;
  }
  return msg;
};

const formatearFecha = (f) => (f ? new Date(f).toLocaleDateString() : "—");

export default function Alertas() {
  const esAdmin = localStorage.getItem("rol") === "ADMIN";

  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorLista, setErrorLista] = useState("");
  const [buscar, setBuscar] = useState("");
  const [filtroPrioridad, setFiltroPrioridad] = useState("");

  const cargarAlertas = async () => {
    try {
      setCargando(true);
      setErrorLista("");
      setAlertas(await listarAlertas());
    } catch (err) {
      setErrorLista(mensajeAmigable(err));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let activo = true;

    listarAlertas()
      .then((datos) => {
        if (activo) {
          setAlertas(datos);
        }
      })
      .catch((err) => {
        if (activo) {
          setErrorLista(mensajeAmigable(err));
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  const filtrados = useMemo(
    () =>
      alertas.filter((a) => {
        const texto = buscar.trim().toLowerCase();
        const coincideTexto =
          !texto ||
          String(a.idAlerta ?? "").includes(texto) ||
          (a.tipo || "").toLowerCase().includes(texto) ||
          (a.reportadoPor || "").toLowerCase().includes(texto) ||
          (a.barrioNombre || "").toLowerCase().includes(texto);
        const coincidePrioridad =
          !filtroPrioridad ||
          (a.prioridad || "").toLowerCase() === filtroPrioridad;
        return coincideTexto && coincidePrioridad;
      }),
    [alertas, buscar, filtroPrioridad],
  );

  const contar = (p) =>
    alertas.filter((a) => (a.prioridad || "").toLowerCase() === p).length;

  const eliminar = async (a) => {
    if (
      !window.confirm(
        `¿Eliminar la alerta "${a.tipo}" reportada por ${a.reportadoPor}?`,
      )
    )
      return;
    try {
      await eliminarAlerta(a.idAlerta);
      await cargarAlertas();
    } catch (err) {
      alert(mensajeAmigable(err));
    }
  };

  const columnas = esAdmin ? 8 : 7;

  return (
    <main className="container-fluid admin-listado admin-alertas">
      <header className="admin-listado__hero mb-4">
        <h1
          className="hero-title-dash"
          style={{ color: "var(--ink)", fontSize: "26px" }}
        >
          Gestión de Alertas
        </h1>
        <p className="hero-text-dash" style={{ color: "var(--muted)" }}>
          Alertas reportadas por la comunidad
        </p>
      </header>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="kpi-dash kpi-red-dash">
            <i className="bi bi-exclamation-octagon kpi-icon-dash" />
            <div className="kpi-num-dash">
              {cargando ? "..." : contar("alta")}
            </div>
            <div className="kpi-label-dash">Prioridad alta</div>
            <div className="kpi-label-dash" style={{ marginTop: "2px" }}>
              Atención inmediata
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-dash kpi-amber-dash">
            <i className="bi bi-exclamation-triangle kpi-icon-dash" />
            <div className="kpi-num-dash">
              {cargando ? "..." : contar("media")}
            </div>
            <div className="kpi-label-dash">Prioridad media</div>
            <div className="kpi-label-dash" style={{ marginTop: "2px" }}>
              Atención programada
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-dash kpi-green-dash">
            <i className="bi bi-info-circle kpi-icon-dash" />
            <div className="kpi-num-dash">
              {cargando ? "..." : contar("baja")}
            </div>
            <div className="kpi-label-dash">Prioridad baja</div>
            <div className="kpi-label-dash" style={{ marginTop: "2px" }}>
              Seguimiento
            </div>
          </div>
        </div>
      </div>
      <section
        className="admin-listado__content"
        aria-label="Administración de alertas"
      >
        <div className="admin-listado__toolbar">
          <div className="row g-2 align-items-center">
            <div className="col-lg-8">
              <div className="search-dash d-flex align-items-center bg-white">
                <span className="input-group-text bg-white border-0">
                  <i className="bi bi-search" />
                </span>
                <input
                  type="text"
                  id="buscador-alertas"
                  className="form-control border-0"
                  placeholder="Buscar por número, tipo, reportante o barrio..."
                  value={buscar}
                  onChange={(e) => setBuscar(e.target.value)}
                />
              </div>
            </div>
            <div className="col-lg-4">
              <select
                id="filtro-prioridad-alerta"
                className="filtro-select-dash form-select"
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
              >
                <option value="">Prioridad: Todas</option>
                {PRIORIDADES.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <section className="card-panel-dash" aria-label="Listado de alertas">
          {errorLista && (
            <div className="text-danger small p-3">{errorLista}</div>
          )}
          <div className="table-responsive">
            <table className="tabla-alertas-dash">
              <thead>
                <tr>
                  <th>Referencia</th>
                  <th>Tipo de alerta</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Reportado por</th>
                  <th>Barrio</th>
                  <th>Fecha</th>
                  {esAdmin && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {cargando && (
                  <tr>
                    <td colSpan={columnas}>Cargando alertas...</td>
                  </tr>
                )}

                {!cargando && !errorLista && filtrados.length === 0 && (
                  <tr>
                    <td colSpan={columnas}>
                      <div className="alertas-vacio-dash">
                        <i className="bi bi-inboxes" />
                        <p>
                          {alertas.length === 0
                            ? "Aún no hay alertas registradas."
                            : "No se encontraron alertas con esos filtros."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!cargando &&
                  filtrados.map((a) => {
                    const prioridad = (a.prioridad || "").toLowerCase();
                    const esAlta = prioridad === "alta";
                    return (
                      <tr key={a.idAlerta}>
                        <td data-label="Referencia">
                          <strong>#{a.idAlerta}</strong>
                        </td>
                        <td
                          className="tipo-alerta-mobile"
                          data-label="Tipo de alerta"
                        >
                          <div className="alerta-tipo-celda-dash">
                            <div
                              className={`alerta-tipo-icono-dash ${esAlta ? "alerta-tipo-icono-grave-dash" : "alerta-tipo-icono-moderado-dash"}`}
                            >
                              <i
                                className={`bi ${esAlta ? "bi-exclamation-octagon-fill" : "bi-exclamation-triangle-fill"}`}
                              />
                            </div>
                            <span className="alerta-tipo-texto-dash">
                              {(a.tipo || "").toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td data-label="Prioridad">
                          <span
                            className={`alerta-badge-dash ${prioridadBadgeClase[prioridad] || "alerta-badge-asignada-dash"}`}
                          >
                            <span className="dot" />
                            {prioridadEtiqueta[prioridad] || a.prioridad || "—"}
                          </span>
                        </td>
                        <td data-label="Estado">{a.estado || "—"}</td>
                        <td data-label="Reportado por">
                          {a.reportadoPor || "—"}
                        </td>
                        <td data-label="Barrio">{a.barrioNombre || "—"}</td>
                        <td data-label="Fecha">{formatearFecha(a.fecha)}</td>
                        {esAdmin && (
                          <td data-label="Acciones">
                            <button
                              type="button"
                              className="action-btn-dash action-delete-dash"
                              aria-label={`Eliminar alerta ${a.idAlerta}`}
                              title="Eliminar"
                              onClick={() => eliminar(a)}
                            >
                              <i className="bi bi-trash" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
