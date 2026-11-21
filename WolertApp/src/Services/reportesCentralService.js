
import {
  cargarCasosCentral as consultarCasos,
  construirCasos,
  fechaLegible,
  coincideFecha,
} from "./historialCentralService";

// Mantener las exportaciones utilizadas
// por Reportes.jsx.

export {
  construirCasos,
  fechaLegible,
  coincideFecha,
};

// ==================================================
// CONSULTAR INFORMACIÓN
// ==================================================

export async function cargarCasosCentral(signal) {
  return consultarCasos(signal);
}

// ==================================================
// ESTADÍSTICAS DE REPORTES
// ==================================================

export function kpisReportes(casos = []) {
  return {
    total: casos.length,

    resueltos: casos.filter(
      (caso) => caso.resuelta
    ).length,

    pendientes: casos.filter(
      (caso) => caso.estado === "PENDIENTE"
    ).length,

    conInforme: casos.filter(
      (caso) => caso.conInforme
    ).length,
  };
}
