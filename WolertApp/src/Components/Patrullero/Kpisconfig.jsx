export const KPIS_PATRULLERO_CONFIG = {
  // Centro de operaciones
  'centro-operaciones': {
    columnas: 'col-6 col-xl-3',
    claseFila: 'row g-3 mb-4',
    items: [
      {
        clave: 'alertasAsignadas',
        etiqueta: 'Alertas asignadas',
        icono: 'bi-exclamation-triangle',
        tono: 'rojo',
      },
      {
        clave: 'atencionActiva',
        etiqueta: 'Atención activa',
        icono: 'bi-car-front',
        tono: 'ambar',
      },
      {
        clave: 'atendidasHoy',
        etiqueta: 'Atendidas hoy',
        icono: 'bi-check2-circle',
        tono: 'verde',
      },
      {
        clave: 'companeros',
        etiqueta: 'Compañeros en unidad',
        icono: 'bi-people',
        tono: 'azul',
      },
    ],
  },

  // Atenciones
  atenciones: {
    columnas: 'col-6 col-md-3',
    claseFila: 'row g-3 mb-4',
    items: [
      {
        clave: 'total',
        etiqueta: 'Atenciones activas',
        icono: 'bi-list-check',
        tono: 'azul',
      },
      {
        clave: 'enCamino',
        etiqueta: 'En camino',
        icono: 'bi-signpost-split',
        tono: 'ambar',
      },
      {
        clave: 'enSitio',
        etiqueta: 'En el sitio',
        icono: 'bi-geo-alt',
        tono: 'rojo',
      },
      {
        clave: 'resueltasHoy',
        etiqueta: 'Resueltas hoy',
        icono: 'bi-clipboard-check',
        tono: 'verde',
      },
    ],
  },

  // Mi unidad
  unidad: {
    columnas: 'col-6 col-md-3',
    claseFila: 'row g-3 mb-4',
    items: [
      {
        clave: 'integrantes',
        etiqueta: 'Integrantes',
        icono: 'bi-people-fill',
        tono: 'azul',
      },
      {
        clave: 'disponibles',
        etiqueta: 'Disponibles',
        icono: 'bi-check-circle',
        tono: 'verde',
      },
      {
        clave: 'enAtencion',
        etiqueta: 'En atención',
        icono: 'bi-hourglass-split',
        tono: 'ambar',
      },
      {
        clave: 'enCamino',
        etiqueta: 'En camino',
        icono: 'bi-signpost-split',
        tono: 'rojo',
      },
    ],
  },

  // Mis alertas
  alertas: {
    columnas: 'col-6 col-xl-3',
    claseFila: 'row g-3 mb-4',
    items: [
      {
        clave: 'total',
        etiqueta: 'Alertas asignadas',
        icono: 'bi-bell',
        tono: 'azul',
      },
      {
        clave: 'prioridadAlta',
        etiqueta: 'Prioridad alta',
        icono: 'bi-exclamation-triangle',
        tono: 'rojo',
      },
      {
        clave: 'nuevas',
        etiqueta: 'Nuevas',
        icono: 'bi-envelope-exclamation',
        tono: 'ambar',
      },
      {
        clave: 'vistas',
        etiqueta: 'Vistas',
        icono: 'bi-eye',
        tono: 'verde',
      },
    ],
  },
};