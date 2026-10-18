// Funciones de localStorage para auth
export function obtenerUsuarios() {
  try {
    const datos = localStorage.getItem('wolertapp_login_usuarios')
    return datos ? JSON.parse(datos) : []
  } catch {
    return []
  }
}

export function guardarUsuariosLogin(usuarios) {
  localStorage.setItem('wolertapp_login_usuarios', JSON.stringify(usuarios))
}

export function guardarSesionActiva(usuario) {
  localStorage.setItem('wolertapp_sesion_activa', JSON.stringify(usuario))
}

export function obtenerSesionActiva() {
  try {
    const sesion = localStorage.getItem('wolertapp_sesion_activa')
    return sesion ? JSON.parse(sesion) : null
  } catch {
    return null
  }
}

export function cerrarSesion() {
  localStorage.removeItem('wolertapp_sesion_activa')
}
