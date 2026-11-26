
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const ENDPOINT = `${API_URL}/api/SolicitudesApoyo`;

// ======================================================
// TOKEN DE AUTENTICACIÓN
// ======================================================

function obtenerToken() {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  if (!token) {
    throw new Error("No hay una sesión activa. Inicia sesión nuevamente.");
  }

  return token;
}

// ======================================================
// PETICIONES AL BACKEND
// ======================================================

async function realizarPeticion(ruta = "", metodo = "GET", cuerpo) {
  if (!API_URL) {
    throw new Error(
      "No está configurado VITE_API_URL en el archivo .env."
    );
  }

  const token = obtenerToken();

  let respuesta;

  try {
    respuesta = await fetch(`${ENDPOINT}${ruta}`, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(cuerpo !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
      },
      ...(cuerpo !== undefined
        ? { body: JSON.stringify(cuerpo) }
        : {}),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el backend. Verifica que esté encendido."
    );

  }

  const texto = await respuesta.text();

  let datos;

  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = texto;
  }

  if (!respuesta.ok) {
    const detalle = typeof datos === "string"
      ? datos
      : datos?.message || datos?.mensaje || datos?.error || datos?.title || texto;
    const detalleTecnico = String(detalle || "").slice(0, 1000);
    const mensajeBackend = typeof detalle === "string" ? detalle.trim() : "";
    const mensajeAmigable = mensajeBackend &&
      mensajeBackend.length < 180 &&
      !/exception|stack|\/api\/| at \w+\.|\bselect\b|\binsert\b|\bupdate\b/i.test(mensajeBackend)
      ? mensajeBackend
      : null;
    const mensajesPorEstado = {
      400: mensajeAmigable || "Revisa la información e inténtalo nuevamente.",
      401: "Tu sesión expiró. Inicia sesión nuevamente.",
      403: "No tienes permisos para realizar esta operación.",
      404: "No se encontró la solicitud de apoyo.",
      409: mensajeAmigable || "La solicitud cambió y no puede actualizarse en este momento.",
      422: mensajeAmigable || "La información no cumple con las validaciones requeridas.",
    };
    const userMessage = mensajesPorEstado[respuesta.status] ||
      (respuesta.status >= 500
        ? "El servidor no pudo completar la operación. Inténtalo de nuevo más tarde."
        : mensajeAmigable || "No fue posible completar la operación.");
    const error = new Error(userMessage);
    error.status = respuesta.status;
    error.userMessage = userMessage;
    error.technicalDetails = `/api/SolicitudesApoyo${ruta}: HTTP ${respuesta.status}${detalleTecnico ? ` - ${detalleTecnico}` : ""}`;
    throw error;

  }

  return datos;
}

// ======================================================
// LISTAR SOLICITUDES DE APOYO
// ======================================================

export async function listarSolicitudesApoyo() {
  return realizarPeticion();
}

// ======================================================
// CONSULTAR SOLICITUD POR ID
// ======================================================

export async function obtenerSolicitudApoyo(idSolicitud) {
  if (idSolicitud == null) {
    throw new Error("Debes indicar el ID de la solicitud.");
  }

  return realizarPeticion(`/${idSolicitud}`);
}

// ======================================================
// CREAR SOLICITUD DE APOYO
// UTILIZADA POR MARÍA
// ======================================================

export async function crearSolicitudApoyo(
  idAlerta,
  idAsignacion,
  centralDestino,
  motivo
) {
  if (idAlerta == null || idAsignacion == null) {
    throw new Error("La alerta y la asignación son obligatorias.");
  }

  const motivoLimpio = motivo?.trim();

  if (!motivoLimpio) {
    throw new Error("Debes indicar el motivo de la solicitud.");
  }

  if (motivoLimpio.length > 200) {
    throw new Error("El motivo no puede superar los 200 caracteres.");
  }

  return realizarPeticion("", "POST", {
    idAlerta,
    idAsignacion,
    centralDestino,
    motivo: motivoLimpio,
  });
}

// ======================================================
// SOLICITAR APOYO POLICIAL
// UTILIZADA POR ATENCIÓN DE TRÁNSITO
// ======================================================

export async function solicitarApoyoPolicial(caso, motivo) {
  if (caso?.idAlerta == null) {
    throw new Error("No se encontró el ID de la alerta.");
  }

  if (caso?.idAsignacion == null) {
    throw new Error("La alerta no tiene una asignación válida.");
  }

  return crearSolicitudApoyo(
    caso.idAlerta,
    caso.idAsignacion,
    "POLICIA",
    motivo
  );
}

// ======================================================
// RESPONDER SOLICITUD
// ACEPTAR O RECHAZAR
// ======================================================

export async function responderSolicitudApoyo(
  idSolicitud,
  respuesta,
  observacion
) {
  if (idSolicitud == null) {
    throw new Error("No se encontró el ID de la solicitud.");
  }

  // Compatible con una llamada que envía un DTO completo.
  const datosRespuesta =
    respuesta !== null &&
    typeof respuesta === "object"
      ? respuesta
      : { respuesta, observacion };

  return realizarPeticion(
    `/${idSolicitud}/responder`,
    "POST",
    datosRespuesta
  );
}

// ======================================================
// ASIGNAR UNIDAD POLICIAL
// ======================================================

export async function asignarUnidadApoyo(
  idSolicitud,
  datosAsignacion
) {
  if (idSolicitud == null) {
    throw new Error("No se encontró el ID de la solicitud.");
  }

  return realizarPeticion(
    `/${idSolicitud}/asignar-unidad`,
    "POST",
    datosAsignacion
  );
}

