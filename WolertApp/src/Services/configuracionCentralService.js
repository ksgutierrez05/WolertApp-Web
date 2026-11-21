
const CLAVES_USUARIO = [
  "usuario",
  "user",
  "usuarioActual",
  "currentUser",
];

const VACIO = "No disponible";

function obtenerCampo(objeto, ...nombres) {
  for (const nombre of nombres) {
    const valor = objeto?.[nombre];

    if (
      valor !== undefined &&
      valor !== null &&
      String(valor).trim() !== ""
    ) {
      return valor;
    }
  }

  return VACIO;
}

function leerUsuario(almacenamiento) {
  for (const clave of CLAVES_USUARIO) {
    const contenido = almacenamiento.getItem(clave);

    if (!contenido) continue;

    try {
      const datos = JSON.parse(contenido);

      if (datos && typeof datos === "object") {
        return datos.usuario && typeof datos.usuario === "object"
          ? datos.usuario
          : datos;
      }
    } catch {
      // Continúa buscando en las demás claves.
    }
  }

  return null;
}

export function obtenerPerfilCentral() {
  const datos =
    leerUsuario(sessionStorage) ||
    leerUsuario(localStorage);

  return {
    disponible: Boolean(datos),

    nombres: obtenerCampo(
      datos,
      "nombres",
      "Nombres",
      "nombre",
      "Nombre",
      "nombreCompleto",
      "NombreCompleto",
      "name"
    ),

    apellidos: obtenerCampo(
      datos,
      "apellidos",
      "Apellidos",
      "apellido",
      "Apellido"
    ),

    identificacion: obtenerCampo(
      datos,
      "identificacion",
      "Identificacion",
      "cedula",
      "Cedula",
      "numeroDocumento",
      "NumeroDocumento"
    ),

    correo: obtenerCampo(
      datos,
      "correo",
      "Correo",
      "email",
      "Email"
    ),

    telefono: obtenerCampo(
      datos,
      "telefono",
      "Telefono",
      "celular",
      "Celular"
    ),

    rango: obtenerCampo(
      datos,
      "rango",
      "Rango",
      "grado",
      "Grado"
    ),

    dependencia: obtenerCampo(
      datos,
      "dependencia",
      "Dependencia",
      "estacion",
      "Estacion"
    ),

    usuario: obtenerCampo(
      datos,
      "nombreUsuario",
      "NombreUsuario",
      "username",
      "Username"
    ),

    rol: obtenerCampo(
      datos,
      "nombreRol",
      "NombreRol",
      "rol",
      "Rol"
    ),
  };
}
