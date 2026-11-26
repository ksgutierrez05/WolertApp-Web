
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
  const [pagina, setPagina] = useState(1);
  const porPagina = 8;

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
  }, []);

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
        ),
    [datos.alertas]
  );
  const totalPaginas = Math.max(1, Math.ceil(recientes.length / porPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const alertasPagina = recientes.slice(
    (paginaActual - 1) * porPagina,
    paginaActual * porPagina
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

  const totalUnidades = datos.unidades.length;
  const disponibles = resumen.centro.unidadesDisponibles;
  const otrosEstados = Math.max(0, totalUnidades - disponibles - ocupadas);

  return (
    <>
      <Topbar
        placeholder="Buscar por caso, unidad, barrio..."
        iniciales="CR"
      />

      <img
        className="co-hero-banner mb-4"
        src="/img/banner-central-policia.png"
        alt="Bienvenido, Operador Policial. Monitoreo de alertas, unidades y atenciones con datos del sistema."
        width="2150"
        height="480"
      />

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
              <li key={i}>{aviso.mensaje}</li>
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
                alertasPagina.map((a, i) => {
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

                      <td className="ver-detalles-cell">
                        <Link
                          to="/Central-Policia/Alertas"
                          className="co-action co-view btn-ver-detalles"
                          title="Ver detalles"
                          aria-label={`Ver detalles de la alerta ${idAlerta(a)}`}
                        >
                          <i className="bi bi-eye-fill" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!cargando && !error && recientes.length > 0 && (
          <nav className="co-pagination" aria-label="Paginación de alertas">
            <span>Mostrando {(paginaActual - 1) * porPagina + 1}–{Math.min(paginaActual * porPagina, recientes.length)} de {recientes.length} alertas</span>
            <div>
              <button type="button" onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={paginaActual === 1}>Anterior</button>
              <span>Página {paginaActual} de {totalPaginas}</span>
              <button type="button" onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}>Siguiente</button>
            </div>
          </nav>
        )}
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

            <div className="mapa-fila-dash co-unit-row co-unit-available">
              <span className="dot dot-disponible-dash" />
              <i className="bi bi-check-circle" aria-hidden="true" />
              <span className="lbl-dash">
                Disponibles
              </span>
              <span className="num-dash">
                {cargando || error ? "—" : disponibles}
              </span>
            </div>

            <div className="mapa-fila-dash co-unit-row co-unit-busy">
              <span className="dot dot-ocupada-dash" />
              <i className="bi bi-truck" aria-hidden="true" />
              <span className="lbl-dash">
                Ocupadas / en servicio
              </span>
              <span className="num-dash">
                {cargando || error ? "—" : ocupadas}
              </span>
            </div>

            <div className="mapa-fila-dash co-unit-row co-unit-other">
              <span className="dot" />
              <i className="bi bi-three-dots" aria-hidden="true" />
              <span className="lbl-dash">Otros estados</span>
              <span className="num-dash">
                {cargando || error ? "—" : otrosEstados}
              </span>
            </div>

            <div className="mapa-fila-dash co-unit-row co-unit-total">
              <i className="bi bi-car-front" aria-hidden="true" />
              <span className="lbl-dash">
                Total registradas
              </span>
              <span className="num-dash">
                {cargando || error ? "—" : totalUnidades}
              </span>
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
