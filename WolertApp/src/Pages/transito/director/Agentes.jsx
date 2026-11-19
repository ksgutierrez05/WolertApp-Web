
import { useEffect, useMemo, useState } from "react";
import Layout from "../../../Components/transito/Layout";
import KpiCard from "../../../Components/transito/KpiCard";
import {
  listarAgentesDirector,
  listarUnidadesDirector,
  listarAtencionesDirector,
  nombreAgente,
  nombreUnidadAgente,
  idAgente,
  estadoActivoAgente,
  fechaEsEsteMes,
  normalizar,
  estadoFinalizado,
} from "../../../Services/directorTransitoService";

const POR_PAGINA = 5;

export default function Agentes() {
  const [agentes, setAgentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const resultados = await Promise.allSettled([
        listarAgentesDirector(),
        listarUnidadesDirector(),
        listarAtencionesDirector(),
      ]);

      if (!activo) return;

      const errores = [];

      const [rAgentes, rUnidades, rAtenciones] = resultados;

      if (rAgentes.status === "fulfilled") {
        setAgentes(rAgentes.value);
      } else {
        errores.push(rAgentes.reason?.message || "Error al cargar agentes");
      }

      if (rUnidades.status === "fulfilled") {
        setUnidades(rUnidades.value);
      } else {
        errores.push(rUnidades.reason?.message || "Error al cargar unidades");
      }

      if (rAtenciones.status === "fulfilled") {
        setAtenciones(rAtenciones.value);
      } else {
        errores.push(rAtenciones.reason?.message || "Error al cargar atenciones");
      }

      setError(errores.join(" | "));
      setCargando(false);
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  const activos = agentes.filter((a) =>
    estadoActivoAgente(a.estadoAgente ?? a.estado)
  ).length;

  const inactivos = agentes.filter(
    (a) => !estadoActivoAgente(a.estadoAgente ?? a.estado)
  ).length;

  const filtrados = useMemo(() => {
    return agentes.filter((agente) => {
      const activo = estadoActivoAgente(
        agente.estadoAgente ?? agente.estado
      );

      if (filtro === "activos" && !activo) return false;
      if (filtro === "inactivos" && activo) return false;

      const contenido = normalizar([
        nombreAgente(agente),
        agente.cedula,
        agente.numeroDocumento,
        agente.placa,
        nombreUnidadAgente(agente, unidades),
      ].join(" "));

      return contenido.includes(normalizar(busqueda));
    });
  }, [agentes, unidades, filtro, busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / POR_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);

  const visibles = filtrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  function casosDelMes(agente) {
    const id = idAgente(agente);
    return atenciones.filter(
      (atencion) =>
        String(atencion.idAgenteTransito) === String(id) &&
        fechaEsEsteMes(atencion.fechaAtencion) &&
        estadoFinalizado(atencion.estadoFinal)
    ).length;
  }

  function cambiarFiltro(valor) {
    setFiltro(valor);
    setPagina(1);
  }

  return (
    <Layout
      titulo="Agentes de Tránsito"
      activo="agentes"
      busqueda={{
        placeholder: "Buscar por agente, zona o placa...",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="section-title-dash">
            Agentes de Tránsito
          </h1>
          <p className="section-text-dash mb-0">
            Gestiona el personal de campo asignado al módulo de Tránsito.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary rounded-pill fw-bold btn-nuevo-dash"
          onClick={() => setMostrarModal(true)}
        >
          <i className="bi bi-person-plus me-2" />
          Nuevo agente
        </button>
      </div>

      {cargando && (
        <div className="alert alert-info" role="status">
          Cargando información de agentes...
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
          variante="plano"
          color="blue"
          valor={agentes.length}
          label="Agentes totales"
          icono="bi-people"
        />
        <KpiCard
          variante="plano"
          color="green"
          valor={activos}
          label="Activos ahora"
          icono="bi-person-check"
        />
        <KpiCard
          variante="plano"
          color="red"
          valor={inactivos}
          label="Inactivos"
          icono="bi-person-dash"
        />
        <KpiCard
          variante="plano"
          color="amber"
          valor="—"
          label="Tiempo prom. de atención"
          icono="bi-stopwatch"
        />
      </div>

      <div className="table-card-dash">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div className="d-flex gap-2 tabs-dash flex-wrap">
            {[
              ["todos", "Todos", agentes.length],
              ["activos", "Activos", activos],
              ["inactivos", "Inactivos", inactivos],
            ].map(([valor, nombre, cantidad]) => (
              <button
                key={valor}
                type="button"
                className={`tab-dash ${
                  filtro === valor ? "active-dash" : ""
                }`}
                onClick={() => cambiarFiltro(valor)}
              >
                {nombre} ({cantidad})
              </button>
            ))}
          </div>

          <div className="input-group search-panel-dash">
            <span className="input-group-text bg-white border-0">
              <i className="bi bi-search" />
            </span>
            <input
              type="search"
              className="form-control border-0"
              placeholder="Buscar agente, cédula o zona..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Agente</th>
                <th>Zona asignada</th>
                <th>Estado</th>
                <th>Casos atendidos (mes)</th>
                <th>Tiempo prom. atención</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {visibles.map((agente, indice) => {
                const activo = estadoActivoAgente(
                  agente.estadoAgente ?? agente.estado
                );

                return (
                  <tr key={idAgente(agente) ?? indice}>
                    <td>
                      <div className="info-title-dash">
                        {nombreAgente(agente)}
                      </div>
                      <div className="info-sub-dash">
                        CC {agente.cedula ??
                          agente.numeroDocumento ??
                          "No registrada"}
                      </div>
                    </td>
                    <td>{nombreUnidadAgente(agente, unidades)}</td>
                    <td>
                      <span
                        className={`badge-dash ${
                          activo
                            ? "badge-green-dash"
                            : "badge-red-dash"
                        }`}
                      >
                        {agente.estadoAgente ??
                          agente.estado ??
                          "Sin estado"}
                      </span>
                    </td>
                    <td>{casosDelMes(agente)}</td>
                    <td>—</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        title="Eliminar no disponible hasta confirmar la API"
                        disabled
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {visibles.length === 0 && (
          <p className="text-center text-muted py-4 mb-0">
            {cargando
              ? "Consultando agentes..."
              : "No se encontraron agentes."}
          </p>
        )}

        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">
            Mostrando {visibles.length} de {filtrados.length} agentes
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

      {mostrarModal && (
        <div
          className="modal fade show"
          id="modalAgente"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tituloModalAgente"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-dash">
              <div className="modal-header border-0 pb-0">
                <h5
                  id="tituloModalAgente"
                  className="panel-title-dash mb-0"
                >
                  Nuevo agente de tránsito
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setMostrarModal(false)}
                />
              </div>

              <div className="modal-body">
                <div className="alert alert-warning small">
                  Para registrar un agente es necesario confirmar
                  el endpoint de creación, los datos del usuario
                  y la asignación de su unidad.
                </div>

                <div className="mb-3">
                  <label className="config-field-label-dash">
                    Nombre completo
                  </label>
                  <input
                    className="form-control"
                    placeholder="Nombre del agente"
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="config-field-label-dash">
                    Cédula
                  </label>
                  <input
                    className="form-control"
                    placeholder="Número de documento"
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="config-field-label-dash">
                    Unidad asignada
                  </label>
                  <select className="form-select" disabled>
                    <option>Selecciona una unidad</option>
                    {unidades.map((unidad, indice) => (
                      <option
                        key={
                          unidad.idUnidadTransito ??
                          unidad.id ??
                          indice
                        }
                      >
                        {unidad.nombre ?? "Sin nombre"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn-secundario-dash"
                  onClick={() => setMostrarModal(false)}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="btn-guardar-dash"
                  disabled
                >
                  Guardar agente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
