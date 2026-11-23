
import { consultarCentral } from "./centralPoliciaApi";

export const campo = (obj, ...nombres) =>
  nombres.reduce((valor, nombre) => valor ?? obj?.[nombre], null);

export const texto = (valor) =>
  String(valor ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");

export const idAlerta = (a) =>
  campo(a, "idAlerta", "IdAlerta", "ID_ALERTA");

export const idAsignacion = (a) =>
  campo(a, "idAsignacion", "IdAsignacion", "ID_ASIGNACION");

export const estadoAlerta = (a) =>
  texto(campo(a, "estado", "Estado", "ESTADO"));

export const prioridadAlerta = (a) =>
  texto(campo(a, "prioridad", "Prioridad", "PRIORIDAD"));

export const fechaAlerta = (a) =>
  campo(
    a, "fechaReporte", "FechaReporte",
    "fechaCreacion", "FechaCreacion",
    "fecha", "Fecha", "FECHA"
  );

export const tipoAlerta = (a) =>
  campo(
    a, "nombreTipoAlerta", "NombreTipoAlerta",
    "tipo", "Tipo", "tipoAlerta", "TipoAlerta"
  ) || "Alerta";

export const ubicacionAlerta = (a) =>
  campo(
    a, "direccion", "Direccion",
    "nombreBarrio", "NombreBarrio",
    "barrio", "Barrio"
  ) || "No disponible";

export const esResuelta = (a) =>
  [
    "RESUELTA", "RESUELTO", "CANCELADA",
    "FINALIZADA", "FINALIZADO",
    "ATENDIDA", "ATENDIDO",
    "CERRADA", "CERRADO"
  ].includes(estadoAlerta(a));

export const esEnAtencion = (a) =>
  [
    "UNIDAD_ASIGNADA", "ASIGNADA",
    "ASIGNADO", "EN_ATENCION",
    "EN_PROCESO", "EN_CAMINO", "ACTIVA"
  ].includes(estadoAlerta(a));

export const esPendiente = (a) =>
  estadoAlerta(a) === "PENDIENTE";

export const esCritica = (a) =>
  ["CRITICA", "ALTA", "URGENTE"].includes(prioridadAlerta(a));

export const fechaLegible = (valor) => {
  if (!valor) return "—";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? "—"
    : fecha.toLocaleString("es-CO");
};

export const esHoy = (valor) => {
  if (!valor) return false;
  const fecha = new Date(valor);
  return !Number.isNaN(fecha.getTime()) &&
    fecha.toDateString() === new Date().toDateString();
};

export const estadoUnidad = (u) =>
  texto(campo(u, "estado", "Estado", "ESTADO"));

export const esUnidadDisponible = (u) =>
  ["OPERATIVA", "DISPONIBLE", "LIBRE"].includes(estadoUnidad(u));

export const esUnidadOcupada = (u) =>
  ["ACTIVA", "OCUPADA", "EN_SERVICIO", "EN_ATENCION"]
    .includes(estadoUnidad(u));

export const esFinalizadaAsignacion = (a) =>
  [
    "FINALIZADA", "FINALIZADO",
    "CERRADA", "CERRADO", "COMPLETADA"
  ].includes(
    texto(campo(a, "estado", "Estado", "estadoAsignacion", "EstadoAsignacion"))
  );

export async function cargarOperaciones(signal) {
  const rutas = [
    ["alertas", "/api/Alertas?alcance=todas"],
    ["asignaciones", "/api/Asignaciones"],
    ["atenciones", "/api/AtencionesAlerta"],
    ["unidades", "/api/Unidades"],
  ];

  const resultados = await Promise.allSettled(
    rutas.map(([, ruta]) => consultarCentral(ruta, { signal }))
  );

  if (signal?.aborted) {
    throw new DOMException("Consulta cancelada", "AbortError");
  }

  const datos = {};
  const errores = [];

  resultados.forEach((resultado, indice) => {
    const [nombre, ruta] = rutas[indice];

    if (
      resultado.status === "fulfilled" &&
      Array.isArray(resultado.value)
    ) {
      datos[nombre] = resultado.value;
    } else {
      datos[nombre] = [];
      errores.push(
        resultado.status === "rejected"
          ? `${ruta}: ${resultado.reason?.message || "Error de conexión"}`
          : `${ruta}: la respuesta no es una lista`
      );
    }
  });

  if (errores.length === rutas.length) {
    throw new Error(errores.join("\n"));
  }

  return { datos, errores };
}

export function resumenOperativo(datos) {
  const alertas = datos.alertas || [];
  const asignaciones = datos.asignaciones || [];
  const unidades = datos.unidades || [];

  const idsAsignados = new Set(
    asignaciones
      .filter((a) => !esFinalizadaAsignacion(a))
      .map((a) => String(campo(a, "idAlerta", "IdAlerta")))
  );

  const sinAsignar = alertas.filter(
    (a) =>
      esPendiente(a) &&
      !idsAsignados.has(String(idAlerta(a)))
  ).length;

  return {
    centro: {
      alertasActivas: alertas.filter((a) => !esResuelta(a)).length,
      prioridadCritica: alertas.filter(
        (a) => !esResuelta(a) && esCritica(a)
      ).length,
      sinAsignar,
      unidadesDisponibles: unidades.filter(esUnidadDisponible).length,
    },

    alertas: {
      total: alertas.length,
      pendientes: alertas.filter(esPendiente).length,
      enAtencion: alertas.filter(esEnAtencion).length,
      resueltas: alertas.filter(esResuelta).length,
    },

    asignaciones: {
      total: asignaciones.length,
      activas: asignaciones.filter(
        (a) => !esFinalizadaAsignacion(a)
      ).length,
      pendientes: sinAsignar,
      finalizadas: asignaciones.filter(
        (a) =>
          esFinalizadaAsignacion(a) &&
          esHoy(campo(
            a, "fechaFinalizacion", "FechaFinalizacion",
            "fechaFin", "FechaFin"
          ))
      ).length,
    },
  };
}
