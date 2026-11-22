import { consultarTransito } from "./transitoApi";

const RUTA = "/api/UnidadTransitoes";

function lista(datos) {
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.$values)) return datos.$values;
  throw new Error("La API no devolvió una lista válida.");
}

export async function listarUnidades() {
  return lista(await consultarTransito(RUTA));
}

export async function obtenerUnidad(id) {
  return consultarTransito(`${RUTA}/${id}`);
}

export async function listarBarriosUnidades() {
  return lista(await consultarTransito("/api/Barrios"));
}

function preparar(datos) {
  const nombre = String(datos.nombre ?? "").trim();
  const estado = String(datos.estado ?? "").trim().toUpperCase();
  if (!nombre || nombre.length > 20) throw new Error("El nombre debe tener entre 1 y 20 caracteres.");
  if (!["OPERATIVA", "FUERA_DE_SERVICIO", "INACTIVA"].includes(estado)) throw new Error("Selecciona un estado válido.");
  if (datos.latitud === "" || datos.longitud === "" || datos.latitud == null || datos.longitud == null) throw new Error("La latitud y la longitud son obligatorias.");
  const latitud = Number(datos.latitud);
  const longitud = Number(datos.longitud);
  if (!Number.isFinite(latitud) || latitud < -90 || latitud > 90) throw new Error("Latitud inválida (-90 a 90).");
  if (!Number.isFinite(longitud) || longitud < -180 || longitud > 180) throw new Error("Longitud inválida (-180 a 180).");
  const barrioId = datos.barrioId === "" || datos.barrioId == null ? null : Number(datos.barrioId);
  if (barrioId !== null && (!Number.isInteger(barrioId) || barrioId <= 0)) throw new Error("Barrio inválido.");
  return { nombre, estado, latitud, longitud, barrioId };
}

export async function crearUnidad(datos) {
  return consultarTransito(RUTA, { method: "POST", body: JSON.stringify(preparar(datos)) });
}

export async function actualizarUnidad(id, datos) {
  return consultarTransito(`${RUTA}/${id}`, { method: "PUT", body: JSON.stringify(preparar(datos)) });
}

export async function desactivarUnidad(unidad) {
  return actualizarUnidad(unidad.idUnidadTransito, { ...unidad, estado: "INACTIVA" });
}
