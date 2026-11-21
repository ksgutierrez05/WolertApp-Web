
import { consultarCentral } from "./centralPoliciaApi";

export const obtenerCampo = (obj, ...nombres) =>
  nombres.reduce((v, nombre) => v ?? obj?.[nombre], null);

export const normalizar = (valor) =>
  String(valor ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");

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
    throw new Error(`${ruta}: respuesta inválida.`);
  }
  return resultado;
};

export async function cargarAtencionesCentral(signal) {
  // Las atenciones son la consulta indispensable.
  const atenciones = await consultarLista(
    "/api/AtencionesAlerta",
    signal
  );

  // El fallo de una consulta complementaria no oculta
  // los informes policiales ya obtenidos.
  const consultas = [
    ["alertas", "/api/Alertas?alcance=todas"],
    ["asignaciones", "/api/Asignaciones"],
    ["unidades", "/api/Unidades"],
  ];

  const resultados = await Promise.allSettled(
    consultas.map(([, ruta]) => consultarLista(ruta, signal))
  );

  if (signal?.aborted) {
    throw new DOMException("Consulta cancelada", "AbortError");
  }

  const datos = { atenciones, alertas: [], asignaciones: [], unidades: [] };
  const errores = [];

  resultados.forEach((resultado, i) => {
    const [nombre, ruta] = consultas[i];
    if (resultado.status === "fulfilled") {
      datos[nombre] = resultado.value;
    } else {
      errores.push(
        `${ruta}: ${resultado.reason?.message || "Error de consulta"}`
      );
    }
  });

  return { ...datos, errores };
}

export async function cargarUnidadesCentral(signal) {
  const rutas = [
    "/api/Unidades",
    "/api/Policias",
    "/api/Asignaciones",
    "/api/Alertas?alcance=todas",
  ];

  const [unidades, policias, asignaciones, alertas] =
    await Promise.all(
      rutas.map((ruta) => consultarLista(ruta, signal))
    );

  return { unidades, policias, asignaciones, alertas };
}

export const idDeAlerta = (a) =>
  obtenerCampo(a, "idAlerta", "IdAlerta");

export const idDeUnidad = (u) =>
  obtenerCampo(u, "idUnidad", "IdUnidad");

export const idDeAtencion = (a) =>
  obtenerCampo(a, "idAtencion", "IdAtencion");

export const idDeAsignacion = (a) =>
  obtenerCampo(a, "idAsignacion", "IdAsignacion");

export const estadoDe = (obj) =>
  normalizar(
    obtenerCampo(
      obj,
      "estadoFinal",
      "EstadoFinal",
      "estadoAsignacion",
      "EstadoAsignacion",
      "estado",
      "Estado"
    )
  );

export const estadoFinalizado = (estado) =>
  [
    "FINALIZADA",
    "FINALIZADO",
    "RESUELTA",
    "CANCELADA",
    "CERRADA",
    "COMPLETADA",
  ].includes(normalizar(estado));

export const nombreUnidad = (u) =>
  obtenerCampo(
    u,
    "unidadNombre",
    "UnidadNombre",
    "nombreUnidad",
    "NombreUnidad",
    "nombre",
    "Nombre"
  ) || `Unidad #${idDeUnidad(u) ?? "—"}`;

export const nombrePolicia = (p) => {
  if (!p) return "No disponible";

  const nombre = [
    obtenerCampo(p, "primerNombre", "PrimerNombre"),
    obtenerCampo(p, "segundoNombre", "SegundoNombre"),
    obtenerCampo(p, "primerApellido", "PrimerApellido"),
    obtenerCampo(p, "segundoApellido", "SegundoApellido"),
  ].filter(Boolean).join(" ");

  return nombre ||
    obtenerCampo(p, "nombreCompleto", "NombreCompleto", "nombre", "Nombre") ||
    "No disponible";
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

export function resumenAtenciones(atenciones = []) {
  return {
    porRevisar: atenciones.filter(
      (a) => !estadoDe(a)
    ).length,

    enRevision: atenciones.filter(
      (a) => estadoDe(a) === "EN_PROCESO"
    ).length,

    finalizadas: atenciones.filter(
      (a) => estadoFinalizado(estadoDe(a))
    ).length,
  };
}

export function resumenUnidades(unidades = []) {
  return {
    total: unidades.length,
    disponibles: unidades.filter(
      (u) =>
        ["OPERATIVA", "DISPONIBLE", "LIBRE"].includes(estadoDe(u))
    ).length,
    enServicio: unidades.filter(
      (u) =>
        ["ACTIVA", "EN_SERVICIO", "EN_CAMINO"].includes(estadoDe(u))
    ).length,
    ocupadas: unidades.filter(
      (u) =>
        ["ACTIVA", "OCUPADA", "EN_ATENCION"].includes(estadoDe(u))
    ).length,
  };
}
