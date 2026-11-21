
import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/transito/Layout";
import KpiCard from "../../Components/transito/KpiCard";
import {
  listarAtencionesDirector,
  listarAlertasDirector,
  listarAgentesDirector,
  idAtencion,
  idAlerta,
  nombreAgente,
  fechaCaso,
  fechaTransito,
  fechaEsHoy,
  estadoCaso,
  tipoCaso,
  badgeEstadoCaso,
  estadoFinalizado,
  estadoActivoAgente,
  normalizar,
} from "../../Services/directorTransitoService";

const POR_PAGINA = 5;

function prepararCasos(alertas, atenciones) {
  if (alertas.length > 0) {
    return alertas.map((alerta) => {
      const atencion = atenciones.find(
        (a) =>
          String(a.idAlerta) === String(idAlerta(alerta))
      );

      return {
        ...alerta,
        atencion,
        identificador: idAlerta(alerta),
        tipoVisual: tipoCaso(alerta),
        estadoVisual: estadoCaso(atencion ?? alerta),
        fechaVisual: fechaCaso(alerta) ?? fechaCaso(atencion),
        reportante:
          alerta.nombreReportante ||
          alerta.nombreUsuario ||
          alerta.reportanteNombre ||
          alerta.usuario?.nombre ||
          "No registrado",
        barrio:
          alerta.nombreBarrio ||
          alerta.barrioNombre ||
          alerta.barrio?.nombre ||
          "No registrado",
      };
    });
  }

  return atenciones.map((atencion) => ({
    ...atencion,
    identificador: idAtencion(atencion),
    tipoVisual: tipoCaso(atencion),
    estadoVisual: estadoCaso(atencion),
    fechaVisual: fechaCaso(atencion),
    reportante:
      atencion.nombreReportante ||
      "No disponible",
    barrio:
      atencion.nombreBarrio ||
      atencion.barrioNombre ||
      "No disponible",
  }));
}

export default function Casos() {
  const [casos, setCasos] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("TODAS");
  const [estado, setEstado] = useState("");
  const [pagina, setPagina] = useState(1);
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const [rAtenciones, rAlertas, rAgentes] =
        await Promise.allSettled([
          listarAtencionesDirector(),
          listarAlertasDirector(),
          listarAgentesDirector(),
        ]);

      if (!activo) return;

      const atenciones =
        rAtenciones.status === "fulfilled"
          ? rAtenciones.value
          : [];

      const alertas =
        rAlertas.status === "fulfilled"
          ? rAlertas.value
          : [];

      setCasos(prepararCasos(alertas, atenciones));

      if (rAgentes.status === "fulfilled") {
        setAgentes(rAgentes.value);
      }

      const errores = [];

      if (rAtenciones.status === "rejected") {
        errores.push(
          rAtenciones.reason?.message ||
            "No se pudieron consultar las atenciones."
        );
      }

      if (rAlertas.status === "rejected") {
        errores.push(
          "No se pudieron consultar las alertas. Se muestran las atenciones disponibles."
        );
      }

      if (rAgentes.status === "rejected") {
        errores.push(
          "No se pudo consultar la disponibilidad de agentes."
        );
      }

      setError(errores.join(" | "));
      setCargando(false);
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  const tipos = useMemo(() => {
    return [...new Set(
      casos.map((c) => normalizar(c.tipoVisual))
    )].filter((t) => t && t !== "SIN TIPO");
  }, [casos]);

  const filtrados = useMemo(() => {
    return casos.filter((caso) => {
      if (
        tipo !== "TODAS" &&
        normalizar(caso.tipoVisual) !== tipo
      ) {
        return false;
      }

      if (
        estado &&
        normalizar(caso.estadoVisual) !== estado
      ) {
        return false;
      }

      const contenido = normalizar([
        caso.identificador,
        caso.reportante,
        caso.barrio,
        caso.tipoVisual,
        caso.estadoVisual,
        caso.descripcion,
      ].join(" "));

      return contenido.includes(normalizar(busqueda));
    });
  }, [casos, tipo, estado, busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / POR_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);

  const visibles = filtrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  const activos = casos.filter(
    (caso) => !estadoFinalizado(caso.estadoVisual)
  ).length;

  const cerradosHoy = casos.filter(
    (caso) =>
      estadoFinalizado(caso.estadoVisual) &&
      fechaEsHoy(
        caso.atencion?.fechaAtencion ??
          caso.fechaVisual
      )
  ).length;

  const disponibles = agentes.filter(
    (agente) =>
      estadoActivoAgente(
        agente.estadoAgente ?? agente.estado
      )
  ).length;

  function limpiar() {
    setBusqueda("");
    setTipo("TODAS");
    setEstado("");
    setPagina(1);
  }

  return (
    <Layout
      titulo="Casos de Tránsito"
      activo="casos"
      busqueda={{
        placeholder: "Buscar por caso, barrio o agente...",
      }}
    >
      <div className="mb-4">
        <h1 className="section-title-dash">
          Casos de Tránsito
        </h1>
        <p className="section-text-dash mb-0">
          Consulta y supervisa los casos reportados
          en el módulo de tránsito.
        </p>
      </div>

      {cargando && (
        <div className="alert alert-info" role="status">
          Cargando casos de tránsito...
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
          valor={activos}
          label="Casos activos"
          icono="bi-geo-alt"
        />
        <KpiCard
          color="blue"
          valor="—"
          label="Tiempo de respuesta"
          icono="bi-clock"
        />
        <KpiCard
          color="green"
          valor={cerradosHoy}
          label="Casos cerrados hoy"
          icono="bi-check2"
        />
        <KpiCard
          color="amber"
          valor={`${disponibles}/${agentes.length}`}
          label="Agentes disponibles"
          icono="bi-truck"
        />
      </div>

      <div className="table-card-dash">
        <div className="filtros-fila-dash mb-3">
          <div className="input-group search-dash filtros-busqueda-dash">
            <span className="input-group-text bg-white border-0">
              <i className="bi bi-search" />
            </span>
            <input
              type="search"
              className="form-control border-0"
              placeholder="Buscar por reportante, barrio..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </div>

          <div className="d-flex flex-wrap gap-2">
            {[
              ["EN_PROCESO", "En atención", "pill-atencion-dash"],
              ["CRITICA", "Crítica", "pill-critica-dash"],
              ["EN_CAMINO", "En camino", "pill-camino-dash"],
              ["FINALIZADA", "Resuelta", "pill-resuelta-dash"],
            ].map(([valor, etiqueta, clase]) => (
              <button
                key={valor}
                type="button"
                className={`pill-filtro-dash ${clase} ${
                  estado === valor ? "fw-bold border border-dark" : ""
                }`}
                onClick={() => {
                  setEstado(estado === valor ? "" : valor);
                  setPagina(1);
                }}
              >
                {etiqueta}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={limpiar}
          >
            <i className="bi bi-x-circle me-1" />
            Limpiar
          </button>
        </div>

        <div className="d-flex gap-2 tabs-dash mb-3 flex-wrap">
          <button
            type="button"
            className={`tab-dash ${
              tipo === "TODAS" ? "active-dash" : ""
            }`}
            onClick={() => {
              setTipo("TODAS");
              setPagina(1);
            }}
          >
            Todas ({casos.length})
          </button>

          {tipos.map((nombreTipo) => (
            <button
              key={nombreTipo}
              type="button"
              className={`tab-dash ${
                tipo === nombreTipo ? "active-dash" : ""
              }`}
              onClick={() => {
                setTipo(nombreTipo);
                setPagina(1);
              }}
            >
              {nombreTipo} (
              {casos.filter(
                (c) => normalizar(c.tipoVisual) === nombreTipo
              ).length}
              )
            </button>
          ))}
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Reportado por</th>
                <th>Tipo</th>
                <th>Barrio</th>
                <th>Estado</th>
                <th className="text-end">&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((caso, indice) => (
                <tr key={caso.identificador ?? indice}>
                  <td>
                    <div className="info-title-dash">
                      {caso.reportante}
                    </div>
                    <div className="info-sub-dash">
                      {fechaTransito(caso.fechaVisual)}
                    </div>
                  </td>
                  <td>
                    <span className="badge-dash badge-amber-dash">
                      {caso.tipoVisual}
                    </span>
                  </td>
                  <td>{caso.barrio}</td>
                  <td>
                    <span
                      className={`badge-dash ${badgeEstadoCaso(
                        caso.estadoVisual
                      )}`}
                    >
                      {caso.estadoVisual}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="link-btn-dash border-0 bg-transparent"
                      onClick={() => setDetalle(caso)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibles.length === 0 && (
          <p className="text-center text-muted py-4 mb-0">
            No se encontraron casos.
          </p>
        )}

        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">
            Mostrando {visibles.length} de {filtrados.length} reportes
          </span>

          <div className="d-flex gap-1">
            <button
              type="button"
              className="page-btn-dash"
              disabled={paginaActual === 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              <i className="bi bi-chevron-left" />
            </button>

            {Array.from(
              { length: totalPaginas },
              (_, i) => i + 1
            ).map((numero) => (
              <button
                key={numero}
                type="button"
                className={`page-btn-dash ${
                  paginaActual === numero ? "active-dash" : ""
                }`}
                onClick={() => setPagina(numero)}
              >
                {numero}
              </button>
            ))}

            <button
              type="button"
              className="page-btn-dash"
              disabled={paginaActual === totalPaginas}
              onClick={() =>
                setPagina((p) => Math.min(totalPaginas, p + 1))
              }
            >
              <i className="bi bi-chevron-right" />
            </button>
          </div>
        </div>
      </div>

      {detalle && (
        <div
          className="modal fade show"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tituloDetalleCaso"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-dash">
              <div className="modal-header">
                <h5 id="tituloDetalleCaso" className="modal-title">
                  Detalle del caso #{detalle.identificador ?? "—"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setDetalle(null)}
                />
              </div>
              <div className="modal-body">
                <p><b>Tipo:</b> {detalle.tipoVisual}</p>
                <p><b>Reportante:</b> {detalle.reportante}</p>
                <p><b>Barrio:</b> {detalle.barrio}</p>
                <p><b>Estado:</b> {detalle.estadoVisual}</p>
                <p>
                  <b>Fecha:</b> {fechaTransito(detalle.fechaVisual)}
                </p>
                <p>
                  <b>Descripción:</b>{" "}
                  {detalle.descripcion ?? "No disponible"}
                </p>
                <p>
                  <b>Agente asignado:</b>{" "}
                  {nombreAgente(
                    agentes.find(
                      (a) =>
                        String(
                          a.idAgenteTransito ??
                          a.idUsuario
                        ) ===
                        String(detalle.atencion?.idAgenteTransito)
                    ) ?? {}
                  )}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setDetalle(null)}
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
