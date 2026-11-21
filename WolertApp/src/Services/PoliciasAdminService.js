
import { apiAdminPolicia } from "./AdminPoliciaApi";

const RUTA_POLICIAS = "/api/Policias";
const RUTA_USUARIOS = "/api/Usuarios";

export async function listarPolicias(signal) {
  const datos = await apiAdminPolicia(RUTA_POLICIAS, {
    method: "GET",
    signal,
  });

  if (!Array.isArray(datos)) {
    throw new Error("No se pudo obtener la lista de policías.");
  }

  return datos;
}

export async function obtenerPolicia(id, signal) {
  return apiAdminPolicia(`${RUTA_POLICIAS}/${id}`, {
    method: "GET",
    signal,
  });
}

export async function listarUsuariosDisponibles(signal) {
  const [usuarios, policias] = await Promise.all([
    apiAdminPolicia(RUTA_USUARIOS, {
      method: "GET",
      signal,
    }),
    listarPolicias(signal),
  ]);

  if (!Array.isArray(usuarios)) {
    throw new Error("La API no devolvió usuarios.");
  }

  const idsRegistrados = new Set(
    policias.map(p => Number(p.idUsuario))
  );

  return usuarios.filter(usuario =>
    usuario.rolNombre?.toUpperCase() === "POLICIA" &&
    usuario.estado?.toUpperCase() === "ACTIVO" &&
    !idsRegistrados.has(Number(usuario.idUsuario))
  );
}

export async function crearPolicia(policia) {
  return apiAdminPolicia(RUTA_POLICIAS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(policia),
  });
}

export async function actualizarPolicia(id, policia) {
  return apiAdminPolicia(`${RUTA_POLICIAS}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(policia),
  });
}

export async function eliminarPolicia(id) {
  return apiAdminPolicia(`${RUTA_POLICIAS}/${id}`, {
    method: "DELETE",
  });
}
