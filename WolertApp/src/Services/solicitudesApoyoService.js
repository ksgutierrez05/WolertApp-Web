// Consume los endpoints existentes. No modifica el backend.

const API =
  import.meta.env.VITE_API_URL || "https://localhost:7138";

async function llamar(ruta, metodo = "GET", cuerpo) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Debes iniciar sesión.");
  }

  const respuesta = await fetch(
    `${API}/api/SolicitudesApoyo${ruta}`,
    {
      method: metodo,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(cuerpo
          ? { "Content-Type": "application/json" }
          : {}),
      },
      ...(cuerpo
        ? { body: JSON.stringify(cuerpo) }
        : {}),
    }
  );

  const texto = await respuesta.text();

  let datos;

  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = texto;
  }

  if (!respuesta.ok) {
    throw new Error(
      typeof datos === "string"
        ? datos
        : datos?.message ||
          datos?.title ||
          `Error HTTP ${respuesta.status}`
    );
  }

  return datos;
}

export const listarSolicitudesApoyo = () =>
  llamar("");

export const crearSolicitudApoyo = (
  idAlerta,
  idAsignacion,
  centralDestino,
  motivo
) =>
  llamar("", "POST", {
    idAlerta,
    idAsignacion,
    centralDestino,
    motivo,
  });

export const responderSolicitudApoyo = (
  id,
  respuesta,
  observacion
) =>
  llamar(`/${id}/responder`, "POST", {
    respuesta,
    observacion,
  });

export const asignarUnidadApoyo = (id) =>
  llamar(`/${id}/asignar-unidad`, "POST");