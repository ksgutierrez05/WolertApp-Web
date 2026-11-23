
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
  esUnidadOcupada,
} from "../../Services/OperacionesCentralService.js";

import "../../css/Policia/central-policia/css/centro-operaciones.css";

const datosVacios = () => ({
  alertas: [],
  asignaciones: [],
  atenciones: [],
  unidades: [],
});

function CentroOperaciones() {
  const [datos, setDatos] = useState(datosVacios);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [avisos, setAvisos] = useState([]);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    cargarOperaciones(controller.signal)
      .then(({ datos: resultado, errores }) => {
        if (controller.signal.aborted) return;

        setDatos(resultado);
        setAvisos(errores);
        setError("");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;

        setDatos(datosVacios());
        setAvisos([]);
        setError(
          err.message || "No se pudieron consultar los datos."
        );
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

  const atencionesActivas = useMemo(() => {
    return datos.atenciones.filter((atencion) => {
      const alertaRelacionada = datos.alertas.find(
        (alerta) =>
          String(idAlerta(alerta)) ===
          String(campo(atencion, "idAlerta", "IdAlerta"))
      );

      if (!alertaRelacionada) return false;

      return estadoAlerta(alertaRelacionada) === "EN_ATENCION";
    });
  }, [datos.atenciones, datos.alertas]);

  const ocupadas = useMemo(
    () => datos.unidades.filter(esUnidadOcupada).length,
    [datos.unidades]
  );

  function actualizar() {
    setCargando(true);
    setError("");
    setAvisos([]);
    setRecarga((n) => n + 1);
  }

  const totalUnidades = datos.unidades.length;
  const disponibles = resumen.centro.unidadesDisponibles;

  const porcentajeDisponibles =
    !cargando && !error && totalUnidades
      ? (disponibles / totalUnidades) * 100
      : 0;

  const porcentajeOcupadas =
    !cargando && !error && totalUnidades
      ? (ocupadas / totalUnidades) * 100
      : 0;

  return (
    <>
      <Topbar
        placeholder="Buscar por caso, unidad, barrio..."
        iniciales="CR"
      />

      {/* HERO */}
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

      {/* ACTUALIZAR */}
      <div className="d-flex justify-content-end mb-3">
        <button
          type="button"
          className="co-action co-refresh"
          onClick={actualizar}
          disabled={cargando}
        >
          <i
            className={`bi bi-arrow-clockwise ${
              cargando ? "co-spin" : ""
            }`}
            aria-hidden="true"
          />
          {cargando ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {/* ERRORES */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error al consultar la central: </strong>
          {error}
        </div>
      )}

      {avisos.length > 0 && (
        <div className="alert alert-warning" role="alert">
          <strong>Información parcial.</strong>
          <p className="mb-1">
            Algunos indicadores podrían estar incompletos:
          </p>
          <ul className="mb-0">
            {avisos.map((aviso, i) => (
              <li key={i}>{aviso}</li>
            ))}
          </ul>
        </div>
      )}

      {/* INDICADORES */}
      <Kpis
        grupo="centro-principal"
        valores={cargando || error ? {} : resumen.centro}
      />

      {/* ALERTAS RECIENTES */}
      <section className="card-panel-dash p-4 mb-4">
        <div className="encabezado-panel-dash">
          <h2 className="section-title-dash">
            <i className="bi bi-exclamation-triangle me-2" />
            Alertas recientes
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
              {cargando || error ? (
                <tr>
                  <td colSpan={7} className="estado-vacio-dash">
                    {cargando
                      ? "Cargando alertas..."
                      : "No fue posible cargar las alertas."}
                  </td>
                </tr>
              ) : recientes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="estado-vacio-dash">
                    No hay alertas para mostrar.
                  </td>
                </tr>
              ) : (
                recientes.map((a, i) => {
                  const prioridad = prioridadAlerta(a) || "";
                  const estado = estadoAlerta(a) || "";

                  return (
                    <tr key={idAlerta(a) ?? i}>
                      <td>
                        <span className="co-case">
                          #{idAlerta(a)}
                        </span>
                      </td>

                      <td>{tipoAlerta(a)}</td>

                      <td>
                        <span
                          className={`co-priority co-priority-${String(
                            prioridad
                          ).toLowerCase()}`}
                        >
                          {prioridad || "—"}
                        </span>
                      </td>

                      <td>{ubicacionAlerta(a)}</td>

                      <td>
                        {fechaLegible(fechaAlerta(a))}
                      </td>

                      <td>
                        <span
                          className={`co-status co-status-${String(
                            estado
                          ).toLowerCase()}`}
                        >
                          {estado.replaceAll("_", " ") || "—"}
                        </span>
                      </td>

                      <td>
                        <Link
                          to="/Central-Policia/Alertas"
                          className="co-action co-view"
                        >
                          <i
                            className="bi bi-eye"
                            aria-hidden="true"
                          />
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* TARJETAS INFERIORES */}
      <div className="row g-4 co-summary-row">
        {/* ATENCIONES ACTIVAS */}
        <div className="col-12 col-xl-7">
          <section className="card-panel-dash co-summary-card p-4 h-100">
            <div className="encabezado-panel-dash">
              <h2 className="section-title-dash">
                <i className="bi bi-broadcast me-2" />
                Atenciones activas
              </h2>
            </div>

            {cargando ? (
              <p>Cargando...</p>
            ) : error ? (
              <p className="text-danger">
                No fue posible cargar las atenciones.
              </p>
            ) : atencionesActivas.length ? (
              <div className="table-responsive">
                <table className="table tabla-dash tabla-atenciones-dash">
                  <thead>
                    <tr>
                      <th>Atención</th>
                      <th>Alerta</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {atencionesActivas.slice(0, 5).map((a, i) => (
                      <tr
                        key={
                          campo(a, "idAtencion", "IdAtencion") ??
                          i
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
                          <span className="co-status co-status-active">
                            <span className="co-status-dot" />
                            EN ATENCIÓN
                          </span>
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

        {/* ESTADO DE UNIDADES */}
        <div className="col-12 col-xl-5">
          <section className="card-panel-dash co-summary-card p-4 h-100">
            <div className="encabezado-panel-dash">
              <h2 className="section-title-dash">
                <i className="bi bi-car-front me-2" />
                Estado de unidades
              </h2>
            </div>

            <div className="mapa-fila-dash co-unit-row">
              <span className="dot dot-disponible-dash" />
              <span className="lbl-dash">
                Disponibles
              </span>
              <span className="num-dash">
                {cargando || error ? "—" : disponibles}
              </span>
            </div>

            <div className="mapa-fila-dash co-unit-row">
              <span className="dot dot-ocupada-dash" />
              <span className="lbl-dash">
                Ocupadas / en servicio
              </span>
              <span className="num-dash">
                {cargando || error ? "—" : ocupadas}
              </span>
            </div>

            <div className="mapa-fila-dash co-unit-row">
              <span className="lbl-dash">
                Total registradas
              </span>
              <span className="num-dash">
                {cargando || error ? "—" : totalUnidades}
              </span>
            </div>

            {/* BARRA DE DISTRIBUCIÓN */}
            <div
              className="co-unit-progress"
              role="img"
              aria-label={
                cargando || error
                  ? "Sin datos de unidades"
                  : `${disponibles} disponibles y ${ocupadas} ocupadas`
              }
            >
              <span
                className="co-unit-progress-available"
                style={{
                  width: `${porcentajeDisponibles}%`,
                }}
              />
              <span
                className="co-unit-progress-busy"
                style={{
                  width: `${porcentajeOcupadas}%`,
                }}
              />
            </div>

            <p className="co-unit-note">
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
