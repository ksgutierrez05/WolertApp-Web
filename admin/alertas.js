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

// Mapea cada estado a su clase de badge y al texto que se muestra.
const estadoBadgeClase = {
    pendiente: "alerta-badge-pendiente-dash",
    unidad_asignada: "alerta-badge-asignada-dash",
    resuelta: "alerta-badge-resuelta-dash"
};

const estadoLabel = {
    pendiente: "Pendiente",
    unidad_asignada: "Unidad asignada",
    resuelta: "Resuelta"
};

// Íconos según severidad del tipo de alerta
const tipoIconoInfo = {
    HOMICIDIO: { clase: "alerta-tipo-icono-grave-dash", icono: "bi-exclamation-octagon-fill" },
    ROBO: { clase: "alerta-tipo-icono-moderado-dash", icono: "bi-exclamation-triangle-fill" }
};

const paletaAvatares = ["#1f5fa8", "#1f9d5b", "#7c4fd1", "#c81e2c", "#c9821c", "#0a2f5c"];

function colorParaNombre(nombre) {
    let suma = 0;
    for (let i = 0; i < nombre.length; i++) suma += nombre.charCodeAt(i);
    return paletaAvatares[suma % paletaAvatares.length];
}

function inicialesNombre(nombreCompleto) {
    const partes = nombreCompleto.trim().split(/\s+/);
    return (partes[0][0] + (partes[1] ? partes[1][0] : "")).toUpperCase();
}

function formatearFechaAlerta(fechaIso) {
    const fecha = new Date(fechaIso + "T00:00:00");
    return fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function crearFilaAlerta(a) {
    const tr = document.createElement("tr");
    const tipoInfo = tipoIconoInfo[a.tipo] || tipoIconoInfo.ROBO;
    const colorAvatar = colorParaNombre(a.usuario);

    tr.innerHTML = `
        <td>
            <div class="alerta-tipo-celda-dash">
                <div class="alerta-tipo-icono-dash ${tipoInfo.clase}">
                    <i class="bi ${tipoInfo.icono}"></i>
                </div>
                <span class="alerta-tipo-texto-dash">${a.tipo}</span>
            </div>
        </td>
        <td>${a.barrio.toUpperCase()}</td>
        <td>
            <div class="alerta-usuario-celda-dash">
                <div class="alerta-avatar-dash" style="background-color: ${colorAvatar};">${inicialesNombre(a.usuario)}</div>
                <span>${a.usuario.toUpperCase()}</span>
            </div>
        </td>
        <td>
            <span class="alerta-badge-dash ${estadoBadgeClase[a.estado]}">
                <span class="dot"></span>${estadoLabel[a.estado]}
            </span>
        </td>
        <td class="alerta-fecha-dash">${formatearFechaAlerta(a.fecha)}</td>
        <td class="celda-desc" title="${a.descripcion || ""}">${a.descripcion || "—"}</td>
    `;
    return tr;
}

function pintarTablaAlertas(lista) {
    const body = document.getElementById("tabla-alertas-body");
    const vacio = document.getElementById("alertas-vacio");

    body.innerHTML = "";

    if (lista.length === 0) {
        vacio.style.display = "block";
        return;
    }

    vacio.style.display = "none";
    lista.forEach(a => body.appendChild(crearFilaAlerta(a)));
}

function actualizarKpisAlertas() {
    document.getElementById("kpi-pendientes").textContent = alertas.filter(a => a.estado === "pendiente").length;
    document.getElementById("kpi-asignadas").textContent = alertas.filter(a => a.estado === "unidad_asignada").length;
    document.getElementById("kpi-resueltas").textContent = alertas.filter(a => a.estado === "resuelta").length;
}

function aplicarFiltrosAlertas() {
    const texto = document.getElementById("buscador-alertas").value.trim().toLowerCase();
    const estado = document.getElementById("filtro-estado-alerta").value;
    const tipo = document.getElementById("filtro-tipo-alerta").value;

    const filtradas = alertas.filter(a => {
        const coincideTexto = !texto ||
            a.barrio.toLowerCase().includes(texto) ||
            a.usuario.toLowerCase().includes(texto) ||
            (a.descripcion || "").toLowerCase().includes(texto);
        const coincideEstado = !estado || a.estado === estado;
        const coincideTipo = !tipo || a.tipo === tipo;
        return coincideTexto && coincideEstado && coincideTipo;
    });

    pintarTablaAlertas(filtradas);
}

function iniciarVistaAlertas() {
    document.getElementById("buscador-alertas").addEventListener("input", aplicarFiltrosAlertas);
    document.getElementById("filtro-estado-alerta").addEventListener("change", aplicarFiltrosAlertas);
    document.getElementById("filtro-tipo-alerta").addEventListener("change", aplicarFiltrosAlertas);

    actualizarKpisAlertas();
    pintarTablaAlertas(alertas);
}

document.addEventListener("DOMContentLoaded", iniciarVistaAlertas);