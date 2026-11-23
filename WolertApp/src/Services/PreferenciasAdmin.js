const DEFECTO = { mostrarCampana: true, compacto: false };

function clave() {
  return `wolertapp_prefs_${localStorage.getItem("idUsuario") || "sin-usuario"}`;
}

export function obtenerPreferenciasAdmin() {
  try {
    const guardadas = JSON.parse(localStorage.getItem(clave()) || "{}");
    return { ...DEFECTO, mostrarCampana: guardadas.mostrarCampana ?? guardadas.notificaciones ?? true, compacto: guardadas.compacto ?? false };
  } catch {
    return { ...DEFECTO };
  }
}

export function guardarPreferenciasAdmin(preferencias) {
  const actualizadas = { ...DEFECTO, ...preferencias };
  localStorage.setItem(clave(), JSON.stringify({ ...actualizadas, notificaciones: actualizadas.mostrarCampana }));
  document.body.classList.toggle("modo-compacto", actualizadas.compacto);
  window.dispatchEvent(new CustomEvent("wolert:preferencias-admin", { detail: actualizadas }));
  return actualizadas;
}
