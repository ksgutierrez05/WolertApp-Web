
import { consultarCentral } from "./centralPoliciaApi";

// ==================================================
// UTILIDADES
// ==================================================

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
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");

const texto = (valor, defecto = "—") =>
  valor == null || String(valor).trim() === ""
    ? defecto
    : String(valor);

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
    "fechaReporte", "FechaReporte",
    "fechaRegistro", "FechaRegistro",
    "fecha", "Fecha"
  );

const idAlerta = (obj) =>
  campo(obj, "idAlerta", "IdAlerta", "ID_ALERTA");

const idAsignacion = (obj) =>
  campo(obj, "idAsignacion", "IdAsignacion");

const idAtencion = (obj) =>
  campo(obj, "idAtencion", "IdAtencion");

const estadoAlerta = (obj) =>
  normalizar(campo(obj, "estado", "Estado"));

const prioridadAlerta = (obj) =>
  normalizar(campo(obj, "prioridad", "Prioridad"));

const tipoAlerta = (obj) =>
  texto(
    campo(
      obj,
      "nombreTipoAlerta", "NombreTipoAlerta",
      "tipoAlerta", "TipoAlerta",
      "tipo", "Tipo"
    ),
    "Sin categoría"
  );

const zonaAlerta = (obj) =>
  texto(
    campo(
      obj,
      "direccion", "Direccion",
      "nombreBarrio", "NombreBarrio",
      "barrio", "Barrio",
      "ubicacion", "Ubicacion"
    ),
    "No disponible"
  );

const descripcionAlerta = (obj) =>
  texto(
    campo(
      obj,
      "descripcion", "Descripcion",
      "detalle", "Detalle"
    ),
    "Sin descripción"
  );

const nombreUnidad = (obj) =>
  campo(
    obj,
    "unidadNombre", "UnidadNombre",
    "nombreUnidad", "NombreUnidad",
    "codigoUnidad", "CodigoUnidad",
    "nombre", "Nombre"
  );

const esResuelta = (obj) =>
  [
    "RESUELTA",
    "RESUELTO",
    "CANCELADA",
    "CERRADA",
    "CERRADO",
    "FINALIZADA",
    "FINALIZADO",
  ].includes(estadoAlerta(obj));

const esCritica = (obj) =>
  [
    "ALTA",
    "CRITICA",
    "CRITICO",
    "URGENTE",
  ].includes(prioridadAlerta(obj));

// ==================================================
// CONSULTAS A LA API
// ==================================================

async function consultarLista(ruta, signal) {
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
    `${ruta}: la API no devolvió una lista válida.`
  );
}

export async function cargarCasosCentral(signal) {
  const rutas = [
    ["alertas", "/api/Alertas?alcance=todas"],
    ["atenciones", "/api/AtencionesAlerta"],
    ["asignaciones", "/api/Asignaciones"],
  ];

  const resultados = await Promise.allSettled(
    rutas.map(([, ruta]) => consultarLista(ruta, signal))
  );

  if (signal?.aborted) {
    throw new DOMException(
      "Consulta cancelada",
      "AbortError"
    );
  }

  // Las alertas son necesarias para construir
  // el historial. Las demás consultas son
  // complementarias.
  if (resultados[0].status === "rejected") {
    throw resultados[0].reason;
  }

  const datos = {
    alertas: [],
    atenciones: [],
    asignaciones: [],
    unidades: [],
    errores: [],
  };

  resultados.forEach((resultado, indice) => {
    const [nombre, ruta] = rutas[indice];

    if (resultado.status === "fulfilled") {
      datos[nombre] = resultado.value;
    } else {
      datos.errores.push(
        `${ruta}: ${
          resultado.reason?.message ||
          "No se pudo consultar"
        }`
      );
    }
  });

  return datos;
}

// ==================================================
// CONSTRUCCIÓN DEL HISTORIAL
// ==================================================

export function construirCasos(datos = {}) {
  const alertas = datos.alertas || [];
  const atenciones = datos.atenciones || [];
  const asignaciones = datos.asignaciones || [];
  const unidades = datos.unidades || [];

  const atencionesPorAlerta = new Map();
  const asignacionesPorAlerta = new Map();

  for (const atencion of atenciones) {
    const id = idAlerta(atencion);
    if (id == null) continue;

    const clave = String(id);

    if (!atencionesPorAlerta.has(clave)) {
      atencionesPorAlerta.set(clave, []);
    }

    atencionesPorAlerta.get(clave).push(atencion);
  }

  for (const asignacion of asignaciones) {
    const id = idAlerta(asignacion);
    if (id == null) continue;

    const clave = String(id);

    if (!asignacionesPorAlerta.has(clave)) {
      asignacionesPorAlerta.set(clave, []);
    }

    asignacionesPorAlerta.get(clave).push(asignacion);
  }

  return alertas.map((alerta, indice) => {
    const id = idAlerta(alerta);
    const claveId = String(id);

    const atencionesCaso = [
      ...(atencionesPorAlerta.get(claveId) || []),
    ].sort(
      (a, b) =>
        Number(idAtencion(b) || 0) -
        Number(idAtencion(a) || 0)
    );

    const asignacionesCaso = [
      ...(asignacionesPorAlerta.get(claveId) || []),
    ].sort(
      (a, b) =>
        Number(idAsignacion(b) || 0) -
        Number(idAsignacion(a) || 0)
    );

    const atencion = atencionesCaso[0] || null;

    const asignacion =
      asignacionesCaso.find(
        (a) =>
          normalizar(
            campo(
              a,
              "tipoParticipacion",
              "TipoParticipacion"
            )
          ) === "PRINCIPAL"
      ) ||
      asignacionesCaso[0] ||
      null;

    const idUnidad = campo(
      asignacion,
      "idUnidad",
      "IdUnidad"
    );

    const unidad = unidades.find(
      (u) =>
        idUnidad != null &&
        String(campo(u, "idUnidad", "IdUnidad")) ===
          String(idUnidad)
    ) || null;

    const observaciones = campo(
      atencion,
      "observacion", "Observacion",
      "observaciones", "Observaciones",
      "descripcionResultado", "DescripcionResultado"
    );

    const descripcionAtencion = campo(
      atencion,
      "descripcion", "Descripcion",
      "detalle", "Detalle"
    );

    const resultadoRegistrado = campo(
      atencion,
      "resultado", "Resultado",
      "estadoFinal", "EstadoFinal"
    );

    const estado = estadoAlerta(alerta);

    return {
      clave: String(id ?? `caso-${indice}`),

      alerta,
      atencion,
      asignacion,
      unidad,

      id,
      fecha: fechaDe(alerta),
      estado,
      prioridad: prioridadAlerta(alerta),
      tipo: tipoAlerta(alerta),
      zona: zonaAlerta(alerta),
      descripcion: descripcionAlerta(alerta),

      resultado: resultadoRegistrado
        ? texto(resultadoRegistrado).replaceAll("_", " ")
        : atencion
          ? "Atención registrada"
          : "Sin informe",

      observaciones:
        observaciones ||
        descripcionAtencion ||
        "Sin observaciones registradas",

      unidadNombre:
        nombreUnidad(asignacion) ||
        nombreUnidad(atencion) ||
        nombreUnidad(unidad) ||
        (idUnidad != null
          ? `Unidad #${idUnidad}`
          : "Sin unidad"),

      estadoAsignacion: normalizar(
        campo(
          asignacion,
          "estadoAsignacion", "EstadoAsignacion",
          "estado", "Estado"
        )
      ),

      fechaAtencion: campo(
        atencion,
        "fechaAtencion", "FechaAtencion",
        "fecha", "Fecha"
      ),

      resuelta: esResuelta(alerta),
      critica: esCritica(alerta),
      conInforme: atencionesCaso.length > 0,

      totalAtenciones: atencionesCaso.length,
      totalAsignaciones: asignacionesCaso.length,
    };
  });
}

// ==================================================
// ESTADÍSTICAS DE HISTORIAL
// ==================================================

export function kpisHistorial(casos = []) {
  return {
    totalCasos: casos.length,

    casosResueltos: casos.filter(
      (caso) => caso.resuelta
    ).length,

    casosCriticos: casos.filter(
      (caso) => caso.critica
    ).length,

    casosConInforme: casos.filter(
      (caso) => caso.conInforme
    ).length,
  };
}

// ==================================================
// FILTROS DE FECHA
// ==================================================

export function coincideFecha(fecha, desde, hasta) {
  if (!desde && !hasta) {
    return true;
  }

  if (!fecha) {
    return false;
  }

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return false;
  }

  if (desde) {
    const inicio = new Date(`${desde}T00:00:00`);

    if (valor < inicio) {
      return false;
    }
  }

  if (hasta) {
    const fin = new Date(`${hasta}T23:59:59.999`);

    if (valor > fin) {
      return false;
    }
  }

  return true;
}
