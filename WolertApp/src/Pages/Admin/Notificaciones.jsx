import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/admin/notificaciones.css";
import { destinoNotificacion, listarNotificaciones } from "../../Services/NotificacionesAPI";
import { obtenerDatosEstadisticas } from "../../Services/HistorialEstadisticasService";

const FECHAS_ALERTA = [
  "fecha",
  "fechaReporte",
  "fechaCreacion",
  "fechaRegistro",
  "createdAt",
  "created_at",
];
const ESTADOS_CERRADOS = [
  "RESUELTA",
  "CERRADA",
  "ATENDIDA",
  "FINALIZADA",
  "COMPLETADA",
];

const textoNormalizado = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleUpperCase("es-CO");

const idAlertaDe = (item) =>
  item?.idAlerta ?? item?.IdAlerta ?? item?.alertaId ?? item?.AlertaId ?? null;

const idNotificacionDe = (item) =>
  item?.idNotificacion ?? item?.IdNotificacion ?? item?.id ?? item?.Id ?? null;

const fechaAlertaDe = (item) =>
  FECHAS_ALERTA.map((campo) => item?.[campo]).find(Boolean) ?? null;

const tipoAlertaDe = (item) => {
  const tipo =
    item?.tipo ??
    item?.nombreTipoAlerta ??
    item?.tipoAlerta?.nombre ??
    item?.tipoAlerta?.Nombre ??
    "Alerta ciudadana";
  return String(tipo).replaceAll("_", " ").trim();
};

function fechaFormato(valor) {
  if (!valor) return "Fecha no disponible";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? "Fecha no disponible"
    : fecha.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

function enriquecerNotificacion(notificacion, alertasPorId) {
  const idAlerta = idAlertaDe(notificacion);
  const alerta = idAlerta == null ? null : alertasPorId.get(String(idAlerta));
  const mensajeOriginal = String(
    notificacion.mensaje ?? notificacion.Mensaje ?? "Aviso del sistema"
  ).trim();

  if (idAlerta == null) {
    return {
      ...notificacion,
      idAlerta: null,
      mensaje: mensajeOriginal,
      categoria: "Aviso del sistema",
      origen: "sistema",
    };
  }

  if (!alerta) {
    return {
      ...notificacion,
      idAlerta,
      mensaje: `${mensajeOriginal} Referencia de seguimiento: alerta #${idAlerta}.`,
      categoria: `Alerta #${idAlerta}`,
      origen: "sistema",
    };
  }

  const prioridad = String(alerta.prioridad ?? alerta.Prioridad ?? "Sin prioridad");
  const estado = String(alerta.estado ?? alerta.Estado ?? "Sin estado");
  const barrio = alerta.barrioNombre ?? alerta.BarrioNombre ?? alerta.barrio ?? null;
  const detalle = [
    tipoAlertaDe(alerta),
    `prioridad ${prioridad.toLocaleLowerCase("es-CO")}`,
    `estado ${estado.toLocaleLowerCase("es-CO")}`,
    barrio ? `sector ${barrio}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    ...notificacion,
    idAlerta,
    mensaje: `${mensajeOriginal} ${detalle}. Revisa el seguimiento de la alerta #${idAlerta}.`,
    categoria: `Alerta #${idAlerta}`,
    origen: "sistema",
  };
}

function crearAvisosOperativos(datos) {
  const alertas = Array.isArray(datos?.alertas) ? datos.alertas : [];
  const abiertos = alertas.filter((alerta) => {
    const estado = textoNormalizado(alerta.estado ?? alerta.Estado);
    return estado !== "" && !ESTADOS_CERRADOS.includes(estado);
  });
  const altasAbiertas = abiertos.filter(
    (alerta) => textoNormalizado(alerta.prioridad ?? alerta.Prioridad) === "ALTA"
  );
  const idsAltas = new Set(altasAbiertas.map((alerta) => String(idAlertaDe(alerta))));
  const pendientes = abiertos.filter((alerta) => {
    const estado = textoNormalizado(alerta.estado ?? alerta.Estado);
    return ["PENDIENTE", "REPORTADA", "RECIBIDA", "NUEVA"].includes(estado)
      && !idsAltas.has(String(idAlertaDe(alerta)));
  });

  const ahora = Date.now();
  const ultimas24Horas = alertas.filter((alerta) => {
    const fecha = new Date(fechaAlertaDe(alerta)).getTime();
    return Number.isFinite(fecha) && fecha >= ahora - 24 * 60 * 60 * 1000;
  });

  const avisos = [];
  if (altasAbiertas.length) {
    const referencia = [...altasAbiertas].sort((a, b) =>
      new Date(fechaAlertaDe(a) || 0) - new Date(fechaAlertaDe(b) || 0)
    )[0];
    const id = idAlertaDe(referencia);
    const tipo = tipoAlertaDe(referencia);
    const barrio = referencia.barrioNombre ?? referencia.BarrioNombre;
    avisos.push({
      idNotificacion: "operativa-prioridad-alta",
      idAlerta: id,
      fecha: new Date().toISOString(),
      categoria: "Revisión prioritaria",
      origen: "operativo",
      ruta: "/admin/alertas",
      menu: "Alertas",
      mensaje: `Hay ${altasAbiertas.length} alerta${altasAbiertas.length === 1 ? "" : "s"} de prioridad alta que siguen abiertas. La más antigua es #${id ?? "sin código"} (${tipo})${barrio ? ` en ${barrio}` : ""}; valida su atención y asignación.`,
    });
  }

  if (pendientes.length) {
    const referencia = [...pendientes].sort((a, b) =>
      new Date(fechaAlertaDe(a) || 0) - new Date(fechaAlertaDe(b) || 0)
    )[0];
    const id = idAlertaDe(referencia);
    avisos.push({
      idNotificacion: "operativa-cola-pendiente",
      idAlerta: id,
      fecha: new Date().toISOString(),
      categoria: "Cola de atención",
      origen: "operativo",
      ruta: "/admin/alertas",
      menu: "Alertas",
      mensaje: `${pendientes.length} alerta${pendientes.length === 1 ? "" : "s"} permanece${pendientes.length === 1 ? "" : "n"} en estado pendiente o recién reportada. Revisa primero la referencia #${id ?? "sin código"} (${tipoAlertaDe(referencia)}).`,
    });
  }

  if (ultimas24Horas.length) {
    const resueltas = ultimas24Horas.filter((alerta) =>
      ESTADOS_CERRADOS.includes(textoNormalizado(alerta.estado ?? alerta.Estado))
    ).length;
    avisos.push({
      idNotificacion: "operativa-actividad-24h",
      fecha: new Date().toISOString(),
      categoria: "Actividad reciente",
      origen: "operativo",
      ruta: "/admin/reportes",
      menu: "Reportes",
      mensaje: `En las últimas 24 horas se registraron ${ultimas24Horas.length} alertas; ${resueltas} ya aparecen cerradas o atendidas. Consulta el reporte de actividad para revisar la carga reciente.`,
    });
  }

  return avisos;
}

export default function Notificaciones() {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);
  const [datosOperativos, setDatosOperativos] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorDatos, setErrorDatos] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setError("");
    setErrorDatos("");

    Promise.allSettled([
      listarNotificaciones(controller.signal),
      obtenerDatosEstadisticas(controller.signal),
    ])
      .then(([resultadoNotificaciones, resultadoDatos]) => {
        if (controller.signal.aborted) return;

        if (resultadoNotificaciones.status === "fulfilled") {
          const lista = resultadoNotificaciones.value;
          if (Array.isArray(lista)) {
            setNotificaciones(lista);
          } else {
            setNotificaciones([]);
            setError("El servicio de notificaciones devolvió una lista no válida.");
          }
        } else {
          setNotificaciones([]);
          setError(
            resultadoNotificaciones.reason?.message
              || "No se pudieron cargar las notificaciones del sistema."
          );
        }

        if (resultadoDatos.status === "fulfilled") {
          setDatosOperativos(resultadoDatos.value.datos || {});
          if (resultadoDatos.value.errores?.length) {
            setErrorDatos("Algunos datos operativos no se pudieron consultar; los avisos se basan en las fuentes disponibles.");
          }
        } else {
          setDatosOperativos({});
          setErrorDatos("No se pudieron consultar los datos operativos para crear avisos contextuales.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false);
      });

    return () => controller.abort();
  }, [recarga]);

  const avisosContextuales = useMemo(
    () => crearAvisosOperativos(datosOperativos),
    [datosOperativos]
  );

  const avisosTotales = useMemo(() => {
    const alertasPorId = new Map(
      (datosOperativos.alertas || []).map((alerta) => [
        String(idAlertaDe(alerta)),
        alerta,
      ])
    );
    const recibidos = notificaciones.map((item, index) => ({
      ...enriquecerNotificacion(item, alertasPorId),
      idNotificacion: idNotificacionDe(item) ?? `sistema-${index}`,
    }));
    const unicos = new Map();

    [...recibidos, ...avisosContextuales].forEach((item) => {
      const firma = textoNormalizado(item.mensaje);
      if (!unicos.has(firma)) unicos.set(firma, item);
    });

    return [...unicos.values()].sort(
      (a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0)
    );
  }, [notificaciones, avisosContextuales, datosOperativos.alertas]);

  const filtradas = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase("es-CO");
    if (!consulta) return avisosTotales;

    return avisosTotales.filter((item) =>
      `${item.categoria || ""} ${item.mensaje || ""} ${item.idAlerta ?? ""} ${item.idNotificacion ?? ""}`
        .toLocaleLowerCase("es-CO")
        .includes(consulta)
    );
  }, [avisosTotales, busqueda]);

  return (
    <main className="admin-notifications">
      <header className="admin-notifications__hero">
        <div>
          <span className="admin-notifications__eyebrow">
            <i className="bi bi-bell-fill" /> CENTRO DE ACTIVIDAD ADMINISTRATIVA
          </span>
          <h1>Notificaciones</h1>
          <p>
            Seguimiento de alertas, prioridades y carga reciente del sistema.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRecarga((actual) => actual + 1)}
          disabled={cargando}
        >
          <i className={`bi bi-arrow-clockwise ${cargando ? "admin-notifications__spin" : ""}`} />
          Actualizar
        </button>
      </header>

      <section className="admin-notifications__summary">
        <div>
          <span className="admin-notifications__summary-icon">
            <i className="bi bi-bell" />
          </span>
          <span>
            <small>Avisos del sistema</small>
            <strong>{notificaciones.length}</strong>
          </span>
        </div>
        <div>
          <span className="admin-notifications__summary-icon admin-notifications__summary-icon--action">
            <i className="bi bi-clipboard2-check" />
          </span>
          <span>
            <small>Seguimientos operativos</small>
            <strong>{avisosContextuales.length}</strong>
          </span>
        </div>
        <p>Los avisos de gestión se calculan con la actividad actual.</p>
      </section>

      <section className="admin-notifications__panel">
        <div className="admin-notifications__toolbar">
          <label className="admin-notifications__search">
            <i className="bi bi-search" />
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por alerta, prioridad, estado o mensaje..."
              aria-label="Buscar notificaciones"
            />
          </label>
          <span className="admin-notifications__sort">
            <i className="bi bi-clock-history" /> Más recientes primero
          </span>
        </div>

        {error && (
          <div className="admin-notifications__error" role="alert">
            <i className="bi bi-exclamation-triangle-fill" />
            <span>{error}</span>
            <button type="button" onClick={() => setRecarga((actual) => actual + 1)}>
              Reintentar
            </button>
          </div>
        )}
        {errorDatos && !cargando && (
          <div className="admin-notifications__data-note" role="status">
            <i className="bi bi-info-circle" /> {errorDatos}
          </div>
        )}

        {cargando ? (
          <div className="admin-notifications__empty">
            <span className="admin-notifications__loader" />
            <b>Consultando actividad y avisos...</b>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="admin-notifications__empty">
            <i className="bi bi-bell-slash" />
            <b>{busqueda ? "No hay coincidencias" : "No hay avisos por atender"}</b>
            <span>
              {busqueda
                ? "Prueba con otro término de búsqueda."
                : "Cuando haya alertas o novedades del sistema, aparecerán aquí."}
            </span>
          </div>
        ) : (
          <div className="admin-notifications__list">
            {filtradas.map((item) => {
              const destino = item.ruta
                ? { ruta: item.ruta, menu: item.menu }
                : destinoNotificacion(item);
              const esOperativo = item.origen === "operativo";

              return (
                <article
                  key={item.idNotificacion}
                  className={`admin-notifications__item ${esOperativo ? "is-operational" : ""}`}
                >
                  <span className="admin-notifications__item-icon">
                    <i className={`bi ${esOperativo ? "bi-clipboard2-check-fill" : item.idAlerta != null ? "bi-exclamation-triangle-fill" : "bi-info-circle-fill"}`} />
                  </span>
                  <div className="admin-notifications__item-content">
                    <div className="admin-notifications__item-meta">
                      <span>{item.categoria || (item.idAlerta != null ? `Alerta #${item.idAlerta}` : "Aviso del sistema")}</span>
                      <time>{fechaFormato(item.fecha ?? item.Fecha)}</time>
                    </div>
                    <p>{item.mensaje || item.Mensaje || "Aviso del sistema"}</p>
                    <button
                      type="button"
                      className="admin-notifications__open"
                      onClick={() => navigate(destino.ruta)}
                    >
                      Revisar en {destino.menu}
                      <i className="bi bi-arrow-up-right" />
                    </button>
                  </div>
                  {esOperativo && <span className="admin-notifications__tag">GESTIÓN</span>}
                </article>
              );
            })}
          </div>
        )}

        <footer className="admin-notifications__footer">
          <span>Mostrando {filtradas.length} de {avisosTotales.length} avisos</span>
          <span>Mensajes de alertas enriquecidos con datos del sistema</span>
        </footer>
      </section>
    </main>
  );
}
