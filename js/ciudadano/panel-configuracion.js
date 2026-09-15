/* ============================================================
   CONFIGURACION.JS
   Guarda las preferencias del usuario (perfil + notificaciones +
   privacidad) en localStorage. El sidebar vive aparte en
   sidebar.js.
   ============================================================ */

const CONFIG_STORAGE_KEY = 'wolertapp_configuracion_ciudadano';

// -------- Valores de prueba / por defecto --------
const CONFIG_PRUEBA = {
  perfil: {
    nombre: 'Juan Carlos Pérez',
    email: 'juan.perez@correo.com',
    telefono: '300 512 4487',
    direccion: 'Cra 12 # 8-40, Los Fundadores',
  },
  notificaciones: {
    alertaVecino: true,
    cambioEstado: true,
    correoElectronico: false,
  },
  privacidad: {
    mostrarNombreVecinos: true,
    reportarAnonimo: false,
  },
};

// -------- Storage helpers --------
function cargarConfiguracion() {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(CONFIG_PRUEBA));
      return CONFIG_PRUEBA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo configuración de localStorage:', e);
    return CONFIG_PRUEBA;
  }
}

function guardarConfiguracion(config) {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Error guardando configuración en localStorage:', e);
    return false;
  }
}

// -------- Pintar valores guardados en el formulario --------
function pintarConfiguracion() {
  const config = cargarConfiguracion();

  document.getElementById('inputNombre').value = config.perfil.nombre;
  document.getElementById('inputEmail').value = config.perfil.email;
  document.getElementById('inputTelefono').value = config.perfil.telefono;
  document.getElementById('inputDireccion').value = config.perfil.direccion;

  document.getElementById('toggleAlertaVecino').checked = config.notificaciones.alertaVecino;
  document.getElementById('toggleCambioEstado').checked = config.notificaciones.cambioEstado;
  document.getElementById('toggleCorreo').checked = config.notificaciones.correoElectronico;

  document.getElementById('toggleMostrarNombre').checked = config.privacidad.mostrarNombreVecinos;
  document.getElementById('toggleAnonimo').checked = config.privacidad.reportarAnonimo;

  const inicial = config.perfil.nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');
  document.getElementById('configAvatar').textContent = inicial;
  document.getElementById('configAvatarNombre').textContent = config.perfil.nombre;
}

// -------- Leer formulario y guardar --------
function guardarCambiosConfiguracion() {
  const config = {
    perfil: {
      nombre: document.getElementById('inputNombre').value.trim(),
      email: document.getElementById('inputEmail').value.trim(),
      telefono: document.getElementById('inputTelefono').value.trim(),
      direccion: document.getElementById('inputDireccion').value.trim(),
    },
    notificaciones: {
      alertaVecino: document.getElementById('toggleAlertaVecino').checked,
      cambioEstado: document.getElementById('toggleCambioEstado').checked,
      correoElectronico: document.getElementById('toggleCorreo').checked,
    },
    privacidad: {
      mostrarNombreVecinos: document.getElementById('toggleMostrarNombre').checked,
      reportarAnonimo: document.getElementById('toggleAnonimo').checked,
    },
  };

  const ok = guardarConfiguracion(config);
  pintarConfiguracion();
  mostrarMensajeGuardado(ok);
}

function mostrarMensajeGuardado(ok) {
  const msg = document.getElementById('msgGuardado');
  if (!msg) return;
  msg.textContent = ok ? 'Cambios guardados' : 'No se pudo guardar';
  msg.classList.add('visible');
  setTimeout(() => msg.classList.remove('visible'), 2200);
}

function restaurarValoresPrueba() {
  guardarConfiguracion(CONFIG_PRUEBA);
  pintarConfiguracion();
  mostrarMensajeGuardado(true);
}

// -------- Eventos --------
document.addEventListener('click', (e) => {
  if (e.target.closest('#btnGuardarConfig')) {
    guardarCambiosConfiguracion();
  }
  if (e.target.closest('#btnRestaurarConfig')) {
    restaurarValoresPrueba();
  }
});

// -------- Init --------
document.addEventListener('DOMContentLoaded', () => {
  renderSidebarCiudadano('configuracion'); // definido en sidebar.js
  pintarConfiguracion();
});