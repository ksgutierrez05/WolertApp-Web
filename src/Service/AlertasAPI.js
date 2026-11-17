const API = 'http://localhost:5000';

function obtenerToken() {
    return localStorage.getItem('token');
}

function cabeceras(conJson = false) {
    const h = {};
    const token = obtenerToken();
    if (token) h.Authorization = `Bearer ${token}`;
    if (conJson) h['Content-Type'] = 'application/json';
    return h;
}

export async function listarAlertas() {
    const respuesta = await fetch(`${API}/api/alertas`, { headers: cabeceras() });
    if (!respuesta.ok) {
        throw new Error(`Error al listar las alertas: ${await respuesta.text()}`);
    }
    return await respuesta.json();
}

export async function crearAlerta(alerta) {
    const respuesta = await fetch(`${API}/api/alertas`, {
        method: 'POST',
        headers: cabeceras(true),
        body: JSON.stringify(alerta)
    });
    if (!respuesta.ok) {
        throw new Error(`Error al crear la alerta: ${await respuesta.text()}`);
    }
    return await respuesta.json();
}

export async function editarAlerta(id, alerta) {
    const respuesta = await fetch(`${API}/api/alertas/${id}`, {
        method: 'PUT',
        headers: cabeceras(true),
        body: JSON.stringify(alerta)
    });
    if (!respuesta.ok) {
        throw new Error(`Error al editar la alerta: ${await respuesta.text()}`);
    }
    // Si el backend responde 204 (sin cuerpo), no hay JSON que leer
    return respuesta.status === 204 ? null : await respuesta.json();
}

export async function eliminarAlerta(id) {
    const respuesta = await fetch(`${API}/api/alertas/${id}`, {
        method: 'DELETE',
        headers: cabeceras()
    });
    if (!respuesta.ok) {
        throw new Error(`Error al eliminar la alerta: ${await respuesta.text()}`);
    }
    return await respuesta.json();
}

export async function listarAlertasPorAlcance(alcance = 'todas') {
    const respuesta = await fetch(`${API}/api/alertas?alcance=${alcance}`, { headers: cabeceras() });
    if (!respuesta.ok) {
        throw new Error(`Error al listar las alertas: ${await respuesta.text()}`);
    }
    return await respuesta.json();
}

export async function resumenAlertas() {
    const respuesta = await fetch(`${API}/api/alertas/resumen`, { headers: cabeceras() });
    if (!respuesta.ok) {
        throw new Error(`Error al obtener el resumen: ${await respuesta.text()}`);
    }
    return await respuesta.json(); // { total, comuna, barrio }
}

export async function listarMisAlertas() {
    return await listarAlertasPorAlcance('mias');
}