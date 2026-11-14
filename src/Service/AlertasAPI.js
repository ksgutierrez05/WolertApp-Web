const API = 'http://localhost:5000';

function cabeceras() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

// Público: no pide token
export async function listaAlertas() {
    const respuesta = await fetch(`${API}/api/Alertas`);

    if (!respuesta.ok) {
        throw new Error(`Error al listar los tipos de alerta: ${await respuesta.text()}`);
    }

    return await respuesta.json();
}

export async function obtenerAlertaPorId(id) {
    const respuesta = await fetch(`${API}/api/Alertas/${id}`);

    if (!respuesta.ok) {
        throw new Error(`Error al obtener la alerta ${id}: ${await respuesta.text()}`);
    }

    return await respuesta.json();
}

export async function crearAlerta(alerta) {
    const respuesta = await fetch(`${API}/api/Alertas`, {
        method: 'POST',
        headers: cabeceras(),
        body: JSON.stringify(alerta)
    });

    if (!respuesta.ok) {
        throw new Error(`Error al crear la alerta: ${await respuesta.text()}`);
    }

    return await respuesta.json();
}

export async function editarAlerta(id, alerta) {
    const respuesta = await fetch(`${API}/api/Alertas/${id}`, {
        method: 'PUT',
        headers: cabeceras(),
        body: JSON.stringify(alerta)
    });

    if (!respuesta.ok) {
        throw new Error(`Error al editar la alerta: ${await respuesta.text()}`);
    }
}

export async function eliminarAlerta(id) {
    const respuesta = await fetch(`${API}/api/Alertas/${id}`, {
        method: 'DELETE',
        headers: cabeceras()
    });

    if (!respuesta.ok) {
        throw new Error(`Error al eliminar la alerta: ${await respuesta.text()}`);
    }
}