const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const ENDPOINT = `${API_URL}/api/SolicitudesApoyo`;

console.log("Backend configurado:", API_URL);
console.log("Ruta de solicitudes:", ENDPOINT);

function obtenerToken() {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  if (!token) {
    throw new Error("No hay una sesión activa. Inicia sesión nuevamente.");
  }

  return token;
}

async function realizarPeticion(ruta = "", opciones = {}) {
  if (!API_URL) {
    throw new Error(
      "No está configurado VITE_API_URL en el archivo .env."
    );
  }

  const token = obtenerToken();

  let respuesta;

  try {
    respuesta = await fetch(`${ENDPOINT}${ruta}`, {
      ...opciones,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...opciones.headers,
      },
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el backend. Verifica que esté encendido y que VITE_API_URL sea correcto."
    );
  }


if (!respuesta.ok) {
  const texto = await respuesta.text();

  let mensajeError;

  try {
    const error = JSON.parse(texto);

    mensajeError =
      error.message ||
      error.mensaje ||
      error.detail ||
      error.title ||
      texto;
  } catch {
    mensajeError = texto;
  }

  if (respuesta.status === 400) {
    throw new Error(
      mensajeError || "Los datos enviados no son válidos."
    );
  }

  if (respuesta.status === 401) {
    throw new Error("Tu sesión ha expirado.");
  }

  if (respuesta.status === 403) {
    throw new Error(
      "No tienes permisos para solicitar apoyo policial."
    );
  }

  if (respuesta.status === 404) {
    throw new Error(
      "No se encontró la ruta en el backend."
    );
  }

  throw new Error(
    mensajeError ||
      `Error ${respuesta.status} al procesar la solicitud.`
  );
}


  if (respuesta.status === 204) {
    return null;
  }

  const contenido = await respuesta.text();

  return contenido ? JSON.parse(contenido) : null;
}

// ======================================================
// SOLICITAR APOYO POLICIAL
// ======================================================

export async function solicitarApoyoPolicial(caso, motivo) {
  if (caso?.idAlerta == null) {
    throw new Error("No se encontró el ID de la alerta.");
  }

  if (caso?.idAsignacion == null) {
    throw new Error("La alerta no tiene una asignación válida.");
  }

  const motivoLimpio = motivo?.trim();

  if (!motivoLimpio) {
    throw new Error("Debes escribir el motivo de la solicitud.");
  }

  if (motivoLimpio.length > 200) {
    throw new Error(
      "El motivo no puede superar los 200 caracteres."
    );
  }

  const datos = {
    idAlerta: caso.idAlerta,
    idAsignacion: caso.idAsignacion,
    centralDestino: "POLICIA",
    motivo: motivoLimpio,
  };

  return realizarPeticion("", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

// ======================================================
// CONSULTAR TODAS LAS SOLICITUDES
// ======================================================

export async function listarSolicitudesApoyo() {
  return realizarPeticion();
}

// ======================================================
// CONSULTAR UNA SOLICITUD POR ID
// ======================================================

export async function obtenerSolicitudApoyo(idSolicitud) {
  if (idSolicitud == null) {
    throw new Error("Debes indicar el ID de la solicitud.");
  }

  return realizarPeticion(`/${idSolicitud}`);
}

// ======================================================
// RESPONDER UNA SOLICITUD
// ======================================================
// El DTO debe coincidir con el backend.

export async function responderSolicitudApoyo(
  idSolicitud,
  datosRespuesta
) {
  if (idSolicitud == null) {
    throw new Error("No se encontró el ID de la solicitud.");
  }

  return realizarPeticion(`/${idSolicitud}/responder`, {
    method: "POST",
    body: JSON.stringify(datosRespuesta),
  });
}

// ======================================================
// ASIGNAR UNIDAD POLICIAL
// ======================================================
// El DTO debe coincidir con el backend.

export async function asignarUnidadApoyo(
  idSolicitud,
  datosAsignacion
) {
  if (idSolicitud == null) {
    throw new Error("No se encontró el ID de la solicitud.");
  }

  return realizarPeticion(`/${idSolicitud}/asignar-unidad`, {
    method: "POST",
    body: JSON.stringify(datosAsignacion),
  });
}
