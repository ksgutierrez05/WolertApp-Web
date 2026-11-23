
import { useEffect, useMemo, useState } from "react";

import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";

import {
  cargarUnidadesCentral,
  obtenerCampo,
  idDeUnidad,
  idDeAlerta,
  estadoDe,
  estadoFinalizado,
  nombreUnidad,
  nombrePolicia,
  tipoDeAlerta,
  resumenUnidades,
} from "../../Services/atencionUnidadesCentralService";

import "../../css/Policia/central-policia/css/unidades.css";

function Unidades() {
  const [datos, setDatos] = useState({
    unidades: [],
    policias: [],
    asignaciones: [],
    alertas: [],
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  const [busqueda, setBusqueda] = useState("");
  const [filtroUnidad, setFiltroUnidad] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    cargarUnidadesCentral(controller.signal)
      .then((resultado) => {
        if (!controller.signal.aborted) {
          setDatos(resultado);
          setError("");
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, [recarga]);

  const valores = useMemo(
    () => resumenUnidades(datos.unidades),
    [datos.unidades]
  );

  const registros = useMemo(() => {
    return datos.policias.map((policia, indice) => {
      const idUnidadPolicia = obtenerCampo(
        policia,
        "idUnidad",
        "IdUnidad"
      );

      const unidad = datos.unidades.find(
        (u) =>
          String(idDeUnidad(u)) ===
          String(idUnidadPolicia)
      );

      const asignacion = datos.asignaciones.find(
        (a) =>
          String(
            obtenerCampo(
              a,
              "idUnidad",
              "IdUnidad"
            )
          ) === String(idUnidadPolicia) &&
          !estadoFinalizado(estadoDe(a))
      );

      const alerta = datos.alertas.find(
        (a) =>
          String(idDeAlerta(a)) ===
          String(
            obtenerCampo(
              asignacion,
              "idAlerta",
              "IdAlerta"
            )
          )
      );

      return {
        clave: `${obtenerCampo(
          policia,
          "idPolicia",
          "IdPolicia",
          "idUsuario",
          "IdUsuario"
        ) ?? indice}`,
        policia,
        unidad,
        asignacion,
        alerta,
        idUnidadPolicia,
      };
    });
  }, [datos]);

  const estados = useMemo(
    () =>
      [...new Set(
        datos.unidades
          .map(estadoDe)
          .filter(Boolean)
      )].sort(),
    [datos.unidades]
  );

  const filtrados = useMemo(() => {
    return registros.filter((registro) => {
      const estado = estadoDe(registro.unidad);

      const coincideUnidad =
        filtroUnidad === "todas" ||
        String(registro.idUnidadPolicia) === filtroUnidad;

      const coincideEstado =
        filtroEstado === "todos" ||
        estado === filtroEstado;

      const textoBusqueda = [
        nombrePolicia(registro.policia),
        nombreUnidad(registro.unidad),
        obtenerCampo(
          registro.policia,
          "cedula",
          "Cedula",
          "identificacion",
          "Identificacion"
        ),
        estado,
      ]
        .join(" ")
        .toLowerCase();

      return (
        coincideUnidad &&
        coincideEstado &&
        textoBusqueda.includes(busqueda.toLowerCase())
      );
    });
  }, [registros, filtroUnidad, filtroEstado, busqueda]);

  function actualizar() {
    setCargando(true);
    setError("");
    setDetalle(null);
    setRecarga((actual) => actual + 1);
  }

  const identificacion = (p) =>
    obtenerCampo(
      p,
      "cedula",
      "Cedula",
      "identificacion",
      "Identificacion",
      "numeroDocumento",
      "NumeroDocumento"
    ) || "—";

  const atencionActual = (registro) => {
    if (!registro.asignacion) {
      return "Sin asignación activa";
    }

    const id = obtenerCampo(
      registro.asignacion,
      "idAlerta",
      "IdAlerta"
    );

    return `Alerta #${id ?? "—"} · ${
      registro.alerta
        ? tipoDeAlerta(registro.alerta)
        : "En seguimiento"
    }`;
  };

  return (
    <div className="unidad-page">
      <Topbar placeholder="Buscar patrullero, unidad o caso..." />

      <main className="main-dash">
        <div className="container-fluid">
          <header className="unidad-header mb-4">
            <div className="unidad-titulo">

              <div>
                <h1 className="page-title-dash">
                  Unidades
                </h1>

                <p className="unidad-descripcion mb-0">
                  Consulta la disponibilidad y el estado
                  operativo de los patrulleros.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={actualizar}
              disabled={cargando}
            >
              <i className="bi bi-arrow-clockwise me-2" />
              Actualizar
            </button>
          </header>

          {error && (
            <div className="alert alert-danger" role="alert">
              <strong>
                No se pudieron consultar las unidades.
              </strong>

              <p className="mb-0 mt-1">{error}</p>
            </div>
          )}

          <div className="unidad-kpis">
            <Kpis
              grupo="unidades"
              valores={cargando || error ? {} : valores}
            />
          </div>

          <div className="unidad-aviso">
            <i className="bi bi-info-circle-fill" />

            <span>
              Esta información es solo de consulta.
              La administración de patrulleros
              corresponde al Comandante de Estación.
            </span>
          </div>

          <section className="unidad-filtros card-panel-dash">
            <div className="unidad-search">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search" />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar nombre o identificación..."
                  aria-label="Buscar patrulleros"
                  value={busqueda}
                  onChange={(e) =>
                    setBusqueda(e.target.value)
                  }
                />
              </div>
            </div>

            <select
              className="form-select unidad-select"
              value={filtroUnidad}
              onChange={(e) =>
                setFiltroUnidad(e.target.value)
              }
              aria-label="Filtrar por unidad"
            >
              <option value="todas">
                Todas las unidades
              </option>

              {datos.unidades.map((u) => (
                <option
                  key={idDeUnidad(u)}
                  value={String(idDeUnidad(u))}
                >
                  {nombreUnidad(u)}
                </option>
              ))}
            </select>

            <select
              className="form-select unidad-select"
              value={filtroEstado}
              onChange={(e) =>
                setFiltroEstado(e.target.value)
              }
              aria-label="Filtrar por estado"
            >
              <option value="todos">
                Todos los estados
              </option>

              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </section>

          <section className="card-panel-dash unidad-panel-tabla">
            <div className="unidad-tabla-encabezado">
              <div>
                <h2>Estado de las unidades</h2>
                <p>
                  Información de los patrulleros registrados.
                </p>
              </div>

              <span className="unidad-tabla-icono">
                <i className="bi bi-shield-check" />
              </span>
            </div>

            <div className="unidad-tabla-wrap table-responsive">
              <table className="table unidad-tabla align-middle">
                <thead>
                  <tr>
                    <th>Patrullero</th>
                    <th>Unidad / CAI</th>
                    <th>Estado</th>
                    <th>Atención actual</th>
                    <th className="text-end">
                      Detalle
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {cargando ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center p-4"
                      >
                        Cargando patrulleros...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center p-4"
                      >
                        No se pudo cargar la información.
                      </td>
                    </tr>
                  ) : filtrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center p-4 text-muted"
                      >
                        No se encontraron patrulleros
                        con esos filtros.
                      </td>
                    </tr>
                  ) : (
                    filtrados.map((registro) => (
                      <tr key={registro.clave}>
                        <td>
                          <div className="unidad-patrullero">
                            <div className="unidad-avatar">
                              <i className="bi bi-person-fill" />
                            </div>

                            <div>
                              <strong>
                                {nombrePolicia(
                                  registro.policia
                                )}
                              </strong>

                              <small>
                                {identificacion(
                                  registro.policia
                                )}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="unidad-nombre-cai">
                            <i className="bi bi-geo-alt" />
                            {" "}
                            {registro.unidad
                              ? nombreUnidad(
                                  registro.unidad
                                )
                              : "Sin unidad"}
                          </span>
                        </td>

                        <td>
                          <span className="badge text-bg-light">
                            {estadoDe(registro.unidad) ||
                              "No disponible"}
                          </span>
                        </td>

                        <td>
                          <span className="unidad-sin-atencion">
                            {atencionActual(registro)}
                          </span>
                        </td>

                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-light btn-sm unidad-btn-detalle"
                            aria-label="Ver detalle del patrullero"
                            onClick={() =>
                              setDetalle(registro)
                            }
                          >
                            <i className="bi bi-eye" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {detalle && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalDetallePatrulleroTitulo"
          style={{
            background: "rgba(0, 0, 0, 0.55)",
          }}
          onClick={() => setDetalle(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content unidad-modal">
              <div className="modal-header">
                <div>
                  <span className="unidad-modal-subtitulo">
                    INFORMACIÓN OPERATIVA
                  </span>

                  <h5
                    className="modal-title"
                    id="modalDetallePatrulleroTitulo"
                  >
                    Detalle del patrullero
                  </h5>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDetalle(null)}
                  aria-label="Cerrar"
                />
              </div>

              <div className="modal-body">
                <div className="unidad-modal-identidad">
                  <div className="unidad-avatar unidad-avatar-grande">
                    <i className="bi bi-person-fill" />
                  </div>

                  <div>
                    <h6>
                      {nombrePolicia(detalle.policia)}
                    </h6>
                    <span>Personal policial</span>
                  </div>
                </div>

                <div className="unidad-detalle-lista">
                  <div className="unidad-detalle-fila">
                    <span>Identificación</span>
                    <strong>
                      {identificacion(detalle.policia)}
                    </strong>
                  </div>

                  <div className="unidad-detalle-fila">
                    <span>Unidad / CAI</span>
                    <strong>
                      {detalle.unidad
                        ? nombreUnidad(detalle.unidad)
                        : "Sin unidad"}
                    </strong>
                  </div>

                  <div className="unidad-detalle-fila">
                    <span>Estado operativo</span>
                    <strong className="unidad-detalle-disponible">
                      {estadoDe(detalle.unidad) ||
                        "No disponible"}
                    </strong>
                  </div>

                  <div className="unidad-detalle-fila">
                    <span>Atención actual</span>
                    <strong>
                      {atencionActual(detalle)}
                    </strong>
                  </div>

                  <div className="unidad-detalle-fila">
                    <span>ID de unidad</span>
                    <strong>
                      {detalle.idUnidadPolicia ?? "—"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light unidad-btn-cerrar"
                  onClick={() => setDetalle(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Unidades;
