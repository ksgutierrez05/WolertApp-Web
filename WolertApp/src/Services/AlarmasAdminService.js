
import { apiAdminPolicia } from "./AdminPoliciaApi";

const RUTA = "/api/Alarmas";

export async function listarAlarmas(signal) {
  const datos = await apiAdminPolicia(RUTA, {
    method: "GET",
    signal,
  });

  if (!Array.isArray(datos)) {
    throw new Error(
      "La API no devolvió una lista válida de alarmas."
    );
  }

  return datos;
}

export async function obtenerAlarma(id) {
  return apiAdminPolicia(`${RUTA}/${id}`, {
    method: "GET",
  });
}

export async function crearAlarma(datos) {
  return apiAdminPolicia(RUTA, {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export async function modificarAlarma(id, datos) {
  return apiAdminPolicia(`${RUTA}/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

export async function eliminarAlarma(id) {
  return apiAdminPolicia(`${RUTA}/${id}`, {
    method: "DELETE",
  });
}

export async function listarBarriosAlarmas() {
  const datos = await apiAdminPolicia("/api/Barrios", {
    method: "GET",
  });

  if (!Array.isArray(datos)) {
    throw new Error(
      "La API no devolvió una lista válida de barrios."
    );
  }

  return datos;
}
