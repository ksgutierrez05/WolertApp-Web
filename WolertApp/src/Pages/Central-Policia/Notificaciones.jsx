
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import Topbar from "../../Components/Central-policia/Topbar";
import Kpis from "../../Components/Central-policia/Kpicard";

import {
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
import {
  suscribirNotificacionesCentral,
} from "../../Services/notificacionesCentralStore";
import { obtenerEstadoNotificacionesCentral } from "../../Services/notificacionesCentralStore";
import { leerIdsLeidos, guardarIdsLeidos } from "../../Services/notificacionesEstado";

import "../../css/Policia/central-policia/css/notificaciones.css";

const PESTANAS = [
  { id: "todas", label: "Todas" },
  { id: "noLeidas", label: "No leídas" },
  { id: "alertas", label: "Alertas" },
  { id: "unidades", label: "Unidades" },
  { id: "informes", label: "Informes y cierre" },
];
const POR_PAGINA = 8;

function fechaPartes(valor) {
  if (!valor || Number.isNaN(new Date(valor).getTime())) return { fecha: "Fecha no disponible", hora: "" };
  const fecha = new Date(valor);
  return {
    fecha: fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }),
    hora: fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
  };
}

function Notificaciones() {
  const estadoNotificaciones = useSyncExternalStore(
    suscribirNotificacionesCentral,
    obtenerEstadoNotificacionesCentral,
    obtenerEstadoNotificacionesCentral
  );
  const [leidas, setLeidas] = useState(leerIdsLeidos);
  const [pestana, setPestana] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState(null);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    const sincronizar = () => setLeidas(leerIdsLeidos());
    window.addEventListener("wolertapp:notificaciones", sincronizar);
    window.addEventListener("storage", sincronizar);
    return () => {
      window.removeEventListener("wolertapp:notificaciones", sincronizar);
      window.removeEventListener("storage", sincronizar);
    };
  }, []);

  const notificaciones = estadoNotificaciones.lista;
  const cargando = estadoNotificaciones.cargando;
  const error = estadoNotificaciones.error;

  const filtradas = useMemo(() => {
    return notificaciones.filter((notificacion, indice) => {
      const categoria = categoriaNotificacion(notificacion);

      const coincidePestana =
        pestana === "todas" ||
        (pestana === "noLeidas" && noLeida(notificacion, leidas, idNotificacion(notificacion) ?? indice)) ||
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
  }, [notificaciones, pestana, busqueda, leidas]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginaNotificaciones = filtradas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const seleccionada = notificaciones.find(
    (n, indice) =>
      String(idNotificacion(n) ?? indice) === seleccion
  );

  function marcarLeida(id) {
    setLeidas(guardarIdsLeidos([...leerIdsLeidos(), String(id)]));
  }

  function marcarTodasLeidas() {
    setLeidas(guardarIdsLeidos([
      ...leerIdsLeidos(),
      ...notificaciones.map((notificacion, indice) => idNotificacion(notificacion) ?? indice),
    ]));
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
                className="btn btn-outline-success btn-sm"
                disabled={!notificaciones.some((notificacion, indice) => noLeida(notificacion, leidas, idNotificacion(notificacion) ?? indice))}
                onClick={marcarTodasLeidas}
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
                : kpisNotificaciones(notificaciones, leidas)
            }
          />

          <div className="notif-filtros-panel">
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
                onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
              />
            </div>
          </div>

          <div className="notif-tabs-dash">
            {PESTANAS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`notif-tab-dash ${
                  pestana === tab.id ? "active" : ""
                }`}
                onClick={() => { setPestana(tab.id); setPagina(1); }}
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
              <div className="notif-lista">
                {paginaNotificaciones.map((notificacion) => {
                  const categoria =
                    categoriaNotificacion(notificacion);

                  const identificador = String(
                    idNotificacion(notificacion) ?? notificaciones.indexOf(notificacion)
                  );
                  const partesFecha = fechaPartes(fechaDe(notificacion));
                  const estaLeida = !noLeida(notificacion, leidas, identificador);

                  return (
                    <button
                      key={identificador}
                      type="button"
                      className={`notif-fila ${estaLeida ? "leida" : "no-leida"}`}
                      onClick={() => setSeleccion(identificador)}
                    >
                      <div className="notif-fila-contenido">
                        <div className={`notif-icon-dash notif-icon-${categoria}`}>
                          <i
                            className={`bi ${iconoCategoria(categoria)}`}
                          />
                        </div>

                        <div className="notif-contenido">
                          <div className="notif-cabecera">
                            <div className="notif-titulo-grupo">
                              <strong className="notif-titulo">
                              {tituloNotificacion(notificacion)}
                              </strong>

                            {noLeida(notificacion, leidas, identificador) && (
                              <span className="notif-estado-unread">
                                Sin leer
                              </span>
                            )}

                            {esUrgente(notificacion) && (
                              <span className="notif-estado-urgente">
                                Urgente
                              </span>
                            )}
                            </div>
                            <time className="notif-fecha" dateTime={fechaDe(notificacion) || undefined}>
                              <span>{partesFecha.fecha}</span>
                              {partesFecha.hora && <span>{partesFecha.hora}</span>}
                            </time>
                          </div>

                          <p className="notif-mensaje">
                            {mensajeNotificacion(notificacion)}
                          </p>

                          <span className="notif-categoria-label">{categoria}</span>
                        </div>

                        <i className="bi bi-chevron-right notif-chevron" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {!cargando && !error && filtradas.length > 0 && (
            <nav className="notif-paginacion" aria-label="Paginación de notificaciones">
              <span>Mostrando {(paginaActual - 1) * POR_PAGINA + 1}–{Math.min(paginaActual * POR_PAGINA, filtradas.length)} de {filtradas.length} notificaciones</span>
              <div className="notif-paginacion-controles">
                <button type="button" disabled={paginaActual <= 1} onClick={() => setPagina((actual) => Math.max(1, actual - 1))}><i className="bi bi-chevron-left" /> Anterior</button>
                {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => (
                  <button key={numero} type="button" className={paginaActual === numero ? "activa" : ""} aria-current={paginaActual === numero ? "page" : undefined} onClick={() => setPagina(numero)}>{numero}</button>
                ))}
                <button type="button" disabled={paginaActual >= totalPaginas} onClick={() => setPagina((actual) => Math.min(totalPaginas, actual + 1))}>Siguiente <i className="bi bi-chevron-right" /></button>
              </div>
            </nav>
          )}

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

              {noLeida(seleccionada, leidas, seleccion) ? (
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm mt-3"
                  onClick={() => marcarLeida(idNotificacion(seleccionada) ?? seleccion)}
                >
                  <i className="bi bi-check2 me-1" />
                  Marcar como leída
                </button>
              ) : (
                <span className="text-muted small d-block mt-3">Notificación leída.</span>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default Notificaciones;
