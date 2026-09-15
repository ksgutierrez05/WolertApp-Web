// ============================================================
// NOTIFICACIONES.JS — lógica propia de admin/notificaciones.html
// ============================================================

const STORAGE_KEY_NOTI = "wolertapp_notificaciones";

// Datos de ejemplo, solo se usan la PRIMERA vez (si localStorage está vacío)
const notificacionesSemilla = [
    { mensaje: "Una unidad policial ha sido asignada a tu alerta reportada en el barrio Centro.", destinatario: "sofia@gmail.com", fecha: "2026-06-10T05:42:00", tipo: "asignacion", estado: "pendiente" },
    { mensaje: "Nueva alerta asignada a tu unidad. Revisa el mapa para más detalles.", destinatario: "miigue05@gmail.com", fecha: "2026-06-10T05:45:00", tipo: "asignacion", estado: "error" },
    { mensaje: "Una unidad policial ha sido asignada a tu alerta reportada en el barrio Centro.", destinatario: "sofia@gmail.com", fecha: "2026-06-10T05:49:00", tipo: "asignacion", estado: "pendiente" },
    { mensaje: "Nueva alerta asignada a tu unidad. Revisa el mapa para más detalles.", destinatario: "miigue05@gmail.com", fecha: "2026-06-10T05:55:00", tipo: "asignacion", estado: "error" },
    { mensaje: "Nueva alerta de robo reportada en el barrio San José, a 200 metros de tu ubicación.", destinatario: "gutierrezkatherine015@gmail.com", fecha: "2026-06-05T12:03:00", tipo: "alerta", estado: "enviado" },
    { mensaje: "Tu cuenta ha sido verificada correctamente. Ya puedes reportar alertas.", destinatario: "yamil@gmail.com", fecha: "2026-06-04T09:15:00", tipo: "sistema", estado: "enviado" }
];

let notificaciones = [];

function cargarNotificaciones() {
    const guardado = localStorage.getItem(STORAGE_KEY_NOTI);
    if (guardado) {
        notificaciones = JSON.parse(guardado);
    } else {
        notificaciones = notificacionesSemilla;
        guardarNotificaciones();
    }
}

function guardarNotificaciones() {
    localStorage.setItem(STORAGE_KEY_NOTI, JSON.stringify(notificaciones));
}

const iconoPorTipo = {
    alerta: { clase: "noti-icono-alerta-dash", icono: "bi-exclamation-triangle-fill" },
    asignacion: { clase: "noti-icono-asignacion-dash", icono: "bi-shield-check" },
    sistema: { clase: "noti-icono-sistema-dash", icono: "bi-gear-fill" }
};

const tipoLabel = { alerta: "Alerta", asignacion: "Asignación", sistema: "Sistema" };
const estadoBadgeClase = { enviado: "noti-badge-enviado-dash", pendiente: "noti-badge-pendiente-dash", error: "noti-badge-error-dash" };
const estadoLabel = { enviado: "Enviado", pendiente: "Pendiente", error: "Error" };

const paletaAvatares = ["#1f5fa8", "#1f9d5b", "#7c4fd1", "#c81e2c", "#c9821c", "#0a2f5c"];

function colorParaCorreo(correo) {
    // Genera siempre el mismo color para el mismo correo, sin guardarlo aparte
    let suma = 0;
    for (let i = 0; i < correo.length; i++) suma += correo.charCodeAt(i);
    return paletaAvatares[suma % paletaAvatares.length];
}

function inicialesCorreo(correo) {
    return correo.trim()[0].toUpperCase();
}

function formatearFecha(fechaIso) {
    const fecha = new Date(fechaIso);
    const fechaTexto = fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
    const horaTexto = fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });
    return `${fechaTexto} · ${horaTexto}`;
}

function tiempoRelativo(fechaIso) {
    const ahora = new Date();
    const fecha = new Date(fechaIso);
    const diffMs = ahora - fecha;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMin < 1) return "Hace un momento";
    if (diffMin < 60) return `Hace ${diffMin} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} h`;
    if (diffDias === 1) return "Ayer";
    return `Hace ${diffDias} días`;
}

function crearFilaNotificacion(n) {
    const tr = document.createElement("tr");
    const tipoInfo = iconoPorTipo[n.tipo] || iconoPorTipo.sistema;
    const color = colorParaCorreo(n.destinatario);

    tr.innerHTML = `
        <td>
            <div class="noti-mensaje-celda-dash">
                <div class="noti-icono-tipo-dash ${tipoInfo.clase}">
                    <i class="bi ${tipoInfo.icono}"></i>
                </div>
                <div>
                    <div class="noti-mensaje-texto-dash">${n.mensaje}</div>
                    <div class="noti-mensaje-tipo-dash">${tipoLabel[n.tipo] || "Sistema"}</div>
                </div>
            </div>
        </td>
        <td>
            <div class="noti-destinatario-dash">
                <div class="noti-avatar-dash" style="background-color: ${color};">${inicialesCorreo(n.destinatario)}</div>
                <span class="noti-correo-dash">${n.destinatario}</span>
            </div>
        </td>
        <td>
            <div class="noti-fecha-dash">${formatearFecha(n.fecha)}</div>
            <div class="noti-fecha-relativa-dash">${tiempoRelativo(n.fecha)}</div>
        </td>
        <td>
            <span class="noti-badge-dash ${estadoBadgeClase[n.estado]}">
                <span class="dot"></span>${estadoLabel[n.estado]}
            </span>
        </td>
    `;
    return tr;
}

function pintarTablaNoti(lista) {
    const body = document.getElementById("tabla-noti-body");
    const vacio = document.getElementById("noti-vacio");

    body.innerHTML = "";

    if (lista.length === 0) {
        vacio.style.display = "block";
        return;
    }

    vacio.style.display = "none";
    lista.forEach(n => body.appendChild(crearFilaNotificacion(n)));
}

function actualizarKpisNoti() {
    document.getElementById("kpi-total").textContent = notificaciones.length;
    document.getElementById("kpi-pendientes").textContent = notificaciones.filter(n => n.estado === "pendiente").length;
    document.getElementById("kpi-error").textContent = notificaciones.filter(n => n.estado === "error").length;
}

function aplicarFiltrosNoti() {
    const texto = document.getElementById("buscador-notificaciones").value.trim().toLowerCase();
    const estado = document.getElementById("filtro-estado-noti").value;
    const tipo = document.getElementById("filtro-tipo-noti").value;

    const filtradas = notificaciones.filter(n => {
        const coincideTexto = !texto ||
            n.mensaje.toLowerCase().includes(texto) ||
            n.destinatario.toLowerCase().includes(texto);
        const coincideEstado = !estado || n.estado === estado;
        const coincideTipo = !tipo || n.tipo === tipo;
        return coincideTexto && coincideEstado && coincideTipo;
    });

    // Más recientes primero
    filtradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    pintarTablaNoti(filtradas);
}

function iniciarVistaNotificaciones() {
    cargarNotificaciones();

    document.getElementById("buscador-notificaciones").addEventListener("input", aplicarFiltrosNoti);
    document.getElementById("filtro-estado-noti").addEventListener("change", aplicarFiltrosNoti);
    document.getElementById("filtro-tipo-noti").addEventListener("change", aplicarFiltrosNoti);

    actualizarKpisNoti();
    aplicarFiltrosNoti();
}

document.addEventListener("DOMContentLoaded", iniciarVistaNotificaciones);