export const KPIS_CENTRAL_CONFIG = {
  'centro-principal': {
    columnas: 'col-6 col-xl-3',
    claseFila: 'row g-3 mb-4',
    items: [
      {
        clave: 'alertasActivas',
        etiqueta: 'Alertas activas',
        descripcion: 'Casos pendientes de atención',
        icono: 'bi-exclamation-triangle-fill',
        tono: 'rojo',
        destacada: true, // la única con diseño distinto
      },
      {
        clave: 'prioridadCritica',
        etiqueta: 'Prioridad crítica',
        icono: 'bi-fire',
        tono: 'rojo',
      },
      {
        clave: 'sinAsignar',
        etiqueta: 'Sin asignar',
        icono: 'bi-hourglass-split',
        tono: 'ambar',
      },
      {
        clave: 'unidadesDisponibles',
        etiqueta: 'Unidades disponibles',
        icono: 'bi-car-front-fill',
        tono: 'azul',
      },
    ],
  },
  alertas: {
    columnas: 'col-6 col-xl-3',
    claseFila: 'row g-3 mb-4',
    items: [
      {
        clave: 'total',
        etiqueta: 'Total de alertas',
        icono: 'bi-broadcast-pin',
        tono: 'petroleo',
      },
      {
        clave: 'pendientes',
        etiqueta: 'Pendientes',
        icono: 'bi-hourglass-split',
        tono: 'ambar',
      },
      {
        clave: 'enAtencion',
        etiqueta: 'En atención',
        icono: 'bi-shield-exclamation',
        tono: 'rojo',
      },
      {
        clave: 'resueltas',
        etiqueta: 'Resueltas',
        icono: 'bi-check-circle-fill',
        tono: 'verde',
      },
    ],
  },

  asignaciones: {
    columnas: 'col-6 col-xl-3',
    claseFila: 'row g-3 mb-4',
    items: [
      {
        clave: 'total',
        etiqueta: 'Total de asignaciones',
        icono: 'bi-clipboard-check',
        tono: 'petroleo',
      },
      {
        clave: 'activas',
        etiqueta: 'Asignaciones activas',
        icono: 'bi-arrow-repeat',
        tono: 'verde',
      },
      {
        clave: 'pendientes',
        etiqueta: 'Por asignar',
        icono: 'bi-clock-history',
        tono: 'ambar',
      },
      {
        clave: 'finalizadas',
        etiqueta: 'Finalizadas hoy',
        icono: 'bi-check-circle-fill',
        tono: 'verde',
      },
    ],
  },

  'atencion-alertas': {
    columnas: 'col-12 col-md-4',
    claseFila: 'row g-3 mb-4',
    items: [
      {
        clave: 'porRevisar',
        etiqueta: 'Por revisar',
        descripcion: 'Reportes recibidos',
        icono: 'bi-inbox',
        tono: 'ambar',
      },
      {
        clave: 'enRevision',
        etiqueta: 'En revisión',
        descripcion: 'Atenciones abiertas',
        icono: 'bi-clock',
        tono: 'azul',
      },
      {
        clave: 'finalizadas',
        etiqueta: 'Finalizadas',
        descripcion: 'Casos cerrados',
        icono: 'bi-check-circle',
        tono: 'verde',
      },
    ],
  },

  unidades: {
    columnas: 'col-6 col-xl-3',
    claseFila: 'row g-3 mb-4',
    items: [
      {
        clave: 'total',
        etiqueta: 'Total de unidades',
        icono: 'bi-car-front-fill',
        tono: 'petroleo',
      },
      {
        clave: 'disponibles',
        etiqueta: 'Disponibles',
        icono: 'bi-check-circle-fill',
        tono: 'verde',
      },
      {
        clave: 'enServicio',
        etiqueta: 'En servicio',
        icono: 'bi-shield-check',
        tono: 'azul',
      },
      {
        clave: 'ocupadas',
        etiqueta: 'Ocupadas',
        icono: 'bi-clock-history',
        tono: 'ambar',
      },
    ],
  },

  historial: {
    columnas: 'col-6 col-xl-3',
    claseFila: 'row g-3 mb-4',
    items: [
      {
        clave: 'totalCasos',
        etiqueta: 'Total de casos',
        icono: 'bi-folder2-open',
        tono: 'petroleo',
      },
      {
        clave: 'casosResueltos',
        etiqueta: 'Casos resueltos',
        icono: 'bi-check-circle-fill',
        tono: 'verde',
      },
      {
        clave: 'casosCriticos',
        etiqueta: 'Casos críticos',
        icono: 'bi-exclamation-triangle-fill',
        tono: 'rojo',
      },
      {
        clave: 'casosConInforme',
        etiqueta: 'Con informe',
        icono: 'bi-file-earmark-text-fill',
        tono: 'azul',
      },
    ],
  },

  reportes: {
    columnas: 'col-6 col-xl-3',
    claseFila: 'row g-3 mb-4',
    items: [
      {
        clave: 'total',
        etiqueta: 'Total de casos',
        icono: 'bi-folder2-open',
        tono: 'petroleo',
      },
      {
        clave: 'resueltos',
        etiqueta: 'Casos resueltos',
        icono: 'bi-check-circle-fill',
        tono: 'verde',
      },
      {
        clave: 'pendientes',
        etiqueta: 'Casos pendientes',
        icono: 'bi-hourglass-split',
        tono: 'ambar',
      },
      {
        clave: 'conInforme',
        etiqueta: 'Con informe',
        icono: 'bi-file-earmark-text-fill',
        tono: 'azul',
      },
    ],
  },
  notificaciones: {
    columnas: 'col-6 col-md-3',
    claseFila: 'row g-3 mb-4',
    items: [
      {
        clave: 'total',
        etiqueta: 'Total',
        icono: 'bi-bell-fill',
        tono: 'petroleo',
      },
      {
        clave: 'noLeidas',
        etiqueta: 'Sin leer',
        icono: 'bi-envelope-exclamation-fill',
        tono: 'rojo',
      },
      {
        clave: 'urgentes',
        etiqueta: 'Requieren acción',
        icono: 'bi-clock-history',
        tono: 'ambar',
      },
      {
        clave: 'resueltas',
        etiqueta: 'Resueltas hoy',
        icono: 'bi-check2-circle',
        tono: 'verde',
      },
    ],
  },

};