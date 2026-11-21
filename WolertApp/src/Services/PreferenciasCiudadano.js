const PREFS = { avisosComunidad: true, avisosMisAlertas: true, modoCompacto: false };

function clave() {
  return `wolert:preferencias-ciudadano:${localStorage.getItem("idUsuario") || "sin-usuario"}`;
}

export function obtenerPreferenciasCiudadano() {
  try {
    return { ...PREFS, ...JSON.parse(localStorage.getItem(clave()) || "{}") };
  } catch {
    return { ...PREFS };
  }
}

export function guardarPreferenciasCiudadano(preferencias) {
  const actualizadas = { ...PREFS, ...preferencias };
  localStorage.setItem(clave(), JSON.stringify(actualizadas));
  document.body.classList.toggle("modo-compacto", actualizadas.modoCompacto);
  window.dispatchEvent(new CustomEvent("wolert:preferencias-ciudadano", { detail: actualizadas }));
  return actualizadas;
}

export function notificacionPermitidaCiudadano(notificacion, preferencias) {
  const mensaje = String(notificacion?.mensaje || "").toLocaleLowerCase("es-CO");
  const comunidad = ["vecino", "comunidad", "cerca", "cercana"].some((palabra) => mensaje.includes(palabra));
  if (comunidad) return preferencias.avisosComunidad;
  if (notificacion?.idAlerta != null || ["estado", "atención", "atencion", "asignad", "tu alerta", "alerta reportada"].some((palabra) => mensaje.includes(palabra))) return preferencias.avisosMisAlertas;
  return preferencias.avisosComunidad;
}
