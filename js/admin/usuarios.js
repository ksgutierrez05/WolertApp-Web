// ============================================================
// USUARIOS.JS — lógica propia de admin/usuarios.html
// ============================================================

const CLAVE_USUARIOS = "wolertapp_usuarios";

// Datos de ejemplo, solo se usan la PRIMERA vez (si localStorage está vacío)
const usuariosDeEjemplo = [
    { nombre: "Sofia Barliza Gutierrez", username: "Sofia123", cedula: "4444555666", correo: "sofia@gmail.com", telefono: "5555777444", rol: "ciudadano", estado: "activo", color: "#1f5fa8" },
    { nombre: "Yamil David Bustillo Contreras", username: "Yamil123", cedula: "1055200333", correo: "yamil@gmail.com", telefono: "3157859745", rol: "ciudadano", estado: "activo", color: "#1f5fa8" },
    { nombre: "Laura Sofia Daza Leon", username: "lauf", cedula: "444", correo: "lau@gmail.com", telefono: "555", rol: "ciudadano", estado: "activo", color: "#c81e2c" },
    { nombre: "Margarita Daza Jimenez", username: "Margarita123", cedula: "8888999777", correo: "margarita@gmail.com", telefono: "4552214463", rol: "ciudadano", estado: "activo", color: "#1f5fa8" },
    { nombre: "Hernando Luis Garcia", username: "hernan01", cedula: "55112236", correo: "hernan01@gmail.com", telefono: "4445558552", rol: "policia", estado: "activo", color: "#1f9d5b" },
    { nombre: "Luis Garcia Daza", username: "luisgd", cedula: "9988776655", correo: "luisgd@gmail.com", telefono: "3011112233", rol: "admin", estado: "activo", color: "#7c4fd1" }
];

// Lista principal de usuarios, se llena al iniciar la página
let listaUsuarios = [];

// Guarda el username del usuario que se está editando (null si se está creando uno nuevo)
let usernameEnEdicion = null;

const nombreDeRol = { admin: "Administrador", policia: "Policía", ciudadano: "Ciudadano" };
const claseBadgePorRol = { admin: "badge-blue-dash", policia: "badge-gray-dash", ciudadano: "badge-green-dash" };
const claseEstadoPorTipo = { activo: "status-active-dash", inactivo: "status-inactive-dash", suspendido: "status-inactive-dash" };
const nombreDeEstado = { activo: "Activo", inactivo: "Inactivo", suspendido: "Suspendido" };


// ===== CARGAR / GUARDAR EN EL NAVEGADOR =====
function cargarUsuarios() {
    const datosGuardados = localStorage.getItem(CLAVE_USUARIOS);

    if (datosGuardados) {
        listaUsuarios = JSON.parse(datosGuardados);
    } else {
        listaUsuarios = usuariosDeEjemplo;
        guardarUsuarios();
    }
}

function guardarUsuarios() {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(listaUsuarios));
}


// ===== BUSCAR UN USUARIO POR SU USERNAME =====
function buscarUsuarioPorUsername(username) {
    return listaUsuarios.find(usuario => usuario.username === username);
}


// ===== OBTENER LAS INICIALES DE UN NOMBRE COMPLETO =====
function obtenerIniciales(nombreCompleto) {
    const partes = nombreCompleto.trim().split(/\s+/);
    return (partes[0][0] + (partes[1] ? partes[1][0] : "")).toUpperCase();
}


// ===== GENERAR UN COLOR ALEATORIO PARA EL AVATAR =====
function generarColorAleatorio() {
    const paleta = ["#1f5fa8", "#1f9d5b", "#7c4fd1", "#c81e2c", "#c9821c", "#0a2f5c"];
    return paleta[Math.floor(Math.random() * paleta.length)];
}


// ===== CREAR LA FILA HTML DE UN USUARIO =====
function crearFilaUsuario(usuario) {
    const fila = document.createElement("tr");

    fila.innerHTML = `
        <td>
            <div class="d-flex align-items-center gap-2">
                <div class="avatar-usuario-dash" style="background-color: ${usuario.color};">${obtenerIniciales(usuario.nombre)}</div>
                <div>
                    <div class="usuario-nombre-dash">${usuario.nombre.toUpperCase()}</div>
                    <div class="usuario-arroba-dash">@${usuario.username}</div>
                </div>
            </div>
        </td>
        <td>${usuario.cedula}</td>
        <td>${usuario.correo || "—"}</td>
        <td>${usuario.telefono || "—"}</td>
        <td><span class="badge-dash ${claseBadgePorRol[usuario.rol]}">${nombreDeRol[usuario.rol].toUpperCase()}</span></td>
        <td>
            <span class="status-dot-dash ${claseEstadoPorTipo[usuario.estado]}">
                <span class="dot"></span>${nombreDeEstado[usuario.estado].toUpperCase()}
            </span>
        </td>
        <td>
            <div class="d-flex gap-2">
                <button class="action-btn-dash action-view-dash" title="Ver detalle" data-username="${usuario.username}" data-accion="ver">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="action-btn-dash action-edit-dash" title="Editar" data-username="${usuario.username}" data-accion="editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn-dash action-delete-dash" title="Eliminar" data-username="${usuario.username}" data-accion="eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    `;

    return fila;
}


// ===== MOSTRAR LA TABLA CON UNA LISTA DE USUARIOS =====
function mostrarTablaUsuarios(usuarios) {
    const cuerpoTabla = document.getElementById("tabla-usuarios-body");
    cuerpoTabla.innerHTML = "";
    usuarios.forEach(usuario => cuerpoTabla.appendChild(crearFilaUsuario(usuario)));
}


// ===== ACTUALIZAR LOS NÚMEROS DE LAS TARJETAS (KPIs) =====
function actualizarTarjetasResumen() {
    document.getElementById("kpi-total").textContent = listaUsuarios.length;
    document.getElementById("kpi-activos").textContent = listaUsuarios.filter(usuario => usuario.estado === "activo").length;
    document.getElementById("kpi-inactivos").textContent = listaUsuarios.filter(usuario => usuario.estado !== "activo").length;
}


// ===== APLICAR BÚSQUEDA Y FILTROS =====
function aplicarFiltros() {
    const textoBuscado = document.getElementById("buscador-usuarios").value.trim().toLowerCase();
    const estadoSeleccionado = document.getElementById("filtro-estado").value;
    const rolSeleccionado = document.getElementById("filtro-rol").value;

    const usuariosFiltrados = listaUsuarios.filter(usuario => {
        const coincideTexto = !textoBuscado ||
            usuario.nombre.toLowerCase().includes(textoBuscado) ||
            usuario.username.toLowerCase().includes(textoBuscado) ||
            usuario.cedula.toLowerCase().includes(textoBuscado);

        const coincideEstado = !estadoSeleccionado || usuario.estado === estadoSeleccionado;
        const coincideRol = !rolSeleccionado || usuario.rol === rolSeleccionado;

        return coincideTexto && coincideEstado && coincideRol;
    });

    mostrarTablaUsuarios(usuariosFiltrados);
}


// ===== ABRIR EL MODAL "VER USUARIO" CON LOS DATOS RELLENOS =====
function abrirModalVerUsuario(username) {
    const usuario = buscarUsuarioPorUsername(username);
    if (!usuario) return;

    document.getElementById("ver-nombre").textContent = usuario.nombre;
    document.getElementById("ver-username").textContent = "@" + usuario.username;
    document.getElementById("ver-cedula").textContent = usuario.cedula;
    document.getElementById("ver-correo").textContent = usuario.correo || "—";
    document.getElementById("ver-telefono").textContent = usuario.telefono || "—";
    document.getElementById("ver-rol").textContent = nombreDeRol[usuario.rol];
    document.getElementById("ver-estado").textContent = nombreDeEstado[usuario.estado];

    const modal = new bootstrap.Modal(document.getElementById("modalVerUsuario"));
    modal.show();
}


// ===== ABRIR EL MODAL DE FORMULARIO EN MODO "EDITAR" =====
function abrirModalEditarUsuario(username) {
    const usuario = buscarUsuarioPorUsername(username);
    if (!usuario) return;

    usernameEnEdicion = username;
    document.getElementById("nu-password").required = false;

    // Separar el nombre completo en sus 4 posibles partes
    const partesNombre = usuario.nombre.split(" ");
    document.getElementById("nu-primer-nombre").value = partesNombre[0] || "";
    document.getElementById("nu-segundo-nombre").value = partesNombre.length === 4 ? partesNombre[1] : "";
    document.getElementById("nu-primer-apellido").value = partesNombre.length === 4 ? partesNombre[2] : (partesNombre[1] || "");
    document.getElementById("nu-segundo-apellido").value = partesNombre.length === 4 ? partesNombre[3] : (partesNombre[2] || "");

    document.getElementById("nu-cedula").value = usuario.cedula;
    document.getElementById("nu-telefono").value = usuario.telefono || "";
    document.getElementById("nu-correo").value = usuario.correo || "";
    document.getElementById("nu-username").value = usuario.username;
    document.getElementById("nu-password").value = usuario.password || "";
    document.getElementById("nu-rol").value = usuario.rol;

    document.getElementById("titulo-modal-usuario").textContent = "Editar usuario";
    document.getElementById("texto-boton-guardar").textContent = "Guardar cambios";

    const modal = new bootstrap.Modal(document.getElementById("modalNuevoUsuario"));
    modal.show();
}


// ===== VOLVER EL FORMULARIO A SU MODO NORMAL: "CREAR USUARIO" =====
function restablecerModalComoCreacion() {
    usernameEnEdicion = null;
    document.getElementById("titulo-modal-usuario").textContent = "Nuevo usuario";
    document.getElementById("texto-boton-guardar").textContent = "Crear Usuario";
    document.getElementById("form-nuevo-usuario").reset();
}


// ===== ELIMINAR UN USUARIO (con confirmación) =====
function eliminarUsuario(username) {
    const confirmado = confirm("¿Seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.");
    if (!confirmado) return;

    listaUsuarios = listaUsuarios.filter(usuario => usuario.username !== username);
    guardarUsuarios();
    actualizarTarjetasResumen();
    aplicarFiltros();
}


// ===== ESCUCHAR CLICS EN LOS BOTONES DE CADA FILA (ver / editar / eliminar) =====
function escucharClicsEnLaTabla() {
    document.getElementById("tabla-usuarios-body").addEventListener("click", (evento) => {
        const boton = evento.target.closest("button[data-accion]");
        if (!boton) return;

        const username = boton.getAttribute("data-username");
        const accion = boton.getAttribute("data-accion");

        if (accion === "ver") abrirModalVerUsuario(username);
        if (accion === "editar") abrirModalEditarUsuario(username);
        if (accion === "eliminar") eliminarUsuario(username);
    });
}


// ===== GUARDAR EL FORMULARIO (crea uno nuevo o actualiza uno existente) =====
function manejarEnvioFormularioUsuario(evento) {
    evento.preventDefault();

    const primerNombre = document.getElementById("nu-primer-nombre").value.trim();
    const segundoNombre = document.getElementById("nu-segundo-nombre").value.trim();
    const primerApellido = document.getElementById("nu-primer-apellido").value.trim();
    const segundoApellido = document.getElementById("nu-segundo-apellido").value.trim();
    const cedula = document.getElementById("nu-cedula").value.trim();
    const telefono = document.getElementById("nu-telefono").value.trim();
    const correo = document.getElementById("nu-correo").value.trim();
    const username = document.getElementById("nu-username").value.trim();
    const password = document.getElementById("nu-password").value;
    const rol = document.getElementById("nu-rol").value;

    const cajaError = document.getElementById("nu-error");

    if (!rol) {
        cajaError.textContent = "Debes seleccionar un rol.";
        cajaError.style.display = "block";
        return;
    }

    // Al validar duplicados, se ignora al propio usuario si estamos editando
    const existeOtroUsuarioIgual = listaUsuarios.some(usuario =>
        usuario.username !== usernameEnEdicion &&
        (usuario.username.toLowerCase() === username.toLowerCase() || usuario.cedula === cedula)
    );

    if (existeOtroUsuarioIgual) {
        cajaError.textContent = "Ya existe un usuario con ese username o cédula.";
        cajaError.style.display = "block";
        return;
    }

    cajaError.style.display = "none";

    const nombreCompleto = [primerNombre, segundoNombre, primerApellido, segundoApellido]
        .filter(Boolean)
        .join(" ");

    if (usernameEnEdicion) {
        // ----- MODO EDICIÓN: actualizar el usuario existente -----
        const usuario = buscarUsuarioPorUsername(usernameEnEdicion);
        usuario.nombre = nombreCompleto;
        usuario.username = username;
        usuario.password = password;
        usuario.cedula = cedula;
        usuario.correo = correo;
        usuario.telefono = telefono;
        usuario.rol = rol;
    } else {
        // ----- MODO CREACIÓN: agregar un usuario nuevo -----
        listaUsuarios.push({
            nombre: nombreCompleto,
            username,
            password,
            cedula,
            correo,
            telefono,
            rol,
            estado: "activo",
            color: generarColorAleatorio()
        });
    }

    guardarUsuarios();
    actualizarTarjetasResumen();
    aplicarFiltros();

    bootstrap.Modal.getInstance(document.getElementById("modalNuevoUsuario")).hide();
    restablecerModalComoCreacion();
}


// ===== PUNTO DE INICIO: se ejecuta apenas carga la página =====
function iniciarVistaUsuarios() {
    cargarUsuarios();

    document.getElementById("buscador-usuarios").addEventListener("input", aplicarFiltros);
    document.getElementById("filtro-estado").addEventListener("change", aplicarFiltros);
    document.getElementById("filtro-rol").addEventListener("change", aplicarFiltros);
    document.getElementById("form-nuevo-usuario").addEventListener("submit", manejarEnvioFormularioUsuario);

    // Si el modal de crear/editar se cierra sin guardar, vuelve a modo "crear"
    document.getElementById("modalNuevoUsuario").addEventListener("hidden.bs.modal", restablecerModalComoCreacion);

    escucharClicsEnLaTabla();

    actualizarTarjetasResumen();
    mostrarTablaUsuarios(listaUsuarios);
}

document.addEventListener("DOMContentLoaded", iniciarVistaUsuarios);