
import { consultarCentral } from "./centralPoliciaApi";

const VACIO = "No disponible";

const valor = (dato) =>
  dato == null || String(dato).trim() === ""
    ? VACIO
    : String(dato).trim();

function usuarioSesion() {
  for (const storage of [sessionStorage, localStorage]) {
    for (const clave of [
      "usuario",
      "user",
      "usuarioActual",
      "currentUser",
    ]) {
      try {
        const dato = JSON.parse(storage.getItem(clave));
        if (dato && typeof dato === "object") {
          return dato.usuario || dato;
        }
      } catch {
        // Ignorar claves que no contienen JSON.
      }
    }
  }
  return {};
}

function idDesdeToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const datos = JSON.parse(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))
    );

    return (
      datos.nameid ||
      datos[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      datos.sub ||
      null
    );
  } catch {
    return null;
  }
}

export async function obtenerPerfilCentral(signal) {
  const sesion = usuarioSesion();

  const id =
    sesion.idUsuario ??
    sesion.IdUsuario ??
    sesion.id ??
    idDesdeToken();

  if (!id || !/^\d+$/.test(String(id))) {
    throw new Error(
      "No se encontró el identificador del usuario autenticado."
    );
  }

  const usuario = await consultarCentral(
    `/api/Usuarios/${id}`,
    { signal }
  );

  const nombres = [
    usuario.primerNombre ?? usuario.PrimerNombre,
    usuario.segundoNombre ?? usuario.SegundoNombre,
  ].filter(Boolean).join(" ");

  const apellidos = [
    usuario.primerApellido ?? usuario.PrimerApellido,
    usuario.segundoApellido ?? usuario.SegundoApellido,
  ].filter(Boolean).join(" ");

  return {
    disponible: true,
    idUsuario: id,
    nombres: valor(nombres),
    apellidos: valor(apellidos),
    identificacion: valor(usuario.cedula ?? usuario.Cedula),
    correo: valor(usuario.correo ?? usuario.Correo),
    telefono: valor(usuario.telefono ?? usuario.Telefono),
    usuario: valor(usuario.username ?? usuario.Username),
    rol: valor(usuario.rolNombre ?? usuario.RolNombre),
    estado: valor(usuario.estado ?? usuario.Estado),
    barrio: valor(usuario.barrioNombre ?? usuario.BarrioNombre),
  };
}
