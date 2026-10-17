const CLAVE_STORAGE_ALERTAS = "wolertapp_alertas";

let alertas = [];
let filtroActivo = "todas";
let paginaActual = 1;

const ALERTAS_POR_PAGINA = 5;

const TIPO_INFO = {
  ROBO: {
    label: "Robo / Hurto",
    clase: "badge-red-dash",
  },
  ACCIDENTE: {
    label: "Accidente",
    clase: "badge-blue-dash",
  },
  INCENDIO: {
    label: "Incendio",
    clase: "badge-amber-dash",
  },
  SOSPECHOSO: {
    label: "Sospechoso",
    clase: "badge-violeta-dash",
  },
};

const ESTADO_INFO = {
  PENDIENTE: {
    label: "Pendiente",
    clase: "badge-amber-dash",
  },
  RECIBIDA: {
    label: "Recibida",
    clase: "badge-blue-dash",
  },
  EN_ATENCION: {
    label: "En atención",
    clase: "badge-violeta-dash",
  },
  UNIDAD_ASIGNADA: {
    label: "Unidad asignada",
    clase: "badge-teal-dash",
  },
  RESUELTA: {
    label: "Resuelta",
    clase: "badge-green-dash",
  },
  CANCELADA: {
    label: "Cancelada",
    clase: "badge-muted-dash",
  },
};

const AVATAR_CLASES = [
  "avatar-amber-dash",
  "avatar-green-dash",
  "avatar-blue-dash",
];

/* =========================================================
   DATOS BASE
   ========================================================= */

const alertasBase = [
  {
    id: 1,
    tipo: "ROBO",
    estado: "PENDIENTE",
    ciudadano: "Carlos Martínez",
    barrio: "Los Fundadores",
    fecha: "Hoy · 08:35 a.m.",
    descripcion: "Se reportó un posible robo cerca de una zona comercial.",
  },
  {
    id: 2,
    tipo: "ACCIDENTE",
    estado: "RECIBIDA",
    ciudadano: "María González",
    barrio: "La Nevada",
    fecha: "Hoy · 09:10 a.m.",
    descripcion: "Accidente de tránsito reportado en la vía principal.",
  },
  {
    id: 3,
    tipo: "INCENDIO",
    estado: "EN_ATENCION",
    ciudadano: "Andrés Pérez",
    barrio: "Casimiro Raúl Maestre",
    fecha: "Hoy · 09:40 a.m.",
    descripcion: "Se reportó humo y posible incendio en una vivienda.",
  },
  {
    id: 4,
    tipo: "SOSPECHOSO",
    estado: "UNIDAD_ASIGNADA",
    ciudadano: "Laura Rodríguez",
    barrio: "San Joaquín",
    fecha: "Hoy · 10:15 a.m.",
    descripcion: "Ciudadano reporta comportamiento sospechoso en el sector.",
  },
  {
    id: 5,
    tipo: "ROBO",
    estado: "RESUELTA",
    ciudadano: "Juan Díaz",
    barrio: "Centro",
    fecha: "Hoy · 10:30 a.m.",
    descripcion: "Reporte de hurto atendido por una unidad policial.",
  },
  {
    id: 6,
    tipo: "ACCIDENTE",
    estado: "PENDIENTE",
    ciudadano: "Daniel Torres",
    barrio: "Villa Dariana",
    fecha: "Hoy · 10:45 a.m.",
    descripcion: "Colisión entre dos vehículos.",
  },
  {
    id: 7,
    tipo: "ACCIDENTE",
    estado: "RECIBIDA",
    ciudadano: "Sofía Ramírez",
    barrio: "El Prado",
    fecha: "Hoy · 11:00 a.m.",
    descripcion: "Accidente reportado por un ciudadano.",
  },
  {
    id: 8,
    tipo: "INCENDIO",
    estado: "PENDIENTE",
    ciudadano: "Pedro Vargas",
    barrio: "La Popa",
    fecha: "Hoy · 11:20 a.m.",
    descripcion: "Reporte de incendio en un establecimiento.",
  },
];

/* =========================================================
   FUNCIONES AUXILIARES
   ========================================================= */

const inicialesDe = (nombre) => {
  if (!nombre) return "?";

  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
};

const avatarClaseDe = (nombre) => {
  if (!nombre) return AVATAR_CLASES[0];

  const suma = nombre
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  return AVATAR_CLASES[suma % AVATAR_CLASES.length];
};

/* =========================================================
   STORAGE
   ========================================================= */

const GuardarEnStorage = () => {
  localStorage.setItem(
    CLAVE_STORAGE_ALERTAS,
    JSON.stringify(alertas)
  );
};

const CargarAlertas = () => {
  const guardado = localStorage.getItem(CLAVE_STORAGE_ALERTAS);

  if (guardado) {
    try {
      alertas = JSON.parse(guardado);

      if (!Array.isArray(alertas)) {
        alertas = alertasBase;
        GuardarEnStorage();
      }

      console.log("Alertas cargadas desde localStorage");
    } catch (error) {
      console.error("Error leyendo las alertas:", error);

      alertas = alertasBase;
      GuardarEnStorage();
    }
  } else {
    alertas = alertasBase;
    GuardarEnStorage();

    console.log("Alertas inicializadas con datos base");
  }

  RenderizarTodo();
};

/* =========================================================
   RENDER GENERAL
   ========================================================= */

const RenderizarTodo = () => {
  const textoBusqueda =
    document.getElementById("buscarAlerta")?.value
      .trim()
      .toLowerCase() || "";

  let filtradas = alertas;

  /* Filtro por tipo */

  if (filtroActivo !== "todas") {
    filtradas = filtradas.filter(
      (alerta) => alerta.tipo === filtroActivo
    );
  }

  /* Filtro por búsqueda */

  if (textoBusqueda) {
    filtradas = filtradas.filter((alerta) => {
      const ciudadano =
        alerta.ciudadano?.toLowerCase() || "";

      const barrio =
        alerta.barrio?.toLowerCase() || "";

      const tipo =
        TIPO_INFO[alerta.tipo]?.label.toLowerCase() || "";

      return (
        ciudadano.includes(textoBusqueda) ||
        barrio.includes(textoBusqueda) ||
        tipo.includes(textoBusqueda)
      );
    });
  }

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtradas.length / ALERTAS_POR_PAGINA)
  );

  if (paginaActual > totalPaginas) {
    paginaActual = totalPaginas;
  }

  const inicio =
    (paginaActual - 1) * ALERTAS_POR_PAGINA;

  const alertasPagina = filtradas.slice(
    inicio,
    inicio + ALERTAS_POR_PAGINA
  );

  PintarAlertas(alertasPagina);
  ActualizarKpis(alertas);
  ActualizarChips();
  ActualizarPaginacion(
    filtradas.length,
    totalPaginas
  );
};

/* =========================================================
   TABLA
   ========================================================= */

const PintarAlertas = (lista) => {
  const cuerpoTabla =
    document.getElementById("filaAlertas");

  if (!cuerpoTabla) {
    console.error(
      "No se encontró el elemento #filaAlertas"
    );
    return;
  }

  if (lista.length === 0) {
    cuerpoTabla.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-5">
          <i class="bi bi-inbox fs-3 d-block mb-2"></i>
          No hay alertas registradas.
        </td>
      </tr>
    `;

    return;
  }

  cuerpoTabla.innerHTML = lista
    .map((alerta) => {
      const tipo =
        TIPO_INFO[alerta.tipo] || {
          label: alerta.tipo || "Sin tipo",
          clase: "",
        };

      const estado =
        ESTADO_INFO[alerta.estado] || {
          label: alerta.estado || "Sin estado",
          clase: "",
        };

      const ciudadano =
        alerta.ciudadano || "Ciudadano";

      return `
        <tr>
          <td>
            <span class="badge-tipo-dash ${tipo.clase}">
              ${tipo.label}
            </span>
          </td>

          <td>
            <div class="d-flex align-items-center gap-2">
              <div class="avatar-dash ${avatarClaseDe(
        ciudadano
      )}">
                ${inicialesDe(ciudadano)}
              </div>

              <span>${ciudadano}</span>
            </div>
          </td>

          <td>
            ${alerta.barrio || "Sin barrio"}
          </td>

          <td>
            <span class="badge-tipo-dash ${estado.clase}">
              ${estado.label}
            </span>
          </td>

          <td class="text-muted small">
            ${alerta.fecha || "Sin fecha"}
          </td>

          <td class="text-end">
  <button
    type="button"
    class="btn-detalle-alerta"
    onclick="VerDetalleAlerta(${alerta.id})"
    title="Ver detalle"
    aria-label="Ver detalle de la alerta"
  >
    <i class="bi bi-eye"></i>
  </button>
</td>
        </tr>
      `;
    })
    .join("");
};

/* =========================================================
   KPIs
   ========================================================= */

const ActualizarKpis = (lista) => {
  const pendientes = lista.filter(
    (a) => a.estado === "PENDIENTE"
  ).length;

  const enAtencion = lista.filter(
    (a) =>
      a.estado === "EN_ATENCION" ||
      a.estado === "UNIDAD_ASIGNADA"
  ).length;

  const resueltas = lista.filter(
    (a) => a.estado === "RESUELTA"
  ).length;

  const elementoPendientes =
    document.getElementById("kpiPendientes");

  const elementoAtencion =
    document.getElementById("kpiEnAtencion");

  const elementoResueltas =
    document.getElementById("kpiResueltas");

  const elementoTotal =
    document.getElementById("kpiTotal");

  if (elementoPendientes) {
    elementoPendientes.textContent = pendientes;
  }

  if (elementoAtencion) {
    elementoAtencion.textContent = enAtencion;
  }

  if (elementoResueltas) {
    elementoResueltas.textContent = resueltas;
  }

  if (elementoTotal) {
    elementoTotal.textContent = lista.length;
  }
};

/* =========================================================
   CHIPS DE FILTRO
   ========================================================= */

const ActualizarChips = () => {
  const contenedor =
    document.getElementById("filtrosAlertas");

  if (!contenedor) return;

  const botones =
    contenedor.querySelectorAll("[data-filtro]");

  botones.forEach((boton) => {
    const filtro = boton.dataset.filtro;

    const cantidad =
      filtro === "todas"
        ? alertas.length
        : alertas.filter(
          (alerta) => alerta.tipo === filtro
        ).length;

    const contador =
      boton.querySelector(".chip-count-dash");

    if (contador) {
      contador.textContent = cantidad;
    }

    boton.classList.toggle(
      "active",
      filtro === filtroActivo
    );
  });
};

/* =========================================================
   BÚSQUEDA
   ========================================================= */

const ConfigurarBusqueda = () => {
  const buscador =
    document.getElementById("buscarAlerta");

  if (!buscador) return;

  buscador.addEventListener("input", () => {
    paginaActual = 1;
    RenderizarTodo();
  });
};

/* =========================================================
   FILTROS
   ========================================================= */

const ConfigurarFiltros = () => {
  const contenedor =
    document.getElementById("filtrosAlertas");

  if (!contenedor) return;

  contenedor.addEventListener("click", (evento) => {
    const boton =
      evento.target.closest("[data-filtro]");

    if (!boton) return;

    filtroActivo = boton.dataset.filtro;
    paginaActual = 1;

    RenderizarTodo();
  });
};

/* =========================================================
   PAGINACIÓN
   ========================================================= */

const ActualizarPaginacion = (
  totalResultados,
  totalPaginas
) => {
  const botones =
    document.querySelectorAll(".pagina-btn-dash");

  if (!botones.length) return;

  botones.forEach((boton, indice) => {
    boton.classList.remove("active");

    if (
      !boton.dataset.accion &&
      indice + 1 === paginaActual
    ) {
      boton.classList.add("active");
    }
  });

  const botonSiguiente =
    document.querySelector(
      '.pagina-btn-dash[data-accion="siguiente"]'
    );

  if (botonSiguiente) {
    botonSiguiente.disabled =
      paginaActual >= totalPaginas;
  }
};

const ConfigurarPaginacion = () => {
  const botones =
    document.querySelectorAll(".pagina-btn-dash");

  botones.forEach((boton, indice) => {
    boton.addEventListener("click", () => {
      const accion = boton.dataset.accion;

      if (accion === "siguiente") {
        paginaActual++;
      } else if (accion === "anterior") {
        paginaActual--;
      } else {
        paginaActual = indice + 1;
      }

      RenderizarTodo();
    });
  });
};

/* =========================================================
   DETALLE DE ALERTA
   ========================================================= */

const VerDetalleAlerta = (id) => {
  const alerta = alertas.find((a) => a.id === id);

  if (!alerta) return;

  const tipo = TIPO_INFO[alerta.tipo] || {
    label: alerta.tipo || "Sin tipo",
    clase: "",
  };

  const estado = ESTADO_INFO[alerta.estado] || {
    label: alerta.estado || "Sin estado",
    clase: "",
  };

  const modal = document.getElementById("modalDetalleAlerta");

  if (!modal) {
    console.error("No existe #modalDetalleAlerta");
    return;
  }

  document.getElementById("detalleTipo").innerHTML = `
    <span class="badge-tipo-dash ${tipo.clase}">
      ${tipo.label}
    </span>
  `;

  document.getElementById("detalleEstado").innerHTML = `
    <span class="badge-tipo-dash ${estado.clase}">
      ${estado.label}
    </span>
  `;

  document.getElementById("detalleCiudadano").textContent =
    alerta.ciudadano || "Sin información";

  document.getElementById("detalleBarrio").textContent =
    alerta.barrio || "Sin información";

  document.getElementById("detalleFecha").textContent =
    alerta.fecha || "Sin información";

  document.getElementById("detalleDescripcion").textContent =
    alerta.descripcion || "Sin descripción";

  const modalBootstrap = new bootstrap.Modal(modal);
  modalBootstrap.show();
};
/* =========================================================
   CAMBIAR ESTADO
   ========================================================= */

const CambiarEstadoAlerta = (id, nuevoEstado) => {
  const alerta = alertas.find(
    (a) => a.id === id
  );

  if (!alerta) return;

  alerta.estado = nuevoEstado;

  GuardarEnStorage();
  RenderizarTodo();
};

/* =========================================================
   EVENTOS
   ========================================================= */

const ConfigurarEventos = () => {
  ConfigurarBusqueda();
  ConfigurarFiltros();
  ConfigurarPaginacion();
};

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */

console.log("ALERTAS.JS SE CARGÓ");

ConfigurarEventos();
CargarAlertas();

console.log("ALERTAS.JS TERMINÓ");