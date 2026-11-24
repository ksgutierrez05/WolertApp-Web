const API = import.meta.env.VITE_API_URL || 'http://localhost:5039';

export function ObtenerToken() {
  return localStorage.getItem('token');
}

export async function ListarMediosTransporte(signal) {
  const obtenerToken = ObtenerToken();
  const respuesta = await fetch(`${API}/api/MediosTransporte`, {
    headers: { 'Authorization': `Bearer ${obtenerToken}` },
    signal,
  });
  if (!respuesta.ok) throw new Error('Error al listar los medios de transporte');
  return await respuesta.json();
}

export async function CrearMedioTransporte(medio) {
  const respuesta = await fetch(`${API}/api/MediosTransporte`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ObtenerToken()}` },
    body: JSON.stringify(medio)
  });
  if (!respuesta.ok) throw new Error(await respuesta.text());
  return await respuesta.json();
}

export async function EditarMedioTransporte(id, medio) {
  const respuesta = await fetch(`${API}/api/MediosTransporte/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ObtenerToken()}` },
    body: JSON.stringify(medio)
  });
  if (!respuesta.ok) throw new Error(await respuesta.text());
}

export async function EliminarMedioTransporte(id) {
  const respuesta = await fetch(`${API}/api/MediosTransporte/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${ObtenerToken()}` }
  });
  if (!respuesta.ok) throw new Error(await respuesta.text());
}
