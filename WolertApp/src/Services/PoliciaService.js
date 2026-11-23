
const API = import.meta.env.VITE_API_URL || 'http://localhost:5039';

export const ObtenerToken = () => localStorage.getItem('token');

export function ObtenerIdUsuario() {
  const guardado = Number(localStorage.getItem('idUsuario'));

  if (Number.isInteger(guardado) && guardado > 0) {
    return guardado;
  }

  const token = ObtenerToken();
  if (!token) return null;

  try {
    const parte = token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const claims = JSON.parse(atob(parte));

    const id = Number(
      claims.nameid ??
      claims.sub ??
      claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    );

    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

async function solicitud(ruta, opciones = {}) {
  const token = ObtenerToken();

  if (!token) {
    throw new Error('No hay sesión activa. Inicia sesión.');
  }

  const respuesta = await fetch(`${API}${ruta}`, {
    ...opciones,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opciones.headers || {})
    }
  });

  if (!respuesta.ok) {
    const texto = await respuesta.text();
    throw new Error(
      `Error ${respuesta.status}: ${texto || respuesta.statusText}`
    );
  }

  if (respuesta.status === 204) return null;

  return respuesta.json();
}

export const ObtenerPoliciaPorId = id =>
  solicitud(`/api/Policias/${id}`);

export const ObtenerUnidad = id =>
  solicitud(`/api/Unidades/${id}`);

export const ListarTodasAsignaciones = () =>
  solicitud('/api/Asignaciones');

export const ListarTodasAlertas = () =>
  solicitud('/api/Alertas');

export const ListarTodasAtenciones = () =>
  solicitud('/api/AtencionesAlerta');

export const ListarMisNotificaciones = () =>
  solicitud('/api/Notificaciones/mias');

export const RegistrarLlegada = id =>
  solicitud(`/api/Asignaciones/${id}/llegada`, {
    method: 'POST'
  });

export const FinalizarAsignacion = id =>
  solicitud(`/api/Asignaciones/${id}/finalizar`, {
    method: 'POST'
  });

export async function CrearAtencion(datos) {
  return solicitud('/api/AtencionesAlerta', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });
}

export async function ActualizarAtencion(id, datos) {
  return solicitud(`/api/AtencionesAlerta/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });
}

export async function ObtenerDatosPatrullero() {
  const idUsuario = ObtenerIdUsuario();

  if (!idUsuario) {
    throw new Error(
      'No se encontró idUsuario en la sesión. Revisa el login.'
    );
  }

  const policia = await ObtenerPoliciaPorId(idUsuario);

  if (policia.idUnidad == null) {
    return {
      idUsuario,
      policia,
      unidad: null,
      asignaciones: [],
      atenciones: [],
      alertas: []
    };
  }

  const [
    unidad,
    todasAsignaciones,
    todasAtenciones,
    todasAlertas
  ] = await Promise.all([
    ObtenerUnidad(policia.idUnidad),
    ListarTodasAsignaciones(),
    ListarTodasAtenciones(),
    ListarTodasAlertas()
  ]);

  const asignaciones = todasAsignaciones.filter(
    a => Number(a.idUnidad) === Number(policia.idUnidad)
  );

  const atenciones = todasAtenciones.filter(
    a => Number(a.idPolicia) === idUsuario
  );

  const idsAlertas = new Set(
    asignaciones.map(a => Number(a.idAlerta))
  );

  const alertas = todasAlertas.filter(
    a => idsAlertas.has(Number(a.idAlerta))
  );

  return {
    idUsuario,
    policia,
    unidad,
    asignaciones,
    atenciones,
    alertas
  };
}

export const EsHoy = fecha => {
  if (!fecha) return false;

  const f = new Date(fecha);
  const hoy = new Date();

  return !Number.isNaN(f.getTime()) &&
    f.toDateString() === hoy.toDateString();
};

export const FormatearFecha = fecha => {
  if (!fecha) return '—';

  const f = new Date(fecha);

  return Number.isNaN(f.getTime())
    ? '—'
    : f.toLocaleString('es-CO');
};
