import { consultarTransito } from './transitoApi';

const normalizar = (valor) => String(valor ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('es-CO');

const campo = (objeto, ...nombres) =>
  nombres.reduce((valor, nombre) => valor ?? objeto?.[nombre], null);

export const textoNotificacionTransito = (notificacion) => String(
  campo(notificacion, 'mensaje', 'Mensaje', 'descripcion', 'Descripcion', 'contenido', 'Contenido', 'titulo', 'Titulo') ??
  'Notificación del sistema'
);

export const idNotificacionTransito = (notificacion) => campo(
  notificacion, 'idNotificacion', 'IdNotificacion', 'id', 'Id'
);

export const fechaNotificacionTransito = (notificacion) => campo(
  notificacion, 'fechaCreacion', 'FechaCreacion', 'fechaNotificacion', 'FechaNotificacion', 'fecha', 'Fecha'
);

export const notificacionTransitoNoLeida = (notificacion) => {
  const leida = campo(notificacion, 'leida', 'Leida');
  if (typeof leida === 'boolean') return !leida;
  if (typeof leida === 'number') return leida === 0;
  return ['no leida', 'pendiente', 'nueva'].includes(normalizar(campo(notificacion, 'estado', 'Estado')));
};

const palabrasTransito = [
  'caso', 'alerta', 'asignacion', 'asignado', 'asignada', 'atencion', 'agente',
  'unidad', 'transito', 'semaforo', 'infraccion', 'incidente', 'despacho', 'siniestro', 'accidente',
];

const palabrasExclusivasOtrosModulos = [
  'comunidad', 'vecino', 'barrio', 'comuna', 'armamento', 'patrullero', 'cuadrante', 'alarma policial',
];

export function notificacionPerteneceATransito(notificacion, rol) {
  const rolDestino = normalizar(campo(
    notificacion, 'rolDestino', 'RolDestino', 'destinatarioRol', 'DestinatarioRol', 'rol', 'Rol'
  ));
  const texto = normalizar([
    campo(notificacion, 'tipo', 'Tipo', 'categoria', 'Categoria', 'tipoNotificacion', 'TipoNotificacion'),
    campo(notificacion, 'titulo', 'Titulo', 'asunto', 'Asunto'),
    textoNotificacionTransito(notificacion),
  ].join(' '));

  if (rolDestino) {
    if (rolDestino.includes('policia') || rolDestino.includes('ciudadano')) return false;
    if (rolDestino.includes('director') && rol !== 'director') return false;
    if (rolDestino.includes('agente') && rol !== 'agente') return false;
    if ((rolDestino.includes('central') || (rolDestino.includes('admin') && rolDestino.includes('transito'))) && rol !== 'central') return false;
    if (!rolDestino.includes('transito') &&
        !rolDestino.includes('director') &&
        !rolDestino.includes('agente') &&
        !rolDestino.includes('central')) return false;
  }

  if (palabrasExclusivasOtrosModulos.some((palabra) => texto.includes(palabra)) &&
      !['caso', 'alerta', 'asignacion', 'transito', 'incidente'].some((palabra) => texto.includes(palabra))) {
    return false;
  }

  const pertenece = palabrasTransito.some((palabra) => texto.includes(palabra)) ||
    campo(notificacion, 'idAlerta', 'IdAlerta') != null;
  if (!pertenece) return false;

  if (rol === 'central') {
    return ['caso', 'alerta', 'asignacion', 'asignado', 'asignada', 'atencion', 'agente', 'unidad', 'despacho', 'incidente', 'siniestro', 'accidente', 'reporte']
      .some((palabra) => texto.includes(palabra)) || campo(notificacion, 'idAlerta', 'IdAlerta') != null;
  }

  if (rol === 'agente') {
    return ['caso', 'alerta', 'asignacion', 'asignado', 'asignada', 'atencion', 'incidente', 'siniestro', 'accidente']
      .some((palabra) => texto.includes(palabra)) || campo(notificacion, 'idAlerta', 'IdAlerta') != null;
  }

  return true;
}

export async function listarNotificacionesTransito(rol, signal) {
  const respuesta = await consultarTransito('api/Notificaciones/mias', { signal });
  const lista = Array.isArray(respuesta)
    ? respuesta
    : campo(respuesta, 'items', 'Items', 'data', 'Data', 'datos', 'Datos', 'resultados', 'Resultados');

  if (!Array.isArray(lista)) {
    throw new Error('La API no devolvió una lista válida de notificaciones.');
  }

  return lista.filter((notificacion) => notificacionPerteneceATransito(notificacion, rol));
}

export function destinoNotificacionTransito(notificacion, rol) {
  const texto = normalizar([
    campo(notificacion, 'tipo', 'Tipo', 'categoria', 'Categoria', 'titulo', 'Titulo'),
    textoNotificacionTransito(notificacion),
  ].join(' '));

  if (rol === 'agente') {
    return texto.includes('historial')
      ? '/transito/agente/historial'
      : '/transito/agente/grupo';
  }

  if (rol === 'central') {
    if (texto.includes('agente')) return '/transito/central/agentes';
    if (texto.includes('asign')) return '/transito/central/asignar';
    return '/transito/central/atencion';
  }

  if (texto.includes('semaforo')) return '/transito/director/semaforos';
  if (texto.includes('unidad')) return '/transito/director/unidades';
  if (texto.includes('agente')) {
    return rol === 'central' ? '/transito/central/agentes' : '/transito/director/agentes';
  }
  return texto.includes('reporte')
    ? '/transito/director/reportes'
    : '/transito/director/casos';
}
