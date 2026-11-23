import { consultarTransito } from "./transitoApi";
// ===== RUTAS DEL BACKEND =====
const RUTAS = {
  alertas: "/api/Alertas",
  asignaciones: "/api/Asignaciones",
  atenciones: "/api/AtencionesTransito",
  unidades: "/api/UnidadTransitoes",
  agentes: "/api/AgentesTransitoes",
};
// ===== FUNCIONES AUXILIARES =====
const tomar = (obj, ...claves) =>
  claves
    .map((clave) => obj?.[clave])
    .find((valor) => valor !== undefined && valor !== null && valor !== "");
const id = (valor) => (valor == null ? "" : String(valor));
const mismoId = (a, b) => a != null && b != null && String(a) === String(b);
const lista = (datos) => {
  if (Array.isArray(datos)) return datos;
  for (const clave of ["$values", "items", "data", "results", "registros"]) {
    if (Array.isArray(datos?.[clave])) return datos[clave];
  }
  if (datos == null) return [];
  throw new Error("La API no devolvió una lista válida.");
};
const solicitarLista = async (ruta) => lista(await consultarTransito(ruta));
export const normalizarEstado = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
const estadoCerrado = (valor) =>
  ["RESUELTA", "CANCELADA"].includes(normalizarEstado(valor));
const ESTADOS_ATENCION = ["PENDIENTE", "EN_PROCESO", "FINALIZADA", "CANCELADA"];
const numero = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
};
const bytes = (valor) => new TextEncoder().encode(valor).length;
// ===== ESTADO DE ATENCIÓN =====
function obtenerEstadoAtencion(atencion) {
  // Sin atención es solo un estado visual; no se registra en Oracle.
  if (!atencion) return "PENDIENTE";
  const estado = normalizarEstado(tomar(atencion, "estadoFinal", "estadoAtencion"));
  return ESTADOS_ATENCION.includes(estado) ? estado : null;
}
// ===== MAPAS =====
function crearMapaUnidades(unidades) {
  const mapa = new Map();
  for (const unidad of unidades) {
    const identificador = tomar(unidad, "idUnidadTransito", "unidadTransitoId", "id");
    if (identificador != null) mapa.set(id(identificador), unidad);
  }
  return mapa;
}
function crearMapaAgentes(agentes) {
  const mapa = new Map();
  for (const agente of agentes) {
    for (const identificador of [
      agente?.idAgenteTransito,
      agente?.agenteTransitoId,
      agente?.idUsuario,
    ]) {
      if (identificador != null) mapa.set(id(identificador), agente);
    }
  }
  return mapa;
}
function agruparPorAlerta(registros) {
  const mapa = new Map();
  for (const registro of registros) {
    const identificador = tomar(registro, "idAlerta", "alertaId");
    if (identificador == null) continue;
    const clave = id(identificador);
    const grupo = mapa.get(clave) ?? [];
    grupo.push(registro);
    mapa.set(clave, grupo);
  }
  return mapa;
}
// ===== BUSCAR ATENCIÓN CORRESPONDIENTE =====
function buscarAtencion(asignacion, atenciones) {
  const idAsignacion = tomar(asignacion, "idAsignacion", "asignacionId");
  const idUnidad = tomar(asignacion, "idUnidadTransito", "unidadTransitoId");
  // Primero por asignación exacta.
  const porAsignacion = atenciones.find((atencion) =>
    mismoId(tomar(atencion, "idAsignacion", "asignacionId"), idAsignacion)
  );
  if (porAsignacion) return porAsignacion;
  // Si no hay, por unidad, sin tomar atenciones de otra asignación.
  return (
    atenciones.find((atencion) => {
      const asignacionAtencion = tomar(atencion, "idAsignacion", "asignacionId");
      const unidadAtencion = tomar(atencion, "idUnidadTransito", "unidadTransitoId");
      return asignacionAtencion == null && mismoId(unidadAtencion, idUnidad);
    }) ?? null
  );
}
// ===== LISTAR SEGUIMIENTOS =====
export async function listarSeguimientos() {
  const [alertas, asignaciones, atenciones, unidades, agentes] =
    await Promise.all([
      solicitarLista(RUTAS.alertas),
      solicitarLista(RUTAS.asignaciones),
      solicitarLista(RUTAS.atenciones),
      solicitarLista(RUTAS.unidades),
      solicitarLista(RUTAS.agentes),
    ]);
  const unidadesPorId = crearMapaUnidades(unidades);
  const agentesPorId = crearMapaAgentes(agentes);
  // Las asignaciones de tránsito tienen idUnidadTransito.
  const asignacionesTransito = asignaciones.filter(
    (asignacion) =>
      tomar(asignacion, "idUnidadTransito", "unidadTransitoId") != null
  );
  const asignacionesPorAlerta = agruparPorAlerta(asignacionesTransito);
  const atencionesPorAlerta = agruparPorAlerta(atenciones);
  const seguimientos = [];
  for (const alerta of alertas) {
    const idAlerta = tomar(alerta, "idAlerta", "alertaId");
    if (idAlerta == null) continue;
    const asignadas = asignacionesPorAlerta.get(id(idAlerta)) ?? [];
    const atencionesAlerta = atencionesPorAlerta.get(id(idAlerta)) ?? [];
    // Mostrar todas las asignaciones, aunque todavía no haya atención.
    for (const asignacion of asignadas) {
      const idAsignacion = tomar(asignacion, "idAsignacion", "asignacionId");
      const idUnidad = tomar(asignacion, "idUnidadTransito", "unidadTransitoId");
      const unidad = unidadesPorId.get(id(idUnidad));
      const atencion = buscarAtencion(asignacion, atencionesAlerta);
      const idAgente = tomar(atencion, "idAgenteTransito", "agenteTransitoId");
      const agente = agentesPorId.get(id(idAgente));
      const estadoAlerta = tomar(alerta, "estadoAlerta", "estado");
      const estadoAsignacion = tomar(asignacion, "estadoAsignacion");
      const estadoAtencion = obtenerEstadoAtencion(atencion);
      const idAtencionTransito = tomar(atencion, "idAtencionTransito", "idAtencion");
      seguimientos.push({
        ...alerta,
        // Identificadores
        idAlerta,
        idAsignacion,
        idUnidadTransito: idUnidad,
        idAgenteTransito: idAgente,
        idAtencionTransito,
        claveSeguimiento: [idAlerta, idAsignacion ?? "sin-asignacion", "atencion"].join("-"),
        // Estado de la alerta
        estado: estadoAlerta,
        estadoAlerta,
        // Estado de la asignación
        estadoAsignacion,
        tipoParticipacion: tomar(asignacion, "tipoParticipacion"),
        fechaAsignacion: tomar(asignacion, "fecha"),
        // Estado de la atención
        estadoAtencion,
        estadoFinalAtencion: estadoAtencion,
        tieneAtencion: Boolean(atencion),
        // Información de la alerta
        nombreTipoAlerta:
          tomar(alerta, "nombreTipoAlerta", "tipoAlerta", "tipo") ??
          "Sin tipo registrado",
        descripcionAlerta: tomar(alerta, "descripcionAlerta", "descripcion") ?? "",
        nombreReportante:
          tomar(alerta, "nombreReportante", "reportadoPor", "nombreUsuario", "nombreCompleto") ??
          "No registrado",
        barrio:
          tomar(alerta, "barrio", "nombreBarrio", "barrioNombre") ??
          "Sin barrio registrado",
        // Unidad de tránsito
        nombreUnidad:
          tomar(asignacion, "nombreUnidad", "unidadNombre") ??
          tomar(unidad, "nombre", "nombreUnidad") ??
          "Unidad sin nombre",
        // Agente de tránsito
        nombreAgente:
          tomar(atencion, "nombreAgente", "nombreAgenteTransito") ??
          tomar(agente, "nombreUsuario", "nombreCompleto", "nombreAgente", "username") ??
          "Sin agente registrado",
        // Datos de la atención
        fechaAtencion: tomar(atencion, "fechaAtencion"),
        descripcionAtencion: tomar(atencion, "descripcion"),
        observacionAtencion: tomar(atencion, "observacion"),
        // Control del informe final
        cerrada: estadoCerrado(estadoAlerta),
        puedeRegistrarInforme:
          normalizarEstado(estadoAlerta) === "EN_ATENCION" &&
          normalizarEstado(estadoAsignacion) === "EN_ATENCION" &&
          estadoAtencion !== "FINALIZADA",
      });
    }
  }
  return seguimientos;
}
// ===== REGISTRAR INFORME FINAL =====
// Central registra la atención; el agente solo confirma llegada y finaliza asignación.
export async function registrarInformeFinal(caso, datos) {
  const idAlerta = numero(caso?.idAlerta);
  const idUnidadTransito = numero(caso?.idUnidadTransito);
  const idAsignacion = numero(caso?.idAsignacion);
  const estadoAlerta = normalizarEstado(caso?.estadoAlerta ?? caso?.estado);
  const estadoAsignacion = normalizarEstado(caso?.estadoAsignacion);
  const descripcion = String(datos?.descripcion ?? "").trim();
  const observacion = String(datos?.observacion ?? "").trim();
  if (estadoAlerta !== "EN_ATENCION" || estadoAsignacion !== "EN_ATENCION") {
    throw new Error("La alerta y la asignación deben estar EN_ATENCION.");
  }
  if (!idAlerta || !idUnidadTransito || !idAsignacion) {
    throw new Error("Faltan identificadores de alerta, unidad o asignación.");
  }
  if (!descripcion || bytes(descripcion) > 200 || bytes(observacion) > 200) {
    throw new Error("La descripción es obligatoria y cada campo admite máximo 200 bytes.");
  }
  // Consultar el backend antes de crear: evita duplicar una atención si otra
  // persona de Central la registró después de la última actualización.
  const atenciones = await solicitarLista(`${RUTAS.atenciones}/alerta/${idAlerta}`);
  const coincidentes = atenciones.filter((a) => {
    const asignacion = numero(tomar(a, "idAsignacion", "asignacionId"));
    const unidad = numero(tomar(a, "idUnidadTransito", "unidadTransitoId"));
    return (
      asignacion === idAsignacion ||
      (asignacion == null && unidad === idUnidadTransito)
    );
  });
  if (coincidentes.length > 1) {
    throw new Error("Existen varias atenciones para esta asignación. Revisa los registros antes de continuar.");
  }
  const actual = coincidentes[0] ?? null;
  const idAtencion = numero(tomar(actual, "idAtencionTransito", "idAtencion"));
  if (actual && normalizarEstado(actual.estadoFinal) === "FINALIZADA") {
    throw new Error("La atención ya está FINALIZADA. Actualiza la pantalla.");
  }
  // El POST exige idAgenteTransito y Oracle comprueba que pertenece a la unidad.
  // Si no hay atención previa, buscar el agente real de esa unidad.
  let idAgenteTransito =
    numero(tomar(actual, "idAgenteTransito", "agenteTransitoId")) ||
    numero(caso?.idAgenteTransito);
  if (!idAgenteTransito) {
    const agentes = await solicitarLista(RUTAS.agentes);
    const candidatos = agentes.filter(
      (a) =>
        numero(tomar(a, "idUnidadTransito", "unidadTransitoId")) ===
        idUnidadTransito
    );
    if (candidatos.length === 1) {
      idAgenteTransito = numero(
        tomar(candidatos[0], "idUsuario", "idAgenteTransito", "agenteTransitoId")
      );
    } else {
      throw new Error(
        candidatos.length === 0
          ? "No hay un agente registrado para esta unidad de tránsito."
          : "La unidad tiene varios agentes. Debes seleccionar el agente que atendió el caso antes de registrar el informe."
      );
    }
  }
  const cuerpo = {
    ...(idAtencion ? { idAtencionTransito: idAtencion } : {}),
    idAlerta,
    idUnidadTransito,
    idAgenteTransito,
    fechaAtencion: actual?.fechaAtencion ?? new Date().toISOString(),
    estadoFinal: "FINALIZADA",
    descripcion,
    observacion,
  };
  return consultarTransito(
    idAtencion ? `${RUTAS.atenciones}/${idAtencion}` : RUTAS.atenciones,
    { method: idAtencion ? "PUT" : "POST", body: JSON.stringify(cuerpo) }
  );
}
// ===== MARCAR ALERTA RESUELTA =====
// Central cierra la alerta después de que todas sus asignaciones hayan finalizado.
// Usa POST /api/Alertas/{id}/cerrar del AlertasController existente.
export async function marcarAlertaResuelta(caso) {
  const idAlerta = numero(caso?.idAlerta);
  if (!idAlerta) throw new Error("La alerta no tiene un identificador válido.");
  const [atenciones, asignaciones] = await Promise.all([
    solicitarLista(`${RUTAS.atenciones}/alerta/${idAlerta}`),
    solicitarLista(RUTAS.asignaciones),
  ]);
  const deAlerta = asignaciones.filter(
    (a) => numero(tomar(a, "idAlerta", "alertaId")) === idAlerta
  );
  if (
    !deAlerta.length ||
    deAlerta.some(
      (a) => normalizarEstado(tomar(a, "estadoAsignacion")) !== "FINALIZADA"
    )
  ) {
    throw new Error("Todas las asignaciones deben estar FINALIZADA antes de resolver la alerta.");
  }
  const atencion = atenciones.find(
    (a) =>
      numero(tomar(a, "idAsignacion", "asignacionId")) ===
        numero(caso?.idAsignacion) ||
      numero(tomar(a, "idUnidadTransito", "unidadTransitoId")) ===
        numero(caso?.idUnidadTransito)
  );
  if (!atencion || normalizarEstado(atencion.estadoFinal) !== "FINALIZADA") {
    throw new Error("Central debe finalizar el informe de atención antes de cerrar la alerta.");
  }
  return consultarTransito(`${RUTAS.alertas}/${idAlerta}/cerrar`, {
    method: "POST",
    body: JSON.stringify({ estadoFinal: "RESUELTA" }),
  });
}