
const normalizar = (v) => String(v ?? "").trim().toUpperCase();

const esHoy = (valor) => {
  if (!valor) return false;
  const fecha = new Date(valor);
  const hoy = new Date();
  return !Number.isNaN(fecha.getTime()) &&
    fecha.getFullYear() === hoy.getFullYear() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getDate() === hoy.getDate();
};

export function calcularIndicadores(datos = {}) {
  const { alertas, policias, unidades, asignaciones, atenciones } = datos;

  const contar = (lista, condicion) =>
    Array.isArray(lista) ? lista.filter(condicion).length : null;

  return {
    alertasActivas: contar(
      alertas,
      a => !["RESUELTA", "CANCELADA"].includes(normalizar(a.estado))
    ),
    alertasCriticas: contar(
      alertas,
      a => normalizar(a.prioridad) === "ALTA"
    ),
    pendientes: contar(
      alertas,
      a => normalizar(a.estado) === "PENDIENTE"
    ),
    totalAlertasHoy: contar(alertas, a => esHoy(a.fecha)),
    resueltasHoy: contar(
      atenciones,
      a => normalizar(a.estadoFinal) === "FINALIZADA" &&
        esHoy(a.fechaAtencion)
    ),
    atencionesFinalizadasHoy: contar(
      atenciones,
      a => normalizar(a.estadoFinal) === "FINALIZADA" &&
        esHoy(a.fechaAtencion)
    ),
    enAtencion: contar(
      atenciones,
      a => normalizar(a.estadoFinal) === "EN_PROCESO"
    ),
    patrullerosDisponibles: contar(
      policias,
      p => normalizar(p.estado) === "DISPONIBLE"
    ),
    // Aproximación: policías activos vinculados a una unidad.
    patrullerosServicio: contar(
      policias,
      p => normalizar(p.estado) === "ACTIVO" &&
        p.idUnidad != null
    ),
    totalPolicias: Array.isArray(policias) ? policias.length : null,
    totalUnidades: Array.isArray(unidades) ? unidades.length : null,
    asignacionesActivas: contar(
      asignaciones,
      a => ["ASIGNADA", "EN_ATENCION"].includes(
        normalizar(a.estadoAsignacion)
      )
    )
  };
}

export function formatearFecha(valor) {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "—";

  return fecha.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function obtenerAlertasRecientes(alertas) {
  if (!Array.isArray(alertas)) return [];

  return [...alertas]
    .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))
    .slice(0, 6)
    .map(a => ({
      id: a.idAlerta,
      tipo: a.tipo || `Alerta #${a.idAlerta}`,
      barrio: a.barrioNombre || "Barrio no disponible",
      estado: a.estado || "Sin estado",
      hora: formatearFecha(a.fecha)
    }));
}

import { apiAdminPolicia } from "./AdminPoliciaApi";

export async function obtenerCentroOperaciones(signal) {
  const recursos = [
    ["alertas", "/api/Alertas?alcance=todas"],
    ["policias", "/api/Policias"],
    ["unidades", "/api/Unidades"],
    ["asignaciones", "/api/Asignaciones"],
    ["atenciones", "/api/AtencionesAlerta"],
  ];

  const resultados = await Promise.allSettled(
    recursos.map(async ([nombre, ruta]) => {
      const respuesta = await apiAdminPolicia(ruta, { signal });

      const lista = Array.isArray(respuesta)
        ? respuesta
        : respuesta?.items ??
          respuesta?.data ??
          respuesta?.datos ??
          respuesta?.resultados;

      if (!Array.isArray(lista)) {
        throw new Error(`${nombre}: respuesta no válida`);
      }

      return [nombre, lista];
    })
  );

  const datos = {};
  const errores = [];

  resultados.forEach((resultado, indice) => {
    const nombre = recursos[indice][0];

    if (resultado.status === "fulfilled") {
      const [clave, lista] = resultado.value;
      datos[clave] = lista;
    } else {
      datos[nombre] = null;
      errores.push(
        `${nombre}: ${
          resultado.reason?.message || "Error de consulta"
        }`
      );
    }
  });

  return { datos, errores };
}
