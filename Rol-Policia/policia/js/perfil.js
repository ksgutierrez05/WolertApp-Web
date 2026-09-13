// js/perfil.js
// Lógica de "Mi Perfil" del rol Patrullero.
// Sin opciones administrativas: solo información propia y preferencias.

renderSidebarPolicia('miperfil');

/* ---------- edición de datos personales ---------- */
const btnEditarPer = document.getElementById('btnEditarPer');
const accionesEdicionPer = document.getElementById('accionesEdicionPer');
const camposEditablesPer = document.querySelectorAll('[data-editable="true"]');
let valoresOriginalesPer = {};

function entrarModoEdicionPer() {
  valoresOriginalesPer = {};

  camposEditablesPer.forEach(fila => {
    const valor = fila.querySelector('.valor-info-per');
    const input = fila.querySelector('.input-info-per');
    const campo = input.dataset.campo;

    valoresOriginalesPer[campo] = valor.textContent.trim();
    input.value = valoresOriginalesPer[campo];

    valor.classList.add('d-none');
    input.classList.remove('d-none');
  });

  btnEditarPer.classList.add('activo-per');
  accionesEdicionPer.classList.remove('d-none');
}

function salirModoEdicionPer() {
  camposEditablesPer.forEach(fila => {
    const valor = fila.querySelector('.valor-info-per');
    const input = fila.querySelector('.input-info-per');

    input.classList.add('d-none');
    valor.classList.remove('d-none');
  });

  btnEditarPer.classList.remove('activo-per');
  accionesEdicionPer.classList.add('d-none');
}

btnEditarPer.addEventListener('click', () => {
  const enEdicion = !accionesEdicionPer.classList.contains('d-none');
  if (enEdicion) {
    salirModoEdicionPer();
  } else {
    entrarModoEdicionPer();
  }
});

document.getElementById('btnCancelarPer').addEventListener('click', () => {
  camposEditablesPer.forEach(fila => {
    const input = fila.querySelector('.input-info-per');
    input.value = valoresOriginalesPer[input.dataset.campo];
  });
  salirModoEdicionPer();
});

document.getElementById('btnGuardarPer').addEventListener('click', () => {
  camposEditablesPer.forEach(fila => {
    const valor = fila.querySelector('.valor-info-per');
    const input = fila.querySelector('.input-info-per');
    valor.textContent = input.value.trim();
  });

  // Aquí se conecta la llamada real al backend para persistir los cambios.
  salirModoEdicionPer();
});

// Los switches solo guardan su estado en memoria de la sesión actual;
// la persistencia real se conecta al backend cuando esté disponible.
['switchNotificacionesPer', 'switchSonidoPer', 'switchVibracionPer', 'switchMapaPer'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('change', () => {
      console.log(`${id}: ${el.checked ? 'activado' : 'desactivado'}`);
    });
  }
});

document.getElementById('btnCerrarSesionPer').addEventListener('click', () => {
  const confirmar = confirm('¿Seguro que deseas cerrar sesión?');
  if (confirmar) {
    // Aquí se conecta el flujo real de logout (limpiar sesión y redirigir al login).
    console.log('Cerrando sesión...');
  }
});