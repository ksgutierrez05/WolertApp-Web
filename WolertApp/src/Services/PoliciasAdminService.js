
import { apiAdminPolicia } from "./AdminPoliciaApi";

// ==========================================
// ENDPOINTS
// ==========================================

const API_POLICIAS = "/api/Policias";
const API_USUARIOS = "/api/Usuarios";
const API_ROLES = "/api/Roles";

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function obtenerIdUsuario(usuario) {
  const id = Number(
    usuario?.idUsuario ??
    usuario?.IdUsuario ??
    usuario?.usuario?.idUsuario ??
    usuario?.usuario?.IdUsuario
  );

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "La API no devolvió un ID_USUARIO válido. " +
      "Verifica si la cuenta fue creada antes de intentarlo nuevamente."
    );
  }

  return id;
}

function obtenerRolPolicia(roles) {
  if (!Array.isArray(roles)) {
    throw new Error(
      "No se pudo obtener el listado de roles."
    );
  }

  const rol = roles.find(
    r =>
      String(
        r.nombre ??
        r.nombreRol ??
        r.rolNombre ??
        ""
      )
        .trim()
        .toUpperCase() === "POLICIA"
  );

  if (!rol) {
    throw new Error(
      "No se encontró el rol POLICIA en el sistema."
    );
  }

  const idRol = Number(
    rol.idRol ?? rol.rolId ?? rol.id
  );

  if (!Number.isInteger(idRol) || idRol <= 0) {
    throw new Error(
      "El rol POLICIA no tiene un identificador válido."
    );
  }

  return idRol;
}

function normalizarDatosPolicia(datos) {
  const placa = String(datos.placa ?? "").trim();
  const rango = String(datos.rango ?? "").trim();

  if (!placa) {
    throw new Error("La placa del policía es obligatoria.");
  }

  if (placa.length > 10) {
    throw new Error(
      "La placa no puede superar los 10 caracteres."
    );
  }

  if (rango.length > 25) {
    throw new Error(
      "El rango no puede superar los 25 caracteres."
    );
  }

  const estado = String(
    datos.estado || "ACTIVO"
  ).trim().toUpperCase();

  if (!["ACTIVO", "INACTIVO"].includes(estado)) {
    throw new Error(
      "El estado debe ser ACTIVO o INACTIVO."
    );
  }

  const idUnidad =
    datos.idUnidad === "" ||
    datos.idUnidad === null ||
    datos.idUnidad === undefined
      ? null
      : Number(datos.idUnidad);

  if (
    idUnidad !== null &&
    (!Number.isInteger(idUnidad) || idUnidad <= 0)
  ) {
    throw new Error(
      "Selecciona una unidad policial válida."
    );
  }

  return {
    placa,
    rango: rango || null,
    estado,
    idUnidad,
  };
}

// ==========================================
// LISTAR POLICÍAS
// GET /api/Policias
// ==========================================

export async function listarPolicias() {
  const respuesta = await apiAdminPolicia(API_POLICIAS);

  if (!Array.isArray(respuesta)) {
    throw new Error(
      "La API no devolvió un listado válido de policías."
    );
  }

  return respuesta;
}

// ==========================================
// OBTENER POLICÍA POR ID
// GET /api/Policias/{id}
// ==========================================

export async function obtenerPolicia(idUsuario) {
  const id = Number(idUsuario);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID de policía inválido.");
  }

  return apiAdminPolicia(`${API_POLICIAS}/${id}`);
}

// ==========================================
// LISTAR USUARIOS DISPONIBLES
// GET /api/Usuarios
// ==========================================

export async function listarUsuariosDisponibles() {
  const [usuarios, policias] = await Promise.all([
    apiAdminPolicia(API_USUARIOS),
    listarPolicias(),
  ]);

  if (!Array.isArray(usuarios)) {
    throw new Error(
      "La API no devolvió un listado válido de usuarios."
    );
  }

  const idsRegistrados = new Set(
    policias.map(p => Number(p.idUsuario))
  );

  return usuarios.filter(usuario => {
    const nombreRol = String(
      usuario.rolNombre ??
      usuario.nombreRol ??
      usuario.rol?.nombre ??
      ""
    )
      .trim()
      .toUpperCase();

    const tieneRolPolicia = nombreRol === "POLICIA";

    const noEstaRegistrado = !idsRegistrados.has(
      Number(usuario.idUsuario)
    );

    return tieneRolPolicia && noEstaRegistrado;
  });
}

// ==========================================
// CREAR REGISTRO POLICIAL
// POST /api/Policias
// ==========================================

export async function crearPolicia(datos) {
  const idUsuario = Number(datos.idUsuario);

  if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
    throw new Error(
      "Debes seleccionar un usuario válido."
    );
  }

  const datosNormalizados = normalizarDatosPolicia(datos);

  return apiAdminPolicia(API_POLICIAS, {
    method: "POST",
    body: JSON.stringify({
      idUsuario,
      ...datosNormalizados,
    }),
  });
}

// ==========================================
// ACTUALIZAR POLICÍA
// PUT /api/Policias/{id}
// ==========================================

export async function actualizarPolicia(
  idUsuario,
  datos
) {
  const id = Number(idUsuario);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "El ID del policía no es válido."
    );
  }

  const datosNormalizados = normalizarDatosPolicia(datos);

  return apiAdminPolicia(`${API_POLICIAS}/${id}`, {
    method: "PUT",
    body: JSON.stringify(datosNormalizados),
  });
}

// ==========================================
// ELIMINAR REGISTRO POLICIAL
// DELETE /api/Policias/{id}
// ==========================================

export async function eliminarPolicia(idUsuario) {
  const id = Number(idUsuario);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "El ID del policía no es válido."
    );
  }

  return apiAdminPolicia(`${API_POLICIAS}/${id}`, {
    method: "DELETE",
  });
}

// ==========================================
// REGISTRAR NUEVO POLICÍA
//
// 1. Obtener rol POLICIA
// 2. Crear usuario
// 3. Obtener ID_USUARIO
// 4. Crear registro en POLICIAS
//
// SIN MODIFICAR EL BACKEND
// ==========================================

export async function registrarNuevoPolicia(datos) {
  // ----------------------------------------
  // VALIDAR DATOS PERSONALES
  // ----------------------------------------

  const cedula = String(datos.cedula ?? "").trim();
  const primerNombre = String(
    datos.primerNombre ?? ""
  ).trim();

  const primerApellido = String(
    datos.primerApellido ?? ""
  ).trim();

  const correo = String(datos.correo ?? "").trim();
  const username = String(datos.username ?? "").trim();
  const password = String(datos.password ?? "");

  if (!cedula) {
    throw new Error("La cédula es obligatoria.");
  }

  if (!primerNombre) {
    throw new Error("El primer nombre es obligatorio.");
  }

  if (!primerApellido) {
    throw new Error("El primer apellido es obligatorio.");
  }

  if (!correo) {
    throw new Error("El correo electrónico es obligatorio.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    throw new Error(
      "Ingresa un correo electrónico válido."
    );
  }

  if (!username) {
    throw new Error(
      "El nombre de usuario es obligatorio."
    );
  }

  if (!password.trim()) {
    throw new Error(
      "La contraseña inicial es obligatoria."
    );
  }

  // Validar los datos policiales antes de
  // crear la cuenta, para evitar errores
  // detectables después de la primera petición.

  const datosPolicia = normalizarDatosPolicia(datos);

  // ----------------------------------------
  // PASO 1: OBTENER ROL POLICIA
  // ----------------------------------------

  const roles = await apiAdminPolicia(API_ROLES);

  const rolId = obtenerRolPolicia(roles);

  // ----------------------------------------
  // PASO 2: CREAR USUARIO
  // POST /api/Usuarios/personal
  // ----------------------------------------

  const datosUsuario = {
    cedula,
    primerNombre,
    primerApellido,
    correo,
    username,
    password,
    rolId,
  };

  const usuarioCreado = await apiAdminPolicia(
    `${API_USUARIOS}/personal`,
    {
      method: "POST",
      body: JSON.stringify(datosUsuario),
    }
  );

  // ----------------------------------------
  // PASO 3: OBTENER ID_USUARIO
  // ----------------------------------------

  const idUsuario = obtenerIdUsuario(usuarioCreado);

  // ----------------------------------------
  // PASO 4: REGISTRAR EN POLICIAS
  // POST /api/Policias
  // ----------------------------------------

  try {
    const policiaCreado = await crearPolicia({
      idUsuario,
      ...datosPolicia,
    });

    return {
      usuario: {
        ...usuarioCreado,
        idUsuario,
      },
      policia: policiaCreado,
    };
  } catch (error) {
    // La primera petición ya creó la cuenta.
    // No repetir automáticamente el proceso.
    // El administrador podrá vincular la
    // cuenta desde "Usuario existente".

    const mensaje =
      `El usuario con ID ${idUsuario} fue creado, ` +
      "pero no se pudo completar su registro policial. " +
      "No vuelvas a crear la cuenta. " +
      "Utiliza la opción 'Usuario existente' " +
      "para completar el registro. " +
      `Detalle: ${error.message}`;

    const errorRegistro = new Error(mensaje);

    errorRegistro.usuarioParcial = {
      ...usuarioCreado,
      idUsuario,
    };

    throw errorRegistro;
  }
}
