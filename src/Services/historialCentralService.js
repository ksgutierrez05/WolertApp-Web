
import { consultarCentral } from "./centralPoliciaApi";

const campo = (obj, ...nombres) =>
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

export const fechaLegible = (valor) => {
  if (!valor) return "—";

  const fecha = new Date(valor);

  return Number.isNaN(fecha.getTime())
    ? "—"
    : fecha.toLocaleString("es-CO");
};

const fechaDe = (obj) =>
  campo(
    obj,
    "fechaCreacion", "FechaCreacion",
    "fechaAlerta", "FechaAlerta",
    "fechaRegistro", "FechaRegistro",
    "fecha", "Fecha"
  );

const idAlerta = (obj) =>
  campo(obj, "idAlerta", "IdAlerta");

const estadoAlerta = (obj) =>
  normalizar(campo(obj, "estado", "Estado"));

const prioridadAlerta = (obj) =>
  normalizar(campo(obj, "prioridad", "Prioridad"));

const tipoAlerta = (obj) =>
  campo(
    obj,
    "nombreTipoAlerta", "NombreTipoAlerta",
    "tipoAlerta", "TipoAlerta",
    "tipo", "Tipo"
  ) || "Sin categoría";

const zonaAlerta = (obj) =>
  campo(
    obj,
    "direccion", "Direccion",
    "barrio", "Barrio",
    "nombreBarrio", "NombreBarrio",
    "ubicacion", "Ubicacion"
  ) || "No disponible";

const descripcionAlerta = (obj) =>
  campo(
    obj,
    "descripcion", "Descripcion",
    "detalle", "Detalle"
  ) || "Sin descripción";

const esResuelta = (obj) =>
  [
    "RESUELTA", "RESUELTO",
    "CERRADA", "CERRADO",
    "FINALIZADA", "FINALIZADO",
    "COMPLETADA", "COMPLETADO",
  ].includes(estadoAlerta(obj));

const esCritica = (obj) =>
  ["CRITICA", "CRITICO"].includes(prioridadAlerta(obj));

async function consultarLista(ruta, signal) {
  const respuesta = await consultarCentral(ruta, { signal });

  if (Array.isArray(respuesta)) return respuesta;

  const lista = campo(
    respuesta,
    "items", "Items",
    "data", "Data",
    "datos", "Datos",
    "resultados", "Resultados"
  );

  if (Array.isArray(lista)) return lista;

  throw new Error(
    `La respuesta de ${ruta} no contiene una lista válida.`
  );
}

export async function cargarCasosCentral(signal) {
  const rutas = [
    "/api/Alertas?alcance=todas",
    "/api/AtencionesAlerta",
    "/api/Asignaciones",
    "/api/Unidades",
  ];

  const resultados = await Promise.allSettled(
    rutas.map((ruta) => consultarLista(ruta, signal))
  );

  if (resultados[0].status === "rejected") {
    throw resultados[0].reason;
  }

  const errores = [];

  const listas = resultados.map((resultado, indice) => {
    if (resultado.status === "fulfilled") {
      return resultado.value;
    }

    errores.push(
      `${rutas[indice]}: ${resultado.reason.message}`
    );

    return [];
  });

  return {
    alertas: listas[0],
    atenciones: listas[1],
    asignaciones: listas[2],
    unidades: listas[3],
    errores,
  };
}

export function construirCasos(datos) {
  return datos.alertas.map((alerta, indice) => {
    const id = idAlerta(alerta);

    const atencion = datos.atenciones.find(
      (a) => String(idAlerta(a)) === String(id)
    );

    const asignacion = datos.asignaciones.find(
      (a) => String(idAlerta(a)) === String(id)
    );

    const unidad = datos.unidades.find(
      (u) =>
        String(campo(u, "idUnidad", "IdUnidad")) ===
        String(campo(asignacion, "idUnidad", "IdUnidad"))
    );

    return {
      clave: `${id ?? indice}`,
      alerta,
      atencion,
      asignacion,
      unidad,
      id,
      fecha: fechaDe(alerta),
      estado: estadoAlerta(alerta),
      prioridad: prioridadAlerta(alerta),
      tipo: tipoAlerta(alerta),
      zona: zonaAlerta(alerta),
      descripcion: descripcionAlerta(alerta),
      resultado:
        campo(atencion, "resultado", "Resultado") || "—",
      observaciones:
        campo(
          atencion,
          "observaciones", "Observaciones",
          "descripcionResultado", "DescripcionResultado"
        ) || "Sin observaciones",
      unidadNombre:
        campo(
          unidad,
          "nombreUnidad", "NombreUnidad",
          "codigoUnidad", "CodigoUnidad",
          "nombre", "Nombre"
        ) || "Sin unidad",
      resuelta: esResuelta(alerta),
      critica: esCritica(alerta),
      conInforme: Boolean(atencion),
    };
  });
}

export function kpisHistorial(casos) {
  return {
    totalCasos: casos.length,
    casosResueltos: casos.filter((c) => c.resuelta).length,
    casosCriticos: casos.filter((c) => c.critica).length,
    casosConInforme: casos.filter((c) => c.conInforme).length,
  };
}

export function coincideFecha(fecha, desde, hasta) {
  if (!desde && !hasta) return true;
  if (!fecha) return false;

  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return false;

  if (desde && valor < new Date(`${desde}T00:00:00`)) {
    return false;
  }

  if (hasta && valor > new Date(`${hasta}T23:59:59`)) {
    return false;
  }

  return true;
}
