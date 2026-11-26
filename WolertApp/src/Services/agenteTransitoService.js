
import {
  consultarTransito,
  obtenerSesionTransito,
} from "./transitoApi";

// ======================================================
// RUTAS DE LA API
// ======================================================

const RUTAS = {
  agentes: "/api/AgentesTransitoes",
  unidades: "/api/UnidadTransitoes",
  atenciones: "/api/AtencionesTransito",
  alertas: "/api/Alertas",
  asignaciones: "/api/Asignaciones/mias",
};

// ======================================================
// FUNCIONES GENERALES
// ======================================================

function convertirLista(datos) {
  if (Array.isArray(datos)) {
    return datos;
  }

  for (const clave of [
    "items",
    "data",
    "results",
    "registros",
    "$values",
  ]) {
    if (Array.isArray(datos?.[clave])) {
      return datos[clave];
    }
  }

  if (datos == null) {
    return [];
  }

  throw new Error("La API no devolvió una lista válida.");
}

function iguales(a, b) {
  return (
    a != null &&
    b != null &&
    String(a) === String(b)
  );
}

function idUsuarioActual() {
  const { idUsuario } = obtenerSesionTransito();

  if (!idUsuario) {
    throw new Error(
      "No hay sesión de agente. Inicia sesión nuevamente."
    );
  }

  return Number(idUsuario);
}

function idDeUnidad(obj) {
  return (
    obj?.unidadTransitoId ??
    obj?.idUnidadTransito ??
    obj?.IdUnidadTransito ??
    obj?.UnidadTransitoId ??
    obj?.idUnidad ??
    null
  );
}

// ======================================================
// CONSULTAS PARA CENTRAL DE TRÁNSITO
// ======================================================

export async function listarAgentesCentral() {
  return convertirLista(
    await consultarTransito(RUTAS.agentes)
  );
}

export async function listarUnidadesCentral() {
  return convertirLista(
    await consultarTransito(RUTAS.unidades)
  );
}

export async function listarAtencionesCentral() {
  return convertirLista(
    await consultarTransito(RUTAS.atenciones)
  );
}

export async function listarAlertasCentral() {
  return convertirLista(
    await consultarTransito(RUTAS.alertas)
  );
}

// ======================================================
// NORMALIZACIÓN
// ======================================================

export function normalizarCentral(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

// ======================================================
// IDENTIFICADORES
// ======================================================

export function idAgenteCentral(agente) {
  return (
    agente?.idAgenteTransito ??
    agente?.agenteTransitoId ??
    agente?.idUsuario ??
    agente?.id ??
    null
  );
}

export function idUnidadCentral(unidad) {
  return (
    unidad?.idUnidadTransito ??
    unidad?.unidadTransitoId ??
    unidad?.id ??
    null
  );
}

export function idAlertaCentral(alerta) {
  return (
    alerta?.idAlerta ??
    alerta?.alertaId ??
    alerta?.id ??
    null
  );
}

export function idAtencionCentral(atencion) {
  return (
    atencion?.idAtencionTransito ??
    atencion?.idAtencion ??
    atencion?.id ??
    null
  );
}

// ======================================================
// DATOS DE LOS AGENTES
// ======================================================

export function nombreAgenteCentral(agente) {
  return (
    agente?.nombreUsuario ||
    agente?.nombreCompleto ||
    agente?.nombreAgente ||
    agente?.nombre ||
    agente?.username ||
    "Agente sin nombre"
  );
}

export function inicialesCentral(nombre) {
  return String(nombre || "A")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0] || "")
    .join("")
    .toUpperCase();
}

// ======================================================
// UNIDADES DE TRÁNSITO
// ======================================================

export function obtenerUnidadDeAgente(
  agente,
  unidades = []
) {
  const id = idDeUnidad(agente);

  if (id == null) {
    return null;
  }

  return (
    unidades.find(
      (unidad) =>
        iguales(idUnidadCentral(unidad), id)
    ) || null
  );
}

export function nombreUnidadCentral(
  agente,
  unidades = []
) {
  const unidad = obtenerUnidadDeAgente(
    agente,
    unidades
  );

  return (
    unidad?.nombre ||
    unidad?.nombreUnidad ||
    agente?.nombreUnidad ||
    "Sin grupo asignado"
  );
}

export function zonaCentral(
  agente,
  unidades = []
) {
  const unidad = obtenerUnidadDeAgente(
    agente,
    unidades
  );

  return (
    unidad?.nombreBarrio ||
    unidad?.nombreComuna ||
    unidad?.zona ||
    agente?.nombreBarrio ||
    agente?.zona ||
    "Sin zona registrada"
  );
}

// ======================================================
// ESTADOS DE ATENCIÓN
// ======================================================

export function finalizadaCentral(atencion) {
  const estado = normalizarCentral(
    atencion?.estadoFinal ??
    atencion?.estado
  );

  return [
    "FINALIZADA",
    "FINALIZADO",
    "RESUELTA",
    "RESUELTO",
    "CERRADA",
    "CERRADO",
    "ATENDIDA",
  ].includes(estado);
}

export function atencionesDeAgenteCentral(
  agente,
  atenciones = []
) {
  const id = idAgenteCentral(agente);

  if (id == null) {
    return [];
  }

  return atenciones.filter((atencion) => {
    const idAsignado =
      atencion?.idAgenteTransito ??
      atencion?.agenteTransitoId;

    return iguales(idAsignado, id);
  });
}

export function estadoAgenteCentral(
  agente,
  atenciones = []
) {
  const estado = normalizarCentral(
    agente?.estadoAgente ??
    agente?.estado
  );

  if (
    [
      "INACTIVO",
      "NO_DISPONIBLE",
      "FUERA_DE_SERVICIO",
      "SUSPENDIDO",
      "DESCONECTADO",
    ].includes(estado)
  ) {
    return "no-disponible";
  }

  const tieneAtencion =
    atencionesDeAgenteCentral(
      agente,
      atenciones
    ).some(
      (atencion) => !finalizadaCentral(atencion)
    );

  if (tieneAtencion) {
    return "atencion";
  }

  if (
    [
      "ACTIVO",
      "DISPONIBLE",
      "EN_SERVICIO",
    ].includes(estado)
  ) {
    return "disponible";
  }

  return "desconocido";
}

// ======================================================
// FECHAS
// ======================================================

export function fechaRegistroCentral(registro) {
  return (
    registro?.fechaReporte ||
    registro?.fechaAlerta ||
    registro?.fechaCreacion ||
    registro?.fechaRegistro ||
    registro?.fechaAtencion ||
    registro?.fechaInicio ||
    null
  );
}

export function fechaCentral(valor) {
  if (!valor) {
    return "Sin fecha";
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return "Fecha no disponible";
  }

  return fecha.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ======================================================
// INFORMACIÓN DE LAS ALERTAS
// ======================================================

export function tipoCentral(registro) {
  return (
    registro?.nombreTipoAlerta ||
    registro?.nombreTipo ||
    registro?.tipoAlerta?.nombre ||
    registro?.tipoCaso ||
    registro?.tipo ||
    "Sin tipo registrado"
  );
}

export function lugarCentral(registro) {
  return (
    registro?.direccion ||
    registro?.ubicacion ||
    registro?.nombreBarrio ||
    registro?.barrioNombre ||
    registro?.barrio?.nombre ||
    "Ubicación no registrada"
  );
}

export function reportanteCentral(registro) {
  return (
    registro?.nombreReportante ||
    registro?.nombreUsuario ||
    registro?.reportanteNombre ||
    registro?.reportadoPor ||
    registro?.usuario?.nombre ||
    "No registrado"
  );
}

export function badgeTipoCentral(tipo) {
  const valor = normalizarCentral(tipo);

  if (
    valor.includes("ACCIDENTE") ||
    valor.includes("CHOQUE")
  ) {
    return "red";
  }

  if (valor.includes("SEMAFORO")) {
    return "amber";
  }

  return "blue";
}

export function tiempoEsperaCentral(valor) {
  if (!valor) {
    return "Sin fecha";
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return "Sin fecha";
  }

  const minutos = Math.max(
    0,
    Math.floor(
      (Date.now() - fecha.getTime()) / 60000
    )
  );

  if (minutos < 60) {
    return `${minutos} min`;
  }

  const horas = Math.floor(minutos / 60);

  return `${horas} h ${minutos % 60} min`;
}

// ======================================================
// COLA DE ALERTAS DE CENTRAL
// ======================================================

export function prepararColaCentral(
  alertas = [],
  atenciones = []
) {
  const asignadas = new Set(
    atenciones
      .map(
        (atencion) =>
          atencion?.idAlerta ??
          atencion?.alertaId
      )
      .filter((id) => id != null)
      .map(String)
  );

  const estadosCerrados = [
    "FINALIZADA",
    "FINALIZADO",
    "RESUELTA",
    "RESUELTO",
    "CERRADA",
    "CERRADO",
    "ATENDIDA",
  ];

  return alertas.filter((alerta) => {
    const id = idAlertaCentral(alerta);

    const estado = normalizarCentral(
      alerta?.estadoAlerta ??
      alerta?.estado
    );

    return (
      id != null &&
      !asignadas.has(String(id)) &&
      !estadosCerrados.includes(estado)
    );
  });
}

// ======================================================
// PREPARACIÓN DE AGENTES PARA CENTRAL
// ======================================================

export function prepararAgentesCentral(
  agentes = [],
  unidades = [],
  atenciones = []
) {
  return agentes.map((agente) => {
    const id = idAgenteCentral(agente);
    const nombre = nombreAgenteCentral(agente);

    const casos = atencionesDeAgenteCentral(
      agente,
      atenciones
    );

    const actual = casos.find(
      (caso) => !finalizadaCentral(caso)
    );

    return {
      id,
      nombre,
      iniciales: inicialesCentral(nombre),

      cedula:
        agente?.cedula ||
        agente?.numeroDocumento ||
        "No registrada",

      zona: zonaCentral(agente, unidades),

      grupo: nombreUnidadCentral(
        agente,
        unidades
      ),

      estado: estadoAgenteCentral(
        agente,
        atenciones
      ),

      casoActual: actual
        ? tipoCentral(actual)
        : "Sin caso activo",

      totalAtenciones: casos.length,

      canal:
        agente?.canalRadio ||
        agente?.canal ||
        "No registrado",

      original: agente,
    };
  });
}

// ======================================================
// PREPARACIÓN DE GRUPOS PARA CENTRAL
// ======================================================

export function prepararGruposCentral(
  unidades = [],
  agentes = [],
  atenciones = []
) {
  return unidades.map((unidad) => {
    const id = idUnidadCentral(unidad);

    const integrantes = agentes.filter(
      (agente) =>
        iguales(idDeUnidad(agente), id)
    );

    const disponibles = integrantes.filter(
      (agente) =>
        estadoAgenteCentral(
          agente,
          atenciones
        ) === "disponible"
    ).length;

    return {
      id,

      nombre:
        unidad?.nombre ||
        unidad?.nombreUnidad ||
        `Grupo ${id ?? "sin ID"}`,

      zona:
        unidad?.nombreBarrio ||
        unidad?.nombreComuna ||
        "Sin zona registrada",

      totalAgentes: integrantes.length,
      disponibles,
      disponible: disponibles > 0,
    };
  });
}

// ======================================================
// FUNCIONES DEL AGENTE DE TRÁNSITO
// ======================================================

// PERFIL DEL AGENTE

export async function obtenerPerfilAgente() {
  const idUsuario = idUsuarioActual();

  const agentes = convertirLista(
    await consultarTransito(RUTAS.agentes)
  );

  const agente = agentes.find(
    (a) =>
      Number(
        a.idUsuario ??
        a.IdUsuario
      ) === idUsuario
  );

  if (!agente) {
    throw new Error(
      "No se encontró el agente asociado a tu usuario."
    );
  }

  return agente;
}

// UNIDAD DEL AGENTE

export async function obtenerUnidadAgente() {
  const agente = await obtenerPerfilAgente();

  const idUnidad = idDeUnidad(agente);

  if (idUnidad == null) {
    return null;
  }

  const unidades = convertirLista(
    await consultarTransito(RUTAS.unidades)
  );

  return (
    unidades.find(
      (unidad) =>
        iguales(
          idUnidadCentral(unidad),
          idUnidad
        )
    ) ?? null
  );
}

// GRUPO DEL AGENTE

export async function obtenerGrupoAgente() {
  const idUsuario = idUsuarioActual();

  const [agentes, unidades] = await Promise.all([
    listarAgentesCentral(),
    listarUnidadesCentral(),
  ]);

  const yo = agentes.find(
    (agente) =>
      Number(
        agente.idUsuario ??
        agente.IdUsuario
      ) === idUsuario
  );

  if (!yo) {
    throw new Error(
      "No se encontró el agente autenticado."
    );
  }

  const idUnidad = idDeUnidad(yo);

  const unidad =
    unidades.find(
      (u) =>
        iguales(
          idUnidadCentral(u),
          idUnidad
        )
    ) ?? null;

  const integrantes =
    idUnidad == null
      ? []
      : agentes.filter(
          (agente) =>
            iguales(
              idDeUnidad(agente),
              idUnidad
            )
        );

  return {
    unidad,
    integrantes,
    agente: yo,
    idUnidad,
  };
}

// ATENCIONES DEL AGENTE

export async function obtenerAtencionesAgente() {
  const perfil = await obtenerPerfilAgente();

  const idUnidad = idDeUnidad(perfil);

  if (idUnidad == null) {
    return [];
  }

  const atenciones = convertirLista(
    await consultarTransito(RUTAS.atenciones)
  );

  return atenciones.filter((atencion) => {
    const unidadAtencion = idDeUnidad(atencion);

    if (unidadAtencion != null) {
      return iguales(
        unidadAtencion,
        idUnidad
      );
    }

    const idAgente =
      atencion?.idAgenteTransito ??
      atencion?.agenteTransitoId;

    return iguales(
      idAgente,
      idAgenteCentral(perfil)
    );
  });
}

// RESUMEN DEL AGENTE

export async function obtenerResumenAgente() {
  const atenciones = await obtenerAtencionesAgente();

  return {
    atenciones,

    enProceso: atenciones.filter(
      (atencion) =>
        normalizarCentral(
          atencion.estadoFinal
        ) === "EN_PROCESO"
    ),

    finalizadas: atenciones.filter(
      (atencion) =>
        normalizarCentral(
          atencion.estadoFinal
        ) === "FINALIZADA"
    ),
  };
}

// FECHA DE ATENCIÓN

export function fechaAtencion(valor) {
  const crudo =
    valor && typeof valor === "object"
      ? valor.fechaAtencion ??
        valor.fechaInicio ??
        valor.fecha
      : valor;

  if (!crudo) {
    return "Sin fecha";
  }

  const fecha = new Date(crudo);

  if (Number.isNaN(fecha.getTime())) {
    return String(crudo);
  }

  return fecha.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ======================================================
// ASIGNACIONES DEL AGENTE
// ======================================================

export async function obtenerAsignacionesAgente() {
  return convertirLista(
    await consultarTransito(RUTAS.asignaciones)
  );
}

// ======================================================
// CASOS ASIGNADOS A LA UNIDAD
// ======================================================

export async function obtenerCasosAgente() {
  const [asignaciones, alertas, atenciones] =
    await Promise.all([
      obtenerAsignacionesAgente(),
      listarAlertasCentral(),
      listarAtencionesCentral(),
    ]);

  const alertasPorId = new Map(
    alertas.map((alerta) => [
      String(idAlertaCentral(alerta)),
      alerta,
    ])
  );

  return asignaciones.map((asignacion) => {
    const idAlerta = asignacion.idAlerta;

    const alerta = alertasPorId.get(
      String(idAlerta)
    );

    const atencionesDelCaso = atenciones
      .filter((atencion) => {
        const coincideAlerta = iguales(
          atencion.idAlerta,
          idAlerta
        );

        const coincideUnidad = iguales(
          idDeUnidad(atencion),
          idDeUnidad(asignacion)
        );

        return coincideAlerta && coincideUnidad && (atencion.idAsignacion == null || iguales(atencion.idAsignacion, asignacion.idAsignacion));
      })
      .sort(
        (a, b) =>
          Number(
            idAtencionCentral(b) ?? 0
          ) -
          Number(
            idAtencionCentral(a) ?? 0
          )
      );

    const atencion =
      atencionesDelCaso[0] ?? null;

    return {
      idAsignacion:
        asignacion.idAsignacion,

      idAlerta,

      idUnidadTransito:
        asignacion.idUnidadTransito,

      fechaCaso:
        asignacion.fecha ??
        alerta?.fecha ??
        null,

      estadoAsignacion: normalizarCentral(
        asignacion.estadoAsignacion
      ),

      estadoAlerta: normalizarCentral(
        alerta?.estadoAlerta ?? alerta?.estado
      ),

      estadoAtencion: normalizarCentral(
        atencion?.estadoFinal ?? atencion?.estadoAtencion ?? "PENDIENTE"
      ),

      idAtencionTransito:
        idAtencionCentral(atencion),

      tipoCaso: alerta
        ? tipoCentral(alerta)
        : "Alerta de tránsito",

      descripcion:
        alerta?.descripcion ||
        asignacion.observacion ||
        "",

      nombreReportante:
        alerta?.reportadoPor ||
        reportanteCentral(alerta),

      barrio: alerta
        ? lugarCentral(alerta)
        : "Ubicación no registrada",

      observacion:
        asignacion.observacion || "",

      atencion,
    };
  });
}

// ======================================================
// ESTADOS DE LOS CASOS
// ======================================================

export function casoFinalizado(caso) {
  const estado = normalizarCentral(
    caso.estadoAsignacion
  );

  return [
    "FINALIZADA",
    "CANCELADA",
  ].includes(estado);
}

export function pasoDelCaso(caso) {
  const estado = normalizarCentral(
    caso.estadoAsignacion
  );

  if (estado === "FINALIZADA") {
    return 3;
  }

  if (estado === "EN_ATENCION") {
    return 2;
  }

  return 0;
}

// ======================================================
// CAMBIOS DE ESTADO EN ORACLE
// ======================================================

// ASIGNADA -> EN_ATENCION

export async function registrarLlegada(
  idAsignacion
) {
  const id = Number(idAsignacion);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "El ID de la asignación no es válido."
    );
  }

  return consultarTransito(
    `/api/Asignaciones/${id}/llegada`,
    {
      method: "POST",
    }
  );
}

// EN_ATENCION -> FINALIZADA
// Requiere una atención FINALIZADA.

export async function finalizarAsignacion(
  idAsignacion
) {
  const id = Number(idAsignacion);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "El ID de la asignación no es válido."
    );
  }

  const casos = await obtenerCasosAgente();
  const caso = casos.find(c => Number(c.idAsignacion) === id);
  if (caso?.estadoAlerta !== "EN_ATENCION" || caso?.estadoAsignacion !== "EN_ATENCION" || caso?.estadoAtencion !== "FINALIZADA") {
    throw new Error("Central debe finalizar la atención antes de finalizar la asignación.");
  }
  return consultarTransito(
    `/api/Asignaciones/${id}/finalizar`,
    {
      method: "POST",
    }
  );
}

// ======================================================
// FORMATO DE FECHAS DE CASOS
// ======================================================

export function fechaCaso(valor) {
  if (!valor) {
    return "Sin fecha";
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return String(valor);
  }

  return fecha.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
