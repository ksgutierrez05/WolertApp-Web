
const CLAVE_PANEL_GRUPO = "panelGrupoTransito1";
 
const ESTADOS_CASO = ["recibido", "en-camino", "en-sitio", "atendido"];
 
const ICONOS_ESTADO = {
  "recibido": "bi-inbox-fill",
  "en-camino": "bi-truck",
  "en-sitio": "bi-geo-alt-fill",
  "atendido": "bi-flag-fill",
};
 
const ETIQUETAS_ESTADO = {
  "recibido": "Recibido",
  "en-camino": "En camino",
  "en-sitio": "En el sitio",
  "atendido": "Atendido",
};
 
const PANEL_SEED = {
  caso: {
    id: 501,
    tipo: "accidente", // "accidente" | "semaforo"
    titulo: "Casimiro Raúl Maestre",
    reportadoPor: "Katherine Gutiérrez",
    horaReporte: "07:47 a.m.",
    horaAsignacion: "07:50 a.m.",
    estadoIndex: 2, // 0 recibido, 1 en camino, 2 en el sitio, 3 atendido
  },
  // Casos que esperan turno. En cuanto el caso actual queda "Atendido",
  // se toma el primero de esta lista y se le asigna al grupo.
  colaCasos: [
    {
      id: 502,
      tipo: "semaforo",
      titulo: "Semáforo dañado · Los Fundadores",
      reportadoPor: "Diana Torres",
      horaReporte: "08:05 a.m.",
      horaAsignacion: null, // se completa al asignarse
      estadoIndex: 0,
    },
  ],
  miembros: [
    { id: 1, nombre: "Jorge Ramírez", esUsuarioActual: true, estado: "atencion" },
    { id: 2, nombre: "Camilo Vega", esUsuarioActual: false, estado: "atencion" },
    { id: 3, nombre: "Sara Molina", esUsuarioActual: false, estado: "disponible" },
  ],
};
 
let panelGrupo = null;
 
const Iniciales = (nombreCompleto) => {
  const partes = nombreCompleto.trim().split(" ");
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
};
 
const ClaseAvatarMiembro = (estado) => (estado === "disponible" ? "avatar-green-dash" : "avatar-amber-dash");
const ClaseBadgeMiembro = (estado) => (estado === "disponible" ? "estado-resuelta-dash" : "estado-atencion-dash");
const TextoBadgeMiembro = (estado) => (estado === "disponible" ? "Disponible" : "En atención");
 
const ClaseTipoCaso = (tipo) => (tipo === "semaforo" ? "tipo-semaforo-dash" : "tipo-accidente-dash");
const TextoTipoCaso = (tipo) => (tipo === "semaforo" ? "Semáforo dañado" : "Accidente");
 
const GuardarPanelGrupo = () => {
  localStorage.setItem(CLAVE_PANEL_GRUPO, JSON.stringify(panelGrupo));
};
 
const CargarPanelGrupo = () => {
  const guardado = localStorage.getItem(CLAVE_PANEL_GRUPO);
  const parseado = guardado ? JSON.parse(guardado) : null;
  const desactualizado = parseado && (parseado.colaCasos === undefined || (parseado.caso && parseado.caso.estadoIndex === undefined));
 
  panelGrupo = (parseado && !desactualizado) ? parseado : structuredClone(PANEL_SEED);
  if (!parseado || desactualizado) GuardarPanelGrupo();
 
  VincularBotonesEstado();
  RenderizarTodo();
};
 
const RenderizarTodo = () => {
  RenderizarHero();
  RenderizarCaso();
  RenderizarMiembros();
};
 
const RenderizarHero = () => {
  const heroTexto = document.querySelector(".hero-page-text-dash");
  if (!heroTexto) return;
 
  const enCola = panelGrupo.colaCasos.length;
 
  if (!panelGrupo.caso) {
    heroTexto.textContent = "No tienen casos asignados en este momento.";
    return;
  }
 
  heroTexto.textContent = enCola > 0
    ? `Tienen 1 caso asignado en este momento y ${enCola} más en cola.`
    : "Tienen 1 caso asignado en este momento.";
};
 
// Crea (una sola vez) la tarjeta de "sin casos asignados" justo después de
// la tarjeta del caso, y la reutiliza cada vez que se necesita mostrar u
// ocultar.
const AsegurarEstadoVacio = () => {
  let estadoVacio = document.getElementById("casoVacioDash");
  if (estadoVacio) return estadoVacio;
 
  const panelCaso = document.querySelector(".panel-card-dash");
  if (!panelCaso) return null;
 
  estadoVacio = document.createElement("div");
  estadoVacio.id = "casoVacioDash";
  estadoVacio.className = "panel-card-dash mb-4 text-center text-muted py-5";
  estadoVacio.style.display = "none";
  estadoVacio.innerHTML = `
    <i class="bi bi-check2-circle" style="font-size: 32px; color: #2fa84f;"></i>
    <p class="mt-3 mb-1 fw-semibold" style="color:#182339;">Sin casos asignados por el momento</p>
    <p class="mb-0" style="font-size: 13px;">Les avisaremos apenas Central de Despacho les asigne uno nuevo.</p>
  `;
  panelCaso.insertAdjacentElement("afterend", estadoVacio);
  return estadoVacio;
};
 
const RenderizarCaso = () => {
  const panelCaso = document.querySelector(".panel-card-dash");
  const caso = panelGrupo.caso;
 
  if (!caso) {
    if (panelCaso) panelCaso.style.display = "none";
    const estadoVacio = AsegurarEstadoVacio();
    if (estadoVacio) estadoVacio.style.display = "";
    return;
  }
 
  if (panelCaso) panelCaso.style.display = "";
  const estadoVacio = AsegurarEstadoVacio();
  if (estadoVacio) estadoVacio.style.display = "none";
 
  const badgeTipo = document.querySelector(".badge-tipo-dash");
  const tituloCaso = document.querySelector(".caso-titulo-dash");
  const metaCaso = document.querySelector(".config-text-dash");
 
  if (badgeTipo) {
    badgeTipo.textContent = TextoTipoCaso(caso.tipo);
    badgeTipo.className = `badge-tipo-dash ${ClaseTipoCaso(caso.tipo)} mb-2 d-inline-block`;
  }
  if (tituloCaso) tituloCaso.textContent = caso.titulo;
  if (metaCaso) {
    metaCaso.textContent = `Reportado por ${caso.reportadoPor} · ${caso.horaReporte} · Asignado a las ${caso.horaAsignacion}`;
  }
 
  RenderizarPasosEstado();
};
 
const RenderizarPasosEstado = () => {
  const botones = document.querySelectorAll(".btn-estado-dash");
  const estadoActualIndex = panelGrupo.caso.estadoIndex;
 
  botones.forEach((boton, index) => {
    const clave = ESTADOS_CASO[index];
    const icono = boton.querySelector("i");
    const texto = boton.querySelector("span");
 
    boton.classList.remove("completado-dash", "activo-dash");
 
    if (index < estadoActualIndex) {
      boton.classList.add("completado-dash");
      if (icono) icono.className = "bi bi-check-circle-fill";
    } else if (index === estadoActualIndex) {
      boton.classList.add("activo-dash");
      if (icono) icono.className = `bi ${ICONOS_ESTADO[clave]}`;
    } else if (icono) {
      icono.className = `bi ${ICONOS_ESTADO[clave]}`;
    }
 
    if (texto) texto.textContent = ETIQUETAS_ESTADO[clave];
  });
};
 
// Se enlazan por posición (no requiere tocar el HTML): el botón 0 es
// "Recibido", el 1 "En camino", el 2 "En el sitio" y el 3 "Atendido".
const VincularBotonesEstado = () => {
  const botones = document.querySelectorAll(".btn-estado-dash");
  botones.forEach((boton, index) => {
    boton.addEventListener("click", () => CambiarEstadoCaso(index));
  });
};
 
const CambiarEstadoCaso = (nuevoIndex) => {
  if (!panelGrupo.caso) return;
  if (nuevoIndex === panelGrupo.caso.estadoIndex) return;
 
  panelGrupo.caso.estadoIndex = nuevoIndex;
 
  const usuarioActual = panelGrupo.miembros.find((m) => m.esUsuarioActual);
  const esUltimoPaso = nuevoIndex === ESTADOS_CASO.length - 1;
 
  if (usuarioActual) {
    // Mientras no esté "Atendido" el agente sigue en atención. Si queda
    // Atendido, su disponibilidad depende de si entra un caso nuevo o no
    // (eso se resuelve justo abajo, en AsignarSiguienteCaso).
    usuarioActual.estado = esUltimoPaso ? "disponible" : "atencion";
  }
 
  GuardarPanelGrupo();
  RenderizarTodo();
 
  if (esUltimoPaso) {
    // Se deja ver el "Atendido" un instante antes de tomar el siguiente caso.
    setTimeout(AsignarSiguienteCaso, 1200);
  }
};
 
// Toma el primer caso de la cola (si hay) y se lo asigna al grupo con su
// flujo reiniciado en "Recibido". Si la cola está vacía, el grupo queda
// libre y sin caso asignado.
const AsignarSiguienteCaso = () => {
  const siguiente = panelGrupo.colaCasos.shift() ?? null;
 
  if (siguiente) {
    siguiente.estadoIndex = 0;
    siguiente.horaAsignacion = ObtenerHoraActual();
  }
  panelGrupo.caso = siguiente;
 
  const usuarioActual = panelGrupo.miembros.find((m) => m.esUsuarioActual);
  if (usuarioActual) {
    usuarioActual.estado = siguiente ? "atencion" : "disponible";
  }
 
  GuardarPanelGrupo();
  RenderizarTodo();
};
 
const ObtenerHoraActual = () => {
  const ahora = new Date();
  return ahora.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });
};
 
const RenderizarMiembros = () => {
  const filas = document.querySelectorAll(".miembro-row-dash");
 
  panelGrupo.miembros.forEach((miembro, index) => {
    const fila = filas[index];
    if (!fila) return;
 
    const avatar = fila.querySelector(".avatar-icon-dash");
    const nombre = fila.querySelector(".fw-semibold");
    const badge = fila.querySelector(".badge-estado-dash");
 
    if (avatar) {
      avatar.textContent = Iniciales(miembro.nombre);
      avatar.className = `avatar-icon-dash ${ClaseAvatarMiembro(miembro.estado)}`;
    }
    if (nombre) nombre.textContent = miembro.esUsuarioActual ? `${miembro.nombre} (tú)` : miembro.nombre;
    if (badge) {
      badge.textContent = TextoBadgeMiembro(miembro.estado);
      badge.className = `badge-estado-dash ${ClaseBadgeMiembro(miembro.estado)}`;
    }
  });
};
 
CargarPanelGrupo();
 