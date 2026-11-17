
import { useEffect, useMemo, useState } from "react";

import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";

import {
  cargarNotificacionesCentral,
  campo,
  fechaDe,
  fechaLegible,
  idNotificacion,
  tituloNotificacion,
  mensajeNotificacion,
  categoriaNotificacion,
  noLeida,
  esUrgente,
  kpisNotificaciones,
} from "../../Services/notificacionesCentralService";

import "../../css/Policia/central-policia/css/notificaciones.css";

const PESTANAS = [
  { id: "todas", label: "Todas" },
  { id: "noLeidas", label: "No leídas" },
  { id: "alertas", label: "Alertas" },
  { id: "unidades", label: "Unidades" },
  { id: "informes", label: "Informes y cierre" },
];

function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [pestana, setPestana] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    cargarNotificacionesCentral(controller.signal)
      .then((lista) => {
        if (controller.signal.aborted) return;

        setNotificaciones(lista);
        setError("");
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

  const filtradas = useMemo(() => {
    return notificaciones.filter((notificacion) => {
      const categoria = categoriaNotificacion(notificacion);

      const coincidePestana =
        pestana === "todas" ||
        (pestana === "noLeidas" && noLeida(notificacion)) ||
        pestana === categoria;

      const texto = [
        tituloNotificacion(notificacion),
        mensajeNotificacion(notificacion),
        categoria,
        idNotificacion(notificacion),
      ].join(" ").toLowerCase();

      return (
        coincidePestana &&
        texto.includes(busqueda.toLowerCase())
      );
    });
  }, [notificaciones, pestana, busqueda]);

  const seleccionada = notificaciones.find(
    (n, indice) =>
      String(idNotificacion(n) ?? indice) === seleccion
  );

  function actualizar() {
    setCargando(true);
    setError("");
    setRecarga((n) => n + 1);
  }

  function iconoCategoria(categoria) {
    switch (categoria) {
      case "alertas":
        return "bi-exclamation-triangle";
      case "unidades":
        return "bi-car-front";
      case "informes":
        return "bi-file-earmark-text";
      default:
        return "bi-bell";
    }
  }

  return (
    <div className="notificaciones-page">
      <Topbar placeholder="Buscar notificación o caso..." />

      <main className="main-dash">
        <div className="container-fluid">
          <div className="notificaciones-header d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
            <div>
              <h1 className="page-title-dash">
                Notificaciones
              </h1>

              <p className="notif-subtitle-dash">
                Alertas, unidades e informes registrados
                para Central de Radio.
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline-success rounded-pill px-3"
                onClick={actualizar}
                disabled={cargando}
              >
                <i className="bi bi-arrow-clockwise me-1" />
                Actualizar
              </button>

              <button
                type="button"
                className="btn btn-cv-azul rounded-pill px-3"
                disabled
                title="Pendiente de confirmar endpoint de lectura"
              >
                <i className="bi bi-check2-all me-1" />
                Marcar todas como leídas
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger">
              No se pudieron cargar las notificaciones:
              {" "}{error}
            </div>
          )}

          <Kpis
            grupo="notificaciones"
            valores={
              error
                ? {}
                : kpisNotificaciones(notificaciones)
            }
          />

          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search" />
              </span>

              <input
                type="search"
                className="form-control"
                placeholder="Buscar por título o mensaje..."
                aria-label="Buscar notificaciones"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="notif-tabs-dash mb-3">
            {PESTANAS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`notif-tab-dash ${
                  pestana === tab.id ? "active" : ""
                }`}
                onClick={() => setPestana(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <section className="card-panel-dash p-2 p-md-3">
            {cargando || error || filtradas.length === 0 ? (
              <div className="notif-empty-dash">
                <i className="bi bi-bell-slash" />

                <strong>
                  {cargando
                    ? "Cargando notificaciones..."
                    : error
                    ? "Error al consultar notificaciones"
                    : "No hay notificaciones para mostrar"}
                </strong>

                <span>
                  {error
                    ? "Comprueba tu conexión y permisos de acceso."
                    : "Aquí aparecerán las notificaciones que coincidan con los filtros."}
                </span>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {filtradas.map((notificacion, indice) => {
                  const categoria =
                    categoriaNotificacion(notificacion);

                  const identificador = String(
                    idNotificacion(notificacion) ?? indice
                  );

                  return (
                    <button
                      key={identificador}
                      type="button"
                      className="card border-0 shadow-sm w-100 text-start"
                      onClick={() => setSeleccion(identificador)}
                    >
                      <div className="card-body d-flex align-items-start gap-3">
                        <div className="fs-4 text-success">
                          <i
                            className={`bi ${iconoCategoria(categoria)}`}
                          />
                        </div>

                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                            <strong>
                              {tituloNotificacion(notificacion)}
                            </strong>

                            {noLeida(notificacion) && (
                              <span className="badge text-bg-primary">
                                Sin leer
                              </span>
                            )}

                            {esUrgente(notificacion) && (
                              <span className="badge text-bg-danger">
                                Urgente
                              </span>
                            )}
                          </div>

                          <p className="text-muted mb-2">
                            {mensajeNotificacion(notificacion)}
                          </p>

                          <small className="text-secondary">
                            <i className="bi bi-clock me-1" />
                            {fechaLegible(
                              fechaDe(notificacion)
                            )}
                          </small>
                        </div>

                        <i className="bi bi-chevron-right text-muted" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {seleccionada && (
            <section className="card-panel-dash p-4 mt-3">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                <h2 className="h5 mb-0">
                  {tituloNotificacion(seleccionada)}
                </h2>

                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar detalle"
                  onClick={() => setSeleccion(null)}
                />
              </div>

              <p>{mensajeNotificacion(seleccionada)}</p>

              <div className="d-flex flex-wrap gap-3 text-muted small">
                <span>
                  <i className="bi bi-clock me-1" />
                  {fechaLegible(fechaDe(seleccionada))}
                </span>

                <span>
                  <i className="bi bi-tag me-1" />
                  {categoriaNotificacion(seleccionada)}
                </span>

                {campo(
                  seleccionada,
                  "idAlerta",
                  "IdAlerta"
                ) != null && (
                  <span>
                    Alerta #
                    {campo(
                      seleccionada,
                      "idAlerta",
                      "IdAlerta"
                    )}
                  </span>
                )}
              </div>

              <p className="text-muted small mt-3 mb-0">
                Consultar el detalle no modifica el estado
                de lectura en el servidor.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default Notificaciones;
