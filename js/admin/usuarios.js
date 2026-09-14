// ============================================================
// USUARIOS.JS — lógica propia de admin/usuarios.html
// ============================================================
// Datos de ejemplo, render de la tabla, KPIs y filtros de la
// vista de Gestión de Usuarios. En producción, "usuarios" vendría
// de un fetch a tu backend/API en vez de estar escrito a mano aquí.
// ============================================================

const usuarios = [
    { nombre: "Sofia Barliza Gutierrez", username: "Sofia123", id: "4444555666", correo: "sofia@gmail.com", telefono: "5555777444", rol: "ciudadano", estado: "activo", color: "#1f5fa8" },
    { nombre: "Yamil David Bustillo Contreras", username: "Yamil123", id: "1055200333", correo: "yamil@gmail.com", telefono: "3157859745", rol: "ciudadano", estado: "activo", color: "#1f5fa8" },
    { nombre: "Laura Sofia Daza Leon", username: "lauf", id: "444", correo: "lau@gmail.com", telefono: "555", rol: "ciudadano", estado: "activo", color: "#c81e2c" },
    { nombre: "Margarita Daza Jimenez", username: "Margarita123", id: "8888999777", correo: "margarita@gmail.com", telefono: "4552214463", rol: "ciudadano", estado: "activo", color: "#1f5fa8" },
    { nombre: "Hernando Luis Garcia", username: "hernan01", id: "55112236", correo: "hernan01@gmail.com", telefono: "4445558552", rol: "policia", estado: "activo", color: "#1f9d5b" },
    { nombre: "Luis Garcia Daza", username: "luisgd", id: "9988776655", correo: "luisgd@gmail.com", telefono: "3011112233", rol: "admin", estado: "activo", color: "#7c4fd1" }
];

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
        <td>${u.id}</td>
        <td>${u.correo}</td>
        <td>${u.telefono}</td>
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
            u.id.toLowerCase().includes(texto);
        const coincideEstado = !estado || u.estado === estado;
        const coincideRol = !rol || u.rol === rol;
        return coincideTexto && coincideEstado && coincideRol;
    });

    pintarTabla(filtrados);
}

function iniciarVistaUsuarios() {
    document.getElementById("buscador-usuarios").addEventListener("input", aplicarFiltros);
    document.getElementById("filtro-estado").addEventListener("change", aplicarFiltros);
    document.getElementById("filtro-rol").addEventListener("change", aplicarFiltros);

    actualizarKpis();
    pintarTabla(usuarios);
}

document.addEventListener("DOMContentLoaded", iniciarVistaUsuarios);