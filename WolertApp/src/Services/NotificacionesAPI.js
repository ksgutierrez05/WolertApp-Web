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

export async function listarMisNotificaciones(signal) {
  const tokenSesion = localStorage.getItem("token");
  const usuarioSesion = Number(localStorage.getItem("idUsuario"));
  const lista = await consultarNotificaciones("/api/Notificaciones/mias", signal);

  // Descarta respuestas tardías si la sesión cambió mientras la API respondía.
  if (
    signal?.aborted ||
    !tokenSesion ||
    !Number.isInteger(usuarioSesion) ||
    usuarioSesion <= 0 ||
    tokenSesion !== localStorage.getItem("token") ||
    usuarioSesion !== Number(localStorage.getItem("idUsuario"))
  ) {
    return [];
  }

  if (!Array.isArray(lista)) {
    throw new Error("La API no devolvió una lista válida de notificaciones.");
  }

  // La bandeja personal solo acepta registros asociados al usuario de esta sesión.
  return lista.filter((notificacion) =>
    Number(notificacion.idUsuario ?? notificacion.IdUsuario) === usuarioSesion
  );
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
    const esAvisoComunidad = ["vecino", "comunidad", "cerca", "cercana"]
      .some((palabra) => mensaje.includes(palabra));
    if (esAvisoComunidad) {
      return { ruta: "/ciudadano/alertas", menu: "Alertas de la comunidad" };
    }

    const palabrasDeSeguimiento = [
      "estado",
      "atención",
      "atencion",
      "asignad",
      "tu alerta",
      "alerta reportada",
    ];
    const esActualizacionDeAlerta = palabrasDeSeguimiento.some((palabra) =>
      mensaje.includes(palabra),
    );
    if (esActualizacionDeAlerta || notificacion?.idAlerta != null) {
      return { ruta: "/ciudadano/mis-alertas", menu: "Mis alertas" };
    }

    if (["vecino", "vecinos"].some((palabra) => mensaje.includes(palabra))) {
      return { ruta: "/ciudadano/vecinos", menu: "Vecinos" };
    }
    return { ruta: "/ciudadano/alertas", menu: "Alertas" };
  }

  if (notificacion?.idAlerta != null) {
    return { ruta: "/admin/alertas", menu: "Alertas" };
  }

  return DESTINOS.find((destino) =>
    destino.palabras.some((palabra) => mensaje.includes(palabra)),
  ) || { ruta: "/admin/alertas", menu: "Alertas" };
}