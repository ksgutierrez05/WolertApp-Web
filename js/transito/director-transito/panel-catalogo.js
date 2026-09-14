const RUTA_API_ZONAS = "https://jsonplaceholder.typicode.com/todos"; // placeholder, cambia por tu endpoint real
const RUTA_API_TIPOS = "https://jsonplaceholder.typicode.com/todos"; // placeholder, cambia por tu endpoint real
 
let zonas = [];
let tipos = [];
 
// datos de respaldo si todavía no hay backend ni localStorage
const MOCK_ZONAS = [
  { id: 1, nombre: "Zona Norte", casos: 9, agentes: 2 },
  { id: 2, nombre: "Centro", casos: 7, agentes: 1 },
  { id: 3, nombre: "Sector La Nevada", casos: 3, agentes: 1 },
  { id: 4, nombre: "Los Fundadores", casos: 1, agentes: 1 },
  { id: 5, nombre: "Casimiro Raúl Maestre", casos: 0, agentes: 0 },
];
 
const MOCK_TIPOS = [
  { id: 1, nombre: "Choque simple", casos: 12, prioridad: "Media" },
  { id: 2, nombre: "Choque con heridos", casos: 4, prioridad: "Alta" },
];
 
// pestaña activa y filtro de búsqueda, se usan al renderizar
let tabActiva = "zonas";
let filtro = "";
 
// ---------------------------------------------------------------------
// Otra forma de función (fetch con then/catch), igual que ConsumirApi
// ---------------------------------------------------------------------
const ConsumirApiZonas = () => {
  fetch(RUTA_API_ZONAS)
    .then((res) => res.json())
    .then((data) => {
      zonas = data;
    })
    .catch((error) => console.error("Error: ", error));
};
 
const ConsumirApiTipos = () => {
  fetch(RUTA_API_TIPOS)
    .then((res) => res.json())
    .then((data) => {
      tipos = data;
    })
    .catch((error) => console.error("Error: ", error));
};
 
// ---------------------------------------------------------------------
// CargarApi: primero busca en localStorage, si no hay nada intenta la API,
// y si la API falla usa los datos MOCK para no dejar la vista vacía.
// ---------------------------------------------------------------------
// Bandera: mientras esto sea true, se usan los datos MOCK_* en vez de pegarle
// al placeholder de jsonplaceholder (que responde bien, pero con otra forma de
// datos: {id, title, completed} en vez de {id, nombre, casos, agentes}).
// Cuando conectes tu backend real, cambia esto a false.
const USAR_DATOS_MOCK = true;
 
// Revisa que lo guardado en localStorage tenga la forma esperada (que traiga
// "nombre"). Si es un arreglo vacío o le falta el campo, se considera inválido
// y se vuelve a cargar el mock, en vez de quedarse pegado con datos viejos/rotos.
function esCacheValido(lista) {
  return Array.isArray(lista) && lista.length > 0 && "nombre" in lista[0];
}
 
const CargarZonas = async () => {
  let zonasLocal = localStorage.getItem("zonas");
  let zonasParseadas = zonasLocal ? JSON.parse(zonasLocal) : null;
 
  if (esCacheValido(zonasParseadas)) {
    zonas = zonasParseadas;
    console.log("Zonas cargadas desde localstorage");
    MostrarZonas(zonas);
    return;
  }
 
  if (zonasLocal) {
    console.warn("El cache de 'zonas' en localStorage tenía datos con otra forma (o vacío). Se descarta y se recarga.");
    localStorage.removeItem("zonas");
  }
 
  if (USAR_DATOS_MOCK) {
    zonas = MOCK_ZONAS;
    localStorage.setItem("zonas", JSON.stringify(zonas));
    console.log("Zonas cargadas desde el respaldo local (MOCK_ZONAS)");
    MostrarZonas(zonas);
    return;
  }
 
  try {
    const rest = await fetch(RUTA_API_ZONAS);
    const data = await rest.json();
    zonas = data.slice(0, 5);
    localStorage.setItem("zonas", JSON.stringify(zonas));
    console.log("Zonas cargadas desde la API");
  } catch (error) {
    console.error("Error: ", error);
    zonas = MOCK_ZONAS;
    localStorage.setItem("zonas", JSON.stringify(zonas));
    console.log("Zonas cargadas desde el respaldo local (MOCK_ZONAS)");
  }
  MostrarZonas(zonas);
};
 
const CargarTipos = async () => {
  let tiposLocal = localStorage.getItem("tipos");
  let tiposParseados = tiposLocal ? JSON.parse(tiposLocal) : null;
 
  if (esCacheValido(tiposParseados)) {
    tipos = tiposParseados;
    console.log("Tipos cargados desde localstorage");
    MostrarTipos(tipos);
    return;
  }
 
  if (tiposLocal) {
    console.warn("El cache de 'tipos' en localStorage tenía datos con otra forma (o vacío). Se descarta y se recarga.");
    localStorage.removeItem("tipos");
  }
 
  if (USAR_DATOS_MOCK) {
    tipos = MOCK_TIPOS;
    localStorage.setItem("tipos", JSON.stringify(tipos));
    console.log("Tipos cargados desde el respaldo local (MOCK_TIPOS)");
    MostrarTipos(tipos);
    return;
  }
 
  try {
    const rest = await fetch(RUTA_API_TIPOS);
    const data = await rest.json();
    tipos = data.slice(0, 2);
    localStorage.setItem("tipos", JSON.stringify(tipos));
    console.log("Tipos cargados desde la API");
  } catch (error) {
    console.error("Error: ", error);
    tipos = MOCK_TIPOS;
    localStorage.setItem("tipos", JSON.stringify(tipos));
    console.log("Tipos cargados desde el respaldo local (MOCK_TIPOS)");
  }
  MostrarTipos(tipos);
};
 
// ---------------------------------------------------------------------
// MostrarTarjetas -> aquí MostrarZonas / MostrarTipos, pintan filas de tabla
// ---------------------------------------------------------------------
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
 
function filtrarLista(lista) {
  if (!filtro) return lista;
  return lista.filter((item) =>
    String(item.nombre ?? item.title ?? "").toLowerCase().includes(filtro.toLowerCase())
  );
}
 
const MostrarZonas = (listaZonas) => {
  const tbodyZonas = document.getElementById("tbodyZonas");
  const emptyZonas = document.getElementById("emptyZonas");
  const countZonas = document.getElementById("countZonas");
 
  const datos = filtrarLista(listaZonas);
  countZonas.textContent = listaZonas.length;
 
  tbodyZonas.innerHTML = datos
    .map(
      (zona) => `
    <tr>
      <td class="fw-semibold">${escapeHtml(zona.nombre)}</td>
      <td>${zona.casos ?? 0}</td>
      <td>${zona.agentes ?? 0}</td>
      <td class="text-end">
        <button class="btn-icon-dash" title="Editar" onclick="AbrirModalEditar('zona', ${zona.id})">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn-icon-dash" title="Eliminar" onclick="EliminarZona(${zona.id})">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
 
  emptyZonas.classList.toggle("d-none", datos.length > 0);
};
 
const MostrarTipos = (listaTipos) => {
  const tbodyTipos = document.getElementById("tbodyTipos");
  const emptyTipos = document.getElementById("emptyTipos");
  const countTipos = document.getElementById("countTipos");
 
  const datos = filtrarLista(listaTipos);
  countTipos.textContent = listaTipos.length;
 
  tbodyTipos.innerHTML = datos
    .map(
      (tipo) => `
    <tr>
      <td class="fw-semibold">${escapeHtml(tipo.nombre)}</td>
      <td>${tipo.casos ?? 0}</td>
      <td>${escapeHtml(tipo.prioridad ?? "Media")}</td>
      <td class="text-end">
        <button class="btn-icon-dash" title="Editar" onclick="AbrirModalEditar('tipo', ${tipo.id})">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn-icon-dash" title="Eliminar" onclick="EliminarTipo(${tipo.id})">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
 
  emptyTipos.classList.toggle("d-none", datos.length > 0);
};
 
// ---------------------------------------------------------------------
// EliminarProducto -> aquí EliminarZona / EliminarTipo
// TODO: agregar aquí el DELETE real a tu API cuando exista.
// ---------------------------------------------------------------------
const EliminarZona = (id) => {
  const confirmar = window.confirm("¿Seguro que deseas eliminar esta zona/sector?");
  if (!confirmar) return;
 
  zonas = zonas.filter((zona) => zona.id !== id);
  localStorage.setItem("zonas", JSON.stringify(zonas));
  MostrarZonas(zonas);
};
 
const EliminarTipo = (id) => {
  const confirmar = window.confirm("¿Seguro que deseas eliminar este tipo de caso?");
  if (!confirmar) return;
 
  tipos = tipos.filter((tipo) => tipo.id !== id);
  localStorage.setItem("tipos", JSON.stringify(tipos));
  MostrarTipos(tipos);
};
 
// ---------------------------------------------------------------------
// Tabs y buscador (igual que antes, para no perder la navegación entre pestañas)
// ---------------------------------------------------------------------
function activarTab(nombreTab) {
  tabActiva = nombreTab;
  document.querySelectorAll(".tab-dash").forEach((btn) => {
    btn.classList.toggle("active-dash", btn.dataset.tab === nombreTab);
  });
  document.getElementById("panelZonas").classList.toggle("d-none", nombreTab !== "zonas");
  document.getElementById("panelTipos").classList.toggle("d-none", nombreTab !== "tipos");
}
 
document.querySelectorAll(".tab-dash").forEach((btn) => {
  btn.addEventListener("click", () => activarTab(btn.dataset.tab));
});
 
document.getElementById("inputBuscarCatalogo").addEventListener("input", (e) => {
  filtro = e.target.value.trim();
  MostrarZonas(zonas);
  MostrarTipos(tipos);
});
 
// ---------------------------------------------------------------------
// Modal crear / editar (usa el mismo modal para las dos entidades)
// TODO: agregar aquí el POST/PUT real a tu API cuando exista.
// ---------------------------------------------------------------------
const modalEl = document.getElementById("modalCatalogo");
const modal = new bootstrap.Modal(modalEl);
 
const AbrirModalCrear = () => {
  document.getElementById("formCatalogo").reset();
  document.getElementById("catalogoId").value = "";
  delete document.getElementById("catalogoId").dataset.tipo;
 
  const esZona = tabActiva === "zonas";
  document.getElementById("modalCatalogoTitulo").textContent = esZona ? "Nueva zona / sector" : "Nuevo tipo de caso";
  document.getElementById("labelNombreCatalogo").textContent = esZona ? "Nombre de la zona / sector" : "Nombre del tipo de caso";
  document.getElementById("campoAgentes").classList.toggle("d-none", !esZona);
  document.getElementById("campoPrioridad").classList.toggle("d-none", esZona);
  document.getElementById("inputCasosCatalogo").value = 0;
  document.getElementById("inputAgentesCatalogo").value = 0;
  document.getElementById("inputPrioridadCatalogo").value = "Media";
 
  modal.show();
};
 
const AbrirModalEditar = (tipoEntidad, id) => {
  const inputId = document.getElementById("catalogoId");
  inputId.value = id;
  inputId.dataset.tipo = tipoEntidad;
 
  document.getElementById("campoAgentes").classList.toggle("d-none", tipoEntidad !== "zona");
  document.getElementById("campoPrioridad").classList.toggle("d-none", tipoEntidad !== "tipo");
 
  if (tipoEntidad === "zona") {
    const zona = zonas.find((z) => z.id === id);
    if (!zona) return;
    document.getElementById("modalCatalogoTitulo").textContent = "Editar zona / sector";
    document.getElementById("labelNombreCatalogo").textContent = "Nombre de la zona / sector";
    document.getElementById("inputNombreCatalogo").value = zona.nombre;
    document.getElementById("inputCasosCatalogo").value = zona.casos;
    document.getElementById("inputAgentesCatalogo").value = zona.agentes;
  } else {
    const tipo = tipos.find((t) => t.id === id);
    if (!tipo) return;
    document.getElementById("modalCatalogoTitulo").textContent = "Editar tipo de caso";
    document.getElementById("labelNombreCatalogo").textContent = "Nombre del tipo de caso";
    document.getElementById("inputNombreCatalogo").value = tipo.nombre;
    document.getElementById("inputCasosCatalogo").value = tipo.casos;
    document.getElementById("inputPrioridadCatalogo").value = tipo.prioridad;
  }
 
  modal.show();
};
 
document.getElementById("btnNuevoCatalogo").addEventListener("click", AbrirModalCrear);
 
document.getElementById("btnGuardarCatalogo").addEventListener("click", () => {
  const formCatalogo = document.getElementById("formCatalogo");
  if (!formCatalogo.reportValidity()) return;
 
  const inputId = document.getElementById("catalogoId");
  const nombre = document.getElementById("inputNombreCatalogo").value.trim();
  const casos = parseInt(document.getElementById("inputCasosCatalogo").value, 10) || 0;
  const id = inputId.value ? parseInt(inputId.value, 10) : null;
  const entidad = inputId.dataset.tipo || (tabActiva === "zonas" ? "zona" : "tipo");
 
  if (entidad === "zona") {
    const agentes = parseInt(document.getElementById("inputAgentesCatalogo").value, 10) || 0;
    if (id) {
      const zona = zonas.find((z) => z.id === id);
      if (zona) {
        zona.nombre = nombre;
        zona.casos = casos;
        zona.agentes = agentes;
      }
    } else {
      const nuevoId = zonas.length ? Math.max(...zonas.map((z) => z.id)) + 1 : 1;
      zonas.push({ id: nuevoId, nombre, casos, agentes });
    }
    localStorage.setItem("zonas", JSON.stringify(zonas));
    MostrarZonas(zonas);
  } else {
    const prioridad = document.getElementById("inputPrioridadCatalogo").value;
    if (id) {
      const tipo = tipos.find((t) => t.id === id);
      if (tipo) {
        tipo.nombre = nombre;
        tipo.casos = casos;
        tipo.prioridad = prioridad;
      }
    } else {
      const nuevoId = tipos.length ? Math.max(...tipos.map((t) => t.id)) + 1 : 1;
      tipos.push({ id: nuevoId, nombre, casos, prioridad });
    }
    localStorage.setItem("tipos", JSON.stringify(tipos));
    MostrarTipos(tipos);
  }
 
  delete inputId.dataset.tipo;
  modal.hide();
});
 
// ---------------------------------------------------------------------
// Inicio: igual que CargarApi() al final del archivo original
// ---------------------------------------------------------------------
CargarZonas();
CargarTipos();
activarTab("zonas");
 