
import { apiAdminPolicia } from "./AdminPoliciaApi";

async function consultarLista(ruta, signal) {
  const datos = await apiAdminPolicia(ruta, {
    method: "GET",
    signal,
  });

  if (!Array.isArray(datos)) {
    throw new Error(`${ruta}: la API no devolvió una lista.`);
  }

  return datos;
}

export async function obtenerCentroOperaciones(signal) {
  const recursos = [
    ["alertas", "/api/Alertas?alcance=todas"],
    ["policias", "/api/Policias"],
    ["unidades", "/api/Unidades"],
    ["asignaciones", "/api/Asignaciones"],
    ["atenciones", "/api/AtencionesAlerta"],
  ];

  const resultados = await Promise.allSettled(
    recursos.map(([, ruta]) =>
      consultarLista(ruta, signal)
    )
  );

  if (signal?.aborted) {
    throw new DOMException(
      "Consulta cancelada",
      "AbortError"
    );
  }

  const datos = {};
  const errores = [];

  resultados.forEach((resultado, indice) => {
    const [nombre, ruta] = recursos[indice];

    if (resultado.status === "fulfilled") {
      datos[nombre] = resultado.value;
    } else {
      datos[nombre] = null;

      errores.push(
        `${ruta}: ${
          resultado.reason?.message ||
          "No se pudo consultar."
        }`
      );
    }
  });

  return { datos, errores };
}
