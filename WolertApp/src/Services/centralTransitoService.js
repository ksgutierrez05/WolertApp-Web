import { consultarTransito } from "../Services/transitoApi";
const RUTAS = {
  agentes: "/api/AgentesTransitoes",
  unidades: "/api/UnidadTransitoes",
  atenciones: "/api/AtencionesTransito",
  alertas: "/api/Alertas",
  tiposAlerta: "/api/TiposAlerta",
};
function convertirLista(datos) {
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.items)) return datos.items;
  if (Array.isArray(datos?.data)) return datos.data;
  if (Array.isArray(datos?.results)) return datos.results;
  if (Array.isArray(datos?.$values)) return datos.$values;
  if (datos == null) return [];
  throw new Error("La API no devolvió una lista válida.");
}
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
export function normalizarCentral(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}
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
export function obtenerUnidadDeAgente(
  agente,
  unidades = []
) {
  const id =
    agente?.unidadTransitoId ??
    agente?.idUnidadTransito;
  return unidades.find(
    (unidad) =>
      id != null &&
      String(idUnidadCentral(unidad)) === String(id)
  ) || null;
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
export function zonaCentral(agente, unidades = []) {
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
export function finalizadaCentral(atencion) {
  const estado = normalizarCentral(
    atencion?.estadoFinal ?? atencion?.estado
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
  return atenciones.filter((atencion) => {
    const asignado =
      atencion?.idAgenteTransito ??
      atencion?.agenteTransitoId;
    return (
      id != null &&
      asignado != null &&
      String(id) === String(asignado)
    );
  });
}
export function estadoAgenteCentral(
  agente,
  atenciones = []
) {
  const estado = normalizarCentral(
    agente?.estadoAgente ?? agente?.estado
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
  const ocupado = atencionesDeAgenteCentral(
    agente,
    atenciones
  ).some((atencion) => !finalizadaCentral(atencion));
  if (ocupado) return "atencion";
  if (
    ["ACTIVO", "DISPONIBLE", "EN_SERVICIO"].includes(
      estado
    )
  ) {
    return "disponible";
  }
  return "desconocido";
}
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
  if (!valor) return "Sin fecha";
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
  if (!valor) return "Sin fecha";
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
  if (minutos < 60) return `${minutos} min`;
  return `${Math.floor(minutos / 60)} h ${
    minutos % 60
  } min`;
}
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
  const cerrados = [
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
      alerta?.estadoAlerta ?? alerta?.estado
    );
    return (
      id != null &&
      !asignadas.has(String(id)) &&
      !cerrados.includes(estado)
    );
  });
}
// Una asignación finalizada no libera la unidad mientras la alerta siga abierta.
export async function listarOcupacionCentral() {
  const [alertas, asignaciones] = await Promise.all([
    listarAlertasCentral(),
    consultarTransito("/api/Asignaciones").then(convertirLista),
  ]);
  const estados = new Map(alertas.map(a => [String(idAlertaCentral(a)), estadoAlertaCentral(a)]));
  return asignaciones.filter(a =>
    (a.idUnidadTransito ?? a.unidadTransitoId) != null &&
    !["RESUELTA", "CANCELADA"].includes(estados.get(String(a.idAlerta ?? a.alertaId)))
  );
}

function unidadOcupada(id, ocupacion) {
  return id != null && ocupacion.some(a => String(a.idUnidadTransito ?? a.unidadTransitoId) === String(id));
}

export function prepararAgentesCentral(
  agentes = [],
  unidades = [],
  atenciones = [],
  ocupacion = null
) {
  return agentes.map((agente) => {
    const nombre = nombreAgenteCentral(agente);
    const casos = atencionesDeAgenteCentral(
      agente,
      atenciones
    );
    const idGrupo = agente.idUnidadTransito ?? agente.unidadTransitoId;
    const unidad = obtenerUnidadDeAgente(agente, unidades);
    const abierta = ocupacion?.find(a => idGrupo != null && String(a.idUnidadTransito ?? a.unidadTransitoId) === String(idGrupo));
    const actual = casos.find(caso => abierta && String(caso.idAlerta ?? caso.alertaId) === String(abierta.idAlerta ?? abierta.alertaId));
    return {
      id: idAgenteCentral(agente),
      nombre,
      iniciales: inicialesCentral(nombre),
      cedula:
        agente?.cedula ||
        agente?.numeroDocumento ||
        "No registrada",
      zona: zonaCentral(agente, unidades),
      grupo: nombreUnidadCentral(agente, unidades),
      estado: ocupacion === null ? "no-disponible" :
        estadoAgenteCentral(agente, []) === "no-disponible" ? "no-disponible" :
        abierta ? "atencion" : !unidad || estadoUnidadCentral(unidad) !== "OPERATIVA" ? "no-disponible" : estadoAgenteCentral(agente, []),
      casoActual: actual
        ? tipoCentral(actual)
        : abierta ? `Alerta #${abierta.idAlerta ?? abierta.alertaId}` : "Sin caso activo",
      totalAtenciones: casos.length,
      canal:
        agente?.canalRadio ||
        agente?.canal ||
        "No registrado",
      original: agente,
    };
  });
}
export function prepararGruposCentral(
  unidades = [],
  agentes = [],
  atenciones = [],
  ocupacion = null
) {
  return unidades.map((unidad) => {
    const id = idUnidadCentral(unidad);
    const integrantes = agentes.filter((agente) => {
      const idGrupo =
        agente?.unidadTransitoId ??
        agente?.idUnidadTransito;
      return (
        id != null &&
        idGrupo != null &&
        String(idGrupo) === String(id)
      );
    });
    const bloqueado = id == null || ocupacion === null || unidadOcupada(id, ocupacion) || estadoUnidadCentral(unidad) !== "OPERATIVA";
    const disponibles = bloqueado ? 0 : integrantes.filter(
      (agente) =>
        estadoAgenteCentral(agente, []) ===
        "disponible"
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
      estadoUnidad: ocupacion !== null && unidadOcupada(id, ocupacion) ? "ACTIVA" : estadoUnidadCentral(unidad),
      disponible: !bloqueado && estadoUnidadCentral(unidad) === "OPERATIVA",
    };
  });
}
export async function asignarGrupoCentral(
  idAlerta,
  nombreUnidad,
  observacion = ""
) {
  const [ocupacion, unidades, alertas] = await Promise.all([
    listarOcupacionCentral(), listarUnidadesCentral(), listarAlertasCentral(),
  ]);
  const coincidencias = unidades.filter(u => normalizarCentral(u.nombre ?? u.nombreUnidad) === normalizarCentral(nombreUnidad));
  const unidad = coincidencias[0];
  if (coincidencias.length !== 1 || estadoUnidadCentral(unidad) !== "OPERATIVA" || unidadOcupada(idUnidadCentral(unidad), ocupacion)) {
    throw new Error("El grupo no está disponible. Central debe cerrar su alerta activa.");
  }
  if (!alertas.some(a => String(idAlertaCentral(a)) === String(idAlerta) && estadoAlertaCentral(a) === "PENDIENTE")) {
    throw new Error("La alerta ya no está pendiente de asignación.");
  }
  return consultarTransito("/api/Asignaciones/manual", {
    method: "POST",
    body: JSON.stringify({
      idAlerta,
      nombreUnidad,
      observacion,
    }),
  });
}
export async function listarTiposAlertaCentral() {
  return convertirLista(await consultarTransito(RUTAS.tiposAlerta));
}
export function estadoAlertaCentral(alerta) {
  return normalizarCentral(alerta?.estadoAlerta ?? alerta?.estado ?? "");
}
export function centralResponsableAlerta(alerta, tipos = []) {
  const idTipo = alerta?.idTipoAlerta ?? alerta?.tipoAlertaId ?? alerta?.tipoAlerta?.idTipoAlerta;
  const tipo = tipos.find(t => idTipo != null && String(t?.idTipoAlerta ?? t?.tipoAlertaId ?? t?.id) === String(idTipo));
  return normalizarCentral(
    alerta?.centralResponsable ?? alerta?.central_responsable ??
    alerta?.tipoAlerta?.centralResponsable ?? tipo?.centralResponsable ?? tipo?.central_responsable
  );
}
export function prepararCasosAsignablesCentral(alertas = [], tipos = []) {
  return alertas.filter(alerta =>
    idAlertaCentral(alerta) != null &&
    estadoAlertaCentral(alerta) === "PENDIENTE" &&
    centralResponsableAlerta(alerta, tipos) === "TRANSITO"
  );
}
export function estadoUnidadCentral(unidad) {
  return normalizarCentral(unidad?.estado ?? unidad?.estadoUnidad ?? unidad?.estadoUnidadTransito);
}
