
import { consultarTransito } from "./transitoApi";

// ========================================
// RUTAS DEL BACKEND
// ========================================

const RUTAS = {
  alertas: "/api/Alertas",
  asignaciones: "/api/Asignaciones",
  atenciones: "/api/AtencionesTransito",
  unidades: "/api/UnidadTransitoes",
  agentes: "/api/AgentesTransitoes",
};

// ========================================
// FUNCIONES AUXILIARES
// ========================================

const tomar = (obj, ...claves) =>
  claves
    .map((clave) => obj?.[clave])
    .find(
      (valor) =>
        valor !== undefined &&
        valor !== null &&
        valor !== ""
    );

const id = (valor) =>
  valor == null ? "" : String(valor);

const mismoId = (a, b) =>
  a != null &&
  b != null &&
  String(a) === String(b);

const lista = (datos) => {
  if (Array.isArray(datos)) {
    return datos;
  }

  for (const clave of [
    "$values",
    "items",
    "data",
    "results",
    "registros",
  ]) {
    if (Array.isArray(datos?.[clave])) {
      return datos[clave];
    }
  }

  if (datos == null) {
    return [];
  }

  throw new Error(
    "La API no devolvió una lista válida."
  );
};

const solicitarLista = async (ruta) =>
  lista(await consultarTransito(ruta));

export const normalizarEstado = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

const estadoCerrado = (valor) =>
  ["RESUELTA", "CANCELADA"].includes(
    normalizarEstado(valor)
  );

const ESTADOS_ATENCION = [
  "PENDIENTE",
  "EN_PROCESO",
  "FINALIZADA",
  "CANCELADA",
];

const numero = (valor) => {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return null;
  }

  const n = Number(valor);

  return Number.isInteger(n) && n > 0
    ? n
    : null;
};

const bytes = (valor) =>
  new TextEncoder().encode(valor).length;

// ========================================
// ESTADO DE ATENCIÓN
// ========================================

function obtenerEstadoAtencion(atencion) {
  if (!atencion) {
    // Solo es un estado visual.
    // No se registra en Oracle.
    return "PENDIENTE";
  }

  const estado = normalizarEstado(
    tomar(
      atencion,
      "estadoFinal",
      "estadoAtencion"
    )
  );

  return ESTADOS_ATENCION.includes(estado)
    ? estado
    : null;
}

// ========================================
// MAPA DE UNIDADES
// ========================================

function crearMapaUnidades(unidades) {
  const mapa = new Map();

  for (const unidad of unidades) {
    const identificador = tomar(
      unidad,
      "idUnidadTransito",
      "unidadTransitoId",
      "id"
    );

    if (identificador != null) {
      mapa.set(
        id(identificador),
        unidad
      );
    }
  }

  return mapa;
}

// ========================================
// MAPA DE AGENTES
// ========================================

function crearMapaAgentes(agentes) {
  const mapa = new Map();

  for (const agente of agentes) {
    const identificadores = [
      agente?.idAgenteTransito,
      agente?.agenteTransitoId,
      agente?.idUsuario,
    ];

    for (const identificador of identificadores) {
      if (identificador != null) {
        mapa.set(
          id(identificador),
          agente
        );
      }
    }
  }

  return mapa;
}

// ========================================
// AGRUPAR REGISTROS POR ALERTA
// ========================================

function agruparPorAlerta(registros) {
  const mapa = new Map();

  for (const registro of registros) {
    const identificador = tomar(
      registro,
      "idAlerta",
      "alertaId"
    );

    if (identificador == null) {
      continue;
    }

    const clave = id(identificador);
    const grupo = mapa.get(clave) ?? [];

    grupo.push(registro);
    mapa.set(clave, grupo);
  }

  return mapa;
}

// ========================================
// BUSCAR ATENCIÓN CORRESPONDIENTE
// ========================================

function buscarAtencion(
  asignacion,
  atenciones
) {
  const idAsignacion = tomar(
    asignacion,
    "idAsignacion",
    "asignacionId"
  );

  const idUnidad = tomar(
    asignacion,
    "idUnidadTransito",
    "unidadTransitoId"
  );

  // Buscar primero por asignación exacta.
  const porAsignacion = atenciones.find(
    (atencion) =>
      mismoId(
        tomar(
          atencion,
          "idAsignacion",
          "asignacionId"
        ),
        idAsignacion
      )
  );

  if (porAsignacion) {
    return porAsignacion;
  }

  // Si no existe coincidencia por asignación,
  // buscar por unidad de tránsito.
  // No asociar una atención que pertenece
  // explícitamente a otra asignación.
  return (
    atenciones.find((atencion) => {
      const asignacionAtencion = tomar(
        atencion,
        "idAsignacion",
        "asignacionId"
      );

      const unidadAtencion = tomar(
        atencion,
        "idUnidadTransito",
        "unidadTransitoId"
      );

      return (
        asignacionAtencion == null &&
        mismoId(
          unidadAtencion,
          idUnidad
        )
      );
    }) ?? null
  );
}

// ========================================
// LISTAR SEGUIMIENTOS
// ========================================

export async function listarSeguimientos() {
  const [
    alertas,
    asignaciones,
    atenciones,
    unidades,
    agentes,
  ] = await Promise.all([
    solicitarLista(RUTAS.alertas),
    solicitarLista(RUTAS.asignaciones),
    solicitarLista(RUTAS.atenciones),
    solicitarLista(RUTAS.unidades),
    solicitarLista(RUTAS.agentes),
  ]);

  const unidadesPorId =
    crearMapaUnidades(unidades);

  const agentesPorId =
    crearMapaAgentes(agentes);

  // Las asignaciones de tránsito se identifican
  // por el campo idUnidadTransito.
  const asignacionesTransito =
    asignaciones.filter(
      (asignacion) =>
        tomar(
          asignacion,
          "idUnidadTransito",
          "unidadTransitoId"
        ) != null
    );

  const asignacionesPorAlerta =
    agruparPorAlerta(
      asignacionesTransito
    );

  const atencionesPorAlerta =
    agruparPorAlerta(atenciones);

  const seguimientos = [];

  for (const alerta of alertas) {
    const idAlerta = tomar(
      alerta,
      "idAlerta",
      "alertaId"
    );

    if (idAlerta == null) {
      continue;
    }

    const asignadas =
      asignacionesPorAlerta.get(
        id(idAlerta)
      ) ?? [];

    const atencionesAlerta =
      atencionesPorAlerta.get(
        id(idAlerta)
      ) ?? [];

    // Mostrar todas las asignaciones de tránsito,
    // incluso cuando el agente todavía no
    // haya registrado una atención.
    for (const asignacion of asignadas) {
      const idAsignacion = tomar(
        asignacion,
        "idAsignacion",
        "asignacionId"
      );

      const idUnidad = tomar(
        asignacion,
        "idUnidadTransito",
        "unidadTransitoId"
      );

      const unidad =
        unidadesPorId.get(
          id(idUnidad)
        );

      const atencion = buscarAtencion(
        asignacion,
        atencionesAlerta
      );

      const idAgente = tomar(
        atencion,
        "idAgenteTransito",
        "agenteTransitoId"
      );

      const agente =
        agentesPorId.get(
          id(idAgente)
        );

      const estadoAlerta = tomar(
        alerta,
        "estadoAlerta",
        "estado"
      );

      const estadoAsignacion = tomar(
        asignacion,
        "estadoAsignacion"
      );

      const estadoAtencion =
        obtenerEstadoAtencion(
          atencion
        );

      const idAtencionTransito = tomar(
        atencion,
        "idAtencionTransito",
        "idAtencion"
      );

      seguimientos.push({
        ...alerta,

        // ==================================
        // IDENTIFICADORES
        // ==================================

        idAlerta,
        idAsignacion,
        idUnidadTransito: idUnidad,
        idAgenteTransito: idAgente,
        idAtencionTransito,

        // Clave para identificar la tarjeta.
        claveSeguimiento: [
          idAlerta,
          idAsignacion ?? "sin-asignacion",
          idAtencionTransito ?? "sin-atencion",
        ].join("-"),

        // ==================================
        // ESTADO GENERAL DE LA ALERTA
        // ==================================

        estado: estadoAlerta,
        estadoAlerta,

        // ==================================
        // ESTADO DE ASIGNACIÓN
        // ==================================

        estadoAsignacion,

        tipoParticipacion: tomar(
          asignacion,
          "tipoParticipacion"
        ),

        fechaAsignacion: tomar(
          asignacion,
          "fecha"
        ),

        // ==================================
        // ESTADO DE ATENCIÓN
        // ==================================

        estadoAtencion,
        estadoFinalAtencion: estadoAtencion,

        tieneAtencion: Boolean(
          atencion
        ),

        // ==================================
        // INFORMACIÓN DE LA ALERTA
        // ==================================

        nombreTipoAlerta:
          tomar(
            alerta,
            "nombreTipoAlerta",
            "tipoAlerta",
            "tipo"
          ) ??
          "Sin tipo registrado",

        descripcionAlerta:
          tomar(
            alerta,
            "descripcionAlerta",
            "descripcion"
          ) ?? "",

        nombreReportante:
          tomar(
            alerta,
            "nombreReportante",
            "reportadoPor",
            "nombreUsuario",
            "nombreCompleto"
          ) ??
          "No registrado",

        barrio:
          tomar(
            alerta,
            "barrio",
            "nombreBarrio",
            "barrioNombre"
          ) ??
          "Sin barrio registrado",

        // ==================================
        // UNIDAD DE TRÁNSITO
        // ==================================

        nombreUnidad:
          tomar(
            asignacion,
            "nombreUnidad",
            "unidadNombre"
          ) ??
          tomar(
            unidad,
            "nombre",
            "nombreUnidad"
          ) ??
          "Unidad sin nombre",

        // ==================================
        // AGENTE DE TRÁNSITO
        // ==================================

        nombreAgente:
          tomar(
            atencion,
            "nombreAgente",
            "nombreAgenteTransito"
          ) ??
          tomar(
            agente,
            "nombreUsuario",
            "nombreCompleto",
            "nombreAgente",
            "username"
          ) ??
          "Sin agente registrado",

        // ==================================
        // DATOS DE LA ATENCIÓN
        // ==================================

        fechaAtencion: tomar(
          atencion,
          "fechaAtencion"
        ),

        descripcionAtencion: tomar(
          atencion,
          "descripcion"
        ),

        observacionAtencion: tomar(
          atencion,
          "observacion"
        ),

        // ==================================
        // CONTROL DEL INFORME FINAL
        // ==================================

        cerrada: estadoCerrado(
          estadoAlerta
        ),

        puedeRegistrarInforme:
          normalizarEstado(
            estadoAlerta
          ) === "RESUELTA" &&
          Boolean(
            idAtencionTransito
          ),
      });
    }
  }

  return seguimientos;
}

// ========================================
// REGISTRAR INFORME FINAL
// ========================================

export async function registrarInformeFinal(
  caso,
  datos
) {
  const idAlerta = numero(
    caso?.idAlerta
  );

  const idAtencion = numero(
    caso?.idAtencionTransito
  );

  const estadoAlerta = normalizarEstado(
    caso?.estadoAlerta ??
    caso?.estado
  );

  const descripcion = String(
    datos?.descripcion ?? ""
  ).trim();

  const observacion = String(
    datos?.observacion ?? ""
  ).trim();

  // ==================================
  // VALIDACIONES
  // ==================================

  if (estadoAlerta !== "RESUELTA") {
    throw new Error(
      "La alerta debe estar RESUELTA para registrar el informe final."
    );
  }

  if (!idAlerta || !idAtencion) {
    throw new Error(
      "Esta alerta no tiene una atención de tránsito registrada."
    );
  }

  if (!descripcion) {
    throw new Error(
      "La descripción del informe es obligatoria."
    );
  }

  if (
    bytes(descripcion) > 200 ||
    bytes(observacion) > 200
  ) {
    throw new Error(
      "La descripción y la observación admiten máximo 200 bytes cada una."
    );
  }

  // ==================================
  // CONSULTAR ATENCIÓN ACTUAL
  // ==================================

  // GET /api/AtencionesTransito/{id}
  // Esta ruta existe en el controlador.
  const actual = await consultarTransito(
    `${RUTAS.atenciones}/${idAtencion}`
  );

  if (!actual) {
    throw new Error(
      "No se encontró la atención de tránsito."
    );
  }

  const idAlertaActual = numero(
    tomar(
      actual,
      "idAlerta",
      "alertaId"
    )
  );

  const idUnidadActual = numero(
    tomar(
      actual,
      "idUnidadTransito",
      "unidadTransitoId"
    )
  );

  const idAgenteActual = numero(
    tomar(
      actual,
      "idAgenteTransito",
      "agenteTransitoId"
    )
  );

  // ==================================
  // VALIDAR RELACIONES
  // ==================================

  if (
    !idAlertaActual ||
    idAlertaActual !== idAlerta
  ) {
    throw new Error(
      "La atención consultada no corresponde a la alerta seleccionada."
    );
  }

  if (!idUnidadActual) {
    throw new Error(
      "La atención no tiene una unidad de tránsito válida."
    );
  }

  if (!idAgenteActual) {
    throw new Error(
      "La atención no tiene un agente de tránsito registrado."
    );
  }

  // ==================================
  // CONSERVAR ESTADO ORIGINAL
  // ==================================

  const estadoActual = normalizarEstado(
    tomar(
      actual,
      "estadoFinal",
      "estadoAtencion"
    )
  );

  // El controlador solamente acepta
  // EN_PROCESO o FINALIZADA.
  if (
    ![
      "EN_PROCESO",
      "FINALIZADA",
    ].includes(estadoActual)
  ) {
    throw new Error(
      "La atención no tiene un estado válido para actualizar."
    );
  }

  // ==================================
  // CONSTRUIR DTO DEL BACKEND
  // ==================================

  // Se conservan los datos originales
  // y solo se cambian los textos.
  const cuerpo = {
    idAlerta: idAlertaActual,
    idUnidadTransito: idUnidadActual,
    idAgenteTransito: idAgenteActual,
    fechaAtencion:
      actual.fechaAtencion ?? null,
    estadoFinal: estadoActual,
    descripcion,
    observacion,
  };

  // ==================================
  // ACTUALIZAR INFORME FINAL
  // ==================================

  // PUT /api/AtencionesTransito/{id}
  // Reutiliza el controlador y el
  // procedimiento de Oracle existentes.
  return consultarTransito(
    `${RUTAS.atenciones}/${idAtencion}`,
    {
      method: "PUT",
      body: JSON.stringify(cuerpo),
    }
  );
}
