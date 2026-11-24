
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import MapaOperaciones from "../../Components/transito/director-transito/MapaOperaciones";
import Layout from "../../Components/transito/Layout";
import KpiCard from "../../Components/transito/KpiCard";

import {
  listarAgentesCentral,
  listarUnidadesCentral,
  listarAtencionesCentral,
  listarAlertasCentral,
  prepararColaCentral,
  prepararAgentesCentral,
  finalizadaCentral,
  tipoCentral,
  lugarCentral,
  idAlertaCentral,
  idAtencionCentral,
} from "../../Services/centralTransitoService";

import {
  listarSeguimientos,
} from "../../Services/atencionTransitoService";

// ======================================================
// FUNCIONES AUXILIARES
// ======================================================

const texto = (valor, defecto = "No registrado") => {
  const resultado = String(valor ?? "").trim();
  return resultado || defecto;
};



const normalizar = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();


const nombreLegible = (valor, defecto = "No registrado") => {
  if (valor === null || valor === undefined || String(valor).trim() === "") {
    return defecto;
  }

  const nombres = {
    SEMAFORO_DANADO: "Semáforo dañado",
    ACCIDENTE_TRANSITO: "Accidente de tránsito",
    CONGESTION_VEHICULAR: "Congestión vehicular",
    OBSTRUCCION_VIA: "Obstrucción de vía",
  };

  const codigo = normalizar(valor);

  if (nombres[codigo]) {
    return nombres[codigo];
  }

  const nombre = codigo.toLocaleLowerCase("es-CO").replaceAll("_", " ");

  return nombre.charAt(0).toLocaleUpperCase("es-CO") + nombre.slice(1);
};


function formatearFecha(valor) {
  if (!valor) return "Sin registrar";

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return "Fecha inválida";
  }

  return fecha.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function tiempoFecha(valor) {
  if (!valor) return 0;

  const tiempo = new Date(valor).getTime();
  return Number.isNaN(tiempo) ? 0 : tiempo;
}

function estadoVisual(valor, categoria = "alerta") {
  const estado = normalizar(valor);

  const estados = {
    PENDIENTE: ["Pendiente", "amber"],
    RECIBIDA: ["Recibida", "blue"],
    UNIDAD_ASIGNADA: ["Unidad asignada", "purple"],
    EN_ATENCION: ["En atención", "blue"],
    EN_PROCESO: ["En proceso", "blue"],
    RESUELTA: ["Resuelta", "green"],
    FINALIZADA: ["Finalizada", "green"],
    CANCELADA: ["Cancelada", "gray"],
    CANCELADO: ["Cancelada", "gray"],
    DISPONIBLE: ["Disponible", "green"],
    ATENCION: ["En atención", "amber"],
    NO_DISPONIBLE: ["No disponible", "gray"],
  };

  if (!estado) {
    return {
      texto:
        categoria === "atencion"
          ? "Sin atención"
          : "No informado",
      color: "gray",
    };
  }

  const encontrado = estados[estado];

  return encontrado
    ? { texto: encontrado[0], color: encontrado[1] }
    : {
        texto: nombreLegible(estado),
        color: "gray",
      };
}

function tipoVisual(tipo) {
  const valor = normalizar(tipo);

  if (
    valor.includes("SEMAFORO") ||
    valor.includes("SEÑAL") ||
    valor.includes("SENAL")
  ) {
    return "amber";
  }

  if (
    valor.includes("ACCIDENTE") ||
    valor.includes("CHOQUE") ||
    valor.includes("ATROPELLO")
  ) {
    return "red";
  }

  if (
    valor.includes("CONGESTION") ||
    valor.includes("TRANCON") ||
    valor.includes("TRAFICO")
  ) {
    return "purple";
  }

  if (
    valor.includes("VIA") ||
    valor.includes("OBSTRUCCION") ||
    valor.includes("BLOQUEO")
  ) {
    return "blue";
  }

  if (
    valor.includes("CONTROL") ||
    valor.includes("OPERATIVO")
  ) {
    return "green";
  }

  return "blue";
}

function obtenerId(objeto, campos) {
  for (const campo of campos) {
    const valor = objeto?.[campo];

    if (valor !== undefined && valor !== null && valor !== "") {
      return String(valor);
    }
  }

  return null;
}

function obtenerIdUnidad(objeto) {
  return obtenerId(objeto, [
    "idUnidadTransito",
    "unidadTransitoId",
    "idUnidad",
    "unidadId",
    "id_unidad_transito",
  ]);
}

function obtenerIdAgente(objeto) {
  return obtenerId(objeto, [
    "idAgenteTransito",
    "agenteTransitoId",
    "idAgente",
    "agenteId",
    "id_agente_transito",
  ]);
}

function obtenerNombreUnidad(objeto) {
  const unidad = objeto?.unidadTransito ?? objeto?.unidad;

  const nombre =
    objeto?.nombreUnidad ??
    objeto?.nombreUnidadTransito ??
    objeto?.unidadNombre ??
    (typeof unidad === "string" ? unidad : null) ??
    unidad?.nombreUnidad ??
    unidad?.nombre ??
    null;

  return nombre ? String(nombre).trim() : null;
}

function obtenerNombreAgente(objeto) {
  return (
    objeto?.nombreAgente ??
    objeto?.nombreCompleto ??
    objeto?.nombre ??
    null
  );
}

function obtenerUnidadDeAgente(
  agente,
  unidades,
  seguimientos,
  atenciones
) {
  // Primero se busca por el ID de unidad del agente.
  const idUnidad = obtenerIdUnidad(agente);

  if (idUnidad) {
    const unidad = unidades.find(
      (item) => obtenerIdUnidad(item) === idUnidad
    );

    if (unidad) {
      return (
        obtenerNombreUnidad(unidad) ??
        `Unidad #${idUnidad}`
      );
    }

    return (
      obtenerNombreUnidad(agente) ??
      `Unidad #${idUnidad}`
    );
  }

  // Algunas APIs entregan la unidad como objeto anidado.
  const nombreDirecto = obtenerNombreUnidad(agente);

  if (nombreDirecto) {
    return nombreDirecto;
  }

  const idAgente = obtenerIdAgente(agente);

  if (idAgente) {
    // También se revisa si la unidad contiene el ID del agente.
    const unidadRelacionada = unidades.find((unidad) => {
      const idAgenteUnidad = obtenerIdAgente(unidad);

      const agentesUnidad =
        unidad?.agentesTransito ??
        unidad?.agentes ??
        [];

      return (
        idAgenteUnidad === idAgente ||
        (Array.isArray(agentesUnidad) &&
          agentesUnidad.some(
            (item) =>
              obtenerIdAgente(item) === idAgente ||
              String(item) === idAgente
          ))
      );
    });

    if (unidadRelacionada) {
      return (
        obtenerNombreUnidad(unidadRelacionada) ??
        `Unidad #${obtenerIdUnidad(unidadRelacionada) ?? "S/N"}`
      );
    }

    // Si hay una atención vinculada, se busca su unidad.
    const atencionesAgente = atenciones.filter(
      (item) => obtenerIdAgente(item) === idAgente
    );

    for (const atencion of atencionesAgente) {
      const idUnidadAtencion = obtenerIdUnidad(atencion);

      if (idUnidadAtencion) {
        const unidad = unidades.find(
          (item) =>
            obtenerIdUnidad(item) === idUnidadAtencion
        );

        return (
          obtenerNombreUnidad(unidad) ??
          obtenerNombreUnidad(atencion) ??
          `Unidad #${idUnidadAtencion}`
        );
      }
    }

    // Último recurso: información de seguimiento.
    const seguimientosAgente = seguimientos
      .filter(
        (caso) => obtenerIdAgente(caso) === idAgente
      )
      .sort(
        (a, b) =>
          tiempoFecha(b.fechaAtencion ?? b.fecha) -
          tiempoFecha(a.fechaAtencion ?? a.fecha)
      );

    const caso = seguimientosAgente.find(
      (item) =>
        obtenerNombreUnidad(item) ||
        obtenerIdUnidad(item)
    );

    if (caso) {
      return (
        obtenerNombreUnidad(caso) ??
        `Unidad #${obtenerIdUnidad(caso)}`
      );
    }
  }

  return "Unidad no vinculada";
}

// ======================================================
// COMPONENTES VISUALES
// ======================================================

function Pill({ texto: contenido, color = "blue" }) {
  return (
    <span className={`central-pill central-pill-${color}`}>
      <span className="central-pill-dot" />
      {contenido}
    </span>
  );
}

function EncabezadoSeccion({ titulo, enlace, etiqueta }) {
  return (
    <div className="central-section-head">
      <h2 className="central-section-title">{titulo}</h2>

      {enlace && (
        <Link className="central-see-all" to={enlace}>
          {etiqueta ?? "Ver todos"}
          <i className="bi bi-chevron-right" />
        </Link>
      )}
    </div>
  );
}

// ======================================================
// PANEL PRINCIPAL
// ======================================================

export default function PanelPrincipal() {
  const [agentes, setAgentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState([]);
  const [tab, setTab] = useState("todas");
  const [buscar, setBuscar] = useState("");

  const [cargas, setCargas] = useState({
    agentes: false,
    atenciones: false,
    alertas: false,
    seguimientos: false,
  });

  // ====================================================
  // CARGAR DATOS
  // ====================================================

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      const resultados = await Promise.allSettled([
        listarAgentesCentral(),
        listarUnidadesCentral(),
        listarAtencionesCentral(),
        listarAlertasCentral(),
        listarSeguimientos(),
      ]);

      if (!activo) return;

      const nombres = [
        "Agentes",
        "Unidades",
        "Atenciones",
        "Alertas",
        "Seguimientos",
      ];

      const mensajes = resultados.flatMap(
        (resultado, indice) =>
          resultado.status === "rejected"
            ? [
                `${nombres[indice]}: ${
                  resultado.reason?.message ??
                  "Error de consulta"
                }`,
              ]
            : []
      );

      const datos = resultados.map((resultado) =>
        resultado.status === "fulfilled" &&
        Array.isArray(resultado.value)
          ? resultado.value
          : []
      );

      setAgentes(datos[0]);
      setUnidades(datos[1]);
      setAtenciones(datos[2]);
      setAlertas(datos[3]);
      setSeguimientos(datos[4]);

      setCargas({
        agentes: resultados[0].status === "fulfilled",
        atenciones: resultados[2].status === "fulfilled",
        alertas: resultados[3].status === "fulfilled",
        seguimientos: resultados[4].status === "fulfilled",
      });

      setErrores(mensajes);
      setCargando(false);
    }

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  // ====================================================
  // INDICADORES
  // ====================================================

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

  const agentesConUnidad = useMemo(
    () =>
      agentesVista.map((agente) => {
        const idVista = obtenerIdAgente(agente);

        const agenteOriginal = agentes.find(
          (item) =>
            idVista &&
            obtenerIdAgente(item) === idVista
        );

        const registro = agenteOriginal
          ? { ...agenteOriginal, ...agente }
          : agente;

        return {
          ...agente,
          nombreUnidad: obtenerUnidadDeAgente(
            registro,
            unidades,
            seguimientos,
            atenciones
          ),
        };
      }),
    [agentesVista, agentes, unidades, seguimientos, atenciones]
  );

  const agentesEnServicio = agentesConUnidad.filter(
    (agente) =>
      agente.estado === "disponible" ||
      agente.estado === "atencion"
  ).length;

  const completadosHoy = atenciones.filter((atencion) => {
    if (!finalizadaCentral(atencion)) return false;

    const valor =
      atencion.fechaFinalizacion ??
      atencion.fechaCierre ??
      atencion.fechaAtencion;

    if (!valor) return false;

    const fecha = new Date(valor);

    return (
      !Number.isNaN(fecha.getTime()) &&
      fecha.toDateString() === new Date().toDateString()
    );
  }).length;

  // ====================================================
  // ATENCIÓN DE TRÁNSITO
  // ====================================================

  const seguimientosFiltrados = useMemo(() => {
    const busqueda = buscar
      .trim()
      .toLocaleLowerCase("es-CO");

    return [...seguimientos]
      .sort(
        (a, b) =>
          tiempoFecha(b.fecha) -
          tiempoFecha(a.fecha)
      )
      .filter((caso) => {
        if (!busqueda) return true;

        return [
          caso.idAlerta,
          caso.nombreTipoAlerta,
          caso.tipo,
          caso.descripcionAlerta,
          caso.barrio,
          caso.barrioNombre,
          caso.nombreUnidad,
          caso.nombreAgente,
          caso.estadoAlerta,
          caso.estadoAtencion,
        ]
          .filter((item) => item != null)
          .join(" ")
          .toLocaleLowerCase("es-CO")
          .includes(busqueda);
      });
  }, [seguimientos, buscar]);

  const ultimosSeguimientos =
    seguimientosFiltrados.slice(0, 5);

  // ====================================================
  // HISTORIAL
  // ====================================================

  const historial = useMemo(
    () =>
      [...atenciones].sort(
        (a, b) =>
          tiempoFecha(
            b.fechaAtencion ??
              b.fechaFinalizacion ??
              b.fecha
          ) -
          tiempoFecha(
            a.fechaAtencion ??
              a.fechaFinalizacion ??
              a.fecha
          )
      ),
    [atenciones]
  );

  const tipos = useMemo(
    () =>
      [
        ...new Set(
          historial.map((item) => tipoCentral(item))
        ),
      ].filter(Boolean),
    [historial]
  );

  const historialFiltrado = historial.filter(
    (item) =>
      tab === "todas" ||
      normalizar(tipoCentral(item)) === normalizar(tab)
  );

  function alertaDeAtencion(atencion) {
    const id =
      atencion.idAlerta ??
      atencion.alertaId;

    return alertas.find(
      (alerta) =>
        id != null &&
        String(idAlertaCentral(alerta)) === String(id)
    );
  }

  function nombreAgenteAsignado(atencion) {
    const id = obtenerIdAgente(atencion);

    const agente = agentesConUnidad.find(
      (item) =>
        id && obtenerIdAgente(item) === id
    );

    return (
      agente?.nombre ??
      obtenerNombreAgente(atencion) ??
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

  // ====================================================
  // INTERFAZ
  // ====================================================

  return (
    <Layout
      rol="central"
      titulo="Panel Central de Despacho"
      activo="panel"
      claseTopbar="mb-4"
      busqueda={{
        placeholder:
          "Buscar por alerta, barrio o unidad...",
        valor: buscar,
        onChange: setBuscar,
      }}
    >
      {/* HERO */}

      <div className="hero-dash hero-img-dash mb-4">
        <div className="eyebrow-dash eyebrow-img-dash">
          <i className="bi bi-shield-check me-2" />
          CENTRAL DE DESPACHO · {fechaActual}
        </div>

        <h1 className="hero-title-dash">
          ¡Bienvenido,
          <br />
          central de despacho!
        </h1>

        <p className="hero-text-dash">
          {cargas.alertas && cargas.atenciones
            ? `Hay ${cola.length} reportes pendientes de despacho y ${agentesEnServicio} agentes en servicio.`
            : "Consulta los reportes, agentes y atenciones registrados."}
        </p>

        <a
          href="#atencionTransito"
          className="btn btn-light rounded-pill fw-bold mt-3 hero-cta-dash"
        >
          <span className="dot-danger-dash" />
          {" "}Ver atención de tránsito
        </a>
      </div>

      {cargando && (
        <div className="alert alert-info">
          Cargando información...
        </div>
      )}

      {errores.length > 0 && (
        <div className="alert alert-warning">
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
            cargas.alertas && cargas.atenciones
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
            cargas.atenciones
              ? completadosHoy
              : "—"
          }
          label="Atenciones completadas hoy"
          icono="bi-check2-circle"
        />

        <KpiCard
          variante="panel"
          color="amber"
          valor={
            cargas.agentes
              ? `${agentesEnServicio}/${agentes.length}`
              : "—"
          }
          label="Agentes en servicio"
          icono="bi-shield-check"
        />
      </div>

      {/* ATENCIÓN DE TRÁNSITO */}

      <section id="atencionTransito">
        <EncabezadoSeccion
          titulo="Atención de tránsito"
          enlace="/transito/central/atencion"
          etiqueta="Ver todas"
        />

        <div className="central-table-card mb-4">
          <div className="table-responsive">
            <table className="central-table">
              <thead>
                <tr>
                  <th>Alerta</th>
                  <th>Incidente / ubicación</th>
                  <th>Unidad y agente</th>
                  <th>Registro</th>
                  <th>Atención</th>
                  <th>Estado de alerta</th>
                  <th>Estado de atención</th>
                </tr>
              </thead>

              <tbody>
                {ultimosSeguimientos.map((caso) => {
                  const tipo =
                    caso.nombreTipoAlerta ??
                    caso.tipoAlerta ??
                    caso.tipo;

                  const alerta = estadoVisual(
                    caso.estadoAlerta ?? caso.estado
                  );

                  const atencion =
                    caso.idAtencionTransito != null ||
                    caso.tieneAtencion
                      ? estadoVisual(
                          caso.estadoAtencion ??
                            caso.estadoFinalAtencion,
                          "atencion"
                        )
                      : estadoVisual(null, "atencion");

                  const unidad =
                    obtenerNombreUnidad(caso) ??
                    (obtenerIdUnidad(caso)
                      ? `Unidad #${obtenerIdUnidad(caso)}`
                      : "Sin asignar");

                  return (
                    <tr
                      key={
                        caso.claveSeguimiento ??
                        `${caso.idAlerta}-${caso.idAsignacion}-${caso.idAtencionTransito}`
                      }
                    >
                      <td>
                        <span className="central-id">
                          #{texto(caso.idAlerta, "S/N")}
                        </span>
                      </td>

                      <td>
                        <Pill
                          texto={nombreLegible(
                            tipo,
                            "Alerta de tránsito"
                          )}
                          color={tipoVisual(tipo)}
                        />

                        <div className="central-cell-sub mt-2">
                          <i className="bi bi-geo-alt me-1" />
                          {texto(
                            caso.barrio ??
                              caso.barrioNombre ??
                              caso.nombreBarrio ??
                              caso.direccion,
                            "Ubicación no registrada"
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="central-cell-main">
                          {unidad}
                        </div>

                        <div className="central-cell-sub">
                          {texto(
                            caso.nombreAgente,
                            "Agente no asignado"
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="central-date">
                          {formatearFecha(caso.fecha)}
                        </span>
                      </td>

                      <td>
                        <span className="central-date">
                          {formatearFecha(
                            caso.fechaAtencion
                          )}
                        </span>
                      </td>

                      <td>
                        <Pill
                          texto={alerta.texto}
                          color={alerta.color}
                        />
                      </td>

                      <td>
                        <Pill
                          texto={atencion.texto}
                          color={atencion.color}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!cargando &&
            ultimosSeguimientos.length === 0 && (
              <div className="central-empty">
                {cargas.seguimientos
                  ? "No hay casos para mostrar."
                  : "No fue posible cargar los seguimientos."}
              </div>
            )}

          <div className="central-table-footer">
            Mostrando {ultimosSeguimientos.length} de{" "}
            {seguimientosFiltrados.length} casos
          </div>
        </div>
      </section>

      {/* MAPA */}
      <EncabezadoSeccion titulo="Mapa de operaciones" enlace="/transito/central/mapa" etiqueta="Ver mapa completo" />
      <div className="panel-pd mb-4">
        <MapaOperaciones compacto />
      </div>

      {/* AGENTES */}

      <EncabezadoSeccion
        titulo="Agentes en servicio"
        enlace="/transito/central/agentes"
      />

      <div className="central-agents-card mb-4">
        {agentesConUnidad.slice(0, 5).map(
          (agente, indice) => {
            const estado = estadoVisual(
              agente.estado
            );

            return (
              <div
                className="central-agent-row"
                key={
                  obtenerIdAgente(agente) ??
                  agente.id ??
                  indice
                }
              >
                <div className="central-agent-info">
                  <span className="central-agent-avatar">
                    {texto(
                      agente.iniciales,
                      texto(agente.nombre, "A")
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </span>

                  <div>
                    <div className="central-agent-name">
                      {texto(
                        agente.nombre,
                        "Agente de tránsito"
                      )}
                    </div>

                    <div className="central-agent-unit">
                      <i className="bi bi-truck-front me-1" />
                      {agente.nombreUnidad}
                    </div>

                    {agente.zona &&
                      agente.zona !== "No registrada" && (
                        <div className="central-agent-zone">
                          {agente.zona}
                        </div>
                      )}
                  </div>
                </div>

                <Pill
                  texto={estado.texto}
                  color={estado.color}
                />
              </div>
            );
          }
        )}

        {agentesConUnidad.length === 0 && (
          <div className="central-empty">
            No hay agentes para mostrar.
          </div>
        )}
      </div>

      {/* HISTORIAL */}

      <section id="historial">
        <EncabezadoSeccion
          titulo="Historial"
          enlace="/transito/central/historial"
        />

        <div className="central-tabs">
          <button
            type="button"
            className={`central-tab ${
              tab === "todas" ? "central-tab-active" : ""
            }`}
            onClick={() => setTab("todas")}
          >
            Todas ({historial.length})
          </button>

          {tipos.map((tipo) => (
            <button
              key={tipo}
              type="button"
              className={`central-tab ${
                normalizar(tab) === normalizar(tipo)
                  ? "central-tab-active"
                  : ""
              }`}
              onClick={() => setTab(tipo)}
            >
              {nombreLegible(tipo)}
            </button>
          ))}
        </div>

        <div className="central-table-card">
          <div className="table-responsive">
            <table className="central-table">
              <thead>
                <tr>
                  <th>N.º atención</th>
                  <th>Agente responsable</th>
                  <th>Incidente</th>
                  <th>Ubicación</th>
                  <th>Fecha de atención</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {historialFiltrado
                  .slice(0, 5)
                  .map((atencion, indice) => {
                    const alerta =
                      alertaDeAtencion(atencion);

                    const tipo = tipoCentral(
                      alerta ?? atencion
                    );

                    const estado = finalizadaCentral(
                      atencion
                    )
                      ? estadoVisual("FINALIZADA")
                      : estadoVisual(
                          atencion.estadoFinal ??
                            atencion.estadoAtencion ??
                            atencion.estado
                        );

                    const fecha =
                      atencion.fechaAtencion ??
                      atencion.fechaFinalizacion ??
                      atencion.fechaCierre ??
                      atencion.fechaRegistro ??
                      atencion.fecha;

                    return (
                      <tr
                        key={
                          idAtencionCentral(atencion) ??
                          indice
                        }
                      >
                        <td>
                          <span className="central-id">
                            #
                            {idAtencionCentral(
                              atencion
                            ) ?? "S/N"}
                          </span>
                        </td>

                        <td>
                          <div className="central-cell-main">
                            {nombreAgenteAsignado(
                              atencion
                            )}
                          </div>
                        </td>

                        <td>
                          <Pill
                            texto={nombreLegible(tipo)}
                            color={tipoVisual(tipo)}
                          />
                        </td>

                        <td>
                          <span className="central-location">
                            {lugarCentral(
                              alerta ?? atencion
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="central-date">
                            {formatearFecha(fecha)}
                          </span>
                        </td>

                        <td>
                          <Pill
                            texto={estado.texto}
                            color={estado.color}
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {historialFiltrado.length === 0 && (
            <div className="central-empty">
              No hay atenciones registradas.
            </div>
          )}

          <div className="central-table-footer">
            Mostrando{" "}
            {Math.min(5, historialFiltrado.length)} de{" "}
            {historialFiltrado.length} atenciones
          </div>
        </div>
      </section>

      {/* ESTILOS */}

      <style>{`
        .central-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .central-section-title {
          margin: 0;
          padding: 0;
          border: none;
          background: transparent;
          color: #173f65;
          font-family: "Space Grotesk", "Inter", sans-serif;
          font-size: 21px;
          font-weight: 800;
          letter-spacing: -0.3px;
        }

        .central-see-all {
          color: #517aac;
          text-decoration: none;
          font-family: "Inter", sans-serif;
          font-size: 13px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .central-see-all:hover {
          color: #2d609c;
        }

        .central-table-card,
        .central-agents-card {
          background: #fff;
          border: 1px solid #e8edf5;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 4px 22px rgba(32, 65, 103, 0.035);
        }

        .central-table {
          width: 100%;
          border-collapse: collapse;
          font-family: "Inter", sans-serif;
          font-size: 13px;
        }

        .central-table thead {
          background: #f3f7fc;
        }

        .central-table th {
          padding: 17px 18px;
          text-align: left;
          color: #64758d;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.35px;
          white-space: nowrap;
          border-bottom: 1px solid #e8edf5;
        }

        .central-table td {
          padding: 17px 18px;
          vertical-align: middle;
          border-bottom: 1px solid #edf1f6;
          color: #34445a;
        }

        .central-table tbody tr:nth-child(even) {
          background: #fbfcff;
        }

        .central-table tbody tr:hover {
          background: #f1f6fc;
          transition: background 0.15s ease;
        }

        .central-table tbody tr:last-child td {
          border-bottom: none;
        }

        .central-id {
          display: inline-flex;
          padding: 7px 11px;
          border-radius: 9px;
          background: #edf3fb;
          color: #2d609c;
          font-weight: 800;
          font-size: 12px;
          white-space: nowrap;
        }

        .central-cell-main {
          font-size: 13px;
          font-weight: 700;
          color: #203c5d;
        }

        .central-cell-sub {
          margin-top: 5px;
          font-size: 11px;
          font-weight: 500;
          color: #8290a3;
        }

        .central-date {
          color: #60728b;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .central-location {
          color: #61738b;
          font-size: 12px;
          font-weight: 500;
        }

        .central-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 750;
          white-space: nowrap;
          line-height: 1.25;
        }

        .central-pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          background: currentColor;
        }

        .central-pill-green {
          background: #e7f7ed;
          color: #20834c;
        }

        .central-pill-amber {
          background: #fff3dc;
          color: #a96a10;
        }

        .central-pill-blue {
          background: #e7f0fc;
          color: #356fae;
        }

        .central-pill-red {
          background: #fdebec;
          color: #c34854;
        }

        .central-pill-purple {
          background: #f0eafd;
          color: #7655b5;
        }

        .central-pill-gray {
          background: #edf0f4;
          color: #6d7887;
        }

        .central-table-footer {
          padding: 14px 19px;
          border-top: 1px solid #edf1f6;
          background: #fbfcff;
          color: #8290a3;
          font-size: 12px;
          font-weight: 600;
        }

        .central-empty {
          padding: 30px 16px;
          text-align: center;
          color: #8794a6;
          font-size: 13px;
        }

        .central-agents-card {
          padding: 0 18px;
        }

        .central-agent-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 17px 5px;
          border-bottom: 1px solid #edf1f6;
        }

        .central-agent-row:last-child {
          border-bottom: none;
        }

        .central-agent-info {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .central-agent-avatar {
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 13px;
          background: #e7effa;
          color: #517aac;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
        }

        .central-agent-name {
          color: #203c5d;
          font-size: 13px;
          font-weight: 800;
        }

        .central-agent-unit {
          margin-top: 4px;
          color: #517aac;
          font-size: 12px;
          font-weight: 650;
        }

        .central-agent-zone {
          margin-top: 3px;
          color: #8794a6;
          font-size: 11px;
        }

        .central-tabs {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }

        .central-tab {
          padding: 9px 15px;
          border: 1px solid #e5ebf3;
          background: #fff;
          border-radius: 10px;
          color: #718198;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .central-tab:hover {
          background: #f1f6fc;
          color: #2d609c;
        }

        .central-tab-active {
          background: #e8f0fa;
          border-color: #d4e2f4;
          color: #2d609c;
        }

        @media (max-width: 768px) {
          .central-section-title {
            font-size: 18px;
          }

          .central-table th,
          .central-table td {
            padding: 13px 12px;
          }

          .central-agent-row {
            align-items: flex-start;
          }
        }
      `}</style>
    </Layout>
  );
}
