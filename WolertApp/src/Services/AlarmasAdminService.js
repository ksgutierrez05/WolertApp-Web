
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
