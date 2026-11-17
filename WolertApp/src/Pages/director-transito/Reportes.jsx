
import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/transito/Layout";
import KpiCard from "../../Components/transito/KpiCard";

import {
  listarAtencionesDirector,
  listarAgentesDirector,
  listarUnidadesDirector,
  nombreAgente,
  nombreUnidadAgente,
  fechaCaso,
  fechaTransito,
  estadoCaso,
  estadoFinalizado,
  badgeEstadoCaso,
  normalizar,
} from "../../Services/directorTransitoService";

function obtenerFechaRegistro(registro) {
  return (
    fechaCaso(registro) ||
    registro.fechaAtencion ||
    registro.fechaCreacion ||
    registro.fechaRegistro ||
    null
  );
}

function obtenerIdAgente(agente) {
  return (
    agente.idAgenteTransito ??
    agente.idUsuario ??
    agente.id ??
    null
  );
}

function obtenerIdAtencion(atencion) {
  return (
    atencion.idAtencionTransito ??
    atencion.idAtencion ??
    atencion.id ??
    null
  );
}

function obtenerZonaAtencion(atencion, agente, unidades) {
  const zonaDirecta =
    atencion.nombreBarrio ||
    atencion.barrioNombre ||
    atencion.nombreZona ||
    atencion.zona;

  if (zonaDirecta) return zonaDirecta;

  if (!agente) return "No disponible";

  return (
    nombreUnidadAgente(agente, unidades) ||
    "No disponible"
  );
}

function obtenerDuracionMinutos(atencion) {
  const minutos =
    atencion.tiempoAtencionMinutos ??
    atencion.duracionMinutos ??
    atencion.tiempoRespuestaMinutos;

  if (minutos != null && Number.isFinite(Number(minutos))) {
    return Number(minutos);
  }

  const inicio =
    atencion.fechaInicio ||
    atencion.fechaAsignacion;

  const fin =
    atencion.fechaFinalizacion ||
    atencion.fechaCierre;

  if (!inicio || !fin) return null;

  const diferencia =
    (new Date(fin).getTime() -
      new Date(inicio).getTime()) / 60000;

  return Number.isFinite(diferencia) && diferencia >= 0
    ? diferencia
    : null;
}

function crearCsv(registros) {
  const columnas = [
    "Fecha",
    "Tipo de reporte",
    "Zona",
    "Agente",
    "Estado",
    "ID",
  ];

  const escapar = (valor) => {
    const texto = String(valor ?? "");

    return `"${texto.replace(/"/g, '""')}"`;
  };

  const filas = registros.map((registro) => [
    fechaTransito(registro.fecha),
    registro.tipo,
    registro.zona,
    registro.agente,
    registro.estado,
    registro.id,
  ]);

  const contenido = [
    columnas,
    ...filas,
  ]
    .map((fila) => fila.map(escapar).join(";"))
    .join("\r\n");

  return "\uFEFF" + contenido;
}

export default function Reportes() {
  const [atenciones, setAtenciones] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [unidades, setUnidades] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [tab, setTab] = useState("todos");
  const [periodo, setPeriodo] = useState("7");
  const [zona, setZona] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      const resultados = await Promise.allSettled([
        listarAtencionesDirector(),
        listarAgentesDirector(),
        listarUnidadesDirector(),
      ]);

      if (!activo) return;

      const [
        resultadoAtenciones,
        resultadoAgentes,
        resultadoUnidades,
      ] = resultados;

      const errores = [];

      if (resultadoAtenciones.status === "fulfilled") {
        setAtenciones(resultadoAtenciones.value);
      } else {
        errores.push(
          resultadoAtenciones.reason?.message ||
          "No se pudieron cargar las atenciones."
        );
      }

      if (resultadoAgentes.status === "fulfilled") {
        setAgentes(resultadoAgentes.value);
      } else {
        errores.push(
          "No se pudieron cargar los agentes."
        );
      }

      if (resultadoUnidades.status === "fulfilled") {
        setUnidades(resultadoUnidades.value);
      } else {
        errores.push(
          "No se pudieron cargar las unidades."
        );
      }

      setError(errores.join(" | "));
      setCargando(false);
    }

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  const registros = useMemo(() => {
    return atenciones.map((atencion, indice) => {
      const idAgenteAtencion =
        atencion.idAgenteTransito ??
        atencion.agenteTransitoId ??
        atencion.idUsuarioAgente;

      const agente = agentes.find(
        (item) =>
          String(obtenerIdAgente(item)) ===
          String(idAgenteAtencion)
      );

      return {
        id: obtenerIdAtencion(atencion) ?? indice,
        tipo: "Caso",
        fecha: obtenerFechaRegistro(atencion),
        zona: obtenerZonaAtencion(
          atencion,
          agente,
          unidades
        ),
        agente: agente
          ? nombreAgente(agente)
          : atencion.nombreAgente ||
            "No asignado",
        estado: estadoCaso(atencion),
        duracion: obtenerDuracionMinutos(atencion),
        original: atencion,
      };
    });
  }, [atenciones, agentes, unidades]);

  const zonasDisponibles = useMemo(() => {
    return [...new Set(
      registros
        .map((registro) => registro.zona)
        .filter(
          (nombre) =>
            nombre &&
            nombre !== "No disponible"
        )
    )].sort();
  }, [registros]);

  const filtrados = useMemo(() => {
    const ahora = new Date();

    return registros.filter((registro) => {
      if (tab !== "todos" && tab !== "casos") {
        return false;
      }

      if (
        zona !== "todas" &&
        registro.zona !== zona
      ) {
        return false;
      }

      const texto = normalizar([
        registro.tipo,
        registro.zona,
        registro.agente,
        registro.estado,
        registro.id,
      ].join(" "));

      if (!texto.includes(normalizar(busqueda))) {
        return false;
      }

      if (periodo === "todo") return true;

      if (!registro.fecha) return false;

      const fecha = new Date(registro.fecha);

      if (Number.isNaN(fecha.getTime())) {
        return false;
      }

      if (periodo === "mes") {
        return (
          fecha.getMonth() === ahora.getMonth() &&
          fecha.getFullYear() === ahora.getFullYear()
        );
      }

      const dias = Number(periodo);

      const desde = new Date(ahora);
      desde.setDate(desde.getDate() - dias);

      return fecha >= desde && fecha <= ahora;
    });
  }, [registros, tab, periodo, zona, busqueda]);

  const estadisticas = useMemo(() => {
    const ahora = new Date();

    const hace24Horas = new Date(
      ahora.getTime() - 24 * 60 * 60 * 1000
    );

    const ultimas24Horas = registros.filter(
      (registro) => {
        if (!registro.fecha) return false;

        const fecha = new Date(registro.fecha);

        return (
          !Number.isNaN(fecha.getTime()) &&
          fecha >= hace24Horas &&
          fecha <= ahora
        );
      }
    ).length;

    const resueltosMes = registros.filter(
      (registro) => {
        if (!estadoFinalizado(registro.estado)) {
          return false;
        }

        const fechaCierre =
          registro.original.fechaFinalizacion ||
          registro.original.fechaCierre ||
          registro.fecha;

        if (!fechaCierre) return false;

        const fecha = new Date(fechaCierre);

        return (
          !Number.isNaN(fecha.getTime()) &&
          fecha.getMonth() === ahora.getMonth() &&
          fecha.getFullYear() === ahora.getFullYear()
        );
      }
    ).length;

    const duraciones = registros
      .map((registro) => registro.duracion)
      .filter(
        (valor) =>
          valor != null &&
          Number.isFinite(valor)
      );

    const promedio =
      duraciones.length > 0
        ? (
            duraciones.reduce(
              (total, valor) => total + valor,
              0
            ) / duraciones.length
          ).toFixed(1) + " min"
        : "—";

    const criticos = registros.filter(
      (registro) =>
        !estadoFinalizado(registro.estado) &&
        (
          normalizar(registro.estado).includes("CRITIC") ||
          normalizar(
            registro.original.prioridad
          ).includes("ALTA")
        )
    ).length;

    return {
      ultimas24Horas,
      resueltosMes,
      promedio,
      criticos,
    };
  }, [registros]);

  function exportarCsv() {
    if (filtrados.length === 0) {
      return;
    }

    const contenido = crearCsv(filtrados);

    const archivo = new Blob(
      [contenido],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(archivo);

    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download =
      `reportes-transito-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <Layout
      titulo="Reportes de Tránsito"
      activo="reportes"
      busqueda={{
        placeholder: "Buscar por caso, barrio o agente...",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="section-title-dash">
            Reportes
          </h1>

          <p className="section-text-dash mb-0">
            Consulta y exporta la actividad registrada
            por el módulo de Tránsito.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary rounded-pill fw-bold btn-nuevo-dash"
          onClick={exportarCsv}
          disabled={filtrados.length === 0}
        >
          <i className="bi bi-download me-2" />
          Exportar
        </button>
      </div>

      {cargando && (
        <div className="alert alert-info" role="status">
          Cargando reportes de tránsito...
        </div>
      )}

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      <div className="row g-3 mb-4">
        <KpiCard
          color="red"
          valor={estadisticas.ultimas24Horas}
          label="Reportes últimas 24h"
          icono="bi-copy"
        />

        <KpiCard
          color="blue"
          valor={estadisticas.promedio}
          label="Tiempo promedio de atención"
          icono="bi-clock"
        />

        <KpiCard
          color="green"
          valor={estadisticas.resueltosMes}
          label="Casos resueltos este mes"
          icono="bi-check2"
        />

        <KpiCard
          color="amber"
          valor={estadisticas.criticos}
          label="Casos críticos activos"
          icono="bi-suitcase-lg"
        />
      </div>

      <div className="table-card-dash">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
          <div className="d-flex gap-2 tabs-dash flex-wrap">
            {[
              ["todos", "Todos"],
              ["casos", "Casos"],
              ["agentes", "Agentes"],
              ["zonas", "Zonas"],
            ].map(([valor, nombre]) => (
              <button
                key={valor}
                type="button"
                className={`tab-dash ${
                  tab === valor ? "active-dash" : ""
                }`}
                onClick={() => setTab(valor)}
              >
                {nombre}
              </button>
            ))}
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <select
              className="form-select input-dash select-filtro-dash"
              value={periodo}
              onChange={(e) =>
                setPeriodo(e.target.value)
              }
            >
              <option value="7">
                Últimos 7 días
              </option>

              <option value="30">
                Últimos 30 días
              </option>

              <option value="mes">
                Este mes
              </option>

              <option value="todo">
                Todo el historial
              </option>
            </select>

            <select
              className="form-select input-dash select-filtro-dash"
              value={zona}
              onChange={(e) =>
                setZona(e.target.value)
              }
            >
              <option value="todas">
                Todas las zonas
              </option>

              {zonasDisponibles.map((nombre) => (
                <option
                  key={nombre}
                  value={nombre}
                >
                  {nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="input-group search-panel-dash mb-3">
          <span className="input-group-text bg-white border-0">
            <i className="bi bi-search" />
          </span>

          <input
            type="search"
            className="form-control border-0"
            placeholder="Buscar por agente, zona o estado..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
          />
        </div>

        {(tab === "agentes" || tab === "zonas") && (
          <div className="alert alert-info small">
            La vista de reportes de{" "}
            {tab === "agentes" ? "agentes" : "zonas"}{" "}
            requiere una fuente de eventos específica
            en la API. Los registros de atenciones
            se consultan en la pestaña Casos.
          </div>
        )}

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo de reporte</th>
                <th>Zona</th>
                <th>Agente</th>
                <th>Estado</th>
                <th className="text-end">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((registro) => (
                <tr key={registro.id}>
                  <td>
                    {fechaTransito(registro.fecha)}
                  </td>

                  <td>{registro.tipo}</td>

                  <td>{registro.zona}</td>

                  <td>{registro.agente}</td>

                  <td>
                    <span
                      className={`badge-dash ${badgeEstadoCaso(
                        registro.estado
                      )}`}
                    >
                      {registro.estado}
                    </span>
                  </td>

                  <td className="text-end">
                    <button
                      type="button"
                      className="link-btn-dash border-0 bg-transparent"
                      onClick={() =>
                        setDetalle(registro)
                      }
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtrados.length === 0 && (
          <div className="text-center text-muted py-4">
            No se encontraron reportes
            para los filtros seleccionados.
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">
            Mostrando {filtrados.length} de{" "}
            {registros.length} registros
          </span>
        </div>
      </div>

      {detalle && (
        <div
          className="modal fade show"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tituloDetalleReporte"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-dash">
              <div className="modal-header">
                <h5
                  id="tituloDetalleReporte"
                  className="modal-title"
                >
                  Detalle del reporte
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setDetalle(null)}
                />
              </div>

              <div className="modal-body">
                <p>
                  <b>ID:</b> {detalle.id}
                </p>

                <p>
                  <b>Fecha:</b>{" "}
                  {fechaTransito(detalle.fecha)}
                </p>

                <p>
                  <b>Tipo:</b> {detalle.tipo}
                </p>

                <p>
                  <b>Zona:</b> {detalle.zona}
                </p>

                <p>
                  <b>Agente:</b> {detalle.agente}
                </p>

                <p>
                  <b>Estado:</b> {detalle.estado}
                </p>

                <p>
                  <b>Descripción:</b>{" "}
                  {detalle.original.descripcion ||
                    "No disponible"}
                </p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() =>
                    setDetalle(null)
                  }
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
