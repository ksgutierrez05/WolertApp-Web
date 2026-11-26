
import { consultarCentral } from './centralPoliciaApi';

const endpoints = {
  alertas: '/api/Alertas?alcance=todas',
  alarmas: '/api/Alarmas',
  unidades: '/api/Unidades',
};

export async function cargarMapaCentral(signal) {
  const entradas = Object.entries(endpoints);

  const resultados = await Promise.allSettled(
    entradas.map(async ([tipo, ruta]) => {
      const respuesta = await consultarCentral(ruta, { signal });

      if (!Array.isArray(respuesta)) {
        throw new Error(`Respuesta inválida de ${ruta}`);
      }

      return [tipo, respuesta];
    })
  );

  if (signal?.aborted) {
    throw new DOMException('Cancelado', 'AbortError');
  }

  const datos = {
    alertas: [],
    alarmas: [],
    unidades: [],
  };

  const errores = [];

  resultados.forEach((resultado, indice) => {
    if (resultado.status === 'fulfilled') {
      const [tipo, lista] = resultado.value;
      datos[tipo] = lista;
    } else {
      const [tipo] = entradas[indice];

      errores.push({
        tipo,
        mensaje: `No se pudieron cargar ${tipo === 'alertas' ? 'las alertas' : tipo === 'alarmas' ? 'las alarmas' : 'las unidades'}.`,
        detalleTecnico: resultado.reason?.technicalDetails || resultado.reason?.message || 'No disponible',
      });
    }
  });

  if (errores.length === 3) {
    const error = new Error('No fue posible cargar la información del mapa. Inténtalo de nuevo.');
    error.userMessage = error.message;
    error.technicalDetails = errores.map(({ tipo, detalleTecnico }) => `${endpoints[tipo]}: ${detalleTecnico}`).join('\n');
    throw error;
  }

  return { datos, errores };
}

export const obtenerCampo = (obj, ...claves) => {
  for (const clave of claves) {
    if (
      obj?.[clave] !== undefined &&
      obj?.[clave] !== null
    ) {
      return obj[clave];
    }
  }

  return null;
};

export function coordenadas(item) {
  const origen =
    item?.direccion &&
    typeof item.direccion === 'object'
      ? item.direccion
      : item;

  const latValor =
    obtenerCampo(
      origen,
      'latitud',
      'Latitud',
      'LATITUD',
      'latitude',
      'lat'
    ) ??
    obtenerCampo(item, 'latitud', 'Latitud', 'LATITUD');

  const lngValor =
    obtenerCampo(
      origen,
      'longitud',
      'Longitud',
      'LONGITUD',
      'longitude',
      'lng'
    ) ??
    obtenerCampo(item, 'longitud', 'Longitud', 'LONGITUD');

  if (
    latValor === null ||
    lngValor === null ||
    latValor === '' ||
    lngValor === ''
  ) {
    return null;
  }

  const lat = Number(latValor);
  const lng = Number(lngValor);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  )
    ? [lat, lng]
    : null;
}

export function normalizarMapa(datos) {
  return Object.entries(datos).flatMap(
    ([tipo, lista]) =>
      (lista || []).map((item, index) => {
        const id =
          obtenerCampo(
            item,
            'idAlerta',
            'idAlarma',
            'idUnidad',
            'IdAlerta',
            'IdAlarma',
            'IdUnidad',
            'ID_ALERTA',
            'ID_ALARMA',
            'ID_UNIDAD'
          ) ?? index;

        const estado = String(
          obtenerCampo(
            item,
            'estado',
            'Estado',
            'ESTADO'
          ) ?? 'SIN ESTADO'
        ).toUpperCase();

        const barrio =
          obtenerCampo(
            item,
            'nombreBarrio',
            'NombreBarrio',
            'barrioNombre',
            'barrio',
            'Barrio'
          ) ??
          item?.barrio?.nombre ??
          'No disponible';

        const nombre =
          tipo === 'alertas'
            ? (
              obtenerCampo(
                item,
                'nombreTipoAlerta',
                'NombreTipoAlerta',
                'tipoAlerta',
                'TipoAlerta',
                'tipo',
                'Tipo'
              ) ??
              item?.tipoAlerta?.nombre ??
              `Alerta #${id}`
            )
            : (
              obtenerCampo(
                item,
                'nombre',
                'Nombre',
                'NOMBRE'
              ) ?? `${tipo} #${id}`
            );

        return {
          key: `${tipo}-${id}-${index}`,
          id,
          tipo,
          estado,

          nombre:
            typeof nombre === 'object'
              ? nombre?.nombre ?? `Alerta #${id}`
              : String(nombre),

          barrio:
            typeof barrio === 'object'
              ? barrio?.nombre ?? 'No disponible'
              : String(barrio),

          prioridad:
            obtenerCampo(
              item,
              'prioridad',
              'Prioridad',
              'PRIORIDAD'
            ) ?? item?.tipoAlerta?.prioridad,

          radio: Number(
            obtenerCampo(
              item,
              'radioCobertura',
              'RadioCobertura',
              'radio_cobertura',
              'RADIO_COBERTURA'
            ) ?? 0
          ),

          posicion: coordenadas(item),
        };
      })
  );
}
