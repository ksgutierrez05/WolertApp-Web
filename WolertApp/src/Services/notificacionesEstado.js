
import {
  ObtenerIdUsuario,
} from "./PoliciaService";

export const claveLecturas = () => {
  const idUsuario =
    ObtenerIdUsuario() ?? "sin-usuario";

  return `notificacionesLeidas:${idUsuario}`;
};

export function leerIdsLeidos() {
  try {
    const guardados = localStorage.getItem(
      claveLecturas()
    );

    const datos = JSON.parse(
      guardados || "[]"
    );

    return Array.isArray(datos)
      ? datos.map(String)
      : [];
  } catch {
    return [];
  }
}

export function guardarIdsLeidos(ids) {
  const unicos = [
    ...new Set(ids.map(String)),
  ];

  localStorage.setItem(
    claveLecturas(),
    JSON.stringify(unicos)
  );

  window.dispatchEvent(
    new Event("wolertapp:notificaciones")
  );

  return unicos;
}
