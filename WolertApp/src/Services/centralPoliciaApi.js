
const API = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5039"
).replace(/\/$/, "");

export async function consultarCentral(
  ruta,
  { signal, ...opciones } = {}
) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "No hay sesión activa. Inicia sesión para consultar Central Policía."
    );
  }

  const respuesta = await fetch(`${API}${ruta}`, {
    ...opciones,
    signal,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...opciones.headers,
    },
  });

  const contenido = await respuesta.text();

  let datos = null;

  if (contenido) {
    try {
      datos = JSON.parse(contenido);
    } catch {
      datos = contenido;
    }
  }

  if (!respuesta.ok) {
    let detalle =
      typeof datos === "string"
        ? datos
        : datos?.message ||
          datos?.mensaje ||
          datos?.error ||
          datos?.title ||
          contenido;

    if (typeof detalle !== "string") {
      detalle = JSON.stringify(detalle);
    }

    if (respuesta.status === 401) {
      throw new Error(
        "Sesión expirada o token inválido. Inicia sesión nuevamente."
      );
    }

    if (respuesta.status === 403) {
      throw new Error(
        "No tienes permisos para realizar esta operación."
      );
    }

    throw new Error(
      `${ruta}: HTTP ${respuesta.status}${
        detalle ? ` - ${detalle.slice(0, 500)}` : ""
      }`
    );
  }

  return datos;
}
