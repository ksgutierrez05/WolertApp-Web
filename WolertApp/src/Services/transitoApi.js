const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5039";

export function obtenerSesionTransito() {
  let usuario = {};

  for (const almacenamiento of [sessionStorage, localStorage]) {
    for (const clave of ["usuario", "user", "usuarioActual", "currentUser"]) {
      const valor = almacenamiento.getItem(clave);
      if (!valor) continue;

      try {
        const datos = JSON.parse(valor);

        if (datos && typeof datos === "object" && !Array.isArray(datos)) {
          usuario = datos;
          break;
        }
      } catch {
        // Ignorar valores que no sean JSON.
      }
    }

    if (Object.keys(usuario).length > 0) break;
  }

  const token =
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken") ||
    usuario.token ||
    usuario.accessToken ||
    import.meta.env.VITE_DEV_TOKEN || // solo para pruebas
    null;

  const idUsuario = Number(
    usuario.idUsuario ??
    usuario.IdUsuario ??
    localStorage.getItem("idUsuario") ??
    import.meta.env.VITE_DEV_ID_USUARIO ??
    0
  );

  return {
    token,
    idUsuario:
      Number.isFinite(idUsuario) && idUsuario > 0 ? idUsuario : null,
    usuario,
  };
}

export async function consultarTransito(ruta, opciones = {}) {
  const { token } = obtenerSesionTransito();
  const headers = new Headers(opciones.headers);

  headers.set("Accept", "application/json");

  if (opciones.body != null && !(opciones.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let respuesta;

  try {
    respuesta = await fetch(`${API_URL}/${ruta.replace(/^\/+/, "")}`, {
      ...opciones,
      headers,
    });
  } catch {
    throw new Error(
      `No se pudo conectar con la API en ${API_URL}. ` +
      "Verifica que el backend esté encendido."
    );
  }

  if (respuesta.status === 401) {
    throw new Error("401: falta el token o venció. Inicia sesión.");
  }

  if (respuesta.status === 403) {
    throw new Error("403: tu rol no tiene permiso para esta acción");
  }

  if (!respuesta.ok) {
    const texto = await respuesta.text();
    let mensaje = texto;

    try {
      const json = JSON.parse(texto);
      mensaje = json.message || json.mensaje || json.title || texto;
    } catch {
      // Mantener el mensaje original.
    }

    throw new Error(
      `HTTP ${respuesta.status}: ` + (mensaje || "Error al consultar la API")
    );
  }

  if (respuesta.status === 204) return null;

  const contenido = await respuesta.text();
  if (!contenido) return null;

  try {
    return JSON.parse(contenido);
  } catch {
    return contenido;
  }
}