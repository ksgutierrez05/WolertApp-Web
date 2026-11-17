
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Topbar from "../../Components/Administrador-policia/Topbar";
import Kpis from "../../Components/Administrador-policia/Kpicard";

import {
  obtenerCentroOperaciones,
} from "../../Services/CentroOperacionesAdminService";

import {
  calcularIndicadores,
  obtenerAlertasRecientes,
} from "../../Utils/centroOperacionesAdmin";

import "../../css/Policia/administrador-policia/css/centro-operaciones.css";

function CentroOperaciones() {
  const [datos, setDatos] = useState(null);
  const [errores, setErrores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recarga, setRecarga] = useState(0);

  const actualizar = useCallback(() => {
    setCargando(true);
    setRecarga(valor => valor + 1);
  }, []);

  useEffect(() => {
    const controlador = new AbortController();

    obtenerCentroOperaciones(controlador.signal)
      .then(resultado => {
        if (controlador.signal.aborted) return;

        setDatos(resultado.datos);
        setErrores(resultado.errores);
      })
      .catch(error => {
        if (!controlador.signal.aborted) {
          setErrores([error.message]);
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controlador.abort();
  }, [recarga]);

  const kpis = datos
    ? calcularIndicadores(datos)
    : {};

  const alertasRecientes = obtenerAlertasRecientes(
    datos?.alertas
  );

  const fecha = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).toUpperCase();

  return (
    <>
      <Topbar placeholder="Centro de Operaciones" />

      <div className="hero-dash mb-4">
        <p className="eyebrow-dash">
          <i className="bi bi-shield-check me-2" />
          CENTRO DE OPERACIONES · {fecha}
        </p>

        <h1 className="hero-title-dash">
          Centro de Operaciones
        </h1>

        <p className="hero-text-dash">
          Consulta las alertas, atenciones y recursos
          policiales registrados en el sistema.
        </p>

        <i className="bi bi-shield-fill-check hero-icon-dash" />
      </div>

      <div className="d-flex justify-content-end mb-3">
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={actualizar}
          disabled={cargando}
        >
          <i className="bi bi-arrow-clockwise me-2" />
          {cargando ? "Consultando..." : "Actualizar datos"}
        </button>
      </div>

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

          <small>
            Los indicadores sin datos disponibles aparecen como guion.
          </small>
        </div>
      )}

      <Kpis
        grupo="centro-principal"
        valores={kpis}
        cargando={cargando}
      />

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="card-panel-dash p-3 h-100">

            <div className="encabezado-panel-dash">
              <h2 className="section-title-dash">
                <i className="bi bi-bell-fill" />
                <span>Alertas recientes</span>
              </h2>

              <Link
                to="/Administrador-Policia/Alertas"
                className="see-all-dash"
              >
                Ver todas
                <i className="bi bi-arrow-right" />
              </Link>
            </div>

            {cargando && (
              <p role="status">Cargando alertas...</p>
            )}

            {!cargando && datos?.alertas === null && (
              <p>No se pudo consultar la lista de alertas.</p>
            )}

            {!cargando &&
              Array.isArray(datos?.alertas) &&
              alertasRecientes.length === 0 && (
                <p>No hay alertas registradas.</p>
              )}

            {alertasRecientes.map(alerta => (
              <div
                className="alert-row-dash"
                key={alerta.id}
              >
                <div className="flex-grow-1">
                  <div className="fw-semibold">
                    {alerta.tipo}
                  </div>

                  <div className="small">
                    {alerta.barrio}
                  </div>

                  <div className="small text-muted">
                    {alerta.estado}
                  </div>
                </div>

                <span className="alert-time-dash">
                  {alerta.hora}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card-panel-dash p-3 h-100">
            <h2 className="section-title-dash mb-3">
              <i className="bi bi-geo-alt-fill" />
              <span>Mapa policial</span>
            </h2>

            <div className="map-box-dash">
              <div className="map-placeholder-dash">
                <i className="bi bi-map" />

                <p className="mb-0 fw-semibold">
                  Ubicación de unidades y alertas
                </p>

                <p className="mb-0 map-placeholder-texto-dash">
                  La visualización cartográfica requiere
                  integrar una librería de mapas.
                </p>

                <span className="badge-soon-dash mt-2">
                  Mapa pendiente
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-panel-dash p-3 mb-4">
        <h2 className="section-title-dash mb-3">
          <i className="bi bi-activity" />
          <span>Estado operativo</span>
        </h2>

        <Kpis
          grupo="centro-operativo"
          valores={kpis}
          cargando={cargando}
        />

        <div className="row g-3 mt-2">
          {[
            ["Total de policías", kpis.totalPolicias],
            ["Total de unidades", kpis.totalUnidades],
            ["Asignaciones activas", kpis.asignacionesActivas],
          ].map(([titulo, valor]) => (
            <div className="col-md-4" key={titulo}>
              <div className="p-3 border rounded">
                <span>{titulo}</span>
                <h3>
                  {cargando ? "..." : valor ?? "—"}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="small text-muted">
        Los indicadores se calculan con los registros
        devueltos por la API.
      </p>
    </>
  );
}

export default CentroOperaciones;
