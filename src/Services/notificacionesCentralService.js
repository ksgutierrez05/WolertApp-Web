
import { consultarCentral } from "./centralPoliciaApi";

export const campo = (obj, ...nombres) =>
  nombres.reduce(
    (valor, nombre) => valor ?? obj?.[nombre],
    null
  );

const normalizar = (valor) =>
  String(valor ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const fechaDe = (obj) =>
  campo(
    obj,
    "fechaCreacion", "FechaCreacion",
    "fechaNotificacion", "FechaNotificacion",
    "fechaRegistro", "FechaRegistro",
    "fecha", "Fecha"
  );

export const fechaLegible = (valor) => {
  if (!valor) return "—";

  const fecha = new Date(valor);

  return Number.isNaN(fecha.getTime())
    ? "—"
    : fecha.toLocaleString("es-CO");
};

export async function cargarNotificacionesCentral(signal) {
  const ruta = "/api/Notificaciones/mias";

  const respuesta = await consultarCentral(ruta, { signal });

  if (Array.isArray(respuesta)) {
    return respuesta;
  }

  const lista = campo(
    respuesta,
    "items", "Items",
    "data", "Data",
    "datos", "Datos",
    "resultados", "Resultados"
  );

  if (Array.isArray(lista)) {
    return lista;
  }

  throw new Error(
    "La API de notificaciones no devolvió una lista válida."
  );
}

export const idNotificacion = (notificacion) =>
  campo(
    notificacion,
    "idNotificacion", "IdNotificacion",
    "id", "Id"
  );

export const tituloNotificacion = (notificacion) =>
  campo(
    notificacion,
    "titulo", "Titulo",
    "asunto", "Asunto"
  ) || "Notificación";

export const mensajeNotificacion = (notificacion) =>
  campo(
    notificacion,
    "mensaje", "Mensaje",
    "descripcion", "Descripcion",
    "contenido", "Contenido"
  ) || "Sin descripción";

export const categoriaNotificacion = (notificacion) => {
  const tipo = normalizar(
    campo(
      notificacion,
      "tipo", "Tipo",
      "categoria", "Categoria",
      "tipoNotificacion", "TipoNotificacion"
    )
  );

  if (tipo.includes("UNIDAD")) {
    return "unidades";
  }

  if (
    tipo.includes("INFORME") ||
    tipo.includes("CIERRE") ||
    tipo.includes("RESUEL")
  ) {
    return "informes";
  }

  if (tipo.includes("ALERTA")) {
    return "alertas";
  }

  return "otras";
};

export const noLeida = (notificacion) => {
  const leida = campo(notificacion, "leida", "Leida");

  if (typeof leida === "boolean") {
    return !leida;
  }

  if (typeof leida === "number") {
    return leida === 0;
  }

  const estado = normalizar(
    campo(notificacion, "estado", "Estado")
  );

  return ["NO LEIDA", "PENDIENTE"].includes(estado);
};

export const esUrgente = (notificacion) => {
  const prioridad = normalizar(
    campo(notificacion, "prioridad", "Prioridad")
  );

  return [
    "URGENTE",
    "CRITICA",
    "CRITICO",
    "ALTA",
  ].includes(prioridad);
};

export function kpisNotificaciones(lista) {
  const hoy = new Date().toDateString();

  return {
    total: lista.length,

    noLeidas: lista.filter(noLeida).length,

    urgentes: lista.filter(esUrgente).length,

    resueltas: lista.filter((notificacion) => {
      const estado = normalizar(
        campo(notificacion, "estado", "Estado")
      );

      const fechaValor = fechaDe(notificacion);

      if (!fechaValor) return false;

      const fecha = new Date(fechaValor);

      return (
        ["RESUELTA", "RESUELTO", "CERRADA", "CERRADO"]
          .includes(estado) &&
        !Number.isNaN(fecha.getTime()) &&
        fecha.toDateString() === hoy
      );
    }).length,
  };
}
