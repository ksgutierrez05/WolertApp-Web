// js/central/configuracion.js
// Lógica de la pantalla "Configuración de perfil" de Central de Radio.
// Solo maneja los datos personales del operador (foto, nombre, cargo,
// correo, teléfono) y el cambio de contraseña. No hay preferencias de
// app (notificaciones, sonidos, mapa, tema) ni administración del sistema.
//
// El perfil se guarda en localStorage bajo una sola llave, ligado a
// este navegador/dispositivo. La contraseña NUNCA se guarda en
// localStorage: solo se valida y se simula el envío al backend.

const CFG_STORAGE_KEY = 'wolertapp.central.perfil';

const CFG_DEFAULT = {
  nombre: '',
  cargo: 'Operador de radio',
  correo: '',
  telefono: '',
  foto: null, // dataURL de la foto, o null si no hay foto
};

// ---------- almacenamiento ----------
function cargarPerfil() {
  try {
    const guardado = localStorage.getItem(CFG_STORAGE_KEY);
    return guardado ? { ...CFG_DEFAULT, ...JSON.parse(guardado) } : { ...CFG_DEFAULT };
  } catch (err) {
    console.warn('No se pudo leer el perfil guardado, se usan valores por defecto.', err);
    return { ...CFG_DEFAULT };
  }
}

function guardarPerfil(perfil) {
  try {
    localStorage.setItem(CFG_STORAGE_KEY, JSON.stringify(perfil));
    return true;
  } catch (err) {
    console.error('No se pudo guardar el perfil.', err);
    return false;
  }
}

// ---------- leer/escribir el formulario ----------
function leerFormulario() {
  return {
    nombre: document.getElementById('perfilNombre').value.trim(),
    cargo: document.getElementById('perfilCargo').value.trim(),
    correo: document.getElementById('perfilCorreo').value.trim(),
    telefono: document.getElementById('perfilTelefono').value.trim(),
    foto: fotoActualDataUrl,
  };
}

function aplicarAlFormulario(perfil) {
  document.getElementById('perfilNombre').value = perfil.nombre;
  document.getElementById('perfilCargo').value = perfil.cargo;
  document.getElementById('perfilCorreo').value = perfil.correo;
  document.getElementById('perfilTelefono').value = perfil.telefono;

  fotoActualDataUrl = perfil.foto;
  actualizarPreviewFoto(perfil);
}

function iniciales(nombre) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return 'CR';
  const primera = partes[0][0] || '';
  const segunda = partes.length > 1 ? partes[1][0] : '';
  return (primera + segunda).toUpperCase();
}

function actualizarPreviewFoto(perfil) {
  const preview = document.getElementById('fotoPreview');
  if (perfil.foto) {
    preview.style.backgroundImage = `url(${perfil.foto})`;
    preview.textContent = '';
    preview.classList.add('cfg-avatar-preview-imagen-dash');
  } else {
    preview.style.backgroundImage = '';
    preview.textContent = iniciales(perfil.nombre);
    preview.classList.remove('cfg-avatar-preview-imagen-dash');
  }
}

// ---------- feedback visual ----------
let toastTimeout = null;
function mostrarToast() {
  const toast = document.getElementById('cfgToast');
  toast.classList.add('visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('visible'), 2200);
}

function mostrarErrorPassword(mostrar) {
  document.getElementById('perfilPassError').classList.toggle('d-none', !mostrar);
}

// ---------- estado en memoria de la foto ----------
let fotoActualDataUrl = null;

// ---------- inicialización ----------
document.addEventListener('DOMContentLoaded', () => {
  const perfil = cargarPerfil();
  aplicarAlFormulario(perfil);

  // Cambiar foto
  document.getElementById('btnCambiarFoto').addEventListener('click', () => {
    document.getElementById('inputFoto').click();
  });

  document.getElementById('inputFoto').addEventListener('change', e => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const limiteBytes = 2 * 1024 * 1024; // 2 MB
    if (archivo.size > limiteBytes) {
      alert('La imagen supera los 2 MB permitidos.');
      e.target.value = '';
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      fotoActualDataUrl = lector.result;
      actualizarPreviewFoto({
        nombre: document.getElementById('perfilNombre').value,
        foto: fotoActualDataUrl,
      });
    };
    lector.readAsDataURL(archivo);
  });

  document.getElementById('btnQuitarFoto').addEventListener('click', () => {
    fotoActualDataUrl = null;
    document.getElementById('inputFoto').value = '';
    actualizarPreviewFoto({
      nombre: document.getElementById('perfilNombre').value,
      foto: null,
    });
  });

  // Guardar cambios
  document.getElementById('btnGuardar').addEventListener('click', () => {
    const passActual = document.getElementById('perfilPassActual').value;
    const passNueva = document.getElementById('perfilPassNueva').value;
    const passConfirmar = document.getElementById('perfilPassConfirmar').value;

    if (passNueva || passConfirmar) {
      if (passNueva !== passConfirmar) {
        mostrarErrorPassword(true);
        return;
      }
      if (!passActual) {
        alert('Ingresa tu contraseña actual para poder cambiarla.');
        return;
      }
      // Aquí iría la llamada al backend para validar la contraseña
      // actual y establecer la nueva. La contraseña nunca se guarda
      // en localStorage.
    }
    mostrarErrorPassword(false);

    const nuevoPerfil = leerFormulario();
    const ok = guardarPerfil(nuevoPerfil);
    if (ok) {
      document.getElementById('perfilPassActual').value = '';
      document.getElementById('perfilPassNueva').value = '';
      document.getElementById('perfilPassConfirmar').value = '';
      mostrarToast();
    }
  });
});