const API = 'localhost:5000';

export async function ListarComunas(){
    const respuesta = await fetch(`http://${API}/api/comunas`);

    if(!respuesta.ok){
        throw new Error('Error en listado de comunas');
    }

    const datos = await respuesta.json();
    return datos;
}

export async function ObtenerComunaPorId(id){
    const respuesta = await fetch(`http://${API}/api/comunas/${id}`);

    if(!respuesta.ok){
        throw new Error('Error en obtención de comuna por ID');
    }

    const datos = await respuesta.json();
    return datos;
}

export async function CrearComuna(comuna){
    const respuesta = await fetch(`http://${API}/api/comunas`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json' ,  'Authorization': `Bearer ${ObtenerToken()}`},
        body: JSON.stringify(comuna)
    });
    
    if(!respuesta.ok){
        const mensaje = await respuesta.text();
        throw new Error(`Error en creación de comuna: ${mensaje}`);
    }   
    
    const datos = await respuesta.json();
    return datos;

}

export async function EditarComuna(id,comuna){
    const respuesta = await fetch(`http://${API}/api/comunas/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json' ,  'Authorization': `Bearer ${ObtenerToken()}`},
        body: JSON.stringify(comuna)
    });

    if(!respuesta.ok){
        const mensaje = await respuesta.text();
        throw new Error(`Error en edición de comuna: ${mensaje}`);
    }
}

export async function EliminarComuna(id){
    const respuesta = await fetch(`http://${API}/api/comunas/${id}`, {
        headers: {'Authorization': `Bearer ${ObtenerToken()}`},
        method: 'DELETE'
    });

    if(!respuesta.ok){
        const mensaje = await respuesta.text();
        throw new Error(`Error en eliminación de comuna: ${mensaje}`);
    }
}

export function ObtenerToken() {
    return localStorage.getItem('token');
}