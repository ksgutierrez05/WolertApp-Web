import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Layout from "../../Components/transito/Layout";
import {
  listarSeguimientos,
  registrarInformeFinal,
  marcarAlertaResuelta,
  normalizarEstado,
} from "../../Services/atencionTransitoService";
import { solicitarApoyoPolicial } from "../../Services/solicitudesApoyoService";
import "../../css/transito/central-transito/panel-atencion-transito.css";

const INTERVALO_ACTUALIZACION = 15000;

const ESTADOS = {
  PENDIENTE: { texto: "Pendiente", icono: "bi-clock-history" },
  RECIBIDA: { texto: "Recibida", icono: "bi-inbox" },
  EN_ATENCION: { texto: "En atención", icono: "bi-broadcast" },
  UNIDAD_ASIGNADA: { texto: "Unidad asignada", icono: "bi-people" },
  RESUELTA: { texto: "Resuelta", icono: "bi-check-circle" },
  CANCELADA: { texto: "Cancelada", icono: "bi-x-circle" },
};

const ESTADOS_ATENCION = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
};

const FILTROS_PRINCIPALES = [
  { valor: "ACTIVOS", nombre: "En seguimiento" },
  { valor: "CERRADOS", nombre: "Cerrados" },
  { valor: "TODOS", nombre: "Todos" },
];

const FILTROS_ALERTA = [
  { valor: "PENDIENTE", nombre: "Pendiente" },
  { valor: "RECIBIDA", nombre: "Recibida" },
  { valor: "UNIDAD_ASIGNADA", nombre: "Unidad asignada" },
  { valor: "EN_ATENCION", nombre: "En atención" },
  { valor: "RESUELTA", nombre: "Resuelta" },
  { valor: "CANCELADA", nombre: "Cancelada" },
];

const texto = (valor, defecto = "Sin registrar") => String(valor ?? "").trim() || defecto;

const nombreIncidente = (valor) => {
  const nombres = {
    SEMAFORO_DANADO: "Semáforo dañado",
    ACCIDENTE_TRANSITO: "Accidente de tránsito",
    CONGESTION_VEHICULAR: "Congestión vehicular",
    OBSTRUCCION_VIA: "Obstrucción de vía",
  };
  const codigo = String(valor ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if (!codigo) return "Alerta de tránsito";
  if (nombres[codigo]) return nombres[codigo];
  const nombre = codigo.toLocaleLowerCase("es-CO").replaceAll("_", " ");
  return nombre.charAt(0).toLocaleUpperCase("es-CO") + nombre.slice(1);
};

const estadoDeAlerta = (caso) => normalizarEstado(caso?.estadoAlerta ?? caso?.estado);
const estadoDeAtencion = (caso) => normalizarEstado(caso?.estadoAtencion ?? caso?.estadoFinalAtencion);

const puedeMostrarInforme = (caso) => ["EN_ATENCION", "RESUELTA"].includes(estadoDeAlerta(caso));

const puedeRegistrarInforme = (caso) =>
  estadoDeAlerta(caso) === "EN_ATENCION" &&
  normalizarEstado(caso?.estadoAsignacion) === "EN_ATENCION" &&
  ["PENDIENTE", "EN_PROCESO"].includes(estadoDeAtencion(caso));

const puedeResolver = (caso) =>
  estadoDeAlerta(caso) === "EN_ATENCION" &&
  normalizarEstado(caso?.estadoAsignacion) === "FINALIZADA" &&
  estadoDeAtencion(caso) === "FINALIZADA";

const esCerrada = (estado) => ["RESUELTA", "CANCELADA"].includes(estado);

const identificadorCaso = (caso) =>
  caso?.claveSeguimiento ?? [caso?.idAlerta, caso?.idAsignacion ?? "sin-asignacion", "atencion"].join("-");

const nombreEstado = (estado) => ESTADOS[estado]?.texto ?? texto(estado).replaceAll("_", " ");
const nombreEstadoAtencion = (estado) => ESTADOS_ATENCION[estado] ?? texto(estado).replaceAll("_", " ");
const cantidadBytes = (valor) => new TextEncoder().encode(valor).length;

function FiltroDesplegable({ etiqueta, valor, opciones, alCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef(null);
  useEffect(() => {
    const cerrarFuera = (evento) => {
      if (!contenedor.current?.contains(evento.target)) setAbierto(false);
    };
    document.addEventListener("pointerdown", cerrarFuera);
    return () => document.removeEventListener("pointerdown", cerrarFuera);
  }, []);
  const seleccionado = opciones.find((opcion) => opcion.valor === valor);
  return (
    <div className="st-custom-filter" ref={contenedor}>
      <button
        type="button"
        className="st-filter-select st-custom-filter-trigger"
        aria-label={etiqueta}
        aria-expanded={abierto}
        aria-haspopup="listbox"
        onClick={() => setAbierto((actual) => !actual)}
        onKeyDown={(evento) => {
          if (evento.key === "Escape") setAbierto(false);
        }}
      >
        {seleccionado?.nombre ?? etiqueta}
      </button>
      {abierto && (
        <div className="st-custom-filter-menu" role="listbox" aria-label={etiqueta}>
          {opciones.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              role="option"
              aria-selected={valor === opcion.valor}
              className="st-custom-filter-option"
              onClick={() => {
                alCambiar(opcion.valor);
                setAbierto(false);
              }}
            >
              {opcion.nombre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AvisoSeguimiento({ aviso, cerrar }) {
  useEffect(() => {
    const temporizador = setTimeout(() => cerrar(aviso.id), aviso.tipo === "error" ? 6500 : 4000);
    return () => clearTimeout(temporizador);
  }, [aviso.id, aviso.tipo, cerrar]);
  const icono =
    aviso.tipo === "error"
      ? "bi-exclamation-circle-fill"
      : aviso.tipo === "exito"
        ? "bi-check-circle-fill"
        : "bi-info-circle-fill";
  return (
    <div
      className={`seguimiento-toast seguimiento-toast-${aviso.tipo}`}
      role={aviso.tipo === "error" ? "alert" : "status"}
    >
      <i className={`bi ${icono}`} />
      <span>{aviso.texto}</span>
      <button type="button" onClick={() => cerrar(aviso.id)} aria-label="Cerrar notificación">
        <i className="bi bi-x-lg" />
      </button>
    </div>
  );
}

export default function SeguimientoCasos() {
  const [casos, setCasos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [buscar, setBuscar] = useState("");
  const [filtro, setFiltro] = useState("TODOS");
  const [filtroAlerta, setFiltroAlerta] = useState("");
  const [filtroAtencion, setFiltroAtencion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [observacion, setObservacion] = useState("");
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [confirmarResolucion, setConfirmarResolucion] = useState(false);
  const [mostrarSolicitudApoyo, setMostrarSolicitudApoyo] = useState(false);
  const [motivoApoyo, setMotivoApoyo] = useState("");
  const [enviandoApoyo, setEnviandoApoyo] = useState(false);
  const [, setError] = useState("");
  const [, setMensaje] = useState("");
  const [avisos, setAvisos] = useState([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  const cerrarAviso = useCallback(
    (id) => setAvisos((actuales) => actuales.filter((aviso) => aviso.id !== id)),
    [],
  );

  const notificar = useCallback((mensaje, tipo = "info") => {
    if (!mensaje) return;
    setAvisos((actuales) => [...actuales, { id: `${Date.now()}-${Math.random()}`, texto: mensaje, tipo }]);
  }, []);

  const avisarError = useCallback(
    (mensaje) => {
      setError(mensaje);
      if (mensaje) notificar(mensaje, "error");
    },
    [notificar],
  );

  const avisarExito = useCallback(
    (mensaje) => {
      setMensaje(mensaje);
      if (mensaje) notificar(mensaje, "exito");
    },
    [notificar],
  );

  const montadoRef = useRef(false);
  const consultandoRef = useRef(false);
  const guardandoRef = useRef(false);
  const seleccionadoRef = useRef(null);
  const editandoRef = useRef(false);

  const cargar = useCallback(async () => {
    if (consultandoRef.current || guardandoRef.current) return;
    consultandoRef.current = true;
    try {
      const datos = await listarSeguimientos();
      if (!montadoRef.current) return;
      const nuevosCasos = Array.isArray(datos) ? datos : [];
      setCasos(nuevosCasos);
      setError("");
      setUltimaActualizacion(new Date());
      const actual = seleccionadoRef.current;
      if (actual) {
        const actualizado = nuevosCasos.find((caso) => identificadorCaso(caso) === identificadorCaso(actual));
        if (actualizado) {
          seleccionadoRef.current = actualizado;
          setSeleccionado(actualizado);
          if (!editandoRef.current) {
            setDescripcion(actualizado.descripcionAtencion ?? "");
            setObservacion(actualizado.observacionAtencion ?? "");
          }
        }
      }
    } catch (e) {
      console.error("Error al cargar seguimientos:", e);
      if (montadoRef.current) avisarError(e.message || "No se pudieron consultar los casos.");
    } finally {
      consultandoRef.current = false;
      if (montadoRef.current) setCargando(false);
    }
  }, [avisarError]);

  useEffect(() => {
    montadoRef.current = true;
    const inicio = setTimeout(() => {
      cargar();
    }, 0);
    const intervalo = setInterval(() => {
      if (!document.hidden) cargar();
    }, INTERVALO_ACTUALIZACION);
    const alVolver = () => {
      if (!document.hidden) cargar();
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      montadoRef.current = false;
      clearTimeout(inicio);
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [cargar]);

  const visibles = useMemo(() => {
    const busqueda = buscar.toLowerCase().trim();
    return casos.filter((caso) => {
      const estadoAlerta = estadoDeAlerta(caso);
      const estadoAtencion = estadoDeAtencion(caso);
      if (filtro === "ACTIVOS" && esCerrada(estadoAlerta)) return false;
      if (filtro === "CERRADOS" && !esCerrada(estadoAlerta)) return false;
      if (filtroAlerta && estadoAlerta !== filtroAlerta) return false;
      if (filtroAtencion === "SIN_ATENCION") {
        if (caso.idAtencionTransito != null) return false;
      } else if (filtroAtencion && (caso.idAtencionTransito == null || estadoAtencion !== filtroAtencion)) {
        return false;
      }
      const contenido = [
        caso.idAlerta,
        caso.idAsignacion,
        caso.nombreTipoAlerta,
        caso.tipoAlerta,
        caso.descripcionAlerta,
        caso.descripcion,
        caso.barrio,
        caso.nombreBarrio,
        caso.direccion,
        caso.nombreUnidad,
        caso.nombreAgente,
        estadoAlerta,
        estadoAtencion,
      ]
        .filter((valor) => valor != null)
        .join(" ")
        .toLowerCase();
      return contenido.includes(busqueda);
    });
  }, [casos, buscar, filtro, filtroAlerta, filtroAtencion]);

  // Diagnóstico temporal: revisa los estados reales recibidos del servicio.
  // Se ejecuta al actualizar los casos, no en cada renderizado.
  useEffect(() => {
    console.table(
      casos.map((caso) => ({
        idAlerta: caso.idAlerta,
        idAsignacion: caso.idAsignacion,
        idAtencionTransito: caso.idAtencionTransito,
        estadoAlerta: estadoDeAlerta(caso),
        estadoAsignacion: normalizarEstado(caso?.estadoAsignacion),
        estadoAtencion: estadoDeAtencion(caso),
        puedeResolver: puedeResolver(caso),
      })),
    );
  }, [casos]);

  const pedirApoyoPolicial = async () => {
    if (!seleccionado || enviandoApoyo) return;
    if (!motivoApoyo.trim()) {
      avisarError("Indica el motivo del apoyo policial.");
      return;
    }
    setEnviandoApoyo(true);
    try {
      await solicitarApoyoPolicial(seleccionado, motivoApoyo);
      if (!montadoRef.current) return;
      avisarExito("Solicitud de apoyo policial enviada correctamente.");
      setMostrarSolicitudApoyo(false);
      setMotivoApoyo("");
    } catch (error) {
      if (montadoRef.current) avisarError(error.message || "No se pudo solicitar apoyo policial.");
    } finally {
      if (montadoRef.current) setEnviandoApoyo(false);
    }
  };

  const abrir = (caso) => {
    setMostrarSolicitudApoyo(false);
    setMotivoApoyo("");
    seleccionadoRef.current = caso;
    setSeleccionado(caso);
    setDescripcion(caso.descripcionAtencion ?? "");
    setObservacion(caso.observacionAtencion ?? "");
    editandoRef.current = false;
    setEditando(false);
    setError("");
    setMensaje("");
  };

  const cancelarEdicion = () => {
    if (guardando) return;
    setDescripcion(seleccionado?.descripcionAtencion ?? "");
    setObservacion(seleccionado?.observacionAtencion ?? "");
    editandoRef.current = false;
    setEditando(false);
    setError("");
    setMensaje("");
  };

  const cerrar = () => {
    if (guardando || enviandoApoyo) return;
    setMostrarSolicitudApoyo(false);
    setMotivoApoyo("");
    seleccionadoRef.current = null;
    setConfirmarResolucion(false);
    setSeleccionado(null);
    editandoRef.current = false;
    setEditando(false);
    setError("");
    setMensaje("");
  };

  const resolver = async () => {
    if (!seleccionado || guardando || !puedeResolver(seleccionado)) return;
    setConfirmarResolucion(false);
    guardandoRef.current = true;
    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      await marcarAlertaResuelta(seleccionado);
      const actualizados = await listarSeguimientos();
      if (!montadoRef.current) return;
      const nuevos = Array.isArray(actualizados) ? actualizados : [];
      setCasos(nuevos);
      const actualizado = nuevos.find((caso) => identificadorCaso(caso) === identificadorCaso(seleccionado));
      if (actualizado) {
        seleccionadoRef.current = actualizado;
        setSeleccionado(actualizado);
      }
      setUltimaActualizacion(new Date());
      avisarExito("La alerta se marcó como RESUELTA.");
    } catch (e) {
      console.error("Error al resolver la alerta:", e);
      if (montadoRef.current) avisarError(e.message || "No se pudo resolver la alerta.");
    } finally {
      guardandoRef.current = false;
      if (montadoRef.current) setGuardando(false);
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!seleccionado || guardando) return;
    if (!puedeRegistrarInforme(seleccionado)) {
      avisarError("La alerta y la asignación deben estar EN_ATENCION para registrar el informe.");
      return;
    }
    const nuevaDescripcion = descripcion.trim();
    const nuevaObservacion = observacion.trim();
    if (!nuevaDescripcion) {
      avisarError("La descripción del informe es obligatoria.");
      return;
    }
    if (cantidadBytes(nuevaDescripcion) > 200 || cantidadBytes(nuevaObservacion) > 200) {
      avisarError("Cada campo admite máximo 200 bytes.");
      return;
    }
    guardandoRef.current = true;
    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      await registrarInformeFinal(seleccionado, {
        descripcion: nuevaDescripcion,
        observacion: nuevaObservacion,
      });
      if (!montadoRef.current) return;
      const casoActualizado = {
        ...seleccionado,
        estadoAtencion: "FINALIZADA",
        estadoFinalAtencion: "FINALIZADA",
        descripcionAtencion: nuevaDescripcion,
        observacionAtencion: nuevaObservacion,
      };
      seleccionadoRef.current = casoActualizado;
      setSeleccionado(casoActualizado);
      setCasos((anteriores) =>
        anteriores.map((caso) =>
          identificadorCaso(caso) === identificadorCaso(seleccionado) ? casoActualizado : caso,
        ),
      );
      setDescripcion(nuevaDescripcion);
      setObservacion(nuevaObservacion);
      editandoRef.current = false;
      setEditando(false);
      avisarExito("Los cambios del informe se guardaron correctamente.");
      try {
        const actualizados = await listarSeguimientos();
        if (!montadoRef.current) return;
        if (Array.isArray(actualizados)) {
          setCasos(actualizados);
          const actualizado = actualizados.find(
            (caso) => identificadorCaso(caso) === identificadorCaso(casoActualizado),
          );
          if (actualizado) {
            seleccionadoRef.current = actualizado;
            setSeleccionado(actualizado);
            setDescripcion(actualizado.descripcionAtencion ?? "");
            setObservacion(actualizado.observacionAtencion ?? "");
          }
        }
        setUltimaActualizacion(new Date());
      } catch (consultaError) {
        console.warn("El informe se guardó, pero falló la consulta posterior:", consultaError);
      }
    } catch (e) {
      console.error("Error al guardar el informe:", e);
      if (montadoRef.current) avisarError(e.message || "No fue posible guardar el informe.");
    } finally {
      guardandoRef.current = false;
      if (montadoRef.current) setGuardando(false);
    }
  };

  return (
    <Layout
      rol="central"
      titulo="Atención de tránsito"
      activo="atencion"
      busqueda={{
        placeholder: "Buscar atención...",
        valor: buscar,
        onChange: setBuscar,
      }}
    >
      <main className="st-page">
        <header className="st-header">
          <div>
            <span className="st-eyebrow">CENTRAL DE TRÁNSITO</span>
            <h1>Seguimiento de casos</h1>
            <p>Consulta las alertas asignadas y consulta el informe final comunicado por radio.</p>
            <div className="st-update-info">
              <i className="bi bi-arrow-repeat" />
              <span>Actualización automática cada 15 segundos</span>
              {ultimaActualizacion && (
                <span>
                  · Última consulta:{" "}
                  {ultimaActualizacion.toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        </header>
        <style>{`
          .st-controls-advanced .st-filter-select {
            appearance: none;
            -webkit-appearance: none;
            border: 1px solid #d8e2f0;
            border-radius: 20px;
            background-color: #eef1f8;
            color: #34465f;
            font-family: Inter, sans-serif;
            font-size: 13px;
            font-weight: 600;
            padding: 9px 38px 9px 16px;
            cursor: pointer;
            outline: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23517aac' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            transition: border-color .2s, box-shadow .2s;
          }
          .st-controls-advanced .st-filter-select:hover { border-color: var(--color-primary, #517aac); }
          .st-controls-advanced .st-filter-select:focus {
            border-color: var(--color-primary, #517aac);
            box-shadow: 0 0 0 3px rgba(81,122,172,.16);
          }
          .st-custom-filter { position: relative; min-width: 0; }
          .st-custom-filter-trigger { width: 100%; text-align: left; white-space: nowrap; }
          .st-custom-filter-trigger:hover { background-color: #e3ecf8; color: var(--color-primary, #517aac); }
          .st-custom-filter-menu { position: absolute; z-index: 1000; top: calc(100% + 5px); left: 0; min-width: 100%; max-height: 260px; overflow-y: auto; padding: 5px; border: 1px solid #d8e2f0; border-radius: 14px; background: #fff; box-shadow: 0 12px 30px rgba(16,30,54,.14); }
          .st-custom-filter-option { display: block; width: 100%; padding: 9px 12px; text-align: left; border: 0; border-radius: 9px; background: transparent; color: #34465f; font: 600 13px Inter,sans-serif; cursor: pointer; }
          .st-custom-filter-option:hover, .st-custom-filter-option:focus-visible, .st-custom-filter-option[aria-selected="true"] { background: var(--color-primary, #517aac); color: #fff; outline: none; }
          .st-controls-advanced input[type="checkbox"],
          .st-controls-advanced input[type="radio"] { accent-color: var(--color-primary, #517aac); }
        `}</style>
        <div className="st-controls st-controls-advanced">
          <div className="st-tabs">
            {FILTROS_PRINCIPALES.map((item) => (
              <button
                key={item.valor}
                type="button"
                className={filtro === item.valor ? "active" : ""}
                style={{
                  border: "none",
                  borderRadius: "20px",
                  padding: "8px 18px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor: filtro === item.valor ? "var(--color-primary, #517aac)" : "#eef1f8",
                  color: filtro === item.valor ? "#ffffff" : "#6b7a90",
                  cursor: "pointer",
                  transition: "background-color 0.2s, color 0.2s",
                }}
                onClick={() => setFiltro(item.valor)}
              >
                {item.nombre}
              </button>
            ))}
          </div>
          <div className="st-filter-group">
            <FiltroDesplegable
              etiqueta="Todos los estados de alerta"
              valor={filtroAlerta}
              alCambiar={setFiltroAlerta}
              opciones={[{ valor: "", nombre: "Todos los estados de alerta" }, ...FILTROS_ALERTA]}
            />
            <FiltroDesplegable
              etiqueta="Todos los estados de atención"
              valor={filtroAtencion}
              alCambiar={setFiltroAtencion}
              opciones={[
                { valor: "", nombre: "Todos los estados de atención" },
                { valor: "SIN_ATENCION", nombre: "Sin atención registrada" },
                ...Object.entries(ESTADOS_ATENCION).map(([valor, nombre]) => ({ valor, nombre })),
              ]}
            />
          </div>
          <input
            aria-label="Buscar alertas"
            placeholder="Buscar alerta, barrio o unidad..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>
        <div className="st-results-info">
          <span>
            {visibles.length} {visibles.length === 1 ? "caso encontrado" : "casos encontrados"}
          </span>
          {(filtroAlerta || filtroAtencion || buscar) && (
            <button
              type="button"
              className="st-clear-filters"
              onClick={() => {
                setFiltro("TODOS");
                setFiltroAlerta("");
                setFiltroAtencion("");
                setBuscar("");
              }}
            >
              <i className="bi bi-x-circle me-1" />
              Limpiar filtros
            </button>
          )}
        </div>
        <section className="st-grid" aria-label="Tarjetas de casos">
          {visibles.map((caso) => {
            const estado = estadoDeAlerta(caso);
            const config = ESTADOS[estado] ?? { texto: nombreEstado(estado), icono: "bi-info-circle" };
            const estadoAtencion = estadoDeAtencion(caso);
            return (
              <article
                key={identificadorCaso(caso)}
                className={`st-card st-${ESTADOS[estado] ? estado.toLowerCase() : "desconocida"}`}
              >
                <div className="st-card-top">
                  <span
                    className="st-number"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                      textTransform: "none",
                    }}
                  >
                    Alerta #{caso.idAlerta}
                  </span>
                  <span className="st-badge">
                    <i className={`bi ${config.icono} me-1`} />
                    {config.texto}
                  </span>
                </div>
                <h2 style={{ textTransform: "uppercase" }}>
                  {nombreIncidente(caso.nombreTipoAlerta ?? caso.tipoAlerta ?? caso.tipo)}
                </h2>
                <p className="st-description">
                  {texto(caso.descripcionAlerta ?? caso.descripcion, "Sin descripción")}
                </p>
                <div className="st-meta">
                  <span>
                    <i className="bi bi-geo-alt" />{" "}
                    {texto(caso.barrio ?? caso.nombreBarrio ?? caso.direccion, "Ubicación no registrada")}
                  </span>
                  <span>
                    <i className="bi bi-truck" /> {texto(caso.nombreUnidad, "Unidad no registrada")}
                  </span>
                  <span>
                    <i className="bi bi-clipboard-check" />{" "}
                    {caso.idAtencionTransito
                      ? `Atención: ${nombreEstadoAtencion(estadoAtencion)}`
                      : "Sin atención registrada"}
                  </span>
                </div>
                <button type="button" className="st-open" onClick={() => abrir(caso)}>
                  Ver detalles
                  <i className="bi bi-arrow-right" />
                </button>
              </article>
            );
          })}
        </section>
        {cargando && <p className="st-empty">Cargando alertas...</p>}
        {!cargando && !visibles.length && (
          <p className="st-empty">No hay alertas que coincidan con los filtros seleccionados.</p>
        )}
        {seleccionado && (
          <div
            className="st-overlay"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) cerrar();
            }}
          >
            <section
              className="st-modal"
              role="dialog"
              aria-modal="true"
              aria-label={`Alerta ${seleccionado.idAlerta}`}
            >
              <header className="st-modal-head">
                <div>
                  <span className="st-eyebrow">DETALLE DE LA ALERTA</span>
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                      textTransform: "none",
                    }}
                  >
                    Alerta #{seleccionado.idAlerta}
                  </h2>
                </div>
                <button type="button" aria-label="Cerrar detalles" onClick={cerrar} className="st-close">
                  ×
                </button>
              </header>
              {puedeResolver(seleccionado) && (
                <div className="px-4 pt-3">
                  <button
                    type="button"
                    className="st-button st-primary"
                    disabled={guardando}
                    onClick={() => setConfirmarResolucion(true)}
                  >
                    <i className="bi bi-check-circle me-2" />
                    {guardando ? "Cerrando alerta..." : "Marcar como resuelta"}
                  </button>
                </div>
              )}
              {estadoDeAlerta(seleccionado) === "EN_ATENCION" &&
                normalizarEstado(seleccionado.estadoAsignacion) === "EN_ATENCION" &&
                seleccionado.idAsignacion != null && (
                  <div className="px-4 pt-3">
                    {!mostrarSolicitudApoyo ? (
                      <button
                        type="button"
                        className="st-button st-primary"
                        disabled={guardando || enviandoApoyo}
                        onClick={() => setMostrarSolicitudApoyo(true)}
                      >
                        <i className="bi bi-shield-check me-2" />
                        Solicitar apoyo policial
                      </button>
                    ) : (
                      <div className="st-form">
                        <h3>Solicitud de apoyo policial</h3>
                        <p>Indica el motivo por el que se necesita apoyo policial.</p>
                        <label htmlFor="st-motivo-apoyo">Motivo *</label>
                        <textarea
                          id="st-motivo-apoyo"
                          rows={3}
                          maxLength={200}
                          value={motivoApoyo}
                          onChange={(e) => setMotivoApoyo(e.target.value)}
                          placeholder="Describe por qué se necesita apoyo..."
                        />
                        <div className="d-flex gap-2 mt-3 flex-wrap">
                          <button
                            type="button"
                            className="st-button st-outline"
                            disabled={enviandoApoyo}
                            onClick={() => {
                              setMostrarSolicitudApoyo(false);
                              setMotivoApoyo("");
                            }}
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            className="st-button st-primary"
                            disabled={enviandoApoyo || guardando || !motivoApoyo.trim()}
                            onClick={pedirApoyoPolicial}
                          >
                            <i className="bi bi-send me-2" />
                            {enviandoApoyo ? "Enviando..." : "Enviar solicitud"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              <div className="st-modal-body">
                <div className="st-details">
                  <div>
                    <small>Tipo de alerta</small>
                    <strong>
                      {nombreIncidente(
                        seleccionado.nombreTipoAlerta ?? seleccionado.tipoAlerta ?? seleccionado.tipo,
                      )}
                    </strong>
                  </div>
                  <div>
                    <small>Estado de alerta</small>
                    <strong>{nombreEstado(estadoDeAlerta(seleccionado))}</strong>
                  </div>
                  <div>
                    <small>Estado de asignación</small>
                    <strong>{texto(seleccionado.estadoAsignacion).replaceAll("_", " ")}</strong>
                  </div>
                  <div>
                    <small>Estado de atención</small>
                    <strong>
                      {seleccionado.idAtencionTransito
                        ? nombreEstadoAtencion(estadoDeAtencion(seleccionado))
                        : "Sin atención registrada"}
                    </strong>
                  </div>
                  <div>
                    <small>Reportante</small>
                    <strong>{texto(seleccionado.nombreReportante ?? seleccionado.nombreUsuario)}</strong>
                  </div>
                  <div>
                    <small>Barrio / dirección</small>
                    <strong>
                      {texto(seleccionado.barrio ?? seleccionado.nombreBarrio ?? seleccionado.direccion)}
                    </strong>
                  </div>
                  <div>
                    <small>Unidad asignada</small>
                    <strong>{texto(seleccionado.nombreUnidad)}</strong>
                  </div>
                  <div>
                    <small>Agente</small>
                    <strong>{texto(seleccionado.nombreAgente)}</strong>
                  </div>
                </div>
                <h3>Descripción original de la alerta</h3>
                <p className="st-original">
                  {texto(seleccionado.descripcionAlerta ?? seleccionado.descripcion)}
                </p>
                {puedeMostrarInforme(seleccionado) ? (
                  <div className="st-form">
                    <h3>Informe final recibido por radio</h3>
                    <p>Consulta el informe registrado de la atención de tránsito.</p>
                    {!editando || !puedeRegistrarInforme(seleccionado) ? (
                      <>
                        <label>Descripción de la atención</label>
                        <div className="st-original">{texto(descripcion, "Sin descripción registrada")}</div>
                        <label>Observaciones finales</label>
                        <div className="st-original">{texto(observacion, "Sin observaciones registradas")}</div>
                        {puedeRegistrarInforme(seleccionado) && (
                          <button
                            type="button"
                            className="st-button st-primary mt-3"
                            onClick={() => {
                              editandoRef.current = true;
                              setEditando(true);
                              setError("");
                            }}
                          >
                            <i className="bi bi-pencil-square me-2" />
                            Registrar informe de atención
                          </button>
                        )}
                      </>
                    ) : (
                      <form onSubmit={guardar}>
                        <label htmlFor="st-descripcion">Descripción de la atención *</label>
                        <textarea
                          id="st-descripcion"
                          maxLength={200}
                          rows={4}
                          required
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          placeholder="Describe lo que informó el agente..."
                        />
                        <label htmlFor="st-observacion">Observaciones finales</label>
                        <textarea
                          id="st-observacion"
                          maxLength={200}
                          rows={3}
                          value={observacion}
                          onChange={(e) => setObservacion(e.target.value)}
                          placeholder="Observaciones adicionales..."
                        />
                        <small>
                          Central finalizará la atención al guardar el informe. No se modificará el estado de la
                          alerta.
                        </small>
                        <div className="d-flex gap-2 mt-3 flex-wrap">
                          <button
                            type="button"
                            className="st-button st-outline"
                            onClick={cancelarEdicion}
                            disabled={guardando}
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="st-button st-primary"
                            disabled={guardando || !descripcion.trim()}
                          >
                            <i className="bi bi-floppy me-2" />
                            {guardando ? "Finalizando atención..." : "Finalizar atención"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="st-notice">
                    <i className="bi bi-info-circle" />
                    <span>El informe se registra cuando la alerta y la asignación están EN_ATENCION.</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
      {confirmarResolucion &&
        seleccionado &&
        createPortal(
          <div
            className="st-confirmar-fondo"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !guardando) setConfirmarResolucion(false);
            }}
          >
            <section
              className="st-confirmar-ventana"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="titulo-confirmar-resolucion"
              aria-describedby="descripcion-confirmar-resolucion"
            >
              <div className="st-confirmar-icono">
                <i className="bi bi-question-circle" />
              </div>
              <h3 id="titulo-confirmar-resolucion">¿Resolver esta alerta?</h3>
              <p id="descripcion-confirmar-resolucion">
                ¿Deseas marcar la alerta <strong>#{seleccionado.idAlerta}</strong> como resuelta?
              </p>
              <div className="st-confirmar-acciones">
                <button
                  type="button"
                  className="st-confirmar-cancelar"
                  onClick={() => setConfirmarResolucion(false)}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button type="button" className="st-confirmar-aceptar" onClick={resolver} disabled={guardando}>
                  {guardando ? "Resolviendo..." : "Sí, resolver"}
                </button>
              </div>
            </section>
          </div>,
          document.body,
        )}
      {createPortal(
        <div className="seguimiento-toast-contenedor" aria-live="polite">
          {avisos.map((aviso) => (
            <AvisoSeguimiento key={aviso.id} aviso={aviso} cerrar={cerrarAviso} />
          ))}
        </div>,
        document.body,
      )}
      <style>{`
        .st-confirmar-fondo { position:fixed; inset:0; z-index:100000; background:rgba(24,42,67,.36); display:flex; justify-content:center; align-items:center; padding:18px; }
        .st-confirmar-ventana { width:min(390px,100%); background:#fff; border:1px solid #e4eaf3; border-radius:18px; padding:25px; text-align:center; box-shadow:0 20px 65px rgba(24,42,67,.22); font-family:Inter,sans-serif; }
        .st-confirmar-icono { color:#517aac; background:#edf4fb; width:54px; height:54px; display:grid; place-items:center; border-radius:50%; margin:0 auto 12px; font-size:27px; }
        .st-confirmar-ventana h3 { font-size:19px; font-weight:700; color:#253b55; margin:0 0 9px; }
        .st-confirmar-ventana p { font-size:14px; color:#66768b; line-height:1.6; margin:0 0 23px; }
        .st-confirmar-acciones { display:flex; justify-content:center; gap:10px; }
        .st-confirmar-acciones button { border-radius:10px; border:1px solid #dce5f0; padding:10px 17px; font:600 13px Inter,sans-serif; cursor:pointer; }
        .st-confirmar-cancelar { background:#f5f7fa; color:#50647c; }
        .st-confirmar-aceptar { background:#517aac; border-color:#517aac!important; color:#fff; }
        .st-confirmar-acciones button:disabled { opacity:.6; cursor:not-allowed; }
        .seguimiento-toast-contenedor { position:fixed; bottom:20px; right:20px; z-index:99999; width:min(365px,calc(100vw - 32px)); display:flex; flex-direction:column; gap:10px; pointer-events:none; }
        .seguimiento-toast { display:flex; align-items:flex-start; gap:12px; padding:14px; border:1px solid #e5eaf1; border-left:4px solid #517aac; border-radius:12px; background:#fff; color:#34465f; box-shadow:0 12px 30px rgba(27,47,73,.14); font:500 13px/1.5 Inter,sans-serif; pointer-events:auto; animation:seguimientoToastEntrada .2s ease-out; }
        .seguimiento-toast-exito { border-left-color:#299b69; }
        .seguimiento-toast-error { border-left-color:#db6471; }
        .seguimiento-toast > i { font-size:18px; color:#517aac; }
        .seguimiento-toast-exito > i { color:#299b69; }
        .seguimiento-toast-error > i { color:#db6471; }
        .seguimiento-toast span { flex:1; overflow-wrap:anywhere; }
        .seguimiento-toast button { background:none; border:0; color:#8390a0; cursor:pointer; }
        @keyframes seguimientoToastEntrada { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
        @media(max-width:600px) { .seguimiento-toast-contenedor { bottom:14px; right:16px; } }
      `}</style>
    </Layout>
  );
}