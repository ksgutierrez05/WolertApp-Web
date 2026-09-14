// ============================================================
// ALERTAS.JS — lógica propia de admin/alertas.html
// ============================================================
// Datos de ejemplo y render de la tabla de Gestión de Alertas.
// En producción, "alertas" vendría de un fetch a tu backend/API
// en vez de estar escrito a mano aquí.
// ============================================================

const alertas = [
    { tipo: "HOMICIDIO", barrio: "Casimiro Raul Maestre", usuario: "Katherine Gutierrez", estado: "pendiente", fecha: "2026-06-13", descripcion: "" },
    { tipo: "ROBO", barrio: "Centro", usuario: "Sofia Barliza", estado: "unidad_asignada", fecha: "2026-06-10", descripcion: "Test alerta H" },
    { tipo: "ROBO", barrio: "Centro", usuario: "Sofia Barliza", estado: "resuelta", fecha: "2026-06-10", descripcion: "Test alerta G" },
    { tipo: "ROBO", barrio: "Centro", usuario: "Sofia Barliza", estado: "resuelta", fecha: "2026-06-10", descripcion: "Test alerta G" },
    { tipo: "ROBO", barrio: "Centro", usuario: "Sofia Barliza", estado: "resuelta", fecha: "2026-06-10", descripcion: "Test alerta H" },
    { tipo: "ROBO", barrio: "Centro", usuario: "Sofia Barliza", estado: "resuelta", fecha: "2026-06-10", descripcion: "Test alerta F" },
    { tipo: "ROBO", barrio: "Centro", usuario: "Sofia Barliza", estado: "resuelta", fecha: "2026-06-10", descripcion: "Test alerta E" },
    { tipo: "ROBO", barrio: "Centro", usuario: "Sofia Barliza", estado: "resuelta", fecha: "2026-06-10", descripcion: "Test alerta D" },
    { tipo: "ROBO", barrio: "Centro", usuario: "Sofia Barliza", estado: "resuelta", fecha: "2026-06-10", descripcion: "Test alerta C" },
    { tipo: "ROBO", barrio: "Centro", usuario: "Sofia Barliza", estado: "resuelta", fecha: "2026-06-10", descripcion: "Test alerta B" },
    { tipo: "ROBO", barrio: "Centro", usuario: "Sofia Barliza", estado: "resuelta", fecha: "2026-06-10", descripcion: "Test alerta A" },
    { tipo: "ROBO", barrio: "Casimiro Raul Maestre", usuario: "Katherine Gutierrez", estado: "resuelta", fecha: "2026-06-05", descripcion: "" },
    { tipo: "ROBO", barrio: "Casimiro Raul Maestre", usuario: "Katherine Gutierrez", estado: "unidad_asignada", fecha: "2026-06-05", descripcion: "" }
];

// Mapea cada estado a su clase de badge (ya definidas en global.css)
// y al texto que se muestra en mayúsculas dentro del badge.
const estadoBadgeClase = {
    pendiente: "badge-amber-dash",
    unidad_asignada: "badge-blue-dash",
    resuelta: "badge-green-dash"
};

const estadoLabel = {
    pendiente: "Pendiente",
    unidad_asignada: "Unidad asignada",
    resuelta: "Resuelta"
};

function crearFilaAlerta(a) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td class="celda-tipo">${a.tipo}</td>
        <td>${a.barrio.toUpperCase()}</td>
        <td>${a.usuario.toUpperCase()}</td>
        <td><span class="badge-dash ${estadoBadgeClase[a.estado]}">${estadoLabel[a.estado].toUpperCase()}</span></td>
        <td>${a.fecha}</td>
        <td class="celda-desc">${a.descripcion || "—"}</td>
    `;
    return tr;
}

function pintarTablaAlertas(lista) {
    const body = document.getElementById("tabla-alertas-body");
    body.innerHTML = "";
    lista.forEach(a => body.appendChild(crearFilaAlerta(a)));
}

function iniciarVistaAlertas() {
    pintarTablaAlertas(alertas);
}

document.addEventListener("DOMContentLoaded", iniciarVistaAlertas);