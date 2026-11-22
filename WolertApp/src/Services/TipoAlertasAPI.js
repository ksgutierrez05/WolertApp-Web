const API = 'http://localhost:5039';

export function ObtenerToken() {
  return localStorage.getItem('token');
}

export async function listarTiposAlerta(signal) {
  const obtenerToken = ObtenerToken();
  const respuesta = await fetch(`${API}/api/TiposAlerta`, {
    headers: { 'Authorization': `Bearer ${obtenerToken}` },
    signal,
  });
  if (!respuesta.ok) throw new Error(`Error al listar los tipos de alerta: ${await respuesta.text()}`);
  return await respuesta.json();
}

export async function crearTipoAlerta(tipo) {
  const respuesta = await fetch(`${API}/api/TiposAlerta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ObtenerToken()}` },
    body: JSON.stringify(tipo)
  });
  if (!respuesta.ok) throw new Error(await respuesta.text());
  return await respuesta.json();
}

export async function editarTipoAlerta(id, tipo) {
  const respuesta = await fetch(`${API}/api/TiposAlerta/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ObtenerToken()}` },
    body: JSON.stringify(tipo)
  });
  if (!respuesta.ok) throw new Error(await respuesta.text());
}

export async function eliminarTipoAlerta(id) {
  const respuesta = await fetch(`${API}/api/TiposAlerta/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${ObtenerToken()}` }
  });
  if (!respuesta.ok) throw new Error(await respuesta.text());
}

