
const API = (
  import.meta.env.VITE_API_URL || "http://localhost:5039"
).replace(/\/$/, "");

export function ObtenerToken() {
  return localStorage.getItem("token");
}

// Función general para consumir los endpoints del administrador.
export async function apiAdminPolicia(ruta, opciones = {}) {
  const token = ObtenerToken();

  const headers = {
    Accept: "application/json",
    ...(opciones.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opciones.headers,
  };

  const respuesta = await fetch(`${API}${ruta}`, {
    ...opciones,
    headers,
  });

  if (!respuesta.ok) {
    const mensaje = await respuesta.text();

    throw new Error(
      mensaje || `Error HTTP ${respuesta.status}`
    );
  }

  if (respuesta.status === 204) {
    return null;
  }

  const contenido = await respuesta.text();

  if (!contenido) return null;

  try {
    return JSON.parse(contenido);
  } catch {
    return contenido;
  }
}

// Listar policías
export async function ListarPolicias() {
  const datos = await apiAdminPolicia("/api/Policias");

  if (!Array.isArray(datos)) {
    throw new Error("La API no devolvió una lista de policías");
  }

  return datos;
}

// Obtener policía por ID
export async function ObtenerPoliciaPorId(id) {
  return await apiAdminPolicia(`/api/Policias/${id}`);
}

export default apiAdminPolicia;
