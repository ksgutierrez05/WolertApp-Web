
import { useEffect, useMemo, useState } from "react";

import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";

import {
  cargarAtencionesCentral,
  obtenerCampo,
  formatearFecha,
  idDeAlerta,
  idDeAtencion,
  estadoDe,
  estadoFinalizado,
  tipoDeAlerta,
  ubicacionDeAlerta,
  resumenAtenciones,
} from "../../Services/atencionUnidadesCentralService";

import "../../css/Policia/central-policia/css/atencion-alertas.css";

const vacios = () => ({
  atenciones: [],
  alertas: [],
  asignaciones: [],
  unidades: [],
  errores: [],
});

const mostrar = (valor) =>
  valor == null || valor === "" ? "—" : String(valor);

const etiqueta = (valor) =>
  mostrar(valor).replaceAll("_", " ");

function AtencionAlertas() {
  const [datos, setDatos] = useState(vacios);
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
        if (controller.signal.aborted) return;
        setDatos(resultado);
        setError("");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setDatos(vacios());
        setError(err.message || "Error al consultar atenciones.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, [recarga]);

  const reportes = useMemo(() => {
    const alertasPorId = new Map(
      datos.alertas.map((a) => [String(idDeAlerta(a)), a])
    );

    return datos.atenciones.map((atencion, indice) => {
      const id = obtenerCampo(atencion, "idAlerta", "IdAlerta");

      return {
        clave: String(idDeAtencion(atencion) ?? indice),
        atencion,
        alerta: alertasPorId.get(String(id)) || null,
      };
    });
  }, [datos.atenciones, datos.alertas]);

  const valores = useMemo(
    () => resumenAtenciones(datos.atenciones),
    [datos.atenciones]
  );

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return reportes.filter(({ atencion, alerta }) => {
      const estado = estadoDe(atencion);

      const coincide =
        filtro === "todas" ||
        (filtro === "porRevisar" && !estado) ||
        (filtro === "enRevision" && estado === "EN_PROCESO") ||
        (filtro === "finalizadas" && estadoFinalizado(estado));

      const contenido = [
        idDeAtencion(atencion),
        obtenerCampo(atencion, "idAlerta", "IdAlerta"),
        tipoDeAlerta(alerta),
        ubicacionDeAlerta(alerta),
        obtenerCampo(atencion, "unidadNombre", "UnidadNombre"),
        estado,
        obtenerCampo(atencion, "descripcion", "Descripcion"),
      ].join(" ").toLowerCase();

      return coincide && contenido.includes(termino);
    });
  }, [reportes, filtro, busqueda]);

  const seleccionado =
    reportes.find((r) => r.clave === seleccion) || null;

  function actualizar() {
    setCargando(true);
    setError("");
    setSeleccion(null);
    setRecarga((n) => n + 1);
  }

  const claseEstado = (estado) => {
    if (estadoFinalizado(estado)) return "finalizada";
    if (estado === "EN_PROCESO") return "en-revision";
    return "por-revisar";
  };

  return (
    <div className="atencion-page">
      <Topbar
        placeholder="Buscar caso, unidad o zona..."
        iniciales="CR"
      />

      <main className="atencion-contenido">
        <header className="atencion-encabezado">
          <div>
            <div className="atencion-eyebrow">
              <i className="bi bi-shield-check" />
              CENTRAL DE POLICÍA / OPERACIONES
            </div>

            <h1>Atención de alertas</h1>
            <p>
              Seguimiento de informes policiales y resultados
              de las atenciones registradas.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-success btn-sm"
            disabled={cargando}
            onClick={actualizar}
          >
            <i className="bi bi-arrow-clockwise me-2" />
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </header>

        {error && (
          <div className="alert alert-danger" role="alert">
            <strong>No se pudieron cargar las atenciones.</strong>
            <p className="mb-0 mt-1">{error}</p>
          </div>
        )}

        {datos.errores.length > 0 && !error && (
          <div className="alert alert-warning" role="alert">
            <strong>Información complementaria incompleta.</strong>
            <ul className="mb-0 mt-2">
              {datos.errores.map((mensaje, i) => (
                <li key={i}>{mensaje}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="atencion-kpis">
          <Kpis
            grupo="atencion-alertas"
            valores={cargando || error ? {} : valores}
          />
        </div>

        <section className="atencion-layout">
          <div className="atencion-panel atencion-listado">
            <div className="atencion-panel-header">
              <div>
                <h2>Reportes policiales</h2>
                <p>Selecciona un reporte para consultar sus detalles.</p>
              </div>
              <span className="atencion-total">
                {cargando || error ? "—" : filtrados.length}
              </span>
            </div>

            <div className="atencion-filtros">
              <div className="atencion-tabs">
                {[
                  ["todas", "Todas"],
                  ["enRevision", "En proceso"],
                  ["finalizadas", "Finalizadas"],
                  ["porRevisar", "Sin estado"],
                ].map(([valor, nombre]) => (
                  <button
                    key={valor}
                    type="button"
                    className={filtro === valor ? "activo" : ""}
                    aria-pressed={filtro === valor}
                    onClick={() => setFiltro(valor)}
                  >
                    {nombre}
                  </button>
                ))}
              </div>

              <div className="atencion-busqueda">
                <i className="bi bi-search" />
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar caso, unidad o zona..."
                  aria-label="Buscar atenciones"
                />
              </div>
            </div>

            <div className="atencion-lista">
              {cargando || error ? (
                <div className="p-4 text-center text-muted">
                  {cargando
                    ? "Cargando reportes..."
                    : "No fue posible consultar los reportes."}
                </div>
              ) : filtrados.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-inbox fs-3 d-block mb-2" />
                  No hay reportes para mostrar.
                </div>
              ) : (
                filtrados.map(({ clave, atencion, alerta }) => {
                  const estado = estadoDe(atencion);

                  return (
                    <button
                      key={clave}
                      type="button"
                      className={`atencion-item w-100 text-start ${
                        seleccion === clave ? "seleccionado" : ""
                      }`}
                      onClick={() => setSeleccion(clave)}
                      aria-pressed={seleccion === clave}
                    >
                      <span className="atencion-item-icono">
                        <i className="bi bi-file-earmark-text" />
                      </span>

                      <span className="atencion-item-info">
                        <strong>
                          Alerta #
                          {mostrar(obtenerCampo(
                            atencion, "idAlerta", "IdAlerta"
                          ))}
                          {" · "}
                          {tipoDeAlerta(alerta)}
                        </strong>

                        <small>
                          <i className="bi bi-geo-alt" />
                          {ubicacionDeAlerta(alerta)}
                        </small>

                        <small>
                          <i className="bi bi-truck-front" />
                          {mostrar(obtenerCampo(
                            atencion, "unidadNombre", "UnidadNombre"
                          ))}
                        </small>

                        <small>
                          <i className="bi bi-calendar3" />
                          {formatearFecha(obtenerCampo(
                            atencion, "fechaAtencion", "FechaAtencion"
                          ))}
                        </small>
                      </span>

                      <span className="atencion-item-derecha">
                        <span className={`atencion-estado ${claseEstado(estado)}`}>
                          {etiqueta(estado || "SIN ESTADO")}
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
              <div className="atencion-vacio">
                <div className="atencion-vacio-icono">
                  <i className="bi bi-clipboard2-check" />
                </div>
                <h2>Selecciona una atención</h2>
                <p>
                  Consulta el informe policial, la unidad
                  responsable y el resultado registrado.
                </p>
              </div>
            ) : (
              <>
                <div className="atencion-detalle-header">
                  <div>
                    <span className="atencion-detalle-etiqueta">
                      ALERTA #
                      {mostrar(obtenerCampo(
                        seleccionado.atencion,
                        "idAlerta",
                        "IdAlerta"
                      ))}
                    </span>

                    <h2>{tipoDeAlerta(seleccionado.alerta)}</h2>

                    <p>
                      <i className="bi bi-geo-alt" />
                      {ubicacionDeAlerta(seleccionado.alerta)}
                    </p>
                  </div>

                  <span className={`atencion-estado ${claseEstado(
                    estadoDe(seleccionado.atencion)
                  )}`}>
                    {etiqueta(
                      estadoDe(seleccionado.atencion) || "SIN ESTADO"
                    )}
                  </span>
                </div>

                <div className="atencion-unidad">
                  <div className="atencion-unidad-icono">
                    <i className="bi bi-shield-check" />
                  </div>

                  <div>
                    <small>Unidad policial</small>
                    <strong>
                      {mostrar(obtenerCampo(
                        seleccionado.atencion,
                        "unidadNombre",
                        "UnidadNombre"
                      ))}
                    </strong>
                  </div>

                  <div className="atencion-unidad-hora">
                    <small>Fecha de atención</small>
                    <strong>
                      {formatearFecha(obtenerCampo(
                        seleccionado.atencion,
                        "fechaAtencion",
                        "FechaAtencion"
                      ))}
                    </strong>
                  </div>
                </div>

                <section className="atencion-seccion">
                  <h3>
                    <i className="bi bi-info-circle" />
                    Información del caso
                  </h3>

                  <div className="atencion-datos-grid">
                    <div>
                      <span>Atención</span>
                      <strong>#{idDeAtencion(seleccionado.atencion)}</strong>
                    </div>
                    <div>
                      <span>Asignación</span>
                      <strong>
                        {mostrar(obtenerCampo(
                          seleccionado.atencion,
                          "idAsignacion",
                          "IdAsignacion"
                        ))}
                      </strong>
                    </div>
                    <div>
                      <span>Estado de alerta</span>
                      <strong>
                        {etiqueta(obtenerCampo(
                          seleccionado.alerta,
                          "estado",
                          "Estado"
                        ))}
                      </strong>
                    </div>
                    <div>
                      <span>Estado de atención</span>
                      <strong>
                        {etiqueta(estadoDe(seleccionado.atencion))}
                      </strong>
                    </div>
                  </div>
                </section>

                <section className="atencion-seccion">
                  <h3>
                    <i className="bi bi-file-earmark-text" />
                    Informe de atención
                  </h3>

                  <div className="atencion-reporte-campo">
                    <span>Descripción</span>
                    <p>
                      {mostrar(obtenerCampo(
                        seleccionado.atencion,
                        "descripcion",
                        "Descripcion"
                      ))}
                    </p>
                  </div>

                  <div className="atencion-reporte-campo">
                    <span>Observaciones</span>
                    <p>
                      {mostrar(obtenerCampo(
                        seleccionado.atencion,
                        "observacion",
                        "Observacion"
                      ))}
                    </p>
                  </div>

                  <div className="atencion-reporte-campo">
                    <span>Tipo de arma</span>
                    <p>
                      {mostrar(obtenerCampo(
                        seleccionado.atencion,
                        "tipoArmaNombre",
                        "TipoArmaNombre"
                      ))}
                    </p>
                  </div>

                  <div className="atencion-reporte-campo">
                    <span>Medio de transporte</span>
                    <p>
                      {mostrar(obtenerCampo(
                        seleccionado.atencion,
                        "medioTransporteNombre",
                        "MedioTransporteNombre"
                      ))}
                    </p>
                  </div>
                </section>

                <section className="atencion-seccion atencion-seccion-central">
                  <h3>
                    <i className="bi bi-person-badge" />
                    Registro de la atención
                  </h3>

                  <div className="atencion-datos-grid">
                    <div>
                      <span>Policía</span>
                      <strong>
                        {mostrar(obtenerCampo(
                          seleccionado.atencion,
                          "idPolicia",
                          "IdPolicia"
                        ))}
                      </strong>
                    </div>

                    <div>
                      <span>Usuario que registra</span>
                      <strong>
                        {mostrar(obtenerCampo(
                          seleccionado.atencion,
                          "usuarioRegistra",
                          "UsuarioRegistra"
                        ))}
                      </strong>
                    </div>
                  </div>

                  <div className="atencion-ayuda">
                    <i className="bi bi-info-circle" />
                    El estado de esta atención es independiente
                    del cierre general de la alerta.
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
