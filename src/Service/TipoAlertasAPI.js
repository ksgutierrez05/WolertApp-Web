const API = 'http://localhost:5039';

// GET api/TipoAlertas es público (no necesita token)
export async function listarTiposAlerta() {
    const respuesta = await fetch(`${API}/api/TipoAlertas`);
    if (!respuesta.ok) {
        throw new Error(`Error al listar los tipos de alerta: ${await respuesta.text()}`);
    }
    return await respuesta.json(); // [{ idTipoAlerta, nombre, prioridad }]
}