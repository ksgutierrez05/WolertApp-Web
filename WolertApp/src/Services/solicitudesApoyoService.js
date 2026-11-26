// Consume los endpoints existentes. No modifica el backend.

const API =
  import.meta.env.VITE_API_URL || "https://localhost:7138";

async function llamar(ruta, metodo = "GET", cuerpo) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Debes iniciar sesión.");
  }

  let respuesta;
  try {
    respuesta = await fetch(
      `${API}/api/SolicitudesApoyo${ruta}`,
      {
        method: metodo,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          ...(cuerpo
            ? { "Content-Type": "application/json" }
            : {}),
        },
        ...(cuerpo
          ? { body: JSON.stringify(cuerpo) }
          : {}),
      }
    );
  } catch (cause) {
    const error = new Error("No fue posible conectar con el servidor. Inténtalo de nuevo.");
    error.userMessage = error.message;
    error.technicalDetails = cause?.message || String(cause);
    error.cause = cause;
    throw error;
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

export const listarSolicitudesApoyo = () =>
  llamar("");

export const crearSolicitudApoyo = (
  idAlerta,
  idAsignacion,
  centralDestino,
  motivo
) =>
  llamar("", "POST", {
    idAlerta,
    idAsignacion,
    centralDestino,
    motivo,
  });

export const responderSolicitudApoyo = (
  id,
  respuesta,
  observacion
) =>
  llamar(`/${id}/responder`, "POST", {
    respuesta,
    observacion,
  });

export const asignarUnidadApoyo = (id) =>
  llamar(`/${id}/asignar-unidad`, "POST");
