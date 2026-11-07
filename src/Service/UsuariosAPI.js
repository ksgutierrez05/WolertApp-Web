const API = 'http://localhost:5000';

function obtenerToken() {
    return localStorage.getItem('token');
}

export async function listaUsuarios() {
    const respuesta = await fetch(`${API}/api/usuarios`);

    if (!respuesta.ok) {
        throw new Error('Error en enlistado de usuarios registrados');
    }

    const datos = await respuesta.json();
    return datos;
}

export async function obtenerUsuarioPorId(id) {
    const respuesta = await fetch(`${API}/api/usuarios/${id}`);

    if (!respuesta.ok) {
        throw new Error('Error al obtener el usuario');
    }

    const datos = await respuesta.json();
    return datos;
}

// pide token. La API responde 204 (sin contenido)
export async function editarUsuario(id, usuario) {
    const respuesta = await fetch(`${API}/api/usuarios/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify(usuario)
    });

    if (!respuesta.ok) {
        throw new Error('Error en edición del usuario');
    }
}

// pide token (solo Admin). La API responde 204 (sin contenido)
export async function eliminarUsuario(id) {
    const respuesta = await fetch(`${API}/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    });

    if (!respuesta.ok) {
        throw new Error('Error al eliminar el usuario');
    }
}

//se guarda el token para las demás peticiones
export async function login(usuario) {
    const respuesta = await fetch(`${API}/api/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
    });

    if (!respuesta.ok) {
        throw new Error('Error al crear el usuario');
    }

    const datos = await respuesta.json();
    return datos;
}

// Pide token. La API responde 204 (sin contenido)
export async function editarUsuario(id, usuario) {
    const respuesta = await fetch(`${API}/api/usuarios/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify(usuario)
    });

    if (!respuesta.ok) {
        throw new Error('Error en edición del usuario');
    }
}

// pide token (solo Admin). La API responde 204 (sin contenido)
export async function eliminarUsuario(id) {
    const respuesta = await fetch(`${API}/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${obtenerToken()}`
        }
    });

    if (!respuesta.ok) {
        throw new Error('Error al eliminar el usuario');
    }
}

//se guarda el token para las demás peticiones
export async function login(usuario) {
    const respuesta = await fetch(`${API}/api/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
    });

    if (!respuesta.ok) {
        throw new Error('Error en autenticación de usuario');
    }

    const datos = await respuesta.json();
    localStorage.setItem('token', datos.token);
    localStorage.setItem('rol', datos.rol);
    return datos;
}

// Pide token
export async function crearUsuarioPersonal(usuario) {
    const respuesta = await fetch(`${API}/api/usuarios/personal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify(usuario)
    });

    if (!respuesta.ok) {
        const mensajes = {
            401: 'Tu sesión venció, inicia sesión nuevamente',
            403: 'No tienes permisos para realizar esta acción',
            409: 'El usuario ya existe con esa cédula, correo o username',
            400: 'Datos inválidos (revisa el barrio y los campos requeridos)',
            500: 'Error interno del servidor'
        };

        throw new Error(mensajes[respuesta.status] || 'Error al crear el usuario');
    }

    return await respuesta.json();
}