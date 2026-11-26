import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Layout from "../../Components/transito/Layout";
import {
  obtenerGrupoAgente,
  obtenerCasosAgente,
  registrarLlegada,
  finalizarAsignacion,
  fechaCaso,
} from "../../Services/agenteTransitoService";
import "../../css/transito/agente-transito/panel-grupo.css";
const INTERVALO_ACTUALIZACION = 5000;
const PASOS = [
  { id: "recibido", label: "Recibido", icono: "bi-check-circle-fill" },
  { id: "sitio", label: "En el sitio", icono: "bi-geo-alt-fill" },
  { id: "atendido", label: "Atendido", icono: "bi-flag-fill" },
];
const normalizar = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
const iniciales = (nombre) =>
  String(nombre || "A")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();
const nombreIntegrante = (integrante) =>
  integrante.nombreUsuario ||
  integrante.nombreCompleto ||
  integrante.nombreAgente ||
  integrante.username ||
  `Agente #${integrante.idUsuario ?? "—"}`;
function descripcionEstado(caso) {
  const estado = normalizar(caso.estadoAsignacion);
  if (estado === "ASIGNADA") return "Recibido";
  if (estado === "EN_ATENCION") return "En el sitio";
  if (estado === "FINALIZADA") return "Atendido";
  if (estado === "CANCELADA") return "Cancelado";
  return estado.replaceAll("_", " ") || "Sin estado";
}
function pasoDelCaso(caso) {
  const estado = normalizar(caso.estadoAsignacion);
  if (estado === "ASIGNADA") return 0;
  if (estado === "EN_ATENCION") return 1;
  if (estado === "FINALIZADA") return 2;
  return -1;
}
const mismaId = (a, b) => a != null && b != null && String(a) === String(b);
function NotificacionGrupo({ item, cerrar }) {
  useEffect(() => {
    const temporizador = setTimeout(
      () => cerrar(item.id),
      item.tipo === "error" ? 6500 : 4000
    );
    return () => clearTimeout(temporizador);
  }, [item.id, item.tipo, cerrar]);
  const error = item.tipo === "error";
  const exito = item.tipo === "exito";
  const color = error ? "#b42318" : exito ? "#16805d" : "#517aac";
  const icono = error
    ? "bi-exclamation-circle-fill"
    : exito
      ? "bi-check-circle-fill"
      : "bi-info-circle-fill";
  return (
    <div
      role={error ? "alert" : "status"}
      style={{
        pointerEvents: "auto",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 14px",
        background: "#fff",
        color: "#25344b",
        borderRadius: 14,
        border: "1px solid #e5eaf1",
        borderLeft: `4px solid ${color}`,
        boxShadow: "0 10px 30px rgba(18, 36, 64, .16)",
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
      }}
    >
      <i className={`bi ${icono}`} style={{ color, fontSize: 19 }} />
      <span style={{ flex: 1, lineHeight: 1.5 }}>{item.mensaje}</span>
      <button
        type="button"
        aria-label="Cerrar notificación"
        onClick={() => cerrar(item.id)}
        style={{
          border: 0,
          background: "transparent",
          color: "#748299",
          fontSize: 20,
          lineHeight: 1,
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
}
export default function Grupo() {
  const [grupo, setGrupo] = useState(null);
  const [casos, setCasos] = useState([]);
  const [casosVerificados, setCasosVerificados] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const procesandoRef = useRef(null);
  const ultimoErrorRef = useRef("");
  const notificar = useCallback((mensaje, tipo = "info") => {
    setNotificaciones((actuales) => [
      ...actuales,
      { id: `${Date.now()}-${Math.random()}`, mensaje, tipo },
    ]);
  }, []);
  const cerrarNotificacion = useCallback((id) => {
    setNotificaciones((actuales) => actuales.filter((item) => item.id !== id));
  }, []);
  const cargarDatos = useCallback(async () => {
    const [resultadoGrupo, resultadoCasos] = await Promise.allSettled([
      obtenerGrupoAgente(),
      obtenerCasosAgente(),
    ]);
    const fallos = [];
    if (resultadoGrupo.status === "fulfilled") {
      setGrupo(resultadoGrupo.value);
    } else {
      fallos.push(resultadoGrupo.reason?.message || "No se pudo cargar la unidad.");
    }
    setCasosVerificados(resultadoCasos.status === "fulfilled");
    if (resultadoCasos.status === "fulfilled") {
      setCasos(Array.isArray(resultadoCasos.value) ? resultadoCasos.value : []);
    } else {
      fallos.push(resultadoCasos.reason?.message || "No se pudieron cargar los casos.");
    }
    // Evita repetir el mismo error cada vez que se actualiza.
    const mensaje = fallos.join(" | ");
    if (mensaje && mensaje !== ultimoErrorRef.current) notificar(mensaje, "error");
    ultimoErrorRef.current = mensaje;
  }, [notificar]);
  useEffect(() => {
    let activo = true;
    async function actualizar() {
      try {
        await cargarDatos();
      } catch (err) {
        if (activo) notificar(err.message || "No se pudo actualizar el grupo.", "error");
      } finally {
        if (activo) setCargando(false);
      }
    }
    actualizar();
    const intervalo = setInterval(() => {
      if (!document.hidden && procesandoRef.current === null) actualizar();
    }, INTERVALO_ACTUALIZACION);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [cargarDatos, notificar]);
  // Avanza entre los tres estados reales de la asignación.
  async function actualizarEstado(caso) {
    if (procesandoRef.current !== null) return;
    const idAsignacion = caso.idAsignacion;
    const estado = normalizar(caso.estadoAsignacion);
    if (!idAsignacion) {
      notificar("El caso no tiene una asignación válida.", "error");
      return;
    }
    if (!["ASIGNADA", "EN_ATENCION"].includes(estado)) return;
    procesandoRef.current = idAsignacion;
    setProcesando(idAsignacion);
    try {
      if (estado === "ASIGNADA") {
        await registrarLlegada(idAsignacion);
        notificar(`Llegada registrada para la alerta #${caso.idAlerta}.`, "exito");
      } else {
        const actualizados = await obtenerCasosAgente();
        const vigente = (Array.isArray(actualizados) ? actualizados : []).find(
          (item) => mismaId(item.idAsignacion, idAsignacion)
        );
        if (normalizar(vigente?.estadoAtencion) !== "FINALIZADA") {
          throw new Error(
            "Central debe finalizar el informe de atención antes de cerrar la asignación."
          );
        }
        await finalizarAsignacion(idAsignacion);
        notificar(`La participación en la alerta #${caso.idAlerta} finalizó.`, "exito");
      }
      await cargarDatos();
    } catch (err) {
      notificar(err.message || "No se pudo actualizar el estado de la asignación.", "error");
      try {
        await cargarDatos();
      } catch {
        // Mantener el mensaje del error original.
      }
    } finally {
      procesandoRef.current = null;
      setProcesando(null);
    }
  }
  const unidad = grupo?.unidad;
  const integrantes = grupo?.integrantes ?? [];
  const activas = casos.filter(caso => !["RESUELTA", "CANCELADA"].includes(normalizar(caso.estadoAlerta)));
  const nombreUnidad = unidad?.nombre || unidad?.nombreUnidad || "Mi grupo";
  const zona =
    unidad?.nombreBarrio || unidad?.nombreComuna || unidad?.zona || "Zona no registrada";
  const estadoUnidad = activas.length ? "OCUPADO" : !casosVerificados ? "Estado por verificar" : unidad?.estado || "Estado no disponible";
  return (
    <Layout
      rol="agente"
      titulo="Mi grupo"
      activo="grupo"
      busqueda={{ placeholder: "Buscar..." }}
    >
      <div className="hero-page-dash hero-page-img-dash mb-4">
        <div className="eyebrow-page-img-dash">
          <i className="bi bi-people-fill me-2" />
          <span>
            {nombreUnidad.toUpperCase()} · {zona.toUpperCase()}
          </span>
        </div>
        <h1 className="hero-page-title-dash">
          Buenos días,
          <br />
          {nombreUnidad}
        </h1>
        <p className="hero-page-text-dash mb-0">
          {cargando
            ? "Consultando casos asignados..."
            : `Tienen ${activas.length} ${
                activas.length === 1 ? "caso asignado" : "casos asignados"
              } en este momento.`}
        </p>
        <div className="chips-page-img-dash">
          <span className="chip-page-img-dash">
            <span className="punto-vivo-dash" />
            {estadoUnidad}
          </span>
          <span className="chip-page-img-dash">
            <i className="bi bi-person-check" />
            {integrantes.length} integrantes
          </span>
        </div>
      </div>
      {cargando && (
        <div className="alert alert-info" role="status">
          Cargando grupo...
        </div>
      )}
      <div className="panel-card-dash mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <p className="caso-label-dash mb-0">CASOS ASIGNADOS A TU GRUPO</p>
        </div>
        {!cargando && activas.length === 0 && (
          <p className="config-text-dash mb-0">
            No hay casos activos asignados a tu unidad.
          </p>
        )}
        {activas.map((caso) => {
          const pasoActual = pasoDelCaso(caso);
          const estado = normalizar(caso.estadoAsignacion);
          const atencionFinalizada = normalizar(caso.estadoAtencion) === "FINALIZADA";
          const procesandoEste = procesando === caso.idAsignacion;
          return (
            <div key={caso.idAsignacion} className="mb-4">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                <span className="badge-tipo-dash tipo-accidente-dash d-inline-block">
                  {caso.tipoCaso}
                </span>
                <span className="badge-estado-dash estado-atencion-dash">
                  {descripcionEstado(caso)}
                </span>
              </div>
              <h2 className="caso-titulo-dash">Alerta #{caso.idAlerta}</h2>
              {caso.nombreReportante && (
                <p className="config-text-dash mb-2">
                  <i className="bi bi-person me-2" />
                  Reportado por: {caso.nombreReportante}
                </p>
              )}
              {caso.barrio && (
                <p className="config-text-dash mb-2">
                  <i className="bi bi-geo-alt me-2" />
                  {caso.barrio}
                </p>
              )}
              <p className="config-text-dash mb-3">
                <i className="bi bi-calendar-event me-2" />
                {fechaCaso(caso.fechaCaso)}
                {caso.descripcion ? ` · ${caso.descripcion}` : ""}
              </p>
              <div className="progreso-caso-dash">
                <div className="progreso-linea-dash">
                  {PASOS.map((paso, i) => {
                    const completado = i < pasoActual;
                    const actual = i === pasoActual;
                    const clase = completado
                      ? "paso-completado-dash"
                      : actual
                        ? "paso-actual-dash"
                        : "paso-pendiente-dash";
                    return (
                      <div
                        key={paso.id}
                        className={`progreso-paso-dash ${clase}`}
                        aria-current={actual ? "step" : undefined}
                      >
                        <span className="progreso-circulo-dash">
                          <i className={`bi ${completado ? "bi-check-lg" : paso.icono}`} />
                        </span>
                        <span className="progreso-label-dash">{paso.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {estado === "FINALIZADA" && <p className="config-text-dash">Asignación finalizada. Esperando que Central cierre la alerta.</p>}
              <div className="d-flex justify-content-end flex-wrap gap-2 mt-3">
                {(estado === "ASIGNADA" || estado === "EN_ATENCION") && (
                  <button
                    type="button"
                    className="btn-avanzar-grupo"
                    disabled={
                      procesando !== null ||
                      (estado === "EN_ATENCION" && !atencionFinalizada)
                    }
                    onClick={() => actualizarEstado(caso)}
                  >
                    <span className="btn-avanzar-grupo-icono">
                      <i
                        className={`bi ${
                          estado === "ASIGNADA" ? "bi-geo-alt-fill" : "bi-check-circle-fill"
                        }`}
                      />
                    </span>
                    <span>
                      {procesandoEste
                        ? "Actualizando..."
                        : estado === "ASIGNADA"
                          ? "Confirmar llegada al sitio"
                          : atencionFinalizada
                            ? "Finalizar asignación"
                            : "Esperando informe de Central"}
                    </span>
                    {procesandoEste ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <i className="bi bi-arrow-right btn-avanzar-flecha" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="panel-card-dash">
        <h2 className="panel-title-dash">Integrantes de {nombreUnidad}</h2>
        {integrantes.map((integrante, indice) => {
          const nombre = nombreIntegrante(integrante);
          const estado = String(
            integrante.estadoAgente || integrante.estado || "Sin estado"
          );
          const disponible = casosVerificados && normalizar(unidad?.estado) === "OPERATIVA" && activas.length === 0 && ["ACTIVO", "DISPONIBLE", "EN_SERVICIO"].includes(
            normalizar(estado)
          );
          return (
            <div key={integrante.idUsuario ?? indice} className="miembro-row-dash">
              <div className="d-flex align-items-center gap-2">
                <span
                  className={`avatar-icon-dash ${
                    disponible ? "avatar-green-dash" : "avatar-amber-dash"
                  }`}
                >
                  {iniciales(nombre)}
                </span>
                <div className="fw-semibold">{nombre}</div>
              </div>
              <span
                className={`badge-estado-dash ${
                  disponible ? "estado-resuelta-dash" : "estado-atencion-dash"
                }`}
              >
                {activas.length ? "Ocupado" : !casosVerificados ? "Por verificar" : disponible ? "Disponible" : "No disponible"}
              </span>
            </div>
          );
        })}
        {!cargando && integrantes.length === 0 && (
          <p className="config-text-dash mb-0">
            No hay integrantes registrados para esta unidad.
          </p>
        )}
      </div>
      {createPortal(
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: "min(360px, calc(100vw - 40px))",
            pointerEvents: "none",
          }}
          aria-live="polite"
        >
          {notificaciones.map((item) => (
            <NotificacionGrupo key={item.id} item={item} cerrar={cerrarNotificacion} />
          ))}
        </div>,
        document.body
      )}
    </Layout>
  );
}