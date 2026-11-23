
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
    const mensajeError =
      typeof datos === "string"
        ? datos
        : datos?.message ||
          datos?.mensaje ||
          datos?.detail ||
          datos?.title ||
          "";

    if (respuesta.status === 401) {
      throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
    }

    if (respuesta.status === 403) {
      throw new Error(
        "No tienes permisos para realizar esta acción."
      );
    }

    if (respuesta.status === 404) {
      throw new Error(
        "No se encontró la ruta solicitada en el backend."
      );
    }

    throw new Error(
      mensajeError || `Error HTTP ${respuesta.status}`
    );
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
