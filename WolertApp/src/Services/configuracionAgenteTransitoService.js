
import {
  obtenerPerfilAgente,
  obtenerUnidadAgente,
} from "./agenteTransitoService";

import {
  obtenerSesionTransito,
} from "./transitoApi";

export async function cargarPerfilAgenteTransito() {
  const [agente, unidad] = await Promise.all([
    obtenerPerfilAgente(),
    obtenerUnidadAgente(),
  ]);

  return {
    agente,
    unidad,
    sesion: obtenerSesionTransito(),
  };
}

export function construirPerfilAgente(datos) {
  const { agente, unidad, sesion } = datos;
  const usuario = sesion.usuario || {};

  const nombre =
    agente.nombreUsuario ||
    agente.nombreCompleto ||
    usuario.nombreCompleto ||
    usuario.nombre ||
    usuario.username ||
    "Agente de Tránsito";

  const iniciales = nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0))
    .join("")
    .toUpperCase();

  return {
    nombre,
    iniciales,
    grupo: unidad?.nombre || "No asignado",
    zona:
      unidad?.nombreBarrio ||
      unidad?.nombreComuna ||
      "No registrada",
    cedula:
      agente.cedula ||
      agente.numeroDocumento ||
      usuario.cedula ||
      "No disponible",
    correo:
      agente.correo ||
      agente.email ||
      usuario.correo ||
      usuario.email ||
      "No disponible",
    usuario:
      agente.username ||
      usuario.username ||
      "No disponible",
    estado:
      agente.estadoAgente ||
      "No disponible",
    idUsuario:
      agente.idUsuario ??
      sesion.idUsuario,
  };
}
