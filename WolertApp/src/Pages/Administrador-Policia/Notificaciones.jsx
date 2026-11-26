import {
  leerIdsLeidos,
  guardarIdsLeidos,
} from "../../Services/notificacionesEstado";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFeedback } from "../../Components/Feedback/useFeedback";
import "../../css/Policia/administrador-policia/css/notificaciones.css";

const API = (import.meta.env.VITE_API_URL || "https://localhost:7138").replace(
  /\/$/,
  "",
);

/*
 * Obtiene el ID del usuario autenticado desde su JWT.
 * Si el token no incluye un identificador reconocido,
 * NO se muestran notificaciones de otros usuarios.
 */
function obtenerIdUsuario() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const parte = token.split(".")[1];
    if (!parte) return null;

    const base64 = parte.replace(/-/g, "+").replace(/_/g, "/");

    const payload = JSON.parse(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")),
    );

    const claves = [
      "idUsuario",
      "IdUsuario",
      "id_usuario",
      "ID_USUARIO",
      "nameid",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
      "sub",
    ];

    for (const clave of claves) {
      const valor = payload[clave];
      const numero = Number(valor);

      if (
        valor !== undefined &&
        valor !== null &&
        Number.isSafeInteger(numero) &&
        numero > 0
      ) {
        return numero;
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function consultarNotificaciones(signal) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Debes iniciar sesión para consultar tus notificaciones.");
  }

  const respuesta = await fetch(`${API}/api/Notificaciones/mias`, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (respuesta.status === 401) {
    throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
  }

  if (respuesta.status === 403) {
    throw new Error("No tienes permisos para consultar las notificaciones.");
  }

  if (!respuesta.ok) {
    throw new Error(
      `No se pudieron consultar las notificaciones (${respuesta.status}).`,
    );
  }

  const datos = await respuesta.json();

  if (!Array.isArray(datos)) {
    throw new Error("La API no devolvió una lista válida de notificaciones.");
  }

  return datos;
}

function formatearFecha(fecha) {
  if (!fecha) return "Fecha no disponible";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "Fecha no disponible";
  }

  return valor.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function esHoy(fecha) {
  if (!fecha) return false;

  const valor = new Date(fecha);

  return (
    !Number.isNaN(valor.getTime()) &&
    valor.toDateString() === new Date().toDateString()
  );
}

function Notificaciones() {
  const { toast } = useFeedback();
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("TODAS");
  const [leidas, setLeidas] = useState(leerIdsLeidos);

  useEffect(() => {
    if (error) toast.errorFrom(error, "No se pudieron cargar las notificaciones.", "Error al cargar notificaciones");
  }, [error, toast]);
  useEffect(() => {
    const sync = () => setLeidas(leerIdsLeidos());
    window.addEventListener("wolertapp:notificaciones", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("wolertapp:notificaciones", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const marcar = (ids) => {
    setLeidas(guardarIdsLeidos([...leerIdsLeidos(), ...ids.map(String)]));
    toast.success("Las notificaciones seleccionadas quedaron marcadas como leídas.", "Cambios guardados");
  };

  const idUsuarioActual = obtenerIdUsuario();

  const cargarNotificaciones = useCallback(
    async (signal) => {
      try {
        const datos = await consultarNotificaciones(signal);

        if (signal?.aborted) return;

        /*
         * Solo se conservan notificaciones dirigidas
         * al usuario que inició sesión.
         *
         * No se filtra por ENVIADA/PENDIENTE porque
         * esos estados no significan leída/no leída.
         */
        const recibidas = [...datos];

        recibidas.sort((a, b) => {
          const fechaA = new Date(a.fecha || 0).getTime() || 0;
          const fechaB = new Date(b.fecha || 0).getTime() || 0;

          return fechaB - fechaA;
        });

        setNotificaciones(recibidas);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError" && !signal?.aborted) {
          setError(err.message || "No se pudieron cargar las notificaciones.");
        }
      } finally {
        if (!signal?.aborted) {
          setCargando(false);
        }
      }
    },
    [idUsuarioActual],
  );

  useEffect(() => {
    const controller = new AbortController();

    const ejecutarCarga = async () => {
      await cargarNotificaciones(controller.signal);
    };

    const tarea = Promise.resolve().then(() => {
      if (!controller.signal.aborted) {
        return ejecutarCarga();
      }
    });

    tarea.catch((error) => {
      if (!controller.signal.aborted) {
        console.error("Error al cargar notificaciones:", error);
      }
    });

    const timer = setInterval(ejecutarCarga, 30000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [cargarNotificaciones]);

  const resumen = useMemo(() => {
    return {
      total: notificaciones.length,
      hoy: notificaciones.filter((n) => esHoy(n.fecha)).length,
      alertas: notificaciones.filter(
        (n) => n.idAlerta !== null && n.idAlerta !== undefined,
      ).length,
    };
  }, [notificaciones]);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return notificaciones.filter((notificacion) => {
      if (filtroFecha === "HOY" && !esHoy(notificacion.fecha)) {
        return false;
      }

      if (filtroFecha === "CON_ALERTA") {
        if (
          notificacion.idAlerta === null ||
          notificacion.idAlerta === undefined
        ) {
          return false;
        }
      }

      const contenido = [
        notificacion.idNotificacion,
        notificacion.mensaje,
        notificacion.idAlerta,
        notificacion.fecha,
      ]
        .filter((valor) => valor !== null && valor !== undefined)
        .join(" ")
        .toLowerCase();

      return !texto || contenido.includes(texto);
    });
  }, [notificaciones, busqueda, filtroFecha]);

  return (
    <main className="notificaciones-page">
      {/* ENCABEZADO */}

      <header className="notificaciones-header">
        <div className="notificaciones-header-info">
          <span className="notificaciones-etiqueta">
            <i className="bi bi-shield-check" aria-hidden="true" />
            ADMINISTRACIÓN POLICIAL
          </span>

          <h1>Mis notificaciones</h1>

          <p>Consulta los avisos y mensajes que has recibido en WOLERTAPP.</p>
        </div>

        <div className="notificaciones-header-acciones">
          <button
            type="button"
            className="btn-notif-primario"
            onClick={() => marcar(notificaciones.map((n) => n.idNotificacion))}
          >
            Marcar todas como leídas
          </button>
        </div>
      </header>

      {/* RESUMEN */}

      <section
        className="notificaciones-resumen-recibidas"
        aria-label="Resumen de notificaciones recibidas"
      >
        <article className="notificaciones-resumen-tarjeta">
          <span className="notificaciones-resumen-icono">
            <i className="bi bi-bell-fill" />
          </span>

          <div>
            <span>Total recibidas</span>
            <strong>{cargando ? "..." : resumen.total}</strong>
          </div>
        </article>

        <article className="notificaciones-resumen-tarjeta">
          <span className="notificaciones-resumen-icono">
            <i className="bi bi-calendar-check" />
          </span>

          <div>
            <span>Recibidas hoy</span>
            <strong>{cargando ? "..." : resumen.hoy}</strong>
          </div>
        </article>

        <article className="notificaciones-resumen-tarjeta">
          <span className="notificaciones-resumen-icono">
            <i className="bi bi-exclamation-circle" />
          </span>

          <div>
            <span>Relacionadas con alertas</span>
            <strong>{cargando ? "..." : resumen.alertas}</strong>
          </div>
        </article>
      </section>

      {/* BANDEJA */}

      <section className="notificaciones-panel">
        <div className="notificaciones-panel-header">
          <div className="notificaciones-panel-titulo">
            <span className="notificaciones-panel-icono">
              <i className="bi bi-inbox" />
            </span>

            <div>
              <h2>Bandeja de entrada</h2>
              <p>Notificaciones dirigidas a tu usuario.</p>
            </div>
          </div>

          <span className="notificaciones-contador">
            {filtradas.length}{" "}
            {filtradas.length === 1 ? "notificación" : "notificaciones"}
          </span>
        </div>

        {/* FILTROS */}

        <div className="notificaciones-filtros">
          <label className="notificaciones-buscador">
            <i className="bi bi-search" />

            <input
              type="search"
              placeholder="Buscar por mensaje o alerta..."
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </label>

          <label className="notificaciones-filtro-estado">
            <span>Mostrar</span>

            <select
              className="form-select"
              value={filtroFecha}
              onChange={(evento) => setFiltroFecha(evento.target.value)}
            >
              <option value="TODAS">Todas las recibidas</option>

              <option value="HOY">Recibidas hoy</option>

              <option value="CON_ALERTA">Relacionadas con alertas</option>
            </select>
          </label>
        </div>

        {/* LISTADO */}

        <div className="notificaciones-lista">
          {cargando ? (
            <div className="notificaciones-vacio">
              <span
                className="spinner-border"
                role="status"
                aria-label="Cargando"
              />

              <h3>Cargando notificaciones</h3>
              <p>Consultando tu bandeja de entrada...</p>
            </div>
          ) : filtradas.length === 0 ? (
            <div className="notificaciones-vacio">
              <span className="notificaciones-vacio-icono">
                <i className="bi bi-bell-slash" />
              </span>

              <h3>No hay notificaciones recibidas</h3>

              <p>
                {busqueda || filtroFecha !== "TODAS"
                  ? "No hay notificaciones que coincidan con los filtros."
                  : "Todavía no tienes notificaciones en tu bandeja."}
              </p>
            </div>
          ) : (
            filtradas.map((notificacion) => (
              <article
                className="notificacion-item"
                key={notificacion.idNotificacion}
              >
                <div className="notificacion-icono normal">
                  <i className="bi bi-bell-fill" />
                </div>

                <div className="notificacion-contenido">
                  <div className="notificacion-superior">
                    <h3>Notificación #{notificacion.idNotificacion}</h3>

                    <span className="notificacion-prioridad prioridad-enviada">
                      RECIBIDA
                    </span>
                  </div>

                  {!leidas.includes(String(notificacion.idNotificacion)) && (
                    <button
                      type="button"
                      className="ap-marcar"
                      onClick={() => marcar([notificacion.idNotificacion])}
                    >
                      Marcar como leída
                    </button>
                  )}
                  <p className="notificacion-mensaje">
                    {notificacion.mensaje || "Notificación sin descripción."}
                  </p>

                  <div className="notificacion-detalles">
                    {notificacion.idAlerta !== null &&
                      notificacion.idAlerta !== undefined && (
                        <span>
                          <i className="bi bi-exclamation-circle" />
                          Alerta #{notificacion.idAlerta}
                        </span>
                      )}

                    <span>
                      <i className="bi bi-calendar3" />
                      {formatearFecha(notificacion.fecha)}
                    </span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default Notificaciones;
