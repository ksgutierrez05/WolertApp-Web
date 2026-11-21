
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";

import {
  cargarOperaciones,
  resumenOperativo,
  fechaAlerta,
  fechaLegible,
  idAlerta,
  tipoAlerta,
  prioridadAlerta,
  ubicacionAlerta,
  estadoAlerta,
  campo,
  texto,
} from "../../Services/OperacionesCentralService.js";

import "../../css/Policia/central-policia/css/centro-operaciones.css";

function CentroOperaciones() {
  const [datos, setDatos] = useState({
    alertas: [],
    asignaciones: [],
    atenciones: [],
    unidades: [],
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [avisos, setAvisos] = useState([]);
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

  const resumen = useMemo(
    () => resumenOperativo(datos),
    [datos]
  );

  const recientes = useMemo(
    () =>
      [...datos.alertas]
        .sort(
          (a, b) =>
            new Date(fechaAlerta(b) || 0) -
            new Date(fechaAlerta(a) || 0)
        )
        .slice(0, 6),
    [datos.alertas]
  );

  const atencionesActivas = datos.atenciones.filter(
    (a) =>
      ![
        "FINALIZADA",
        "FINALIZADO",
        "CERRADA",
        "CERRADO",
      ].includes(texto(campo(a, "estado", "Estado")))
  );

  const ocupadas = datos.unidades.filter(
    (u) =>
      [
        "OCUPADA",
        "OCUPADO",
        "EN SERVICIO",
        "EN ATENCION",
        "EN ATENCIÓN",
      ].includes(texto(campo(u, "estado", "Estado")))
  ).length;

  function actualizar() {
    setCargando(true);
    setError("");
    setRecarga((n) => n + 1);
  }

  return (
    <>
      <Topbar
        placeholder="Buscar por caso, unidad, barrio..."
        iniciales="CR"
      />

      <section className="hero-dash mb-4">
        <div className="hero-content-dash">
          <div className="eyebrow-dash">
            CENTRAL DE RADIO · CENTRO DE OPERACIONES
          </div>

          <h1 className="hero-title-dash">
            Turno en línea,
            <br />
            alertas en curso
          </h1>

          <p className="hero-text-dash">
            Monitoreo de alertas, unidades y atenciones
            con datos del sistema.
          </p>

          <Link
            to="/Central-Policia/Alertas"
            className="hero-cta-dash"
          >
            <span className="hero-cta-icon-dash">
              <i className="bi bi-exclamation-lg" />
            </span>

            Ver alertas

            <i className="bi bi-arrow-right hero-cta-arrow-dash" />
          </Link>
        </div>
      </section>

      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-outline-success btn-sm"
          onClick={actualizar}
          disabled={cargando}
        >
          <i className="bi bi-arrow-clockwise me-1" />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {avisos.length > 0 && (
        <div className="alert alert-warning" role="alert">
          Algunas consultas fallaron: {avisos.join(" | ")}
        </div>
      )}

      <Kpis
        grupo="centro-principal"
        valores={cargando ? {} : resumen.centro}
      />

      <section className="card-panel-dash p-4 mb-4">
        <div className="encabezado-panel-dash">
          <h2 className="section-title-dash">
            <i className="bi bi-exclamation-triangle" />
            {" "}Alertas recientes
          </h2>

          <Link
            to="/Central-Policia/Alertas"
            className="see-all-dash"
          >
            Ver todas
            <i className="bi bi-chevron-right" />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table tabla-dash tabla-alertas-dash align-middle">
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
                  <td colSpan="7" className="estado-vacio-dash">
                    Cargando alertas...
                  </td>
                </tr>
              ) : recientes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="estado-vacio-dash">
                    No hay alertas para mostrar.
                  </td>
                </tr>
              ) : (
                recientes.map((a) => (
                  <tr key={idAlerta(a)}>
                    <td>#{idAlerta(a)}</td>
                    <td>{tipoAlerta(a)}</td>
                    <td>{prioridadAlerta(a) || "—"}</td>
                    <td>{ubicacionAlerta(a)}</td>
                    <td>{fechaLegible(fechaAlerta(a))}</td>
                    <td>{estadoAlerta(a) || "—"}</td>

                    <td>
                      <Link
                        to="/Central-Policia/Alertas"
                        className="btn btn-sm btn-outline-success"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <section className="card-panel-dash p-4 h-100">
            <div className="encabezado-panel-dash">
              <h2 className="section-title-dash">
                <i className="bi bi-broadcast" />
                {" "}Atenciones activas
              </h2>
            </div>

            {cargando ? (
              <p>Cargando...</p>
            ) : atencionesActivas.length ? (
              <div className="table-responsive">
                <table className="table tabla-dash">
                  <thead>
                    <tr>
                      <th>Atención</th>
                      <th>Alerta</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {atencionesActivas
                      .slice(0, 5)
                      .map((a, i) => (
                        <tr
                          key={
                            campo(
                              a,
                              "idAtencion",
                              "IdAtencion"
                            ) ?? i
                          }
                        >
                          <td>
                            #
                            {campo(
                              a,
                              "idAtencion",
                              "IdAtencion"
                            ) ?? "—"}
                          </td>

                          <td>
                            #
                            {campo(
                              a,
                              "idAlerta",
                              "IdAlerta"
                            ) ?? "—"}
                          </td>

                          <td>
                            {campo(
                              a,
                              "estado",
                              "Estado"
                            ) || "Sin estado"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="estado-vacio-dash">
                No hay atenciones activas registradas.
              </div>
            )}
          </section>
        </div>

        <div className="col-12 col-xl-5">
          <section className="card-panel-dash p-4 h-100">
            <div className="encabezado-panel-dash">
              <h2 className="section-title-dash">
                <i className="bi bi-car-front" />
                {" "}Estado de unidades
              </h2>
            </div>

            <div className="mapa-fila-dash">
              <span className="dot dot-disponible-dash" />
              <span className="lbl-dash">Disponibles</span>

              <span className="num-dash">
                {cargando
                  ? "—"
                  : resumen.centro.unidadesDisponibles}
              </span>
            </div>

            <div className="mapa-fila-dash">
              <span className="dot dot-ocupada-dash" />
              <span className="lbl-dash">
                Ocupadas / en servicio
              </span>

              <span className="num-dash">
                {cargando ? "—" : ocupadas}
              </span>
            </div>

            <div className="mapa-fila-dash">
              <span className="lbl-dash">
                Total registradas
              </span>

              <span className="num-dash">
                {cargando
                  ? "—"
                  : datos.unidades.length}
              </span>
            </div>

            <p className="small text-muted mt-3 mb-0">
              Los valores reflejan el estado registrado
              en la API, no ubicación GPS en tiempo real.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

export default CentroOperaciones;
