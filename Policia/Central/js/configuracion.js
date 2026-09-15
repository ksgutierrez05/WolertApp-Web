
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
  actualizarHero(perfil);
  actualizarResumen(perfil);
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

// ---------- hero y resumen (se refrescan con cada cambio) ----------
function actualizarHero(perfil) {
  document.getElementById('heroNombre').textContent = perfil.nombre || 'Operador de radio';
  document.getElementById('heroCargo').textContent = perfil.cargo || 'Operador de radio';
  document.getElementById('heroCorreo').textContent = perfil.correo || 'Sin correo registrado';
}

function actualizarResumen(perfil) {
  document.getElementById('resumenNombre').textContent = perfil.nombre || '—';
  document.getElementById('resumenCargo').textContent = perfil.cargo || '—';
  document.getElementById('resumenCorreo').textContent = perfil.correo || '—';
  document.getElementById('resumenTelefono').textContent = perfil.telefono || '—';
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

// ---------- checklist de contraseña ----------
function validarPassword(password) {
  return {
    longitud: password.length >= 8,
    mayuscula: /[A-Z]/.test(password),
    numero: /[0-9]/.test(password),
    simbolo: /[^A-Za-z0-9]/.test(password),
  };
}

function actualizarChecklistUI(password) {
  const checklist = document.getElementById('perfilPassChecklist');
  checklist.classList.toggle('d-none', password.length === 0);

  const estado = validarPassword(password);
  const mapa = {
    chkLongitud: estado.longitud,
    chkMayuscula: estado.mayuscula,
    chkNumero: estado.numero,
    chkSimbolo: estado.simbolo,
  };

  Object.entries(mapa).forEach(([id, cumple]) => {
    const li = document.getElementById(id);
    const icono = li.querySelector('i');
    li.classList.toggle('cfg-checklist-ok-dash', cumple);
    icono.className = cumple ? 'bi bi-check-circle-fill' : 'bi bi-circle';
  });
}

// ---------- estado en memoria de la foto ----------
let fotoActualDataUrl = null;

// ---------- inicialización ----------
document.addEventListener('DOMContentLoaded', () => {
  const perfil = cargarPerfil();
  aplicarAlFormulario(perfil);

  // Refrescar hero y resumen en vivo mientras se escribe
  ['perfilNombre', 'perfilCorreo', 'perfilTelefono'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      const actual = leerFormulario();
      actualizarHero(actual);
      actualizarResumen(actual);
    });
  });

  // Checklist de contraseña
  document.getElementById('perfilPassNueva').addEventListener('input', e => {
    actualizarChecklistUI(e.target.value);
  });

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
  
    }
    mostrarErrorPassword(false);

    const nuevoPerfil = leerFormulario();
    const ok = guardarPerfil(nuevoPerfil);
    if (ok) {
      document.getElementById('perfilPassActual').value = '';
      document.getElementById('perfilPassNueva').value = '';
      document.getElementById('perfilPassConfirmar').value = '';
      document.getElementById('perfilPassChecklist').classList.add('d-none');
      mostrarToast();
    }
  });
});