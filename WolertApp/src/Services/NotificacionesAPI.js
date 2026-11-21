const API = (import.meta.env.VITE_API_URL || "http://localhost:5039").replace(/\/+$/, "");

function headers() {
  const token = localStorage.getItem("token");
  return { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function consultarNotificaciones(ruta, signal) {
  const respuesta = await fetch(`${API}${ruta}`, { headers: headers(), signal });
  if (!respuesta.ok) {
    const mensaje = await respuesta.text();
    throw new Error(mensaje || `No se pudieron cargar las notificaciones (HTTP ${respuesta.status}).`);
  }
  return respuesta.json();
}

export function listarNotificaciones(signal) {
  return consultarNotificaciones("/api/Notificaciones", signal);
}

export function listarMisNotificaciones(signal) {
  return consultarNotificaciones("/api/Notificaciones/mias", signal);
}

function claveLecturas() {
  return `wolert:notificaciones:leidas:${localStorage.getItem("idUsuario") || "sin-usuario"}`;
}

export function obtenerNotificacionesLeidas() {
  try {
    const ids = JSON.parse(localStorage.getItem(claveLecturas()) || "[]");
    return Array.isArray(ids) ? ids.map(Number) : [];
  } catch {
    return [];
  }
}

export function guardarNotificacionesLeidas(ids) {
  const leidas = [...new Set(ids.map(Number))];
  localStorage.setItem(claveLecturas(), JSON.stringify(leidas));
  window.dispatchEvent(new CustomEvent("wolert:notificaciones-leidas", { detail: leidas }));
}

const DESTINOS = [
  { palabras: ["usuario", "cuenta", "perfil"], ruta: "/admin/usuarios", menu: "Usuarios" },
  { palabras: ["alarma", "sirena"], ruta: "/admin/alarmas", menu: "Alarmas" },
  { palabras: ["comuna"], ruta: "/admin/comunas", menu: "Comunas" },
  { palabras: ["barrio"], ruta: "/admin/barrios", menu: "Barrios" },
  { palabras: ["tipo de alerta", "catálogo", "catalogo"], ruta: "/admin/tipos", menu: "Tipos" },
  { palabras: ["reporte", "informe"], ruta: "/admin/reportes", menu: "Reportes" },
  { palabras: ["estadística", "estadistica"], ruta: "/admin/estadisticas", menu: "Estadísticas" },
  { palabras: ["configuración", "configuracion", "sistema"], ruta: "/admin/configuracion", menu: "Configuración" },
];

export function destinoNotificacion(notificacion, audiencia = "admin") {
  const mensaje = String(notificacion?.mensaje || "").toLocaleLowerCase("es-CO");
  if (audiencia === "ciudadano") {
    if (["vecino", "comunidad", "cerca", "cercana"].some((palabra) => mensaje.includes(palabra))) return { ruta: "/ciudadano/alertas", menu: "Alertas de la comunidad" };
    if (["estado", "atención", "atencion", "asignad", "tu alerta", "alerta reportada"].some((palabra) => mensaje.includes(palabra)) || notificacion?.idAlerta != null) return { ruta: "/ciudadano/mis-alertas", menu: "Mis alertas" };
    if (["vecino", "vecinos"].some((palabra) => mensaje.includes(palabra))) return { ruta: "/ciudadano/vecinos", menu: "Vecinos" };
    return { ruta: "/ciudadano/alertas", menu: "Alertas" };
  }
  if (notificacion?.idAlerta != null) return { ruta: "/admin/alertas", menu: "Alertas" };
  return DESTINOS.find((destino) => destino.palabras.some((palabra) => mensaje.includes(palabra))) || { ruta: "/admin/alertas", menu: "Alertas" };
}
