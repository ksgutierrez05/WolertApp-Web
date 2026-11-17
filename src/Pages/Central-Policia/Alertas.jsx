
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";

import {
  cargarOperaciones,
  resumenOperativo,
  idAlerta,
  tipoAlerta,
  prioridadAlerta,
  ubicacionAlerta,
  fechaAlerta,
  fechaLegible,
  estadoAlerta,
  esCritica,
  esPendiente,
  esResuelta,
} from "../../Services/OperacionesCentralService.js";


import "../../css/Policia/central-policia/css/alertas.css";

function Alertas() {
  const [datos, setDatos] = useState({
    alertas: [],
    asignaciones: [],
    atenciones: [],
    unidades: [],
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [avisos, setAvisos] = useState([]);

  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    cargarOperaciones(controller.signal)
      .then(({ datos: resultado, errores }) => {
        if (!controller.signal.aborted) {
          setDatos(resultado);
          setAvisos(errores);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setError(e.message);
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
    () => resumenOperativo(datos).alertas,
    [datos]
  );

  const filtradas = useMemo(
    () =>
      datos.alertas
        .filter((a) => {
          const coincide =
            filtro === "todas" ||
            (filtro === "criticas" && esCritica(a)) ||
            (filtro === "pendientes" && esPendiente(a)) ||
            (filtro === "resueltas" && esResuelta(a));

          const coincideBusqueda = [
            idAlerta(a),
            tipoAlerta(a),
            ubicacionAlerta(a),
            estadoAlerta(a),
          ]
            .join(" ")
            .toLowerCase()
            .includes(busqueda.toLowerCase());

          return coincide && coincideBusqueda;
        })
        .sort(
          (a, b) =>
            new Date(fechaAlerta(b) || 0) -
            new Date(fechaAlerta(a) || 0)
        ),
    [datos.alertas, filtro, busqueda]
  );

  function actualizar() {
    setCargando(true);
    setError("");
    setRecarga((n) => n + 1);
  }

  return (
    <>
      <Topbar
        placeholder="Buscar por caso, tipo, dirección o barrio..."
        iniciales="CR"
      />

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h1 className="page-title-dash">
            Alertas entrantes
          </h1>

          <p className="info-sub-dash mb-0">
            Consulta y filtra las alertas recibidas
            desde los ciudadanos.
          </p>
        </div>

        <button
          className="btn btn-outline-success btn-sm"
          disabled={cargando}
          onClick={actualizar}
        >
          <i className="bi bi-arrow-clockwise me-1" />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {avisos.length > 0 && (
        <div className="alert alert-warning">
          Consultas parciales: {avisos.join(" | ")}
        </div>
      )}

      <Kpis
        grupo="alertas"
        valores={cargando ? {} : valores}
      />

      <section className="card-panel-dash p-4 mb-4">
        <div className="encabezado-panel-dash">
          <h2 className="section-title-dash">
            <i className="bi bi-funnel me-2" />
            Filtros de alertas
          </h2>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-3">
          {[
            ["todas", "Todas"],
            ["criticas", "Críticas"],
            ["pendientes", "Pendientes"],
            ["resueltas", "Resueltas"],
          ].map(([clave, etiqueta]) => (
            <button
              key={clave}
              type="button"
              onClick={() => setFiltro(clave)}
              className={`btn btn-sm ${
                filtro === clave
                  ? "btn-success"
                  : "btn-outline-secondary"
              }`}
              aria-pressed={filtro === clave}
            >
              {etiqueta}
            </button>
          ))}
        </div>

        <input
          className="form-control"
          placeholder="Buscar por caso, tipo, barrio o estado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar alertas"
        />
      </section>

      <section className="card-panel-dash p-4 mb-4">
        <div className="encabezado-panel-dash">
          <h2 className="section-title-dash">
            <i className="bi bi-inboxes me-2" />
            Listado de alertas
          </h2>

          <span className="see-all-dash">
            {filtradas.length} registros
          </span>
        </div>

        <div className="table-responsive">
          <table className="table tabla-dash align-middle">
            <thead>
              <tr>
                <th>Caso</th>
                <th>Tipo</th>
                <th>Prioridad</th>
                <th>Ubicación</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td
                    colSpan="7"
                    className="estado-vacio-dash"
                  >
                    Cargando alertas...
                  </td>
                </tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="estado-vacio-dash"
                  >
                    No se encontraron alertas.
                  </td>
                </tr>
              ) : (
                filtradas.map((a) => (
                  <tr key={idAlerta(a)}>
                    <td>#{idAlerta(a)}</td>
                    <td>{tipoAlerta(a)}</td>
                    <td>
                      {prioridadAlerta(a) || "—"}
                    </td>
                    <td>{ubicacionAlerta(a)}</td>
                    <td>
                      {fechaLegible(fechaAlerta(a))}
                    </td>
                    <td>
                      {estadoAlerta(a) || "—"}
                    </td>

                    <td>
                      <Link
                        to="/Central-Policia/Asignaciones"
                        className="btn btn-sm btn-outline-success"
                      >
                        Asignaciones
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default Alertas;
