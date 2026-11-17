
import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/transito/Layout";
import {
  listarBarriosDirector,
  listarUnidadesDirector,
  listarAgentesDirector,
  listarAlertasDirector,
  nombreBarrio,
  nombreUnidadAgente,
  tipoCaso,
  normalizar,
  fechaEsEsteMes,
} from "../../Services/directorTransitoService";

export default function Catalogo() {
  const [tab, setTab] = useState("zonas");
  const [barrios, setBarrios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const [
        rBarrios,
        rUnidades,
        rAgentes,
        rAlertas,
      ] = await Promise.allSettled([
        listarBarriosDirector(),
        listarUnidadesDirector(),
        listarAgentesDirector(),
        listarAlertasDirector(),
      ]);

      if (!activo) return;

      const errores = [];

      if (rBarrios.status === "fulfilled") {
        setBarrios(rBarrios.value);
      } else {
        errores.push("No se pudieron cargar los barrios.");
      }

      if (rUnidades.status === "fulfilled") {
        setUnidades(rUnidades.value);
      } else {
        errores.push("No se pudieron cargar las unidades.");
      }

      if (rAgentes.status === "fulfilled") {
        setAgentes(rAgentes.value);
      } else {
        errores.push("No se pudieron cargar los agentes.");
      }

      if (rAlertas.status === "fulfilled") {
        setAlertas(rAlertas.value);
      } else {
        errores.push(
          "No se pudieron consultar los tipos usados en alertas."
        );
      }

      setError(errores.join(" "));
      setCargando(false);
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  const zonas = useMemo(() => {
    return barrios.map((barrio) => {
      const nombre = nombreBarrio(barrio);

      const casos = alertas.filter((alerta) => {
        const mismoId =
          alerta.idBarrio != null &&
          String(alerta.idBarrio) ===
            String(barrio.idBarrio);

        const mismoNombre =
          normalizar(
            alerta.nombreBarrio ??
            alerta.barrioNombre
          ) === normalizar(nombre);

        return (
          (mismoId || mismoNombre) &&
          fechaEsEsteMes(
            alerta.fechaReporte ??
            alerta.fechaCreacion ??
            alerta.fechaAlerta
          )
        );
      }).length;

      const asignados = agentes.filter(
        (agente) =>
          normalizar(
            nombreUnidadAgente(agente, unidades)
          ) === normalizar(nombre)
      ).length;

      return {
        id: barrio.idBarrio,
        nombre,
        casos,
        asignados,
      };
    });
  }, [barrios, agentes, unidades, alertas]);

  const tipos = useMemo(() => {
    const agrupados = new Map();

    for (const alerta of alertas) {
      const nombre = tipoCaso(alerta);
      const clave = normalizar(nombre);

      if (!clave || clave === "SIN TIPO") continue;

      if (!agrupados.has(clave)) {
        agrupados.set(clave, {
          nombre,
          cantidad: 0,
        });
      }

      if (
        fechaEsEsteMes(
          alerta.fechaReporte ??
          alerta.fechaCreacion ??
          alerta.fechaAlerta
        )
      ) {
        agrupados.get(clave).cantidad += 1;
      }
    }

    return [...agrupados.values()];
  }, [alertas]);

  const zonasFiltradas = zonas.filter(
    (zona) =>
      normalizar(zona.nombre).includes(
        normalizar(busqueda)
      )
  );

  const tiposFiltrados = tipos.filter(
    (tipo) =>
      normalizar(tipo.nombre).includes(
        normalizar(busqueda)
      )
  );

  return (
    <Layout
      titulo="Catálogos de Tránsito"
      activo="catalogo"
      busqueda={{
        placeholder: "Buscar por zona o tipo de caso...",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="section-title-dash">
            Catálogos de Tránsito
          </h1>

          <p className="section-text-dash mb-0">
            Consulta las zonas y los tipos de caso
            del módulo de Tránsito.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary rounded-pill fw-bold btn-nuevo-dash"
          onClick={() => setMostrarModal(true)}
        >
          <i className="bi bi-plus-lg me-2" />
          Nuevo
        </button>
      </div>

      {cargando && (
        <div className="alert alert-info" role="status">
          Cargando catálogos...
        </div>
      )}

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      <div className="table-card-dash">
        <div className="d-flex gap-2 tabs-dash mb-4 flex-wrap">
          <button
            type="button"
            className={`tab-dash ${
              tab === "zonas" ? "active-dash" : ""
            }`}
            onClick={() => {
              setTab("zonas");
              setBusqueda("");
            }}
          >
            Zonas y sectores ({zonas.length})
          </button>

          <button
            type="button"
            className={`tab-dash ${
              tab === "tipos" ? "active-dash" : ""
            }`}
            onClick={() => {
              setTab("tipos");
              setBusqueda("");
            }}
          >
            Tipos de caso ({tipos.length})
          </button>
        </div>

        <div className="input-group search-panel-dash mb-4">
          <span className="input-group-text bg-white border-0">
            <i className="bi bi-search" />
          </span>

          <input
            type="search"
            className="form-control border-0"
            placeholder={
              tab === "zonas"
                ? "Buscar zona o sector..."
                : "Buscar tipo de caso..."
            }
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div
          className={`tab-panel-dash ${
            tab === "zonas" ? "" : "d-none"
          }`}
        >
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Zona / sector</th>
                  <th>Casos este mes</th>
                  <th>Agentes asignados</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {zonasFiltradas.map((zona, indice) => (
                  <tr key={zona.id ?? indice}>
                    <td>{zona.nombre}</td>
                    <td>{zona.casos}</td>
                    <td>{zona.asignados}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-light btn-sm me-1"
                        title="Edición pendiente de API"
                        disabled
                      >
                        <i className="bi bi-pencil" />
                      </button>

                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        title="Eliminación pendiente de API"
                        disabled
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {zonasFiltradas.length === 0 && (
            <p className="text-center text-muted py-4 mb-0">
              No se encontraron zonas o sectores.
            </p>
          )}
        </div>

        <div
          className={`tab-panel-dash ${
            tab === "tipos" ? "" : "d-none"
          }`}
        >
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Tipo de caso</th>
                  <th>Casos este mes</th>
                  <th>Prioridad</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {tiposFiltrados.map((tipo) => (
                  <tr key={normalizar(tipo.nombre)}>
                    <td>{tipo.nombre}</td>
                    <td>{tipo.cantidad}</td>
                    <td>
                      <span className="badge-dash badge-blue-dash">
                        No especificada
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-light btn-sm me-1"
                        title="Edición pendiente de API"
                        disabled
                      >
                        <i className="bi bi-pencil" />
                      </button>

                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        title="Eliminación pendiente de API"
                        disabled
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tiposFiltrados.length === 0 && (
            <p className="text-center text-muted py-4 mb-0">
              No hay tipos de caso disponibles.
            </p>
          )}
        </div>
      </div>

      {mostrarModal && (
        <div
          className="modal fade show"
          id="modalCatalogo"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tituloModalCatalogo"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5
                  id="tituloModalCatalogo"
                  className="modal-title fw-bold"
                >
                  {tab === "zonas"
                    ? "Nueva zona / sector"
                    : "Nuevo tipo de caso"}
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
                  El registro de{" "}
                  {tab === "zonas"
                    ? "zonas y sectores"
                    : "tipos de caso"}{" "}
                  requiere confirmar el endpoint y los
                  campos del DTO correspondiente.
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    {tab === "zonas"
                      ? "Nombre de la zona / sector"
                      : "Nombre del tipo de caso"}
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre"
                    disabled
                  />
                </div>

                {tab === "tipos" && (
                  <div className="mb-3">
                    <label className="form-label">
                      Prioridad
                    </label>
                    <select className="form-select" disabled>
                      <option>Selecciona una prioridad</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4"
                  onClick={() => setMostrarModal(false)}
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4 fw-bold"
                  disabled
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
