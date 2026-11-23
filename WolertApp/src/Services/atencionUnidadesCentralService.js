
import { consultarCentral } from "./centralPoliciaApi";

export const obtenerCampo = (obj, ...nombres) =>
  nombres.reduce(
    (valor, nombre) => valor ?? obj?.[nombre],
    null
  );

export const normalizar = (valor) =>
  String(valor ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const formatearFecha = (valor) => {
  if (!valor) return "—";

  const fecha = new Date(valor);

  return Number.isNaN(fecha.getTime())
    ? "—"
    : fecha.toLocaleString("es-CO");
};

const consultarLista = async (ruta, signal) => {
  const resultado = await consultarCentral(ruta, { signal });

  if (!Array.isArray(resultado)) {
    throw new Error(
      `${ruta}: la API no devolvió una lista válida.`
    );
  }

  return resultado;
};

export async function cargarAtencionesCentral(signal) {
  const [atenciones, alertas, asignaciones, unidades] =
    await Promise.all([
      consultarLista("/api/AtencionesAlerta", signal),
      consultarLista("/api/Alertas?alcance=todas", signal),
      consultarLista("/api/Asignaciones", signal),
      consultarLista("/api/Unidades", signal),
    ]);

  return {
    atenciones,
    alertas,
    asignaciones,
    unidades,
  };
}

export async function cargarUnidadesCentral(signal) {
  const [unidades, policias, asignaciones, alertas] =
    await Promise.all([
      consultarLista("/api/Unidades", signal),
      consultarLista("/api/Policias", signal),
      consultarLista("/api/Asignaciones", signal),
      consultarLista("/api/Alertas?alcance=todas", signal),
    ]);

  return {
    unidades,
    policias,
    asignaciones,
    alertas,
  };
}

export const idDeAlerta = (a) =>
  obtenerCampo(a, "idAlerta", "IdAlerta");

export const idDeUnidad = (u) =>
  obtenerCampo(u, "idUnidad", "IdUnidad");

export const idDeAtencion = (a) =>
  obtenerCampo(
    a,
    "idAtencion",
    "IdAtencion",
    "idAtencionAlerta",
    "IdAtencionAlerta"
  );

export const idDeAsignacion = (a) =>
  obtenerCampo(a, "idAsignacion", "IdAsignacion");

export const estadoDe = (obj) =>
  normalizar(obtenerCampo(obj, "estado", "Estado"));

export const estadoFinalizado = (estado) =>
  [
    "FINALIZADA",
    "FINALIZADO",
    "CERRADA",
    "CERRADO",
    "COMPLETADA",
    "COMPLETADO",
    "RESUELTA",
    "RESUELTO",
  ].includes(normalizar(estado));

export const nombreUnidad = (u) =>
  obtenerCampo(
    u,
    "nombreUnidad",
    "NombreUnidad",
    "nombre",
    "Nombre",
    "codigoUnidad",
    "CodigoUnidad",
    "placa",
    "Placa"
  ) || `Unidad #${idDeUnidad(u) ?? "—"}`;

export const nombrePolicia = (p) => {
  if (!p) return "No disponible";

  const nombre = [
    obtenerCampo(p, "primerNombre", "PrimerNombre"),
    obtenerCampo(p, "segundoNombre", "SegundoNombre"),
    obtenerCampo(p, "primerApellido", "PrimerApellido"),
    obtenerCampo(p, "segundoApellido", "SegundoApellido"),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    nombre ||
    obtenerCampo(
      p,
      "nombreCompleto",
      "NombreCompleto",
      "nombre",
      "Nombre"
    ) ||
    "No disponible"
  );
};

export const tipoDeAlerta = (a) =>
  obtenerCampo(
    a,
    "nombreTipoAlerta",
    "NombreTipoAlerta",
    "tipoAlerta",
    "TipoAlerta",
    "tipo",
    "Tipo"
  ) || "Alerta";

export const ubicacionDeAlerta = (a) =>
  obtenerCampo(
    a,
    "direccion",
    "Direccion",
    "nombreBarrio",
    "NombreBarrio",
    "barrio",
    "Barrio",
    "ubicacion",
    "Ubicacion"
  ) || "No disponible";

export function resumenAtenciones(atenciones) {
  const porRevisar = [
    "PENDIENTE",
    "POR REVISAR",
    "REPORTADA",
    "REPORTADO",
  ];

  const enRevision = [
    "EN REVISION",
    "EN PROCESO",
    "EN ATENCION",
    "ACTIVA",
    "ACTIVO",
  ];

  return {
    porRevisar: atenciones.filter((a) =>
      porRevisar.includes(estadoDe(a))
    ).length,

    enRevision: atenciones.filter((a) =>
      enRevision.includes(estadoDe(a))
    ).length,

    finalizadas: atenciones.filter((a) =>
      estadoFinalizado(estadoDe(a))
    ).length,
  };
}

export function resumenUnidades(unidades) {
  return {
    total: unidades.length,

    disponibles: unidades.filter((u) =>
      ["DISPONIBLE", "LIBRE"].includes(estadoDe(u))
    ).length,

    enServicio: unidades.filter((u) =>
      [
        "EN SERVICIO",
        "EN CAMINO",
        "EN SITIO",
        "EN EL SITIO",
      ].includes(estadoDe(u))
    ).length,

    ocupadas: unidades.filter((u) =>
      [
        "OCUPADA",
        "OCUPADO",
        "EN ATENCION",
      ].includes(estadoDe(u))
    ).length,
  };
}

// Registrar informe policial
export function crearAtencionCentral(datos) {
  return consultarCentral("/api/AtencionesAlerta", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datos),
  });
}

// Actualizar o finalizar informe
export function actualizarAtencionCentral(idAtencion, datos) {
  return consultarCentral(
    `/api/AtencionesAlerta/${encodeURIComponent(idAtencion)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos),
    }
  );
}

// Cerrar alerta como RESUELTA
export function cerrarAlertaCentral(idAlerta) {
  return consultarCentral(
    `/api/Alertas/${encodeURIComponent(idAlerta)}/cerrar`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        estadoFinal: "RESUELTA"
      }),
    }
  );
}
