import { consultarTransito, obtenerSesionTransito } from "./transitoApi";

const RUTAS = {
  agentes: "/api/AgentesTransitoes",
  unidades: "/api/UnidadTransitoes",
  atenciones: "/api/AtencionesTransito",
};

function convertirLista(datos) {
  if (Array.isArray(datos)) return datos;
  if (Array.isArray(datos?.items)) return datos.items;
  if (Array.isArray(datos?.data)) return datos.data;
  if (Array.isArray(datos?.results)) return datos.results;
  if (Array.isArray(datos?.$values)) return datos.$values;
  if (datos == null) return [];
  throw new Error("La API no devolvio una lista valida.");
}

function idUsuarioActual() {
  const { idUsuario } = obtenerSesionTransito();
  if (!idUsuario) {
    throw new Error("No hay sesion de agente. Inicia sesion de nuevo.");
  }
  return idUsuario;
}

function idDeUnidad(obj) {
  return obj?.idUnidadTransito ?? obj?.idUnidad ?? obj?.IdUnidadTransito ?? null;
}

export async function obtenerPerfilAgente() {
  const idUsuario = idUsuarioActual();
  const agentes = convertirLista(await consultarTransito(RUTAS.agentes));

  const agente = agentes.find(
    (a) => Number(a.idUsuario ?? a.IdUsuario) === idUsuario
  );

  if (!agente) {
    throw new Error("No se encontro el agente asociado a tu usuario.");
  }
  return agente;
}

export async function obtenerUnidadAgente() {
  const agente = await obtenerPerfilAgente();
  const idUnidad = idDeUnidad(agente);
  if (idUnidad == null) return null;

  const unidades = convertirLista(await consultarTransito(RUTAS.unidades));
  return unidades.find((u) => idDeUnidad(u) === idUnidad) ?? null;
}

export async function obtenerGrupoAgente() {
  const idUsuario = idUsuarioActual();
  const [agentes, unidades] = await Promise.all([
    consultarTransito(RUTAS.agentes).then(convertirLista),
    consultarTransito(RUTAS.unidades).then(convertirLista),
  ]);

  const yo = agentes.find(
    (a) => Number(a.idUsuario ?? a.IdUsuario) === idUsuario
  );
  const idUnidad = idDeUnidad(yo);

  const unidad = unidades.find((u) => idDeUnidad(u) === idUnidad) ?? null;
  const integrantes =
    idUnidad == null ? [] : agentes.filter((a) => idDeUnidad(a) === idUnidad);

  return { unidad, integrantes };
}

export async function obtenerAtencionesAgente() {
  const perfil = await obtenerPerfilAgente();
  const idUnidad = idDeUnidad(perfil);

  const atenciones = convertirLista(await consultarTransito(RUTAS.atenciones));

  // Si las atenciones traen la unidad, se filtra por la del agente.
  return atenciones.filter((x) => {
    const u = idDeUnidad(x);
    return u == null || idUnidad == null || u === idUnidad;
  });
}

export async function obtenerResumenAgente() {
  const atenciones = await obtenerAtencionesAgente();
  return {
    atenciones,
    enProceso: atenciones.filter((x) => x.estadoFinal === "EN_PROCESO"),
    finalizadas: atenciones.filter((x) => x.estadoFinal === "FINALIZADA"),
  };
}

export function fechaAtencion(valor) {
  const crudo =
    valor && typeof valor === "object" ? valor.fechaAtencion : valor;
  if (!crudo) return "Sin fecha";

  const fecha = new Date(crudo);
  if (Number.isNaN(fecha.getTime())) return String(crudo);

  return fecha.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}