
const API = (
  import.meta.env.VITE_API_URL || "https://localhost:7138"
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

  if (!respuesta.ok) {
    let detalle = "";

    try {
      detalle = await respuesta.text();
    } catch {
      // Respuesta sin cuerpo.
    }

    throw new Error(
      `${ruta}: HTTP ${respuesta.status}${
        detalle ? ` - ${detalle.slice(0, 180)}` : ""
      }`
    );
  }

  return respuesta.status === 204
    ? null
    : respuesta.json();
}
