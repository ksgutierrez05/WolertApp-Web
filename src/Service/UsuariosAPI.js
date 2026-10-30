const API = 'http://localhost:5000';

export async function listaUsuarios() {
    const respuesta = await fetch(`${API}/usuarios`);

    if (!respuesta.ok) {
        throw new Error('Error en enlistado de usuarios registrados');
    }

    const datos = await respuesta.json();
    return datos;
}

export async function obtenerUsuarioPorId(id) {
    const respuesta = await fetch(`${API}/usuarios/${id}`);

    if (!respuesta.ok){
        throw new Error ('Error al obtener el usuario');
    }

    const datos = await respuesta.json();
    return datos;
}

export async function crearUsuario(usuario) {
    const respuesta = await fetch(`${API}/usuarios`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(usuario)
    });

    if (!respuesta.ok) {
        throw new Error('Error al crear el usuario');
    }

    const datos = await respuesta.json();
    return datos;
}

export async function editarUsuario(id, usuario) {
    const respuesta = await fetch(`${API}/usuarios/${id}`, {
        metod: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(usuario)
    });

    if (!respuesta.ok) {
        throw new Error('Error en edición del usuario');
    }

    const datos = await respuesta.json();
    return datos;
}

export async function eliminarUsuario(id) {
    const respuesta = await fetch(`${API}/usuarios/${id}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    });

    if (!respuesta.ok) {
        throw new Error('Error al eliminar el usuario');
    }

    const datos = await respuesta.json();
    return datos;
}