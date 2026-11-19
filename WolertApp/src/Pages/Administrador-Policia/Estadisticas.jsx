
import { useEffect, useMemo, useState } from "react";
import Topbar from "../../Components/Administrador-policia/Topbar";
import Kpis from "../../Components/Administrador-policia/Kpicard";
import {
  obtenerDatosEstadisticas,
} from "../../Services/HistorialEstadisticasService";
import "../../css/Policia/administrador-policia/css/estadisticas.css";

function Barra({ etiqueta, valor, total }) {
  const porcentaje = total > 0
    ? Math.round((valor / total) * 100)
    : 0;

  return (
    <div className="estadistica-barra-fila">
      <span className="estadistica-barra-etiqueta">
        {etiqueta.replaceAll("_", " ")}
      </span>

      <div className="estadistica-barra-track">
        <div
          className="estadistica-barra-fill"
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      <strong>{valor}</strong>
      <small>{porcentaje}%</small>
    </div>
  );
}

function PanelBarras({ titulo, icono, registros, campo }) {
  const agrupados = useMemo(() => {
    const conteo = {};

    registros.forEach(registro => {
      const valor = registro[campo] || "SIN INFORMACIÓN";
      conteo[valor] = (conteo[valor] || 0) + 1;
    });

    return Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  }, [registros, campo]);

  return (
    <section className="card-panel-dash p-3 h-100">
      <h2 className="section-title-dash fw-bold mb-3">
        <i className={`bi ${icono} me-2`} />
        {titulo}
      </h2>

      {agrupados.length === 0 ? (
        <p className="estadistica-vacio">
          No hay información disponible.
        </p>
      ) : (
        <div className="estadistica-barras">
          {agrupados.map(([nombre, cantidad]) => (
            <Barra
              key={nombre}
              etiqueta={nombre}
              valor={cantidad}
              total={registros.length}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Estadisticas() {
  const [datos, setDatos] = useState({
    alertas: [],
    atenciones: [],
    asignaciones: [],
    policias: [],
    unidades: [],
    alarmas: [],
  });

  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState([]);
  const [actualizacion, setActualizacion] = useState(null);

  async function cargarDatos(signal) {
  try {
    const resultado = await obtenerDatosEstadisticas(signal);

    if (signal?.aborted) return;

    setDatos(resultado.datos);
    setErrores(resultado.errores);
    setActualizacion(new Date());
  } catch (error) {
    if (error.name !== "AbortError" && !signal?.aborted) {
      setErrores([error.message]);
    }
  } finally {
    if (!signal?.aborted) {
      setCargando(false);
    }
  }
}

  useEffect(() => {
  const controller = new AbortController();

  obtenerDatosEstadisticas(controller.signal)
    .then((resultado) => {
      if (controller.signal.aborted) return;

      setDatos(resultado.datos);
      setErrores(resultado.errores);
      setActualizacion(new Date());
    })
    .catch((error) => {
      if (
        error.name !== "AbortError" &&
        !controller.signal.aborted
      ) {
        setErrores([error.message]);
      }
    })
    .finally(() => {
      if (!controller.signal.aborted) {
        setCargando(false);
      }
    });

  return () => {
    controller.abort();
  };
}, []);

  const valores = useMemo(() => {
    

    const alertasResueltas = datos.alertas.filter(
      a => String(a.estado || "").toUpperCase() === "RESUELTA"
    ).length;

    return {
      totalAlertas: datos.alertas.length,
      alertasResueltas,
      policiasActivos: datos.policias.filter(
        p => String(p.estado || "").toUpperCase() === "ACTIVO"
      ).length,
      unidadesOperativas: datos.unidades.filter(
        u => String(u.estado || "").toUpperCase() === "OPERATIVA"
      ).length,
    };
  }, [datos]);
const atencionesHoy = datos.atenciones.filter(a => {
  if (!a.fechaAtencion) return false;

  return (
    new Date(a.fechaAtencion).toDateString() ===
    new Date().toDateString()
  );
});

  const estadosAlarmas = useMemo(() => {
    const conteo = {};
    datos.alarmas.forEach(a => {
      const estado = a.estado || "SIN INFORMACIÓN";
      conteo[estado] = (conteo[estado] || 0) + 1;
    });
    return conteo;
  }, [datos.alarmas]);

  const estadosUnidades = useMemo(() => {
    const conteo = {};
    datos.unidades.forEach(u => {
      const estado = u.estado || "SIN INFORMACIÓN";
      conteo[estado] = (conteo[estado] || 0) + 1;
    });
    return conteo;
  }, [datos.unidades]);

  return (
    <>
      <Topbar placeholder="Consultar estadísticas..." />

      <main className="main-dash estadisticas-page">
        <div className="container-fluid">

          <header className="header-vista-dash mb-4">
            <div>
              <h1>Estadísticas</h1>
              <p>
                Indicadores operacionales del sistema policial.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-cv-verde"
              disabled={cargando}
              onClick={() => cargarDatos()}
            >
              <i className="bi bi-arrow-clockwise" />
              Actualizar datos
            </button>
          </header>

          <section aria-label="Indicadores generales">
            <Kpis
              grupo="estadisticas"
              valores={valores}
              cargando={cargando}
            />
          </section>

          {errores.length > 0 && (
            <div className="estadistica-alerta-error">
              <i className="bi bi-exclamation-triangle" />
              <div>
                <strong>Algunas consultas no pudieron completarse.</strong>
                {errores.map((error, i) => (
                  <p key={i}>{error}</p>
                ))}
              </div>
            </div>
          )}

          {cargando && (
            <p className="estadistica-vacio">
              Cargando estadísticas...
            </p>
          )}

          {!cargando && (
            <>
              <div className="row g-3 mb-4">
                <div className="col-lg-6">
                  <PanelBarras
                    titulo="Alertas por estado"
                    icono="bi-bell"
                    registros={datos.alertas}
                    campo="estado"
                  />
                </div>

                <div className="col-lg-6">
                  <PanelBarras
                    titulo="Policías por estado"
                    icono="bi-people"
                    registros={datos.policias}
                    campo="estado"
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-lg-6">
                  <PanelBarras
                    titulo="Atenciones por estado"
                    icono="bi-clipboard-check"
                    registros={datos.atenciones}
                    campo="estadoFinal"
                  />
                </div>

                <div className="col-lg-6">
                  <PanelBarras
                    titulo="Alertas por tipo"
                    icono="bi-exclamation-circle"
                    registros={datos.alertas}
                    campo="tipo"
                  />
                </div>
              </div>

              <section className="card-panel-dash p-3 mb-4">
                <h2 className="section-title-dash fw-bold mb-3">
                  <i className="bi bi-activity me-2" />
                  Estado de alarmas y unidades
                </h2>

                <div className="row g-4">
                  <div className="col-md-6">
                    <h3 className="estadistica-subtitulo">
                      Alarmas ({datos.alarmas.length})
                    </h3>

                    {Object.entries(estadosAlarmas).length === 0
                      ? <p>No hay alarmas registradas.</p>
                      : Object.entries(estadosAlarmas).map(([estado, total]) => (
                        <div className="estado-fila-dash" key={estado}>
                          <span className="estado-dot-dash" />
                          <span className="estado-nombre-dash">{estado}</span>
                          <strong className="estado-valor-dash">{total}</strong>
                        </div>
                      ))}
                  </div>

                  <div className="col-md-6">
                    <h3 className="estadistica-subtitulo">
                      Unidades ({datos.unidades.length})
                    </h3>

                    {Object.entries(estadosUnidades).length === 0
                      ? <p>No hay unidades registradas.</p>
                      : Object.entries(estadosUnidades).map(([estado, total]) => (
                        <div className="estado-fila-dash" key={estado}>
                          <span className="estado-dot-dash" />
                          <span className="estado-nombre-dash">{estado}</span>
                          <strong className="estado-valor-dash">{total}</strong>
                        </div>
                      ))}
                  </div>
                </div>
              </section>

              <section className="card-panel-dash p-3 mb-4">
                <h2 className="section-title-dash fw-bold mb-3">
                  <i className="bi bi-calendar-check me-2" />
                  Actividad de hoy
                </h2>

                <div className="estadistica-resumen">
                  <div>
                    <strong>{datos.alertas.filter(a =>
                      a.fecha &&
                      new Date(a.fecha).toDateString() === new Date().toDateString()
                    ).length}</strong>
                    <span>Alertas registradas hoy</span>
                  </div>

                  <div>
                    <strong>{atencionesHoy.length}</strong>
                    <span>Atenciones registradas hoy</span>
                  </div>

                  <div>
                    <strong>{datos.asignaciones.filter(a =>
                      a.fecha &&
                      new Date(a.fecha).toDateString() === new Date().toDateString()
                    ).length}</strong>
                    <span>Asignaciones de hoy</span>
                  </div>
                </div>
              </section>
            </>
          )}

          <p className="estadistica-actualizacion">
            {actualizacion
              ? `Última actualización: ${actualizacion.toLocaleString("es-CO")}`
              : "Sin actualización disponible"}
          </p>
        </div>
      </main>
    </>
  );
}

export default Estadisticas;
