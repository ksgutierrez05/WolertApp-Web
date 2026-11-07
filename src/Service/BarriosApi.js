const API = 'localhost:5000';

export async function ListarBarrios(){
    const respuesta = await fetch(`http://${API}/api/barrios`);

    if(!respuesta.ok){
        throw new Error('Error en listado de barrios ')
    };

    const datos = await respuesta.json();
    return datos;
};

export async function ObtenerBarrioPorId(id){
    const respuesta = await fetch(`http://${API}/api/barrios/${id}`);

    if(!respuesta.ok){
        throw new Error('Error en obtención de barrio por ID');
    };

    const datos = await respuesta.json();
    return datos;
};

export async function CrearBarrio(barrio){
    const respuesta = await fetch (`http://${API}/api/barrios`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json' ,  'Authorization': `Bearer ${ObtenerToken()}`},
        body: JSON.stringify(barrio)
    });

    if(!respuesta.ok){
        const mensaje = await respuesta.text();
        throw new Error(`Error en creación de barrio: ${mensaje}`);
    }

    const datos = await respuesta.json();
    return datos;
};

export async function EditarBarrio(id,barrio){
    const respuesta = await fetch(`http://${API}/api/barrios/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json' ,  'Authorization': `Bearer ${ObtenerToken()}`},
        body: JSON.stringify(barrio)
    });

    if(!respuesta.ok){
        const mensaje = await respuesta.text();
        throw new Error(`Error en edición de barrio: ${mensaje}`);
    }

    const datos = await respuesta.json();
    return datos;
};

export async function EliminarBarrio(id){
    const respuesta = await fetch(`http://${API}/api/barrios/${id}`, {
        method: 'DELETE',
        headers: {'Authorization': `Bearer ${ObtenerToken()}`}
    });

    if(!respuesta.ok){
        const mensaje = await respuesta.text();
        throw new Error(`Error en eliminación de barrio: ${mensaje}`);
    }

    const datos = await respuesta.json();
    return datos;
};

export function ObtenerToken() {
    return localStorage.getItem('token');
};