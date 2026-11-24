const API = import.meta.env.VITE_API_URL || 'http://localhost:5039';

export function ObtenerToken() {
  return localStorage.getItem('token');
}

export async function ListarTiposArma(signal) {
  const obtenerToken = ObtenerToken();
  const respuesta = await fetch(`${API}/api/TiposArma`, {
    headers: { 'Authorization': `Bearer ${obtenerToken}` },
    signal,
  });
  if (!respuesta.ok) throw new Error('Error al listar los tipos de arma');
  return await respuesta.json();
}

export async function CrearTipoArma(tipo) {
  const respuesta = await fetch(`${API}/api/TiposArma`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ObtenerToken()}` },
    body: JSON.stringify(tipo)
  });
  if (!respuesta.ok) throw new Error(await respuesta.text());
  return await respuesta.json();
}

export async function EditarTipoArma(id, tipo) {
  const respuesta = await fetch(`${API}/api/TiposArma/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ObtenerToken()}` },
    body: JSON.stringify(tipo)
  });
  if (!respuesta.ok) throw new Error(await respuesta.text());
}

export async function EliminarTipoArma(id) {
  const respuesta = await fetch(`${API}/api/TiposArma/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${ObtenerToken()}` }
  });
  if (!respuesta.ok) throw new Error(await respuesta.text());
}
