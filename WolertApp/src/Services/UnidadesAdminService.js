
import { apiAdminPolicia } from "./AdminPoliciaApi";

const RUTA = "/api/Unidades";

export async function listarUnidades(signal) {
  const datos = await apiAdminPolicia(RUTA, {
    method: "GET",
    signal,
  });

  if (!Array.isArray(datos)) {
    throw new Error("La API no devolvió una lista de unidades.");
  }

  return datos;
}

export async function obtenerUnidad(id, signal) {
  return apiAdminPolicia(`${RUTA}/${id}`, {
    method: "GET",
    signal,
  });
}

export async function crearUnidad(unidad) {
  return apiAdminPolicia(RUTA, {
    method: "POST",
    body: JSON.stringify(unidad),
  });
}

export async function actualizarUnidad(id, unidad) {
  return apiAdminPolicia(`${RUTA}/${id}`, {
    method: "PUT",
    body: JSON.stringify(unidad),
  });
}

export async function eliminarUnidad(id) {
  return apiAdminPolicia(`${RUTA}/${id}`, {
    method: "DELETE",
  });
}
