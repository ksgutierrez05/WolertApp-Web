
import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/transito/Layout";
import KpiCard from "../../Components/transito/KpiCard";
import "../../css/transito/agente-transito/panel-principal.css";

import {
  obtenerResumenAgente,
  obtenerGrupoAgente,
  obtenerPerfilAgente,
  fechaAtencion,
} from "../../Services/agenteTransitoService";

const normalizar = (valor) =>
  String(valor ?? "").trim().toUpperCase();

const esFinalizada = (a) =>
  ["FINALIZADA", "FINALIZADO", "ATENDIDA", "CERRADA", "RESUELTA"]
    .includes(normalizar(a.estadoFinal ?? a.estado));

const esEnProceso = (a) =>
  ["EN_PROCESO", "RECIBIDO", "EN_CAMINO", "EN_EL_SITIO"]
    .includes(normalizar(a.estadoFinal ?? a.estado));

const claseEstado = (a) => {
  if (esFinalizada(a)) return "estado-resuelto-ag";

  const e = normalizar(
    a.estadoEtapa ?? a.etapa ?? a.estadoFinal ?? a.estado
  );

  if (e === "EN_CAMINO") return "estado-en_camino-ag";

  if (["EN_EL_SITIO", "EN_SITIO"].includes(e))
    return "estado-en_sitio-ag";

  if (["RECIBIDO", "PENDIENTE", "EN_PROCESO"].includes(e))
    return "estado-pendiente-ag";

  return "estado-desconocido-ag";
};

const estadoTexto = (a) => {
  const estado = normalizar(
    a.estadoEtapa ?? a.etapa ?? a.estadoFinal ?? a.estado
  );

  if (esFinalizada(a)) return "Finalizada";
  if (estado === "RECIBIDO") return "Recibido";
  if (estado === "EN_CAMINO") return "En camino";
  if (["EN_EL_SITIO", "EN_SITIO"].includes(estado)) return "En el sitio";
  if (estado === "EN_PROCESO") return "En proceso";

  return estado ? estado.replaceAll("_", " ") : "Sin estado";
};

const nombrePersona = (persona) =>
  persona?.nombreUsuario ||
  persona?.nombreCompleto ||
  persona?.nombreAgente ||
  persona?.nombre ||
  persona?.username ||
  "Agente de Tránsito";

const obtenerIniciales = (nombre) =>
  nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase();

export default function PanelPrincipal() {
  const [resumen, setResumen] = useState(null);
  const [grupo, setGrupo] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState([]);
  const [tab, setTab] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    let montado = true;

    Promise.allSettled([
      obtenerResumenAgente(),
      obtenerGrupoAgente(),
      obtenerPerfilAgente(),
    ])
      .then(([rResumen, rGrupo, rPerfil]) => {
        if (!montado) return;

        if (rResumen.status === "fulfilled") setResumen(rResumen.value);
        if (rGrupo.status === "fulfilled") setGrupo(rGrupo.value);
        if (rPerfil.status === "fulfilled") setPerfil(rPerfil.value);

        setErrores(
          [rResumen, rGrupo, rPerfil]
            .filter((r) => r.status === "rejected")
            .map((r) => r.reason?.message || "Error al consultar la API")
        );
      })
      .finally(() => {
        if (montado) setCargando(false);
      });

    return () => {
      montado = false;
    };
  }, []);

  const atenciones = useMemo(
    () => Array.isArray(resumen?.atenciones) ? resumen.atenciones : [],
    [resumen]
  );

  const pendientes = useMemo(
    () => atenciones.filter(esEnProceso),
    [atenciones]
  );

  const terminadas = useMemo(
    () => atenciones.filter(esFinalizada),
    [atenciones]
  );

  const integrantes = Array.isArray(grupo?.integrantes)
    ? grupo.integrantes
    : [];

  const nombre = nombrePersona(
    perfil ?? grupo?.agente ?? resumen?.agente
  );

  const nombreGrupo =
    grupo?.unidad?.nombre ||
    grupo?.unidad?.nombreUnidad ||
    "Sin unidad asignada";

  const estado =
    perfil?.estadoAgente ||
    perfil?.estado ||
    grupo?.agente?.estadoAgente ||
    "Sin estado";

  const fecha = new Date()
    .toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  const coincide = (a) =>
    [
      a.idAtencionTransito,
      a.idAlerta,
      a.descripcion,
      estadoTexto(a),
    ].some((v) =>
      String(v ?? "")
        .toLowerCase()
        .includes(busqueda.toLowerCase().trim())
    );

  const visibles = pendientes.filter(coincide);

  const historial = atenciones.filter(
    (a) =>
      (tab === "todas" ||
        (tab === "EN_PROCESO"
          ? esEnProceso(a)
          : esFinalizada(a))) &&
      coincide(a)
  );

  return (
    <Layout
      rol="agente"
      titulo="Panel Agente de Tránsito"
      activo="panel"
      claseTopbar="mb-4"
      avatar={nombre.charAt(0).toUpperCase()}
      busqueda={{
        placeholder: "Buscar por caso, barrio o agente...",
      }}
    >
      <div className="hero-dash hero-img-dash mb-4">
        <div className="eyebrow-dash eyebrow-img-dash">
          <i className="bi bi-shield-check me-2" />
          PANEL DEL AGENTE · {fecha}
        </div>

        <h1 className="hero-title-dash">
          ¡Bienvenido,<br />
          {nombre}!
        </h1>

        <p className="hero-text-dash">
          Tienes {pendientes.length}{" "}
          {pendientes.length === 1
            ? "caso asignado"
            : "casos asignados"}{" "}
          en proceso. Este es el resumen de tu turno.
        </p>

        <a
          href="#mis-atenciones"
          className="btn btn-light rounded-pill fw-bold mt-3 hero-cta-dash"
        >
          <span className="dot-danger-dash" />
          Ver mis casos
        </a>
      </div>

      {cargando && (
        <div className="alert alert-info" role="status">
          <i className="bi bi-arrow-repeat me-2" />
          Cargando información desde la API...
        </div>
      )}

      {errores.length > 0 && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          {errores.join(" | ")}
        </div>
      )}

      <div className="row g-3 mb-4">
        <KpiCard
          variante="panel"
          color="red"
          valor={pendientes.length}
          label="Casos asignados"
          icono="bi-file-earmark-text"
        />

        <KpiCard
          variante="panel"
          color="blue"
          valor={atenciones.length}
          label="Total de casos"
          icono="bi-clipboard-data"
        />

        <KpiCard
          variante="panel"
          color="green"
          valor={terminadas.length}
          label="Casos resueltos"
          icono="bi-check2-circle"
        />

        <KpiCard
          variante="panel"
          color="amber"
          valor={estado}
          label="Mi estado"
          icono="bi-shield-check"
        />
      </div>

      <section id="mis-atenciones">
        <div className="sec-head-ag">
          <h2 className="titulos-ag">Mis casos asignados</h2>

          <a
            className="see-all-dash"
            href="/transito/agente/grupo"
          >
            Ver todos <i className="bi bi-chevron-right" />
          </a>
        </div>

        <div className="panel-ag mb-4">
          <div className="buscador-panel-ag">
            <div className="buscador-contenedor-ag">
              <i className="bi bi-search" />

              <input
                type="search"
                aria-label="Filtrar casos"
                placeholder="Filtrar casos por número, alerta o estado..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

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
                {visibles.map((a, i) => (
                  <tr
                    key={a.idAtencionTransito ?? i}
                    className="caso-row-ag"
                  >
                    <td>#{a.idAtencionTransito ?? "—"}</td>
                    <td>#{a.idAlerta ?? "—"}</td>
                    <td>{fechaAtencion(a.fechaAtencion)}</td>

                    <td>
                      <span className={`estado-badge-ag ${claseEstado(a)}`}>
                        {estadoTexto(a)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visibles.length === 0 && (
            <div className="mensaje-vacio-ag">
              <i className="bi bi-clipboard-check fs-3 d-block mb-2" />

              <p className="mb-0">
                {cargando
                  ? "Consultando atenciones..."
                  : "No hay casos asignados en proceso para mostrar."}
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="sec-head-ag">
        <h2 className="titulos-ag">Mapa en tiempo real</h2>
      </div>

      <div className="panel-ag mb-4">
        <div
          className="mapa-canvas-ag d-flex align-items-center justify-content-center text-center p-4"
          style={{
            minHeight: 220,
            background: "#f3f7fc",
          }}
        >
          <div>
            <div
              className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-4"
              style={{
                width: 58,
                height: 58,
                background: "#e3edf9",
                color: "var(--color-primary)",
              }}
            >
              <i className="bi bi-geo-alt fs-3" />
            </div>

            <h6
              className="fw-bold mb-2"
              style={{ color: "#173f65" }}
            >
              Ubicación de mis casos
            </h6>

            <p
              className="mb-0 text-muted small"
              style={{ maxWidth: 360 }}
            >
              Las ubicaciones aparecerán cuando la API
              proporcione coordenadas de los casos.
            </p>
          </div>
        </div>

        <div className="map-legend-ag">
          <div className="d-flex align-items-center gap-2">
            <i
              className="bi bi-geo-alt-fill"
              style={{ color: "var(--color-primary)" }}
            />
            <b className="mb-0">Mis casos</b>
          </div>

          <p className="text-muted small mb-0 mt-1">
            No se muestran marcadores ficticios.
          </p>
        </div>
      </div>

      <div className="sec-head-ag">
        <h2 className="titulos-ag">Mi grupo</h2>

        <a
          className="see-all-dash"
          href="/transito/agente/grupo"
        >
          Ver grupo <i className="bi bi-chevron-right" />
        </a>
      </div>

      <div className="grupo-ag mb-4">
        <div className="companero-row-ag">
          <div className="companero-info-ag">
            <span className="companero-avatar-ag">
              <i className="bi bi-people-fill fs-5" />
            </span>

            <div>
              <div className="nombre-ag">{nombreGrupo}</div>

              <div className="companero-sub-ag">
                Unidad de tránsito asignada
              </div>
            </div>
          </div>

          <span className="estado-mini-ag estado-verde-ag">
            {integrantes.length} integrantes
          </span>
        </div>

        {integrantes.map((p, i) => (
          <div
            key={p.idUsuario ?? i}
            className="companero-row-ag"
          >
            <div className="companero-info-ag">
              <span className="companero-avatar-ag">
                {obtenerIniciales(nombrePersona(p))}
              </span>

              <div>
                <div className="nombre-ag">
                  {nombrePersona(p)}
                </div>

                <div className="companero-sub-ag">
                  Agente de tránsito
                </div>
              </div>
            </div>

            <span
              className={`estado-mini-ag ${
                ["ACTIVO", "DISPONIBLE"].includes(
                  normalizar(p.estadoAgente ?? p.estado)
                )
                  ? "estado-verde-ag"
                  : "estado-gris-ag"
              }`}
            >
              {p.estadoAgente || p.estado || "Sin estado"}
            </span>
          </div>
        ))}

        {integrantes.length === 0 && (
          <div className="mensaje-vacio-ag">
            <i className="bi bi-people fs-3 d-block mb-2" />

            <p className="mb-0">
              {cargando
                ? "Consultando integrantes..."
                : "No hay integrantes disponibles para esta unidad."}
            </p>
          </div>
        )}
      </div>

      <div className="sec-head-ag">
        <h2 className="titulos-ag">Historial de casos</h2>

        <a
          className="see-all-dash"
          href="/transito/agente/historial"
        >
          Ver todos <i className="bi bi-chevron-right" />
        </a>
      </div>

      <div className="tabs-ag">
        {[
          ["todas", "Todas", atenciones.length],
          ["EN_PROCESO", "En proceso", pendientes.length],
          ["FINALIZADA", "Finalizadas", terminadas.length],
        ].map(([id, texto, cantidad]) => (
          <button
            key={id}
            type="button"
            className={`tab-ag ${tab === id ? "active-ag" : ""}`}
            onClick={() => setTab(id)}
          >
            {texto} ({cantidad})
          </button>
        ))}
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
                <th>Descripción</th>
              </tr>
            </thead>

            <tbody>
              {historial.map((a, i) => (
                <tr
                  key={a.idAtencionTransito ?? i}
                  className="caso-row-ag"
                >
                  <td>#{a.idAtencionTransito ?? "—"}</td>
                  <td>#{a.idAlerta ?? "—"}</td>
                  <td>{fechaAtencion(a.fechaAtencion)}</td>

                  <td>
                    <span className={`estado-badge-ag ${claseEstado(a)}`}>
                      {estadoTexto(a)}
                    </span>
                  </td>

                  <td>{a.descripcion || "Sin descripción"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {historial.length === 0 && (
          <div className="mensaje-vacio-ag">
            <i className="bi bi-clock-history fs-3 d-block mb-2" />

            <p className="mb-0">
              No hay atenciones para este filtro.
            </p>
          </div>
        )}

        <div className="paginacion-ag">
          <span>
            Mostrando {historial.length} de {atenciones.length} atenciones
          </span>
        </div>
      </div>
    </Layout>
  );
}
