
import {
  cargarCasosCentral as consultarCasos,
  construirCasos,
  fechaLegible,
  coincideFecha,
} from "./historialCentralService";

export { construirCasos, fechaLegible, coincideFecha };

export async function cargarCasosCentral(signal) {
  return consultarCasos(signal);
}

export function kpisReportes(casos) {
  return {
    total: casos.length,
    resueltos: casos.filter((caso) => caso.resuelta).length,
    pendientes: casos.filter((caso) => !caso.resuelta).length,
    conInforme: casos.filter((caso) => caso.conInforme).length,
  };
}
