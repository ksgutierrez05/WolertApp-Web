// ============================================================
// USUARIOS.JS — lógica propia de admin/usuarios.html
// ============================================================

const STORAGE_KEY = "wolertapp_usuarios";

// Datos de ejemplo, solo se usan la PRIMERA vez (si localStorage está vacío)
const usuariosSemilla = [
    { nombre: "Sofia Barliza Gutierrez", username: "Sofia123", cedula: "4444555666", correo: "sofia@gmail.com", telefono: "5555777444", rol: "ciudadano", estado: "activo", color: "#1f5fa8" },
    { nombre: "Yamil David Bustillo Contreras", username: "Yamil123", cedula: "1055200333", correo: "yamil@gmail.com", telefono: "3157859745", rol: "ciudadano", estado: "activo", color: "#1f5fa8" },
    { nombre: "Laura Sofia Daza Leon", username: "lauf", cedula: "444", correo: "lau@gmail.com", telefono: "555", rol: "ciudadano", estado: "activo", color: "#c81e2c" },
    { nombre: "Margarita Daza Jimenez", username: "Margarita123", cedula: "8888999777", correo: "margarita@gmail.com", telefono: "4552214463", rol: "ciudadano", estado: "activo", color: "#1f5fa8" },
    { nombre: "Hernando Luis Garcia", username: "hernan01", cedula: "55112236", correo: "hernan01@gmail.com", telefono: "4445558552", rol: "policia", estado: "activo", color: "#1f9d5b" },
    { nombre: "Luis Garcia Daza", username: "luisgd", cedula: "9988776655", correo: "luisgd@gmail.com", telefono: "3011112233", rol: "admin", estado: "activo", color: "#7c4fd1" }
];

let usuarios = [];

function cargarUsuarios() {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) {
        usuarios = JSON.parse(guardado);
    } else {
        usuarios = usuariosSemilla;
        guardarUsuarios();
    }
}

function guardarUsuarios() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

const rolLabel = { admin: "Administrador", policia: "Policía", ciudadano: "Ciudadano" };
const rolBadgeClase = { admin: "badge-blue-dash", policia: "badge-gray-dash", ciudadano: "badge-green-dash" };
const estadoClase = { activo: "status-active-dash", inactivo: "status-inactive-dash", suspendido: "status-inactive-dash" };
const estadoLabel = { activo: "Activo", inactivo: "Inactivo", suspendido: "Suspendido" };

function iniciales(nombreCompleto) {
    const partes = nombreCompleto.trim().split(/\s+/);
    return (partes[0][0] + (partes[1] ? partes[1][0] : "")).toUpperCase();
}

function crearFila(u) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>
            <div class="d-flex align-items-center gap-2">
                <div class="avatar-usuario-dash" style="background-color: ${u.color};">${iniciales(u.nombre)}</div>
                <div>
                    <div class="usuario-nombre-dash">${u.nombre.toUpperCase()}</div>
                    <div class="usuario-arroba-dash">@${u.username}</div>
                </div>
            </div>
        </td>
        <td>${u.cedula}</td>
        <td>${u.correo || "—"}</td>
        <td>${u.telefono || "—"}</td>
        <td><span class="badge-dash ${rolBadgeClase[u.rol]}">${rolLabel[u.rol].toUpperCase()}</span></td>
        <td>
            <span class="status-dot-dash ${estadoClase[u.estado]}">
                <span class="dot"></span>${estadoLabel[u.estado].toUpperCase()}
            </span>
        </td>
        <td>
            <div class="d-flex gap-2">
                <button class="action-btn-dash action-view-dash" title="Ver detalle"><i class="bi bi-eye"></i></button>
                <button class="action-btn-dash action-edit-dash" title="Editar"><i class="bi bi-pencil"></i></button>
                <button class="action-btn-dash action-delete-dash" title="Eliminar"><i class="bi bi-trash"></i></button>
            </div>
        </td>
    `;
    return tr;
}

function pintarTabla(lista) {
    const body = document.getElementById("tabla-usuarios-body");
    body.innerHTML = "";
    lista.forEach(u => body.appendChild(crearFila(u)));
}

function actualizarKpis() {
    document.getElementById("kpi-total").textContent = usuarios.length;
    document.getElementById("kpi-activos").textContent = usuarios.filter(u => u.estado === "activo").length;
    document.getElementById("kpi-inactivos").textContent = usuarios.filter(u => u.estado !== "activo").length;
}

function aplicarFiltros() {
    const texto = document.getElementById("buscador-usuarios").value.trim().toLowerCase();
    const estado = document.getElementById("filtro-estado").value;
    const rol = document.getElementById("filtro-rol").value;

    const filtrados = usuarios.filter(u => {
        const coincideTexto = !texto ||
            u.nombre.toLowerCase().includes(texto) ||
            u.username.toLowerCase().includes(texto) ||
            u.cedula.toLowerCase().includes(texto);
        const coincideEstado = !estado || u.estado === estado;
        const coincideRol = !rol || u.rol === rol;
        return coincideTexto && coincideEstado && coincideRol;
    });

    pintarTabla(filtrados);
}

function generarColorAleatorio() {
    const paleta = ["#1f5fa8", "#1f9d5b", "#7c4fd1", "#c81e2c", "#c9821c", "#0a2f5c"];
    return paleta[Math.floor(Math.random() * paleta.length)];
}

function manejarSubmitNuevoUsuario(e) {
    e.preventDefault();

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

    const errorBox = document.getElementById("nu-error");

    if (!rol) {
        errorBox.textContent = "Debes seleccionar un rol.";
        errorBox.style.display = "block";
        return;
    }

    const yaExiste = usuarios.some(u => u.username.toLowerCase() === username.toLowerCase() || u.cedula === cedula);
    if (yaExiste) {
        errorBox.textContent = "Ya existe un usuario con ese username o cédula.";
        errorBox.style.display = "block";
        return;
    }
    errorBox.style.display = "none";

    const nombre = [primerNombre, segundoNombre, primerApellido, segundoApellido]
        .filter(Boolean)
        .join(" ");

    usuarios.push({
        nombre, username, password, cedula, correo, telefono, rol,
        estado: "activo",
        color: generarColorAleatorio()
    });

    guardarUsuarios();
    actualizarKpis();
    aplicarFiltros();

    const modalEl = document.getElementById("modalNuevoUsuario");
    bootstrap.Modal.getInstance(modalEl).hide();
    document.getElementById("form-nuevo-usuario").reset();
}

function iniciarVistaUsuarios() {
    cargarUsuarios();

    document.getElementById("buscador-usuarios").addEventListener("input", aplicarFiltros);
    document.getElementById("filtro-estado").addEventListener("change", aplicarFiltros);
    document.getElementById("filtro-rol").addEventListener("change", aplicarFiltros);
    document.getElementById("form-nuevo-usuario").addEventListener("submit", manejarSubmitNuevoUsuario);

    actualizarKpis();
    pintarTabla(usuarios);
}

document.addEventListener("DOMContentLoaded", iniciarVistaUsuarios);