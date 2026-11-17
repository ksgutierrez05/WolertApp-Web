
import { apiAdminPolicia } from "./AdminPoliciaApi";

const RUTA = "/api/Alarmas";

export async function listarAlarmas(signal) {
  const datos = await apiAdminPolicia(RUTA, {
    method: "GET",
    signal,
  });

  if (!Array.isArray(datos)) {
    throw new Error("La API no devolvió una lista de alarmas.");
  }

  return datos;
}

export async function obtenerAlarma(id, signal) {
  return apiAdminPolicia(`${RUTA}/${id}`, {
    method: "GET",
    signal,
  });
}

export async function crearAlarma(alarma) {
  return apiAdminPolicia(RUTA, {
    method: "POST",
    body: JSON.stringify(alarma),
  });
}

export async function actualizarAlarma(id, alarma) {
  return apiAdminPolicia(`${RUTA}/${id}`, {
    method: "PUT",
    body: JSON.stringify(alarma),
  });
}

export async function eliminarAlarma(id) {
  return apiAdminPolicia(`${RUTA}/${id}`, {
    method: "DELETE",
  });
}
