
import { useEffect, useMemo, useState } from "react";

import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";

import {
  cargarAtencionesCentral,
  obtenerCampo,
  normalizar,
  formatearFecha,
  idDeAlerta,
  idDeUnidad,
  idDeAtencion,
  estadoDe,
  estadoFinalizado,
  nombreUnidad,
  tipoDeAlerta,
  ubicacionDeAlerta,
  resumenAtenciones,
} from "../../Services/atencionUnidadesCentralService";

import "../../css/Policia/central-policia/css/atencion-alertas.css";

function AtencionAlertas() {
  const [datos, setDatos] = useState({
    atenciones: [],
    alertas: [],
    asignaciones: [],
    unidades: [],
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    cargarAtencionesCentral(controller.signal)
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

  const reportes = useMemo(() => {
    return datos.atenciones.map((atencion, indice) => {
      const alerta = datos.alertas.find(
        (a) =>
          String(idDeAlerta(a)) ===
          String(
            obtenerCampo(
              atencion,
              "idAlerta",
              "IdAlerta"
            )
          )
      );

      const asignacion = datos.asignaciones.find(
        (a) =>
          String(
            obtenerCampo(
              a,
              "idAlerta",
              "IdAlerta"
            )
          ) ===
          String(
            obtenerCampo(
              atencion,
              "idAlerta",
              "IdAlerta"
            )
          )
      );

      const unidad = datos.unidades.find(
        (u) =>
          String(idDeUnidad(u)) ===
          String(
            obtenerCampo(
              asignacion,
              "idUnidad",
              "IdUnidad"
            )
          )
      );

      return {
        clave: `${idDeAtencion(atencion) ?? indice}`,
        atencion,
        alerta,
        asignacion,
        unidad,
      };
    });
  }, [datos]);

  const valores = useMemo(
    () => resumenAtenciones(datos.atenciones),
    [datos.atenciones]
  );

  const filtrados = useMemo(() => {
    return reportes.filter((reporte) => {
      const estado = estadoDe(reporte.atencion);

      const coincideFiltro =
        filtro === "todas" ||
        (filtro === "finalizadas" &&
          estadoFinalizado(estado)) ||
        (filtro === "porRevisar" &&
          [
            "PENDIENTE",
            "POR REVISAR",
            "REPORTADA",
            "REPORTADO",
          ].includes(estado)) ||
        (filtro === "enRevision" &&
          [
            "EN REVISION",
            "EN PROCESO",
            "EN ATENCION",
            "ACTIVA",
            "ACTIVO",
          ].includes(estado));

      const textoBusqueda = [
        idDeAtencion(reporte.atencion),
        obtenerCampo(
          reporte.atencion,
          "idAlerta",
          "IdAlerta"
        ),
        tipoDeAlerta(reporte.alerta),
        ubicacionDeAlerta(reporte.alerta),
        nombreUnidad(reporte.unidad),
        estado,
      ]
        .join(" ")
        .toLowerCase();

      return (
        coincideFiltro &&
        textoBusqueda.includes(busqueda.toLowerCase())
      );
    });
  }, [reportes, filtro, busqueda]);

  const seleccionado = reportes.find(
    (r) => r.clave === seleccion
  );

  const fechaReporte = (a) =>
    obtenerCampo(
      a,
      "fecha",
      "Fecha",
      "fechaAtencion",
      "FechaAtencion",
      "fechaCreacion",
      "FechaCreacion"
    );

  function actualizar() {
    setCargando(true);
    setError("");
    setRecarga((actual) => actual + 1);
  }

  return (
    <div className="atencion-page">
      <Topbar placeholder="Buscar caso, unidad o zona..." />

      <main className="atencion-contenido">
        <header className="atencion-encabezado">
          <div>
            <h1>Atención de alertas</h1>
            <p>
              Consulta los informes registrados por la Policía
              y revisa el estado de cada atención.
            </p>
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
            <strong>No se pudieron cargar las atenciones.</strong>
            <p className="mb-0 mt-1">{error}</p>
          </div>
        )}

        <Kpis
          grupo="atencion-alertas"
          valores={cargando || error ? {} : valores}
        />

        <section className="atencion-layout">
          <div className="atencion-panel atencion-listado">
            <div className="atencion-panel-header">
              <div>
                <h2>Reportes policiales</h2>
                <p>
                  Selecciona un reporte para consultar
                  su información.
                </p>
              </div>

              <span className="atencion-total">
                {cargando ? "..." : filtrados.length}
              </span>
            </div>

            <div className="atencion-filtros">
              <div className="atencion-tabs">
                {[
                  ["porRevisar", "Por revisar"],
                  ["enRevision", "En revisión"],
                  ["finalizadas", "Finalizadas"],
                  ["todas", "Todas"],
                ].map(([valor, etiqueta]) => (
                  <button
                    key={valor}
                    type="button"
                    className={
                      filtro === valor ? "activo" : ""
                    }
                    onClick={() => setFiltro(valor)}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>

              <div className="atencion-busqueda">
                <i className="bi bi-search" />

                <input
                  type="text"
                  placeholder="Buscar caso, unidad o zona..."
                  value={busqueda}
                  onChange={(e) =>
                    setBusqueda(e.target.value)
                  }
                  aria-label="Buscar reportes policiales"
                />
              </div>
            </div>

            <div className="atencion-lista">
              {cargando ? (
                <div className="p-4 text-center text-muted">
                  Cargando reportes...
                </div>
              ) : error ? (
                <div className="p-4 text-center text-muted">
                  No se pudo consultar la información.
                </div>
              ) : filtrados.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-inbox fs-3 d-block mb-2" />
                  No hay reportes para mostrar.
                </div>
              ) : (
                filtrados.map((reporte) => {
                  const estado = estadoDe(
                    reporte.atencion
                  );

                  return (
                    <button
                      key={reporte.clave}
                      type="button"
                      className="atencion-item w-100 text-start"
                      onClick={() =>
                        setSeleccion(reporte.clave)
                      }
                      aria-pressed={
                        seleccion === reporte.clave
                      }
                    >
                      <span className="atencion-item-icono">
                        <i className="bi bi-file-earmark-text" />
                      </span>

                      <span className="atencion-item-info">
                        <strong>
                          #
                          {obtenerCampo(
                            reporte.atencion,
                            "idAlerta",
                            "IdAlerta"
                          ) ?? "—"}
                          {" · "}
                          {tipoDeAlerta(reporte.alerta)}
                        </strong>

                        <small>
                          <i className="bi bi-geo-alt" />
                          {" "}
                          {ubicacionDeAlerta(
                            reporte.alerta
                          )}
                        </small>

                        <small>
                          <i className="bi bi-truck-front" />
                          {" "}
                          {reporte.unidad
                            ? nombreUnidad(reporte.unidad)
                            : "Unidad no disponible"}
                        </small>
                      </span>

                      <span className="atencion-item-derecha">
                        <span className="atencion-estado">
                          {estado || "Sin estado"}
                        </span>
                        <i className="bi bi-chevron-right" />
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="atencion-panel atencion-detalle">
            {!seleccionado ? (
              <div className="text-center text-muted p-5">
                <i className="bi bi-file-earmark-text fs-1 d-block mb-3" />
                <h2 className="fs-5">
                  Selecciona una atención
                </h2>
                <p>
                  Aquí podrás consultar el informe policial
                  y los datos del caso.
                </p>
              </div>
            ) : (
              <>
                <div className="atencion-detalle-header">
                  <div>
                    <span className="atencion-detalle-etiqueta">
                      ALERTA #
                      {obtenerCampo(
                        seleccionado.atencion,
                        "idAlerta",
                        "IdAlerta"
                      ) ?? "—"}
                    </span>

                    <h2>
                      {tipoDeAlerta(
                        seleccionado.alerta
                      )}
                    </h2>

                    <p>
                      <i className="bi bi-geo-alt" />
                      {" "}
                      {ubicacionDeAlerta(
                        seleccionado.alerta
                      )}
                    </p>
                  </div>

                  <span className="atencion-estado">
                    {estadoDe(
                      seleccionado.atencion
                    ) || "Sin estado"}
                  </span>
                </div>

                <div className="atencion-unidad">
                  <div className="atencion-unidad-icono">
                    <i className="bi bi-truck-front" />
                  </div>

                  <div>
                    <small>Unidad responsable</small>
                    <strong>
                      {seleccionado.unidad
                        ? nombreUnidad(
                            seleccionado.unidad
                          )
                        : "No disponible"}
                    </strong>
                  </div>

                  <div className="atencion-unidad-hora">
                    <small>Reporte registrado</small>
                    <strong>
                      {formatearFecha(
                        fechaReporte(
                          seleccionado.atencion
                        )
                      )}
                    </strong>
                  </div>
                </div>

                <section className="atencion-seccion">
                  <h3>
                    <i className="bi bi-file-earmark-text" />
                    {" "}Información de la alerta
                  </h3>

                  <p>
                    {obtenerCampo(
                      seleccionado.alerta,
                      "descripcion",
                      "Descripcion",
                      "detalle",
                      "Detalle"
                    ) || "No hay descripción disponible."}
                  </p>
                </section>

                <section className="atencion-seccion">
                  <h3>
                    <i className="bi bi-broadcast" />
                    {" "}Informe enviado por la Policía
                  </h3>

                  <div className="atencion-reporte-campo">
                    <span>Descripción del resultado</span>
                    <p>
                      {obtenerCampo(
                        seleccionado.atencion,
                        "descripcion",
                        "Descripcion",
                        "descripcionResultado",
                        "DescripcionResultado"
                      ) || "No registrada"}
                    </p>
                  </div>

                  <div className="atencion-reporte-campo">
                    <span>Acciones realizadas</span>
                    <p>
                      {obtenerCampo(
                        seleccionado.atencion,
                        "accionesRealizadas",
                        "AccionesRealizadas",
                        "acciones",
                        "Acciones"
                      ) || "No registradas"}
                    </p>
                  </div>

                  <div className="atencion-reporte-campo">
                    <span>Resultado informado</span>
                    <p>
                      {obtenerCampo(
                        seleccionado.atencion,
                        "resultado",
                        "Resultado"
                      ) || "No registrado"}
                    </p>
                  </div>

                  <div className="atencion-reporte-campo">
                    <span>Observaciones</span>
                    <p>
                      {obtenerCampo(
                        seleccionado.atencion,
                        "observaciones",
                        "Observaciones"
                      ) || "Sin observaciones"}
                    </p>
                  </div>
                </section>

                <section className="atencion-seccion atencion-seccion-central">
                  <h3>
                    <i className="bi bi-info-circle" />
                    {" "}Estado de revisión
                  </h3>

                  <p className="mb-0">
                    Estado registrado en el sistema:
                    <strong>
                      {" "}
                      {normalizar(
                        estadoDe(
                          seleccionado.atencion
                        )
                      ) || "No disponible"}
                    </strong>
                  </p>

                  <div className="atencion-ayuda">
                    <i className="bi bi-info-circle" />
                    {" "}
                    Las acciones de revisión y cierre se
                    habilitarán cuando confirmemos sus
                    endpoints y permisos en el backend.
                  </div>
                </section>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AtencionAlertas;
