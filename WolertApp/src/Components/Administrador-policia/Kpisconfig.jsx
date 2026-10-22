
export const KPIS_CONFIG = {
  'centro-principal': {
    columnas: 'col-6 col-xl-3',
    claseFila: 'row g-3 mb-4',
    items: [
      {
        clave: 'alertasActivas',
        etiqueta: 'Alertas activas',
        icono: 'bi-bell-fill',
        tono: 'rojo',
      },
      {
        clave: 'alertasCriticas',
        etiqueta: 'Alertas críticas',
        icono: 'bi-exclamation-octagon-fill',
        tono: 'ambar',
      },
      {
        clave: 'resueltasHoy',
        etiqueta: 'Resueltas hoy',
        icono: 'bi-check-circle-fill',
        tono: 'verde',
      },
      {
        clave: 'patrullerosDisponibles',
        etiqueta: 'Patrulleros disponibles',
        icono: 'bi-people-fill',
        tono: 'azul',
      },
    ],
  },

  'centro-operativo': {
    columnas: 'col-6 col-md-3',
    claseFila: 'row g-3',
    items: [
      {
        clave: 'patrullerosServicio',
        etiqueta: 'Patrulleros en servicio',
        icono: 'bi-car-front-fill',
        tono: 'verde',
      },
      {
        clave: 'totalAlertasHoy',
        etiqueta: 'Total de alertas hoy',
        icono: 'bi-graph-up-arrow',
        tono: 'azul',
      },
      {
        clave: 'enAtencion',
        etiqueta: 'En atención',
        icono: 'bi-clock-history',
        tono: 'ambar',
      },
      {
        clave: 'pendientes',
        etiqueta: 'Pendientes',
        icono: 'bi-hourglass-split',
        tono: 'rojo',
      },
    ],
  },

  alertas: {
    columnas: 'col-6 col-xl-3',
    claseFila: 'row g-3 mb-4',
    items: [
      {
        id: 'kpiTotalAlertas',
        clave: 'total',
        etiqueta: 'Total de alertas',
        icono: 'bi-exclamation-triangle-fill',
        tono: 'azul',
      },
      {
        id: 'kpiPendientes',
        clave: 'pendientes',
        etiqueta: 'Pendientes',
        icono: 'bi-hourglass-split',
        tono: 'ambar',
      },
      {
        id: 'kpiEnAtencion',
        clave: 'enAtencion',
        etiqueta: 'En atención',
        icono: 'bi-shield-exclamation',
        tono: 'rojo',
      },
      {
        id: 'kpiResueltas',
        clave: 'resueltas',
        etiqueta: 'Resueltas',
        icono: 'bi-check-circle-fill',
        tono: 'verde',
      },
    ],
  },

  alarmas: {
    columnas: 'col-6 col-xl-3',
    claseFila: 'row g-3 mb-4',
    items: [
      {
        id: 'kpiTotalAlarmas',
        clave: 'total',
        etiqueta: 'Total de alarmas',
        icono: 'bi-broadcast-pin',
        tono: 'azul',
      },
      {
        id: 'kpiActivas',
        clave: 'activas',
        etiqueta: 'Activas',
        icono: 'bi-check-circle-fill',
        tono: 'verde',
      },
      {
        id: 'kpiInactivas',
        clave: 'inactivas',
        etiqueta: 'Inactivas',
        icono: 'bi-slash-circle-fill',
        tono: 'rojo',
      },
      {
        id: 'kpiMantenimiento',
        clave: 'mantenimiento',
        etiqueta: 'En mantenimiento',
        icono: 'bi-tools',
        tono: 'ambar',
      },
    ],
  },
};
