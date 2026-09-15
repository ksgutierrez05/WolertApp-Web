
const LS_KEY_PERFIL = 'perfilUsuarioPolicia';

function cargarPerfil() {
  try {
    const guardado = localStorage.getItem(LS_KEY_PERFIL);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {
    console.warn('No se pudo leer el perfil desde localStorage:', e);
  }
  return null;
}

function guardarPerfil(datos) {
  try {
    const actual = cargarPerfil() || {};
    const nuevo = { ...actual, ...datos };
    localStorage.setItem(LS_KEY_PERFIL, JSON.stringify(nuevo));
    return nuevo;
  } catch (e) {
    console.warn('No se pudo guardar el perfil en localStorage:', e);
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {

  const perfilGuardado = cargarPerfil();

  /* ---------- 1) Foto de perfil ---------- */
  const inputFoto = document.getElementById('inputFotoPerfil');
  const imgFoto = document.getElementById('fotoPerfilImg');
  const fallbackFoto = document.getElementById('fotoPerfilFallback');

  // Foto pendiente de guardar (se confirma junto con el resto del
  // formulario al pulsar "Guardar cambios", igual que nombre/correo/teléfono).
  let fotoPendiente = null;

  // Restaura la foto guardada, si existe, al cargar la página.
  if (perfilGuardado?.foto && imgFoto) {
    imgFoto.src = perfilGuardado.foto;
    imgFoto.classList.remove('d-none');
    fallbackFoto?.classList.add('d-none');
  }

  inputFoto?.addEventListener('change', (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      fotoPendiente = ev.target.result;
      imgFoto.src = fotoPendiente;
      imgFoto.classList.remove('d-none');
      fallbackFoto.classList.add('d-none');
    };
    reader.readAsDataURL(archivo);
  });

  /* ---------- 2) Guardar datos personales ---------- */
  const formCuenta = document.getElementById('formCuenta');
  const previewNombre = document.getElementById('previewNombre');
  const campoNombre = document.getElementById('campoNombre');

  // Restaura los campos editables guardados (cualquier campo cuyo id
  // empiece por "campo" dentro del formulario), si existe algo previo.
  if (perfilGuardado) {
    formCuenta?.querySelectorAll('[id^="campo"]').forEach(campo => {
      if (perfilGuardado[campo.id] !== undefined) {
        campo.value = perfilGuardado[campo.id];
      }
    });
    if (previewNombre && campoNombre) {
      previewNombre.textContent = campoNombre.value.trim() || 'Sin nombre';
    }
  }

  // Refleja el nombre en vivo en la tarjeta de la izquierda mientras se edita.
  campoNombre?.addEventListener('input', () => {
    previewNombre.textContent = campoNombre.value.trim() || 'Sin nombre';
  });

  formCuenta?.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!formCuenta.checkValidity()) {
      formCuenta.reportValidity();
      return;
    }

    // Junta todos los campos editables (id que empiece por "campo")
    // más la foto pendiente (si el usuario seleccionó una nueva).
    const datos = {};
    formCuenta.querySelectorAll('[id^="campo"]').forEach(campo => {
      datos[campo.id] = campo.value;
    });
    if (fotoPendiente) {
      datos.foto = fotoPendiente;
      fotoPendiente = null;
    }

    // Aquí se conectaría la llamada real al backend para persistir:
    // nombre, correo y teléfono del usuario autenticado. Mientras tanto,
    // se guarda localmente para que los cambios no se pierdan al recargar.
    guardarPerfil(datos);
    mostrarToast('Cambios guardados correctamente.');
  });

  /* ---------- 3) Cambiar contraseña ---------- */
  const btnTogglePass = document.getElementById('btnTogglePass');
  const btnCancelarPass = document.getElementById('btnCancelarPass');
  const formPassword = document.getElementById('formPassword');
  const passActual = document.getElementById('passActual');
  const passNueva = document.getElementById('passNueva');
  const passConfirmar = document.getElementById('passConfirmar');
  const passError = document.getElementById('passError');

  function abrirFormPassword() {
    formPassword.classList.remove('d-none');
    btnTogglePass.classList.add('d-none');
    passActual.focus();
  }

  function cerrarFormPassword() {
    formPassword.reset();
    passError.classList.add('d-none');
    formPassword.classList.add('d-none');
    btnTogglePass.classList.remove('d-none');
  }

  btnTogglePass?.addEventListener('click', abrirFormPassword);
  btnCancelarPass?.addEventListener('click', cerrarFormPassword);

  formPassword?.addEventListener('submit', (e) => {
    e.preventDefault();
    passError.classList.add('d-none');

    if (!passActual.value || !passNueva.value || !passConfirmar.value) {
      formPassword.reportValidity();
      return;
    }

    if (passNueva.value.length < 8) {
      passError.textContent = 'La nueva contraseña debe tener al menos 8 caracteres.';
      passError.classList.remove('d-none');
      return;
    }

    if (passNueva.value !== passConfirmar.value) {
      passError.textContent = 'Las contraseñas no coinciden.';
      passError.classList.remove('d-none');
      return;
    }

    // Aquí se conectaría la llamada real al backend para actualizar la
    // contraseña. Deliberadamente NO se guarda nada de esto en
    // localStorage por seguridad.
    cerrarFormPassword();
    mostrarToast('Contraseña actualizada correctamente.');
  });

  /* ---------- Aviso de confirmación ---------- */
  let toastTimeout;
  function mostrarToast(mensaje) {
    const toast = document.getElementById('cuentaToast');
    const texto = document.getElementById('cuentaToastTexto');
    if (!toast || !texto) return;

    texto.textContent = mensaje;
    toast.classList.add('mostrar');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('mostrar'), 3000);
  }
});