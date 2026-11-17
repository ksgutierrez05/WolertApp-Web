import { useCallback, useEffect, useMemo, useState } from "react";
import Kpis from "../../Components/Administrador-policia/Kpicard";
import "../../css/Policia/administrador-policia/css/notificaciones.css";

const API = (
  import.meta.env.VITE_API_URL || "https://localhost:7138"
).replace(/\/$/, "");

async function apiNotificaciones(ruta, opciones = {}) {
  const token = localStorage.getItem("token");

  const respuesta = await fetch(`${API}${ruta}`, {
    ...opciones,
    headers: {
      Accept: "application/json",
      ...(opciones.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  });

  if (!respuesta.ok) {
    const mensaje = await respuesta.text();

    if (respuesta.status === 401) {
      throw new Error("Sesión no válida. Inicia sesión para continuar.");
    }

    if (respuesta.status === 403) {
      throw new Error(
        "Tu usuario no tiene permisos para consultar o administrar notificaciones."
      );
    }

    throw new Error(mensaje || `Error HTTP ${respuesta.status}`);
  }

  if (respuesta.status === 204) return null;

  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : null;
}

function fechaFormato(fecha) {
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

function estadoNotificacion(notificacion) {
  return String(
    notificacion.estado ??
      (notificacion.enviada === "S" ? "ENVIADA" : "PENDIENTE")
  ).toUpperCase();
}

function Notificaciones() {
  // ================================
  // ESTADOS
  // ================================

  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  const [modalAbierto, setModalAbierto] = useState(false);

  const [formulario, setFormulario] = useState({
    idUsuario: "",
    idAlerta: "",
    mensaje: "",
  });

  // ================================
  // CONSULTAR NOTIFICACIONES
  // ================================

  const cargarNotificaciones = useCallback(async (signal) => {
    try {
      const datos = await apiNotificaciones(
        "/api/Notificaciones",
        { signal }
      );

      if (!Array.isArray(datos)) {
        throw new Error(
          "La API no devolvió una lista válida de notificaciones."
        );
      }

      if (signal?.aborted) return;

      setNotificaciones(datos);
      setError("");

    } catch (err) {
      if (err.name !== "AbortError" && !signal?.aborted) {
        setError(
          err.message || "No se pudieron cargar las notificaciones."
        );
      }

    } finally {
      if (!signal?.aborted) {
        setCargando(false);
      }
    }
  }, []);

  // ================================
  // CARGA INICIAL
  // ================================

 useEffect(() => {
  const controller = new AbortController();
  let activo = true;

  Promise.resolve().then(() => {
    if (activo) {
      cargarNotificaciones(controller.signal);
    }
  });

  return () => {
    activo = false;
    controller.abort();
  };
}, [cargarNotificaciones]);
  // ================================
  // KPI REALES
  // ================================

  const valoresKpi = useMemo(() => {
    const hoy = new Date();

    const enviadas = notificaciones.filter(
      (n) => estadoNotificacion(n) === "ENVIADA"
    ).length;

    const pendientes = notificaciones.filter(
      (n) => estadoNotificacion(n) === "PENDIENTE"
    ).length;

    const totalHoy = notificaciones.filter((n) => {
      if (!n.fecha) return false;

      const fecha = new Date(n.fecha);

      return (
        !Number.isNaN(fecha.getTime()) &&
        fecha.toDateString() === hoy.toDateString()
      );
    }).length;

    return {
      total: notificaciones.length,
      enviadas,
      pendientes,
      hoy: totalHoy,
    };

  }, [notificaciones]);

  // ================================
  // FILTROS Y BÚSQUEDA
  // ================================

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return notificaciones.filter((n) => {
      const estado = estadoNotificacion(n);

      const coincideEstado =
        filtroEstado === "TODOS" ||
        estado === filtroEstado;

      const contenido = [
        n.idNotificacion,
        n.idUsuario,
        n.usuarioCedula,
        n.mensaje,
        n.idAlerta,
        n.estado,
      ]
        .join(" ")
        .toLowerCase();

      return (
        coincideEstado &&
        (!texto || contenido.includes(texto))
      );
    });

  }, [notificaciones, busqueda, filtroEstado]);

  // ================================
  // ACTUALIZAR FORMULARIO
  // ================================

  function cambiarFormulario(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  // ================================
  // ABRIR MODAL
  // ================================

  function abrirModal() {
    setFormulario({
      idUsuario: "",
      idAlerta: "",
      mensaje: "",
    });

    setError("");
    setMensajeExito("");

    setModalAbierto(true);
  }

  // ================================
  // CREAR NOTIFICACIÓN
  // ================================

  async function crearNotificacion(evento) {
    evento.preventDefault();

    if (
      !formulario.idUsuario ||
      !formulario.mensaje.trim()
    ) {
      setError(
        "El usuario y el mensaje son obligatorios."
      );
      return;
    }

    const idUsuario = Number(formulario.idUsuario);

    const idAlerta = formulario.idAlerta
      ? Number(formulario.idAlerta)
      : null;

    if (
      !Number.isInteger(idUsuario) ||
      idUsuario <= 0
    ) {
      setError("El ID del usuario no es válido.");
      return;
    }

    if (
      idAlerta !== null &&
      (!Number.isInteger(idAlerta) || idAlerta <= 0)
    ) {
      setError("El ID de la alerta no es válido.");
      return;
    }

    setProcesando(true);
    setError("");
    setMensajeExito("");

    try {
      await apiNotificaciones("/api/Notificaciones", {
        method: "POST",
        body: JSON.stringify({
          idUsuario,
          idAlerta,
          mensaje: formulario.mensaje.trim(),
        }),
      });

      setModalAbierto(false);

      setMensajeExito(
        "Notificación creada correctamente."
      );

      setCargando(true);

      await cargarNotificaciones();

    } catch (err) {
      setError(err.message);

    } finally {
      setProcesando(false);
    }
  }

  // ================================
  // MARCAR COMO ENVIADA
  // ================================

  async function marcarEnviada(id) {
    if (
      !window.confirm(
        "¿Confirmas marcar esta notificación como enviada?"
      )
    ) {
      return;
    }

    setProcesando(true);
    setError("");
    setMensajeExito("");

    try {
      await apiNotificaciones(
        `/api/Notificaciones/${id}/enviada`,
        {
          method: "PUT",
        }
      );

      setMensajeExito(
        "Notificación marcada como enviada."
      );

      setCargando(true);

      await cargarNotificaciones();

    } catch (err) {
      setError(err.message);

    } finally {
      setProcesando(false);
    }
  }

  // ================================
  // ELIMINAR NOTIFICACIÓN
  // ================================

  async function eliminarNotificacion(id) {
    if (
      !window.confirm(
        "¿Seguro que deseas eliminar esta notificación?"
      )
    ) {
      return;
    }

    setProcesando(true);
    setError("");
    setMensajeExito("");

    try {
      await apiNotificaciones(
        `/api/Notificaciones/${id}`,
        {
          method: "DELETE",
        }
      );

      setMensajeExito(
        "Notificación eliminada correctamente."
      );

      setCargando(true);

      await cargarNotificaciones();

    } catch (err) {
      setError(err.message);

    } finally {
      setProcesando(false);
    }
  }

  // ================================
  // ACTUALIZAR MANUALMENTE
  // ================================

  async function actualizar() {
    setCargando(true);
    setError("");
    setMensajeExito("");

    await cargarNotificaciones();
  }

  // ================================
  // VISTA
  // ================================

  return (
    <main className="notificaciones-page">

      {/* ENCABEZADO */}

      <header className="notificaciones-header">

        <div className="notificaciones-header-info">

          <span className="notificaciones-etiqueta">
            <i
              className="bi bi-shield-check"
              aria-hidden="true"
            />
            ADMINISTRACIÓN POLICIAL
          </span>

          <h1>Notificaciones</h1>

          <p>
            Administra y consulta las notificaciones del sistema.
          </p>

        </div>

        <div className="notificaciones-header-acciones">

          <button
            type="button"
            className="btn-notif-secundario"
            onClick={actualizar}
            disabled={cargando || procesando}
          >
            <i className="bi bi-arrow-clockwise" />
            Actualizar
          </button>

          <button
            type="button"
            className="btn-notif-primario"
            onClick={abrirModal}
            disabled={procesando}
          >
            <i className="bi bi-plus-lg" />
            Nueva notificación
          </button>

        </div>

      </header>

      {/* MENSAJES */}

      {error && (
        <div
          className="notificaciones-mensaje notificaciones-mensaje-error"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle" />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Cerrar aviso"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}

      {mensajeExito && (
        <div
          className="notificaciones-mensaje notificaciones-mensaje-exito"
          role="status"
        >
          <i className="bi bi-check-circle" />

          <span>{mensajeExito}</span>

          <button
            type="button"
            onClick={() => setMensajeExito("")}
            aria-label="Cerrar aviso"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}

      {/* KPI */}

      <section
        className="notificaciones-kpis"
        aria-label="Resumen de notificaciones"
      >
        <Kpis
          grupo="notificaciones"
          valores={valoresKpi}
          cargando={cargando}
        />
      </section>

      {/* BANDEJA */}

      <section className="notificaciones-panel">

        <div className="notificaciones-panel-header">

          <div className="notificaciones-panel-titulo">

            <span className="notificaciones-panel-icono">
              <i className="bi bi-inbox" />
            </span>

            <div>
              <h2>Bandeja de notificaciones</h2>

              <p>
                Consulta los mensajes enviados y pendientes.
              </p>
            </div>

          </div>

          <span className="notificaciones-contador">
            {filtradas.length}{" "}
            {filtradas.length === 1 ? "registro" : "registros"}
          </span>

        </div>

        {/* FILTROS */}

        <div className="notificaciones-filtros">

          <label className="notificaciones-buscador">

            <i className="bi bi-search" />

            <input
              type="search"
              placeholder="Buscar por mensaje, usuario o alerta..."
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(evento.target.value)
              }
            />

          </label>

          <label className="notificaciones-filtro-estado">

            <span>Estado</span>

            <select
              className="form-select"
              value={filtroEstado}
              onChange={(evento) =>
                setFiltroEstado(evento.target.value)
              }
            >
              <option value="TODOS">
                Todos los estados
              </option>

              <option value="ENVIADA">
                Enviadas
              </option>

              <option value="PENDIENTE">
                Pendientes
              </option>

            </select>

          </label>

        </div>

        {/* LISTA */}

        <div className="notificaciones-lista">

          {cargando ? (

            <div className="notificaciones-vacio">

              <span
                className="spinner-border"
                role="status"
              />

              <h3>Cargando notificaciones</h3>

              <p>
                Estamos consultando los registros del sistema.
              </p>

            </div>

          ) : filtradas.length === 0 ? (

            <div className="notificaciones-vacio">

              <span className="notificaciones-vacio-icono">
                <i className="bi bi-bell-slash" />
              </span>

              <h3>No hay notificaciones</h3>

              <p>
                {busqueda || filtroEstado !== "TODOS"
                  ? "No se encontraron registros con los filtros seleccionados."
                  : "Todavía no hay notificaciones registradas en el sistema."}
              </p>

            </div>

          ) : (

            filtradas.map((n) => {

              const enviada =
                estadoNotificacion(n) === "ENVIADA";

              return (

                <article
                  key={n.idNotificacion}
                  className={`notificacion-item ${
                    enviada
                      ? "notificacion-leida"
                      : "notificacion-no-leida"
                  }`}
                >

                  <div
                    className={`notificacion-icono ${
                      enviada ? "normal" : "pendiente"
                    }`}
                  >
                    <i
                      className={`bi ${
                        enviada
                          ? "bi-send-check-fill"
                          : "bi-hourglass-split"
                      }`}
                    />
                  </div>

                  <div className="notificacion-contenido">

                    <div className="notificacion-superior">

                      <h3>
                        Notificación #{n.idNotificacion}
                      </h3>

                      <span
                        className={`notificacion-prioridad ${
                          enviada
                            ? "prioridad-enviada"
                            : "prioridad-pendiente"
                        }`}
                      >
                        {enviada ? "ENVIADA" : "PENDIENTE"}
                      </span>

                    </div>

                    <p className="notificacion-mensaje">
                      {n.mensaje}
                    </p>

                    <div className="notificacion-detalles">

                      <span>
                        <i className="bi bi-person" />
                        Usuario: {n.usuarioCedula || n.idUsuario}
                      </span>

                      <span>
                        <i className="bi bi-exclamation-circle" />
                        Alerta: {n.idAlerta ?? "No asociada"}
                      </span>

                      <span>
                        <i className="bi bi-calendar3" />
                        {fechaFormato(n.fecha)}
                      </span>

                    </div>

                    {/* ACCIONES */}

                    <div className="notificacion-acciones">

                      {!enviada && (
                        <button
                          type="button"
                          className="btn-notif-accion btn-notif-marcar"
                          disabled={procesando}
                          onClick={() =>
                            marcarEnviada(n.idNotificacion)
                          }
                        >
                          <i className="bi bi-send-check" />
                          Marcar enviada
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-notif-accion btn-notif-eliminar"
                        disabled={procesando}
                        onClick={() =>
                          eliminarNotificacion(n.idNotificacion)
                        }
                      >
                        <i className="bi bi-trash" />
                        Eliminar
                      </button>

                    </div>

                  </div>

                </article>

              );
            })

          )}

        </div>

      </section>

      {/* MODAL CREAR */}

      {modalAbierto && (

        <div
          className="notificacion-modal-fondo"
          onMouseDown={(evento) => {
            if (
              evento.target === evento.currentTarget &&
              !procesando
            ) {
              setModalAbierto(false);
            }
          }}
        >

          <section
            className="notificacion-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloModalNotificacion"
          >

            <div className="notificacion-modal-header">

              <div>

                <span className="notificacion-modal-kicker">
                  GESTIÓN DE MENSAJES
                </span>

                <h2 id="tituloModalNotificacion">
                  Nueva notificación
                </h2>

                <p>
                  Registra un mensaje para un usuario del sistema.
                </p>

              </div>

              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                disabled={procesando}
                aria-label="Cerrar"
              >
                <i className="bi bi-x-lg" />
              </button>

            </div>

            <form onSubmit={crearNotificacion}>

              <div className="notificacion-modal-body">

                <label>
                  ID del usuario <span>*</span>

                  <input
                    type="number"
                    name="idUsuario"
                    min="1"
                    required
                    className="form-control"
                    value={formulario.idUsuario}
                    onChange={cambiarFormulario}
                    placeholder="Ej. 5"
                  />
                </label>

                <label>
                  ID de alerta <small>(opcional)</small>

                  <input
                    type="number"
                    name="idAlerta"
                    min="1"
                    className="form-control"
                    value={formulario.idAlerta}
                    onChange={cambiarFormulario}
                    placeholder="Ej. 12"
                  />
                </label>

                <label>
                  Mensaje <span>*</span>

                  <textarea
                    name="mensaje"
                    required
                    maxLength="1000"
                    rows="4"
                    className="form-control"
                    value={formulario.mensaje}
                    onChange={cambiarFormulario}
                    placeholder="Escribe el mensaje..."
                  />

                  <small className="notificacion-caracteres">
                    {formulario.mensaje.length}/1000 caracteres
                  </small>

                </label>

              </div>

              <div className="notificacion-modal-footer">

                <button
                  type="button"
                  className="btn-notif-secundario"
                  onClick={() => setModalAbierto(false)}
                  disabled={procesando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn-notif-primario"
                  disabled={procesando}
                >
                  {procesando
                    ? "Guardando..."
                    : "Crear notificación"}
                </button>

              </div>

            </form>

          </section>

        </div>

      )}

    </main>
  );
}

export default Notificaciones;