
const API = (
  import.meta.env.VITE_API_URL || "https://localhost:7138"
).replace(/\/+$/, "");

export function obtenerToken() {
  return localStorage.getItem("token");
}

export async function consultarAPI(ruta, signal) {
  const token = obtenerToken();

  const respuesta = await fetch(`${API}${ruta}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    },
    signal,
  });

  if (!respuesta.ok) {
    const mensaje = await respuesta.text();

    throw new Error(
      `${ruta}: ${mensaje || `Error HTTP ${respuesta.status}`}`
    );
  }

  if (respuesta.status === 204) {
    return null;
  }

  return respuesta.json();
}

export async function obtenerHistorial(signal) {
  const rutas = {
    atenciones: "/api/AtencionesAlerta",
    asignaciones: "/api/Asignaciones",
    alertas: "/api/Alertas?alcance=todas",
  };

  const [atenciones, asignaciones, alertas] =
    await Promise.all([
      consultarAPI(rutas.atenciones, signal),
      consultarAPI(rutas.asignaciones, signal),
      consultarAPI(rutas.alertas, signal),
    ]);

  if (
    !Array.isArray(atenciones) ||
    !Array.isArray(asignaciones) ||
    !Array.isArray(alertas)
  ) {
    throw new Error(
      "La API devolvió información con formato incorrecto."
    );
  }

  return {
    atenciones,
    asignaciones,
    alertas,
  };
}

export async function obtenerDatosEstadisticas(signal) {
  const rutas = [
    ["alertas", "/api/Alertas?alcance=todas"],
    ["atenciones", "/api/AtencionesAlerta"],
    ["asignaciones", "/api/Asignaciones"],
    ["policias", "/api/Policias"],
    ["unidades", "/api/Unidades"],
    ["alarmas", "/api/Alarmas"],
  ];

  const resultados = await Promise.allSettled(
    rutas.map(([, ruta]) => consultarAPI(ruta, signal))
  );

  if (signal?.aborted) {
    throw new DOMException(
      "Consulta cancelada",
      "AbortError"
    );
  }

  const datos = {};
  const errores = [];

  resultados.forEach((resultado, index) => {
    const [nombre, ruta] = rutas[index];

    if (
      resultado.status === "fulfilled" &&
      Array.isArray(resultado.value)
    ) {
      datos[nombre] = resultado.value;
    } else {
      datos[nombre] = [];

      errores.push(
        `${ruta}: ${
          resultado.status === "rejected"
            ? resultado.reason?.message
            : "Respuesta no válida"
        }`
      );
    }
  });

  return { datos, errores };
}
