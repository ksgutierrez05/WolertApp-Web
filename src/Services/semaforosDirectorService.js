
import { consultarTransito } from "./transitoApi";

const RUTA = "/api/Semaforos";

export async function listarSemaforos() {
  const datos = await consultarTransito(RUTA);

  if (!Array.isArray(datos)) {
    throw new Error(
      "La API no devolvió una lista de semáforos."
    );
  }

  return datos;
}

export async function obtenerSemaforo(id) {
  return consultarTransito(`${RUTA}/${id}`);
}

export async function listarBarrios() {
  const datos = await consultarTransito("/api/Barrios");

  if (!Array.isArray(datos)) {
    throw new Error(
      "La API no devolvió una lista de barrios."
    );
  }

  return datos;
}

function prepararSemaforo(datos) {
  return {
    codigo: datos.codigo.trim().toUpperCase(),
    direccion: datos.direccion.trim(),
    tipo: datos.tipo.trim().toUpperCase(),
    estado: datos.estado.trim().toUpperCase(),
    idBarrio: Number(datos.idBarrio),
    latitud: Number(datos.latitud),
    longitud: Number(datos.longitud),
    observacion: datos.observacion.trim(),
  };
}

export async function crearSemaforo(datos) {
  return consultarTransito(RUTA, {
    method: "POST",
    body: JSON.stringify(prepararSemaforo(datos)),
  });
}

export async function actualizarSemaforo(id, datos) {
  return consultarTransito(`${RUTA}/${id}`, {
    method: "PUT",
    body: JSON.stringify(prepararSemaforo(datos)),
  });
}

export async function eliminarSemaforo(id) {
  return consultarTransito(`${RUTA}/${id}`, {
    method: "DELETE",
  });
}
