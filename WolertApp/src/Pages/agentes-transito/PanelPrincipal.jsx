
import { useEffect, useState } from "react";
import Layout from "../../Components/transito/Layout";
import KpiCard from "../../Components/transito/KpiCard";
import {
  obtenerResumenAgente,
  obtenerGrupoAgente,
  fechaAtencion,
} from "../../Services/agenteTransitoService";

export default function PanelPrincipal() {
  const [resumen, setResumen] = useState(null);
  const [grupo, setGrupo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("todas");

  useEffect(() => {
    let activo = true;

    Promise.allSettled([
      obtenerResumenAgente(),
      obtenerGrupoAgente(),
    ])
      .then(([datos, equipo]) => {
        if (!activo) return;

        if (datos.status === "fulfilled") {
          setResumen(datos.value);
        }

        if (equipo.status === "fulfilled") {
          setGrupo(equipo.value);
        }

        const fallos = [datos, equipo].filter(
          (resultado) => resultado.status === "rejected"
        );

        if (fallos.length) {
          setError(
            fallos
              .map(
                (resultado) =>
                  resultado.reason?.message ||
                  "Error al consultar la API"
              )
              .join(" | ")
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const atenciones = resumen?.atenciones ?? [];
  const pendientes = resumen?.enProceso ?? [];
  const terminadas = resumen?.finalizadas ?? [];
  const integrantes = grupo?.integrantes ?? [];

  const historial =
    tab === "todas"
      ? atenciones
      : atenciones.filter(
          (atencion) => atencion.estadoFinal === tab
        );

  const nombre =
    resumen?.agente?.nombreUsuario ||
    grupo?.agente?.nombreUsuario ||
    "Agente de Tránsito";

  const fecha = new Date()
    .toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <Layout
      rol="agente"
      titulo="Panel Agente de Tránsito"
      activo="panel"
      claseTopbar="mb-4"
      avatar={nombre.charAt(0)}
      busqueda={{ placeholder: "Buscar por atención..." }}
    >
      <div className="hero-dash hero-img-dash mb-4">
        <div className="eyebrow-dash eyebrow-img-dash">
          <i className="bi bi-shield-check me-2" />
          PANEL DEL AGENTE · {fecha}
        </div>

        <h1 className="hero-title-dash">
          ¡Bienvenido,
          <br />
          {nombre}!
        </h1>

        <p className="hero-text-dash">
          Consulta tus atenciones y el estado de tu unidad
          de tránsito.
        </p>

        <a
          href="#mis-atenciones"
          className="btn btn-light rounded-pill fw-bold mt-3 hero-cta-dash"
        >
          <span className="dot-danger-dash" />
          {" "}Ver mis atenciones
        </a>
      </div>

      {cargando && (
        <div className="alert alert-info" role="status">
          Cargando información desde la API...
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      )}

      <div className="row g-3 mb-4">
        <KpiCard
          variante="panel"
          color="red"
          valor={pendientes.length}
          label="Atenciones en proceso"
          icono="bi-file-earmark-text"
        />

        <KpiCard
          variante="panel"
          color="blue"
          valor={atenciones.length}
          label="Total de atenciones"
          icono="bi-clipboard-data"
        />

        <KpiCard
          variante="panel"
          color="green"
          valor={terminadas.length}
          label="Atenciones finalizadas"
          icono="bi-check2-circle"
        />

        <KpiCard
          variante="panel"
          color="amber"
          valor={
            resumen?.agente?.estadoAgente ||
            "Sin estado"
          }
          label="Mi estado"
          icono="bi-shield-check"
        />
      </div>

      <section id="mis-atenciones">
        <div className="sec-head-ag">
          <h2>Mis atenciones en proceso</h2>
        </div>

        <div className="panel-ag mb-4">
          <div className="table-responsive">
            <table className="tabla-ag">
              <thead>
                <tr>
                  <th>Atención</th>
                  <th>Alerta</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {pendientes.map((atencion, indice) => (
                  <tr
                    key={
                      atencion.idAtencionTransito ?? indice
                    }
                    className="caso-row-ag"
                  >
                    <td>
                      #{atencion.idAtencionTransito}
                    </td>

                    <td>
                      #{atencion.idAlerta ?? "—"}
                    </td>

                    <td>
                      {fechaAtencion(
                        atencion.fechaAtencion
                      )}
                    </td>

                    <td>
                      <span className="badge-dash badge-amber-dash">
                        En proceso
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pendientes.length === 0 && (
            <p className="text-center text-muted small p-3 mb-0">
              {cargando
                ? "Consultando atenciones..."
                : "No hay atenciones en proceso para mostrar."}
            </p>
          )}
        </div>
      </section>

      <div className="sec-head-ag">
        <h2 className="titulos-ag">
          Mapa de referencia
        </h2>
      </div>

      <div className="panel-ag mb-4">
        <div className="mapa-canvas-ag">
          <svg
            className="base-ag"
            viewBox="0 0 600 320"
            preserveAspectRatio="none"
            role="img"
            aria-label="Ilustración de vías, sin ubicaciones reales"
          >
            <rect
              width="600"
              height="320"
              fill="#eef2e6"
            />

            <ellipse
              cx="470"
              cy="70"
              rx="110"
              ry="80"
              fill="#dcead2"
            />

            <ellipse
              cx="90"
              cy="240"
              rx="100"
              ry="90"
              fill="#dcead2"
            />

            <path
              d="M560,0 C500,60 520,140 470,200 C430,250 460,300 420,320 L600,320 L600,0 Z"
              fill="#cfe6f0"
            />

            <g stroke="#d7d2c2" strokeWidth="6">
              <line x1="0" y1="80" x2="600" y2="80" />
              <line x1="0" y1="170" x2="600" y2="170" />
              <line x1="0" y1="250" x2="600" y2="250" />
              <line x1="120" y1="0" x2="120" y2="320" />
              <line x1="260" y1="0" x2="260" y2="320" />
              <line x1="400" y1="0" x2="400" y2="320" />
            </g>

            <line
              x1="0"
              y1="130"
              x2="600"
              y2="200"
              stroke="#e7c98a"
              strokeWidth="9"
            />
          </svg>
        </div>

        <div className="map-legend-ag">
          <b>Mapa ilustrativo</b>

          <p className="text-muted small mb-0">
            Las ubicaciones reales aparecerán cuando
            estén disponibles en la API.
          </p>
        </div>
      </div>

      <div className="sec-head-ag">
        <h2 className="titulos-ag">Mi grupo</h2>
      </div>

      <div className="grupo-ag mb-4">
        <div className="companero-row-ag">
          <span className="nombre-ag fw-semibold">
            {grupo?.unidad?.nombre ||
              "Sin unidad asignada"}
          </span>

          <span className="estado-mini-ag estado-verde-ag">
            {integrantes.length} integrantes
          </span>
        </div>

        {integrantes.map((integrante, indice) => (
          <div
            key={integrante.idUsuario ?? indice}
            className="companero-row-ag"
          >
            <span className="nombre-ag">
              {integrante.nombreUsuario ||
                integrante.username ||
                `Agente #${integrante.idUsuario ?? "—"}`}
            </span>

            <span className="estado-mini-ag estado-verde-ag">
              {integrante.estadoAgente ||
                "Sin estado"}
            </span>
          </div>
        ))}

        {integrantes.length === 0 && (
          <p className="text-muted small p-3 mb-0">
            No hay integrantes disponibles.
          </p>
        )}
      </div>

      <div className="sec-head-ag">
        <h2 className="titulos-ag">
          Historial de atenciones
        </h2>
      </div>

      <div className="tabs-ag">
        {[
          ["todas", "Todas"],
          ["EN_PROCESO", "En proceso"],
          ["FINALIZADA", "Finalizadas"],
        ].map(([id, texto]) => (
          <button
            key={id}
            type="button"
            className={`tab-ag ${
              tab === id ? "active-ag" : ""
            }`}
            onClick={() => setTab(id)}
          >
            {texto} (
            {id === "todas"
              ? atenciones.length
              : atenciones.filter(
                  (a) => a.estadoFinal === id
                ).length}
            )
          </button>
        ))}
      </div>

      <div className="panel-ag">
        <div className="table-responsive">
          <table className="tabla-ag">
            <thead>
              <tr>
                <th>Atención</th>
                <th>Alerta</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Descripción</th>
              </tr>
            </thead>

            <tbody>
              {historial.map((atencion, indice) => (
                <tr
                  key={
                    atencion.idAtencionTransito ?? indice
                  }
                >
                  <td>
                    #{atencion.idAtencionTransito}
                  </td>

                  <td>
                    #{atencion.idAlerta ?? "—"}
                  </td>

                  <td>
                    {fechaAtencion(
                      atencion.fechaAtencion
                    )}
                  </td>

                  <td>
                    <span
                      className={`badge-dash badge-${
                        atencion.estadoFinal ===
                        "FINALIZADA"
                          ? "green"
                          : "amber"
                      }-dash`}
                    >
                      {atencion.estadoFinal ===
                      "FINALIZADA"
                        ? "Finalizada"
                        : atencion.estadoFinal ===
                          "EN_PROCESO"
                        ? "En proceso"
                        : atencion.estadoFinal ||
                          "Sin estado"}
                    </span>
                  </td>

                  <td>
                    {atencion.descripcion ||
                      "Sin descripción"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {historial.length === 0 && (
          <p className="text-center text-muted small p-3 mb-0">
            No hay atenciones para este filtro.
          </p>
        )}

        <div className="paginacion-ag">
          <span>
            Mostrando {historial.length} de{" "}
            {atenciones.length} atenciones
          </span>
        </div>
      </div>
    </Layout>
  );
}
