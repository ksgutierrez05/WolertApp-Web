// js/mi-cuenta.js
// Lógica de Configuración → Mi cuenta (rol Comandante de Estación / Administrador Policía).
// Responsabilidades exclusivas de esta pantalla:
//   1) Previsualizar el cambio de foto de perfil.
//   2) Guardar los datos personales editables (nombre, correo, teléfono).
//   3) Mostrar/ocultar y validar el formulario de cambio de contraseña.
// "Rol" y "Estación asignada" son intencionalmente de solo lectura y
// no tienen ningún manejador de edición aquí.

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1) Foto de perfil ---------- */
  const inputFoto = document.getElementById('inputFotoPerfil');
  const imgFoto = document.getElementById('fotoPerfilImg');
  const fallbackFoto = document.getElementById('fotoPerfilFallback');

  inputFoto?.addEventListener('change', (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      imgFoto.src = ev.target.result;
      imgFoto.classList.remove('d-none');
      fallbackFoto.classList.add('d-none');
    };
    reader.readAsDataURL(archivo);
  });

  /* ---------- 2) Guardar datos personales ---------- */
  const formCuenta = document.getElementById('formCuenta');
  const previewNombre = document.getElementById('previewNombre');
  const campoNombre = document.getElementById('campoNombre');

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

    // Aquí se conectaría la llamada real al backend para persistir:
    // nombre, correo y teléfono del usuario autenticado.
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

    // Aquí se conectaría la llamada real al backend para actualizar la contraseña.
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