
const API = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5039"
).replace(/\/$/, "");

export async function consultarCentral(
  ruta,
  { signal, ...opciones } = {}
) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "No hay sesión activa. Inicia sesión para consultar Central Policía."
    );
  }

  let respuesta;
  try {
    respuesta = await fetch(`${API}${ruta}`, {
      ...opciones,
      signal,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...opciones.headers,
      },
    });
  } catch (cause) {
    if (cause?.name === "AbortError") throw cause;
    const error = new Error("No fue posible conectar con el servidor. Inténtalo de nuevo.");
    error.userMessage = error.message;
    error.technicalDetails = cause?.message || String(cause);
    error.cause = cause;
    throw error;
  }

  const contenido = await respuesta.text();

  let datos = null;

  if (contenido) {
    try {
      datos = JSON.parse(contenido);
    } catch {
      datos = contenido;
    }
  }

  if (!respuesta.ok) {
    const detalle =
      typeof datos === "string"
        ? datos
        : datos?.message ||
          datos?.mensaje ||
          datos?.error ||
          datos?.title ||
          contenido;

    const detalleTecnico = typeof detalle === "string"
      ? detalle.slice(0, 1000)
      : JSON.stringify(detalle).slice(0, 1000);
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
      404: "No se encontró la información solicitada.",
      409: mensajeAmigable || "La operación entra en conflicto con el estado actual.",
      422: mensajeAmigable || "La información no cumple con las validaciones requeridas.",
    };
    const safeMessage = mensajesPorEstado[respuesta.status] ||
      (respuesta.status >= 500
        ? "El servidor no pudo completar la operación. Inténtalo de nuevo más tarde."
        : mensajeAmigable || "No fue posible completar la operación.");
    const error = new Error(safeMessage);
    error.status = respuesta.status;
    error.userMessage = safeMessage;
    error.technicalDetails = `${ruta}: HTTP ${respuesta.status}${detalleTecnico ? ` - ${detalleTecnico}` : ""}`;
    throw error;
  }

  return datos;
}
