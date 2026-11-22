
import { apiAdminPolicia } from "./AdminPoliciaApi";

const API_POLICIAS = "/api/Policias";
const API_USUARIOS = "/api/Usuarios";
const API_ROLES = "/api/Roles";

const lista = (respuesta) => {
  if (Array.isArray(respuesta)) return respuesta;
  for (const clave of ["items", "data", "datos", "resultados", "value"]) {
    if (Array.isArray(respuesta?.[clave])) return respuesta[clave];
  }
  throw new Error("La API no devolvió una lista válida.");
};

const idValido = (valor, nombre) => {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`${nombre} no es válido.`);
  }
  return id;
};

function datosPoliciales(datos) {
  const placa = String(datos.placa ?? "").trim();
  const rango = String(datos.rango ?? "").trim();
  const estado = String(datos.estado || "ACTIVO")
    .trim()
    .toUpperCase();

  if (!placa) throw new Error("La placa es obligatoria.");
  if (placa.length > 10) {
    throw new Error("La placa no puede superar 10 caracteres.");
  }
  if (rango.length > 25) {
    throw new Error("El rango no puede superar 25 caracteres.");
  }
  if (!["ACTIVO", "INACTIVO"].includes(estado)) {
    throw new Error("Estado policial no válido.");
  }

  const idUnidad =
    datos.idUnidad === "" ||
    datos.idUnidad === null ||
    datos.idUnidad === undefined
      ? null
      : idValido(datos.idUnidad, "La unidad");

  return { placa, rango: rango || null, estado, idUnidad };
}

export async function listarPolicias() {
  return lista(await apiAdminPolicia(API_POLICIAS));
}

export async function obtenerPolicia(idUsuario) {
  return apiAdminPolicia(
    `${API_POLICIAS}/${idValido(idUsuario, "El policía")}`
  );
}

export async function crearPolicia(datos) {
  const idUsuario = idValido(datos.idUsuario, "El usuario");

  return apiAdminPolicia(API_POLICIAS, {
    method: "POST",
    body: JSON.stringify({
      idUsuario,
      ...datosPoliciales(datos),
    }),
  });
}

export async function actualizarPolicia(idUsuario, datos) {
  return apiAdminPolicia(
    `${API_POLICIAS}/${idValido(idUsuario, "El policía")}`,
    {
      method: "PUT",
      body: JSON.stringify(datosPoliciales(datos)),
    }
  );
}

export async function eliminarPolicia(idUsuario) {
  return apiAdminPolicia(
    `${API_POLICIAS}/${idValido(idUsuario, "El policía")}`,
    { method: "DELETE" }
  );
}

export async function registrarNuevoPolicia(datos) {
  const cedula = String(datos.cedula ?? "").trim();
  const primerNombre = String(datos.primerNombre ?? "").trim();
  const primerApellido = String(datos.primerApellido ?? "").trim();
  const correo = String(datos.correo ?? "").trim();
  const username = String(datos.username ?? "").trim();
  const password = String(datos.password ?? "");

  if (!cedula || !primerNombre || !primerApellido) {
    throw new Error("Completa la cédula, el nombre y el apellido.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    throw new Error("Ingresa un correo electrónico válido.");
  }

  if (!username) {
    throw new Error("El nombre de usuario es obligatorio.");
  }

  if (!password.trim()) {
    throw new Error("La contraseña inicial es obligatoria.");
  }

  // Validar antes de crear la cuenta.
  const policia = datosPoliciales(datos);

  // Obtener el rol real desde la base de datos.
  const roles = lista(await apiAdminPolicia(API_ROLES));

  const rol = roles.find((item) =>
    String(
      item.nombre ??
      item.nombreRol ??
      item.rolNombre ??
      ""
    ).trim().toUpperCase() === "POLICIA"
  );

  if (!rol) {
    throw new Error("No se encontró el rol POLICIA.");
  }

  const rolId = idValido(
    rol.idRol ?? rol.rolId ?? rol.id,
    "El rol POLICIA"
  );

  // Crear usuario con rol POLICIA.
  const usuarioCreado = await apiAdminPolicia(
    `${API_USUARIOS}/personal`,
    {
      method: "POST",
      body: JSON.stringify({
        cedula,
        primerNombre,
        primerApellido,
        correo,
        username,
        password,
        rolId,
      }),
    }
  );

  const idUsuario = idValido(
    usuarioCreado?.idUsuario ??
    usuarioCreado?.IdUsuario ??
    usuarioCreado?.usuario?.idUsuario ??
    usuarioCreado?.usuario?.IdUsuario,
    "El ID del usuario creado"
  );

  // Crear registro en POLICIAS.
  try {
    const policiaCreado = await crearPolicia({
      idUsuario,
      ...policia,
    });

    return {
      usuario: { ...usuarioCreado, idUsuario },
      policia: policiaCreado,
    };
  } catch (error) {
    const fallo = new Error(
      `La cuenta de usuario #${idUsuario} se creó, pero ` +
      `falló el registro policial: ${error.message}. ` +
      "No repitas la creación: primero debe completarse " +
      "el registro de esa cuenta."
    );

    fallo.usuarioParcial = { ...usuarioCreado, idUsuario };
    throw fallo;
  }
}
