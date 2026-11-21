
import { consultarTransito, obtenerSesionTransito } from "./transitoApi";

// Verifica la ruta de alertas en Swagger.
const RUTAS = {
  agentes: "/api/AgentesTransitoes",
  unidades: "/api/UnidadTransitoes",
  atenciones: "/api/AtencionesTransito",
  alertas: "/api/Alertas",
};

function convertirLista(datos) {
  if (Array.isArray(datos)) return datos;

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

  if (datos == null) return [];

  throw new Error("La API no devolviÃ³ una lista vÃ¡lida.");
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

  if (id == null) return null;

  return (
    unidades.find(
      (unidad) =>
        String(idUnidadCentral(unidad)) === String(id)
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

  if (id == null) return [];

  return atenciones.filter((atencion) => {
    const idAsignado =
      atencion?.idAgenteTransito ??
      atencion?.agenteTransitoId;

    return (
      idAsignado != null &&
      String(idAsignado) === String(id)
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

  const tieneAtencion = atencionesDeAgenteCentral(
    agente,
    atenciones
  ).some((atencion) => !finalizadaCentral(atencion));

  if (tieneAtencion) return "atencion";

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
    "UbicaciÃ³n no registrada"
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

// ESTA ES LA EXPORTACIÃ“N QUE FALTABA.
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

  if (minutos < 60) {
    return `${minutos} min`;
  }

  const horas = Math.floor(minutos / 60);

  return `${horas} h ${minutos % 60} min`;
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
      alerta?.estadoAlerta ?? alerta?.estado
    );

    return (
      id != null &&
      !asignadas.has(String(id)) &&
      !estadosCerrados.includes(estado)
    );
  });
}

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
      grupo: nombreUnidadCentral(agente, unidades),
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

export function prepararGruposCentral(
  unidades = [],
  agentes = [],
  atenciones = []
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

    const disponibles = integrantes.filter(
      (agente) =>
        estadoAgenteCentral(agente, atenciones) ===
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
      disponible: disponibles > 0,
    };
  });
}



const RUTAS_AGENTE = {
  agentes: "/api/AgentesTransitoes",
  unidades: "/api/UnidadTransitoes",
  atenciones: "/api/AtencionesTransito",
};

function convertirListaAgente(datos) {
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
  const agentes = convertirListaAgente(await consultarTransito(RUTAS_AGENTE.agentes));

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

  const unidades = convertirListaAgente(await consultarTransito(RUTAS_AGENTE.unidades));
  return unidades.find((u) => idDeUnidad(u) === idUnidad) ?? null;
}

export async function obtenerGrupoAgente() {
  const idUsuario = idUsuarioActual();
  const [agentes, unidades] = await Promise.all([
    consultarTransito(RUTAS_AGENTE.agentes).then(convertirLista),
    consultarTransito(RUTAS_AGENTE.unidades).then(convertirLista),
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

  const atenciones = convertirListaAgente(await consultarTransito(RUTAS_AGENTE.atenciones));

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
