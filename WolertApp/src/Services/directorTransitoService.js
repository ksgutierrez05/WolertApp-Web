import { consultarTransito } from "./transitoApi";

const RUTAS = {
  agentes: "/api/AgentesTransitoes",
  unidades: "/api/UnidadTransitoes",
  atenciones: "/api/AtencionesTransito",
  alertas: "/api/Alertas",
  barrios: "/api/Barrios",
};

export function listaApi(respuesta) {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.items)) return respuesta.items;
  if (Array.isArray(respuesta?.data)) return respuesta.data;
  if (Array.isArray(respuesta?.$values)) return respuesta.$values;
  return [];
}
export function texto(valor, alternativa = "No disponible") {
  if (valor === null || valor === undefined || valor === "") return alternativa;
  return String(valor);
}
export function normalizar(valor) {
  return String(valor ?? "").trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
export function fechaTransito(valor) {
  if (!valor) return "Sin fecha";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "Sin fecha";
  return fecha.toLocaleString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
export function fechaEsHoy(valor) {
  if (!valor) return false;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return false;
  const hoy = new Date();
  return fecha.getFullYear() === hoy.getFullYear() && fecha.getMonth() === hoy.getMonth() && fecha.getDate() === hoy.getDate();
}
export function fechaEsEsteMes(valor) {
  if (!valor) return false;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return false;
  const hoy = new Date();
  return fecha.getFullYear() === hoy.getFullYear() && fecha.getMonth() === hoy.getMonth();
}
export function estadoFinalizado(estado) {
  return ["FINALIZADA", "FINALIZADO", "RESUELTA", "RESUELTO", "CERRADA", "CERRADO", "ATENDIDO"].includes(normalizar(estado));
}
export function estadoActivoAgente(estado) {
  return ["ACTIVO", "ACTIVA", "DISPONIBLE", "EN SERVICIO", "EN_SERVICIO"].includes(normalizar(estado));
}
export function nombreAgente(agente) {
  return agente?.nombreUsuario || agente?.nombreCompleto || agente?.nombre || agente?.username || `Agente #${agente?.idAgenteTransito ?? agente?.idUsuario ?? "—"}`;
}
export function idAgente(agente) {
  return agente?.idAgenteTransito ?? agente?.idAgente ?? agente?.idUsuario ?? agente?.id;
}
export function idAtencion(atencion) {
  return atencion?.idAtencionTransito ?? atencion?.idAtencion ?? atencion?.id;
}
export function idAlerta(alerta) { return alerta?.idAlerta ?? alerta?.id; }
export function nombreBarrio(item) {
  return item?.nombreBarrio || item?.barrioNombre || item?.barrio?.nombre || item?.nombre || "No registrado";
}
export async function listarAgentesDirector() {
  const respuesta = await consultarTransito(RUTAS.agentes);
  if (!Array.isArray(respuesta) && !Array.isArray(respuesta?.items) && !Array.isArray(respuesta?.data) && !Array.isArray(respuesta?.$values)) {
    throw new Error("La API no devolvió una lista de agentes.");
  }
  return listaApi(respuesta);
}
export async function registrarAgenteDirector(datos) {
  return consultarTransito(RUTAS.agentes, { method: "POST", body: JSON.stringify(datos) });
}
export async function listarUnidadesDirector() {
  const respuesta = await consultarTransito(RUTAS.unidades);
  return listaApi(respuesta);
}
export async function listarAtencionesDirector() {
  const respuesta = await consultarTransito(RUTAS.atenciones);
  if (!Array.isArray(respuesta) && !Array.isArray(respuesta?.items) && !Array.isArray(respuesta?.data) && !Array.isArray(respuesta?.$values)) {
    throw new Error("La API no devolvió una lista de atenciones.");
  }
  return listaApi(respuesta);
}
// Verificar en Swagger que este controlador exista.
export async function listarAlertasDirector() {
  const [respuesta, respuestaTipos] = await Promise.all([
    consultarTransito(RUTAS.alertas),
    consultarTransito("/api/TiposAlerta"),
  ]);

  const alertas = listaApi(respuesta);
  const tipos = listaApi(respuestaTipos);

  const tiposTransito = tipos.filter(tipo =>
    normalizar(
      tipo.centralResponsable ?? tipo.central_responsable
    ) === "TRANSITO"
  );

  return alertas.filter(alerta => {
    const nombre = normalizar(tipoCaso(alerta));
    const idTipo = alerta.idTipoAlerta ?? alerta.tipoAlertaId;

    return tiposTransito.some(tipo => {
      const id = tipo.idTipoAlerta ?? tipo.id;

      return (
        (idTipo != null && id != null &&
          String(idTipo) === String(id)) ||
        nombre === normalizar(
          tipo.nombre ?? tipo.nombreTipoAlerta ?? tipo.tipo
        )
      );
    });
  });
}
export async function listarBarriosDirector() {
  const respuesta = await consultarTransito(RUTAS.barrios);
  return listaApi(respuesta);
}
export function nombreUnidadAgente(agente, unidades) {
  if (agente?.nombreUnidad) return agente.nombreUnidad;
  if (agente?.zonaAsignada) return agente.zonaAsignada;
  const unidad = unidades.find(item =>
    String(item.idUnidadTransito ?? item.idUnidad ?? item.id) === String(agente?.unidadTransitoId ?? agente?.idUnidadTransito)
  );
  return unidad?.nombre || unidad?.nombreBarrio || unidad?.nombreComuna || "Sin asignar";
}
export function estadoCaso(caso) {
  return caso?.estadoFinal || caso?.estadoAlerta || caso?.estado || "Sin estado";
}
export function tipoCaso(caso) {
  return caso?.tipoAlerta || caso?.nombreTipoAlerta || caso?.tipoCaso || caso?.tipo || "Sin tipo";
}
export function fechaCaso(caso) {
  return caso?.fecha || caso?.fechaReporte || caso?.fechaCreacion || caso?.fechaAlerta || caso?.fechaAtencion || caso?.createdAt || null;
}
export function esAccidente(caso) {
  const tipo = normalizar(tipoCaso(caso));
  return tipo.includes("ACCIDENTE") || tipo.includes("CHOQUE");
}
export function badgeEstadoCaso(estado) {
  const valor = normalizar(estado);
  if (estadoFinalizado(valor)) return "badge-green-dash";
  if (valor.includes("CRITIC")) return "badge-red-dash";
  if (valor.includes("CAMINO")) return "badge-blue-dash";
  return "badge-amber-dash";
}

// Ajustar la ruta y el DTO según el PUT real del controlador ASP.NET.
export async function actualizarAgenteDirector(id, datos) {
  return consultarTransito(`${RUTAS.agentes}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

// Agregar al final de src/Services/directorTransitoService.js
// Usa el mismo cliente autenticado que las otras funciones del service.
export async function registrarCentralTransito(datos) {
  return consultarTransito("/api/Usuarios/personal", {
    method: "POST",
    body: JSON.stringify({
      cedula: datos.cedula,
      primerNombre: datos.primerNombre,
      segundoNombre: datos.segundoNombre,
      primerApellido: datos.primerApellido,
      segundoApellido: datos.segundoApellido,
      correo: datos.correo,
      telefono: datos.telefono,
      username: datos.username,
      password: datos.password,
      barrioId: datos.barrioId ?? null,
      calle: datos.calle,
      carrera: datos.carrera,
      etapa: datos.etapa,
      manzana: datos.manzana,
      casa: datos.casa,
      rolId: 9, // CENTRAL_TRANSITO en el SQL proporcionado
    }),
  });
}

// Listar personal de central desde USUARIOS (no desde AGENTES_TRANSITO).
export async function listarUsuariosTransito() {
  const respuesta = await consultarTransito("/api/Usuarios");
  return Array.isArray(respuesta) ? respuesta : [];
}
