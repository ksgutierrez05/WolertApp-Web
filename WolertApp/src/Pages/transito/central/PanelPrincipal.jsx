
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Layout from "../../../Components/transito/Layout";
import KpiCard from "../../../Components/transito/KpiCard";

import {
  listarAgentesCentral,
  listarUnidadesCentral,
  listarAtencionesCentral,
  listarAlertasCentral,
  prepararColaCentral,
  prepararAgentesCentral,
  finalizadaCentral,
  fechaRegistroCentral,
  fechaCentral,
  tipoCentral,
  lugarCentral,
  reportanteCentral,
  badgeTipoCentral,
  tiempoEsperaCentral,
  idAlertaCentral,
  idAtencionCentral,
  normalizarCentral,
} from "../../../Services/centralTransitoService";

const ESTADOS = {
  disponible: {
    texto: "Disponible",
    color: "green",
  },
  atencion: {
    texto: "En atención",
    color: "amber",
  },
  "no-disponible": {
    texto: "No disponible",
    color: "gray",
  },
  desconocido: {
    texto: "No informado",
    color: "gray",
  },
};

export default function PanelPrincipal() {
  const [agentes, setAgentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [alertas, setAlertas] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState([]);
  const [alertasCargadas, setAlertasCargadas] =
    useState(false);
  const [atencionesCargadas, setAtencionesCargadas] =
    useState(false);
  const [agentesCargados, setAgentesCargados] =
    useState(false);
  const [tab, setTab] = useState("todas");

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      const resultados = await Promise.allSettled([
        listarAgentesCentral(),
        listarUnidadesCentral(),
        listarAtencionesCentral(),
        listarAlertasCentral(),
      ]);

      if (!activo) return;

      const [
        resultadoAgentes,
        resultadoUnidades,
        resultadoAtenciones,
        resultadoAlertas,
      ] = resultados;

      const mensajes = [];

      if (resultadoAgentes.status === "fulfilled") {
        setAgentes(resultadoAgentes.value);
        setAgentesCargados(true);
      } else {
        mensajes.push(
          `Agentes: ${resultadoAgentes.reason?.message || "Error de consulta"}`
        );
      }

      if (resultadoUnidades.status === "fulfilled") {
        setUnidades(resultadoUnidades.value);
      } else {
        mensajes.push(
          `Unidades: ${resultadoUnidades.reason?.message || "Error de consulta"}`
        );
      }

      if (resultadoAtenciones.status === "fulfilled") {
        setAtenciones(resultadoAtenciones.value);
        setAtencionesCargadas(true);
      } else {
        mensajes.push(
          `Atenciones: ${resultadoAtenciones.reason?.message || "Error de consulta"}`
        );
      }

      if (resultadoAlertas.status === "fulfilled") {
        setAlertas(resultadoAlertas.value);
        setAlertasCargadas(true);
      } else {
        mensajes.push(
          `Alertas: ${resultadoAlertas.reason?.message || "Error de consulta"}`
        );
      }

      setErrores(mensajes);
      setCargando(false);
    }

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  const cola = useMemo(
    () => prepararColaCentral(alertas, atenciones),
    [alertas, atenciones]
  );

  const agentesVista = useMemo(
    () =>
      prepararAgentesCentral(
        agentes,
        unidades,
        atenciones
      ),
    [agentes, unidades, atenciones]
  );

  const despachos = useMemo(
    () =>
      [...atenciones].sort((a, b) => {
        const fechaA = new Date(
          fechaRegistroCentral(a) || 0
        ).getTime();

        const fechaB = new Date(
          fechaRegistroCentral(b) || 0
        ).getTime();

        return fechaB - fechaA;
      }),
    [atenciones]
  );

  const tipos = useMemo(
    () =>
      [
        ...new Set(
          despachos.map((item) => tipoCentral(item))
        ),
      ],
    [despachos]
  );

  const despachosFiltrados = despachos.filter(
    (item) =>
      tab === "todas" ||
      normalizarCentral(tipoCentral(item)) ===
      normalizarCentral(tab)
  );

  const agentesEnServicio = agentesVista.filter(
    (agente) =>
      agente.estado === "disponible" ||
      agente.estado === "atencion"
  ).length;

  const completadosHoy = atenciones.filter(
    (atencion) => {
      if (!finalizadaCentral(atencion)) {
        return false;
      }

      const valor =
        atencion.fechaFinalizacion ||
        atencion.fechaCierre ||
        atencion.fechaAtencion;

      if (!valor) return false;

      const fecha = new Date(valor);

      return (
        !Number.isNaN(fecha.getTime()) &&
        fecha.toDateString() ===
        new Date().toDateString()
      );
    }
  ).length;

  function nombreAgenteAsignado(atencion) {
    const id =
      atencion.idAgenteTransito ??
      atencion.agenteTransitoId;

    const agente = agentesVista.find(
      (item) =>
        id != null &&
        item.id != null &&
        String(item.id) === String(id)
    );

    return (
      agente?.nombre ||
      atencion.nombreAgente ||
      "No identificado"
    );
  }

  const fechaActual = new Date()
    .toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <Layout
      rol="central"
      titulo="Panel Central de Despacho"
      activo="panel"
      claseTopbar="mb-4"
      busqueda={{
        placeholder:
          "Buscar por caso, agente o barrio...",
      }}
    >
      {/* BIENVENIDA */}
      <div className="hero-dash hero-img-dash mb-4">
        <div className="eyebrow-dash eyebrow-img-dash">
          <i className="bi bi-shield-check me-2" />
          <span>
            CENTRAL DE DESPACHO · {fechaActual}
          </span>
        </div>

        <h1 className="hero-title-dash">
          ¡Bienvenido,
          <br />
          central de despacho!
        </h1>

        <p className="hero-text-dash">
          {alertasCargadas && atencionesCargadas
            ? `Hay ${cola.length} reportes en cola y ${agentesEnServicio} agentes en servicio.`
            : "Consulta los reportes, agentes y despachos registrados."}
        </p>

        <a
          href="#colaDespacho"
          className="btn btn-light rounded-pill fw-bold mt-3 hero-cta-dash"
        >
          <span className="dot-danger-dash" />
          {" "}Ver cola de despacho
        </a>
      </div>

      {/* MENSAJES DE API */}
      {cargando && (
        <div className="alert alert-info">
          <i className="bi bi-arrow-repeat me-2" />
          Cargando información de Central de Tránsito...
        </div>
      )}

      {errores.length > 0 && (
        <div
          className="alert alert-warning"
          role="alert"
        >
          <strong>
            Algunas consultas no se completaron:
          </strong>

          <ul className="mb-0 mt-2">
            {errores.map((error, indice) => (
              <li key={indice}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* INDICADORES */}
      <div className="row g-3 mb-4">
        <KpiCard
          variante="panel"
          color="red"
          valor={
            alertasCargadas && atencionesCargadas
              ? cola.length
              : "—"
          }
          label="Reportes en cola"
          icono="bi-inboxes"
        />

        <KpiCard
          variante="panel"
          color="blue"
          valor="—"
          label="Tiempo prom. de despacho"
          icono="bi-stopwatch"
        />

        <KpiCard
          variante="panel"
          color="green"
          valor={
            atencionesCargadas
              ? completadosHoy
              : "—"
          }
          label="Despachos completados hoy"
          icono="bi-check2-circle"
        />

        <KpiCard
          variante="panel"
          color="amber"
          valor={
            agentesCargados
              ? `${agentesEnServicio}/${agentes.length}`
              : "—"
          }
          label="Agentes en servicio"
          icono="bi-shield-check"
        />
      </div>

      {/* COLA DE DESPACHO */}
      <section id="colaDespacho">
        <div className="sec-head-pd">
          <h2 id="tituloSinAsignar">
            Cola de despacho
          </h2>

          <Link
            className="see-all-dash"
            to="/transito/central/asignar"
          >
            Ver todos
            <i className="bi bi-chevron-right ms-1" />
          </Link>
        </div>

        <div className="panel-pd mb-4">
          <div className="table-responsive">
            <table className="tabla-pd">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Ubicación / reportante</th>
                  <th>Espera</th>
                  <th className="text-end">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {cola.slice(0, 5).map(
                  (caso, indice) => {
                    const espera = tiempoEsperaCentral(
                      fechaRegistroCentral(caso)
                    );

                    const urgente = (() => {
                      const horas = espera.match(/(\d+)\s*h/);
                      const minutos = espera.match(/(\d+)\s*min/);

                      const totalMinutos =
                        (horas ? Number(horas[1]) * 60 : 0) +
                        (minutos ? Number(minutos[1]) : 0);

                      return espera !== "Sin fecha" && totalMinutos >= 10;
                    })();

                    return (
                      <tr
                        key={
                          idAlertaCentral(caso) ??
                          indice
                        }
                        className="unassigned-row-pd"
                      >
                        <td>
                          <span
                            className={`badge-dash badge-${badgeTipoCentral(
                              tipoCentral(caso)
                            )}-dash`}
                          >
                            {tipoCentral(caso)}
                          </span>
                        </td>

                        <td>
                          <div className="info-title-dash">
                            {lugarCentral(caso)}
                          </div>

                          <div className="info-sub-dash">
                            Reportado por{" "}
                            {reportanteCentral(caso)}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`wait-dash ${urgente
                                ? "wait-urgent-dash"
                                : "wait-warn-dash"
                              }`}
                          >
                            {espera}
                          </span>
                        </td>

                        <td className="text-end">
                          <Link
                            className="assign-btn-pd"
                            to="/transito/central/asignar"
                          >
                            Despachar agente
                          </Link>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {cola.length === 0 && (
            <p className="text-center text-muted py-4 mb-0">
              {alertasCargadas &&
                atencionesCargadas
                ? "No hay casos pendientes de asignación."
                : "No se pudo determinar la cola de despacho."}
            </p>
          )}
        </div>
      </section>

      {/* MAPA ILUSTRATIVO */}
      <div className="sec-head-pd">
        <h2 className="titulos-ct">
          Mapa de despacho
        </h2>
      </div>

      <div className="panel-pd mb-4">
        <div className="mapa-canvas-pd">
          <svg
            className="base-pd"
            viewBox="0 0 600 320"
            preserveAspectRatio="none"
            role="img"
            aria-label="Mapa ilustrativo de despacho"
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

            <g
              stroke="#d7d2c2"
              strokeWidth="6"
            >
              <line
                x1="0"
                y1="80"
                x2="600"
                y2="80"
              />
              <line
                x1="0"
                y1="170"
                x2="600"
                y2="170"
              />
              <line
                x1="0"
                y1="250"
                x2="600"
                y2="250"
              />
              <line
                x1="120"
                y1="0"
                x2="120"
                y2="320"
              />
              <line
                x1="260"
                y1="0"
                x2="260"
                y2="320"
              />
              <line
                x1="400"
                y1="0"
                x2="400"
                y2="320"
              />
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

        <div className="map-legend-pd">
          <strong>Mapa ilustrativo</strong>

          <p className="text-muted small mb-0">
            Para mostrar posiciones reales
            necesitamos coordenadas de la API.
          </p>
        </div>
      </div>

      {/* AGENTES */}
      <div className="sec-head-pd">
        <h2 className="titulos-ct">
          Agentes en servicio
        </h2>

        <Link
          className="see-all-dash"
          to="/transito/central/agentes"
        >
          Ver todos
          <i className="bi bi-chevron-right ms-1" />
        </Link>
      </div>

      <div className="agentes-pd mb-4">
        {agentesVista.slice(0, 5).map(
          (agente, indice) => {
            const estado =
              ESTADOS[agente.estado] ||
              ESTADOS.desconocido;

            return (
              <div
                key={agente.id ?? indice}
                className="agente-row-pd"
              >
                <div className="agente-info-pd">
                  <span className="agente-avatar-pd">
                    {agente.iniciales}
                  </span>

                  <div>
                    <div className="agente-nombre-pd">
                      {agente.nombre}
                    </div>

                    <div className="agente-zona-pd">
                      {agente.zona} ·{" "}
                      {agente.grupo}
                    </div>
                  </div>
                </div>

                <span
                  className={`badge-dash badge-${estado.color}-dash`}
                >
                  {estado.texto}
                </span>
              </div>
            );
          }
        )}

        {agentesVista.length === 0 && (
          <p className="text-center text-muted py-4 mb-0">
            No hay agentes para mostrar.
          </p>
        )}
      </div>

      {/* ÚLTIMOS DESPACHOS */}
      <div className="sec-head-pd">
        <h2 className="titulos-ct">
          Últimos despachos
        </h2>

        <Link
          className="see-all-dash"
          to="/transito/central/historial"
        >
          Ver todos
          <i className="bi bi-chevron-right ms-1" />
        </Link>
      </div>

      <div className="tabs-pd">
        <button
          type="button"
          className={`tab-pd ${tab === "todas" ? "active-pd" : ""
            }`}
          onClick={() => setTab("todas")}
        >
          Todas ({despachos.length})
        </button>

        {tipos.map((tipo) => (
          <button
            key={tipo}
            type="button"
            className={`tab-pd ${tab === tipo ? "active-pd" : ""
              }`}
            onClick={() => setTab(tipo)}
          >
            {tipo}
          </button>
        ))}
      </div>

      <div className="panel-pd">
        <div className="table-responsive">
          <table className="tabla-pd">
            <thead>
              <tr>
                <th>Agente asignado</th>
                <th>Tipo</th>
                <th>Barrio</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {despachosFiltrados
                .slice(0, 5)
                .map((despacho, indice) => (
                  <tr
                    key={
                      idAtencionCentral(despacho) ??
                      indice
                    }
                  >
                    <td>
                      <div className="info-title-dash">
                        {nombreAgenteAsignado(
                          despacho
                        )}
                      </div>

                      <div className="info-sub-dash">
                        {fechaCentral(
                          fechaRegistroCentral(
                            despacho
                          )
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`badge-dash badge-${badgeTipoCentral(
                          tipoCentral(despacho)
                        )}-dash`}
                      >
                        {tipoCentral(despacho)}
                      </span>
                    </td>

                    <td>
                      {lugarCentral(despacho)}
                    </td>

                    <td>
                      <span
                        className={`badge-dash badge-${finalizadaCentral(
                          despacho
                        )
                            ? "green"
                            : "amber"
                          }-dash`}
                      >
                        {despacho.estadoFinal ||
                          despacho.estado ||
                          "No informado"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {despachosFiltrados.length === 0 && (
          <p className="text-center text-muted py-4 mb-0">
            No hay despachos registrados.
          </p>
        )}

        <div className="paginacion-pd">
          <span>
            Mostrando{" "}
            {Math.min(
              5,
              despachosFiltrados.length
            )}{" "}
            de {despachosFiltrados.length}{" "}
            despachos
          </span>
        </div>
      </div>
    </Layout>
  );
}
