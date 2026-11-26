export function mensajeSeguro(error, fallback = "No fue posible completar la operación.") {
  if (error?.userMessage) return error.userMessage;
  const message = typeof error === "string" ? error : error?.message;
  if (!message) return fallback;
  if (error?.status === 401) return "Tu sesión expiró. Inicia sesión nuevamente.";
  if (error?.status === 403) return "No tienes permisos para realizar esta operación.";
  if (/HTTP\s+\d{3}|\/api\/|failed to fetch|networkerror|stack trace|exception|\bat\s+\w+\s*\(/i.test(message)) {
    return fallback;
  }
  return message.length > 200 ? fallback : message;
}
