
import {
  ObtenerIdUsuario,
  ObtenerPoliciaPorId,
  ObtenerUnidad,
  ListarTodasAsignaciones,
  ListarTodasAlertas,
  ListarTodasAtenciones,
  ListarMisNotificaciones,
  EsHoy,
  FormatearFecha,
} from "./PoliciaService";

const campo = (obj, ...nombres) =>
  nombres.reduce(
    (valor, nombre) => valor ?? obj?.[nombre],
    null
  );

const estadoDe = (obj, ...nombres) =>
  String(campo(obj, ...nombres) ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

const lista = (valor, nombre) => {
  if (!Array.isArray(valor)) {
    throw new Error(
      `La API devolvió un formato incorrecto en ${nombre}.`
    );
  }
  return valor;
};

const fechaDe = (obj) =>
  campo(obj, "fecha", "Fecha");

const idAlerta = (obj) =>
  campo(obj, "idAlerta", "IdAlerta");

const idUnidad = (obj) =>
  campo(obj, "idUnidad", "IdUnidad");

const idAsignacion = (obj) =>
  campo(obj, "idAsignacion", "IdAsignacion");

export async function cargarCentroPatrullero(signal) {
  const idUsuario = ObtenerIdUsuario();

  if (!idUsuario) {
    throw new Error(
      "No se encontró el ID del usuario autenticado."
    );
  }

  // Datos obligatorios del patrullero.
  const policia = await ObtenerPoliciaPorId(idUsuario);

  if (signal?.aborted) {
    throw new DOMException("Cancelado", "AbortError");
  }

  const unidadId = idUnidad(policia);

  if (unidadId == null) {
    return {
      policia,
      unidad: null,
      asignaciones: [],
      alertas: [],
      atenciones: [],
      notificaciones: [],
      errores: [],
      disponibles: {
        asignaciones: true,
        alertas: true,
        atenciones: true,
        notificaciones: true,
      },
    };
  }

  // Las consultas complementarias no deben
  // bloquear toda la pantalla si una falla.
  const consultas = [
    ["unidad", () => ObtenerUnidad(unidadId)],
    ["asignaciones", ListarTodasAsignaciones],
    ["alertas", ListarTodasAlertas],
    ["atenciones", ListarTodasAtenciones],
    ["notificaciones", ListarMisNotificaciones],
  ];

  const resultados = await Promise.allSettled(
    consultas.map(([, ejecutar]) => ejecutar())
  );

  if (signal?.aborted) {
    throw new DOMException("Cancelado", "AbortError");
  }

  const datos = {
    policia,
    unidad: null,
    asignaciones: [],
    alertas: [],
    atenciones: [],
    notificaciones: [],
    errores: [],
    disponibles: {},
  };

  resultados.forEach((resultado, indice) => {
    const nombre = consultas[indice][0];

    if (resultado.status === "rejected") {
      datos.disponibles[nombre] = false;
      datos.errores.push(
        `${nombre}: ${resultado.reason?.message || "Error"}`
      );
      return;
    }

    try {
      datos[nombre] =
        nombre === "unidad"
          ? resultado.value
          : lista(resultado.value, nombre);

      datos.disponibles[nombre] = true;
    } catch (error) {
      datos.disponibles[nombre] = false;
      datos.errores.push(error.message);
    }
  });

  // Mostrar únicamente asignaciones de su unidad.
  const asignaciones = datos.asignaciones.filter(
    (a) => String(idUnidad(a)) === String(unidadId)
  );

  const idsAlertas = new Set(
    asignaciones
      .map(idAlerta)
      .filter((id) => id != null)
      .map(String)
  );

  const alertas = datos.alertas.filter(
    (a) => idsAlertas.has(String(idAlerta(a)))
  );

  const idsAsignaciones = new Set(
    asignaciones
      .map(idAsignacion)
      .filter((id) => id != null)
      .map(String)
  );

  const atenciones = datos.atenciones.filter((a) => {
    const asignacion = campo(
      a, "idAsignacion", "IdAsignacion"
    );

    if (asignacion != null) {
      return idsAsignaciones.has(String(asignacion));
    }

    return (
      String(idUnidad(a)) === String(unidadId) &&
      idsAlertas.has(String(idAlerta(a)))
    );
  });

  return {
    ...datos,
    asignaciones,
    alertas,
    atenciones,
  };
}

export function construirResumenPatrullero(datos) {
  if (!datos) return null;

  const { policia, unidad } = datos;
  const asignaciones = datos.asignaciones || [];
  const alertas = datos.alertas || [];
  const atenciones = datos.atenciones || [];

  const activas = asignaciones.filter((a) =>
    ["ASIGNADA", "EN_ATENCION"].includes(
      estadoDe(a, "estadoAsignacion", "EstadoAsignacion")
    )
  );

  const enAtencion = activas.filter(
    (a) =>
      estadoDe(
        a, "estadoAsignacion", "EstadoAsignacion"
      ) === "EN_ATENCION"
  );

  const finalizadas = asignaciones.filter(
    (a) =>
      estadoDe(
        a, "estadoAsignacion", "EstadoAsignacion"
      ) === "FINALIZADA"
  );

  const alertasCriticas = alertas.filter(
    (a) =>
      estadoDe(a, "prioridad", "Prioridad") === "ALTA"
  );

  const alertasRecientes = [...alertas]
    .sort(
      (a, b) =>
        new Date(fechaDe(b) || 0) -
        new Date(fechaDe(a) || 0)
    )
    .slice(0, 5)
    .map((a) => ({
      id: idAlerta(a),
      tipo:
        campo(a, "tipo", "Tipo") || "Alerta",
      barrio:
        campo(a, "barrioNombre", "BarrioNombre") ||
        "Barrio no disponible",
      prioridad:
        campo(a, "prioridad", "Prioridad") || "—",
      estado:
        campo(a, "estado", "Estado") || "—",
      fecha: FormatearFecha(fechaDe(a)),
    }));

  return {
    nombrePolicia:
      campo(policia, "nombreUsuario", "NombreUsuario") ||
      "Patrullero",
    rango:
      campo(policia, "rango", "Rango") || "—",
    nombreUnidad:
      campo(unidad, "nombre", "Nombre") ||
      campo(policia, "nombreUnidad", "NombreUnidad") ||
      "Unidad no disponible",
    estadoUnidad:
      campo(unidad, "estado", "Estado") || "—",
    totalAsignaciones: asignaciones.length,
    asignacionesActivas: activas.length,
    enAtencion: enAtencion.length,
    finalizadas: finalizadas.length,
    finalizadasHoy: finalizadas.filter(
      (a) => EsHoy(fechaDe(a))
    ).length,
    alertasCriticas: alertasCriticas.length,
    alertasRecientes,
    atencionesRegistradas: atenciones.length,
    notificaciones: datos.notificaciones?.length || 0,
    asignacionesRecientes: [...asignaciones]
      .sort(
        (a, b) =>
          new Date(fechaDe(b) || 0) -
          new Date(fechaDe(a) || 0)
      )
      .slice(0, 5)
      .map((a) => ({
        id: idAsignacion(a),
        idAlerta: idAlerta(a),
        estado: campo(
          a, "estadoAsignacion", "EstadoAsignacion"
        ) || "—",
        tipo: campo(
          a, "tipoParticipacion", "TipoParticipacion"
        ) || "—",
        fecha: FormatearFecha(fechaDe(a)),
      })),
  };
}
