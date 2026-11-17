const API = 'http://localhost:5039';

// GET api/TiposAlerta es público (no necesita token)
// OJO: la ruta debe coincidir con el nombre del controlador del backend
// (TiposAlertaController => /api/TiposAlerta).
export async function listarTiposAlerta() {
    const respuesta = await fetch(`${API}/api/TiposAlerta`);
    if (!respuesta.ok) {
        throw new Error(`Error al listar los tipos de alerta: ${await respuesta.text()}`);
    }
    return await respuesta.json(); // [{ idTipoAlerta, nombre, prioridad }]
}