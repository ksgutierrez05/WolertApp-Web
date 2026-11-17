
const ESTADOS_CERRADOS = ["RESUELTA", "CANCELADA"];

const normalizar = valor =>
  String(valor ?? "").trim().toUpperCase();

function esHoy(valor) {
  if (!valor) return false;

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) return false;

  const hoy = new Date();

  return (
    fecha.getFullYear() === hoy.getFullYear() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getDate() === hoy.getDate()
  );
}

export function calcularIndicadores(datos = {}) {
  const {
    alertas,
    policias,
    unidades,
    asignaciones,
    atenciones,
  } = datos;

  const alertasActivas =
    Array.isArray(alertas) &&
    alertas.every(a => a.estado != null)
      ? alertas.filter(
          a => !ESTADOS_CERRADOS.includes(normalizar(a.estado))
        ).length
      : null;

  const alertasCriticas =
    Array.isArray(alertas) &&
    alertas.every(a => a.prioridad != null)
      ? alertas.filter(
          a => normalizar(a.prioridad) === "ALTA"
        ).length
      : null;

  const pendientes =
    Array.isArray(alertas)
      ? alertas.filter(
          a => normalizar(a.estado) === "PENDIENTE"
        ).length
      : null;

  const alertasHoy =
    Array.isArray(alertas) &&
    alertas.every(a => a.fecha != null)
      ? alertas.filter(a => esHoy(a.fecha)).length
      : null;

  const atencionesFinalizadasHoy =
    Array.isArray(atenciones)
      ? atenciones.filter(
          a =>
            normalizar(a.estadoFinal) === "FINALIZADA" &&
            esHoy(a.fechaAtencion)
        ).length
      : null;

  const enAtencion =
    Array.isArray(atenciones)
      ? atenciones.filter(
          a => normalizar(a.estadoFinal) === "EN_PROCESO"
        ).length
      : null;

  const patrullerosDisponibles =
    Array.isArray(policias)
      ? policias.filter(
          p => normalizar(p.estado) === "DISPONIBLE"
        ).length
      : null;

  const asignacionesActivas =
    Array.isArray(asignaciones)
      ? asignaciones.filter(a =>
          ["ASIGNADA", "EN_ATENCION"].includes(
            normalizar(a.estadoAsignacion)
          )
        ).length
      : null;

  return {
    alertasActivas,
    alertasCriticas,
    resueltasHoy: atencionesFinalizadasHoy,
    patrullerosDisponibles,
    patrullerosServicio: null,
    totalAlertasHoy: alertasHoy,
    enAtencion,
    pendientes,
    totalPolicias: Array.isArray(policias)
      ? policias.length
      : null,
    totalUnidades: Array.isArray(unidades)
      ? unidades.length
      : null,
    asignacionesActivas,
    atencionesFinalizadasHoy,
  };
}

export function obtenerAlertasRecientes(alertas) {
  if (!Array.isArray(alertas)) return [];

  return [...alertas]
    .sort(
      (a, b) =>
        new Date(b.fecha || 0) -
        new Date(a.fecha || 0)
    )
    .slice(0, 6)
    .map(alerta => ({
      id: alerta.idAlerta,
      tipo: alerta.tipo || `Alerta #${alerta.idAlerta}`,
      barrio: alerta.barrioNombre || "Barrio no disponible",
      estado: alerta.estado || "Sin estado",
      hora: formatearFecha(alerta.fecha),
    }));
}

export function formatearFecha(valor) {
  if (!valor) return "—";

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) return "—";

  return fecha.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
