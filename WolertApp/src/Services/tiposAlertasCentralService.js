import {
  listarTiposAlertaCentral,
  normalizarCentral,
} from "./centralTransitoService";

export async function listarTiposTransito() {
  const datos = await listarTiposAlertaCentral();

  return datos.filter(tipo =>
    normalizarCentral(
      tipo.centralResponsable ??
      tipo.central_responsable
    ) === "TRANSITO"
  );
}

export function obtenerNombreTipo(tipo) {
  return tipo?.nombre ??
    tipo?.nombreTipoAlerta ??
    tipo?.tipoAlerta ??
    "Sin nombre";
}

export function obtenerPrioridadTipo(tipo) {
  return normalizarCentral(
    tipo?.prioridad ?? tipo?.prioridadAlerta
  );
}

export function esPrioridadAlta(tipo) {
  return obtenerPrioridadTipo(tipo) === "ALTA";
}