
renderSidebarPolicia('miperfil');
const STORAGE_KEY_PER = 'wolert_perfil';
const IDS_SWITCHES_PER = ['switchNotificacionesPer', 'switchSonidoPer', 'switchVibracionPer', 'switchMapaPer'];

const ESTADOS_OPERATIVOS_PER = {
  disponible:    { texto: 'Disponible',    badge: 'badge-green-dash', color: 'var(--color-green)' },
  en_atencion:   { texto: 'En atención',   badge: 'badge-amber-dash', color: 'var(--color-amber)' },
  en_camino:     { texto: 'En camino',     badge: 'badge-red-dash',   color: 'var(--color-danger)' },
  no_disponible: { texto: 'No disponible', badge: 'badge-blue-dash',  color: 'var(--subtle)' },
};

function cargarPerfil() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY_PER);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {
    console.warn('No se pudo leer Mi Perfil desde localStorage.', e);
  }
  return { campos: {}, switches: {}, estado: 'disponible' };
}

function guardarPerfil() {
  try {
    localStorage.setItem(STORAGE_KEY_PER, JSON.stringify(perfilGuardado));
  } catch (e) {
    console.warn('No se pudo guardar Mi Perfil en localStorage.', e);
  }
}

let perfilGuardado = cargarPerfil();
if (!perfilGuardado.estado) perfilGuardado.estado = 'disponible';

/* ---------- edición de datos personales ---------- */
const btnEditarPer = document.getElementById('btnEditarPer');
const accionesEdicionPer = document.getElementById('accionesEdicionPer');
const camposEditablesPer = document.querySelectorAll('[data-editable="true"]');
let valoresOriginalesPer = {};

// Aplica al cargar la página cualquier valor guardado previamente
camposEditablesPer.forEach(fila => {
  const valor = fila.querySelector('.valor-info-per');
  const input = fila.querySelector('.input-info-per');
  const campo = input.dataset.campo;
  if (perfilGuardado.campos[campo] !== undefined) {
    valor.textContent = perfilGuardado.campos[campo];
  }
});

IDS_SWITCHES_PER.forEach(id => {
  const el = document.getElementById(id);
  if (el && perfilGuardado.switches[id] !== undefined) {
    el.checked = perfilGuardado.switches[id];
  }
});

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
    const nuevoValor = input.value.trim();
    valor.textContent = nuevoValor;
    perfilGuardado.campos[input.dataset.campo] = nuevoValor;
  });

  // Aquí se conecta la llamada real al backend para persistir los cambios.
  guardarPerfil();
  salirModoEdicionPer();
});

// Los switches guardan su estado en localStorage; la sincronización real
// con el backend se conecta cuando esté disponible.
IDS_SWITCHES_PER.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('change', () => {
      perfilGuardado.switches[id] = el.checked;
      guardarPerfil();
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

/* ============================================================
   ESTADO OPERATIVO (Disponible / En atención / En camino / No disponible)
   Convierte el chip fijo del encabezado en un desplegable, y mantiene
   sincronizado el badge de "Estado operativo" dentro de la tarjeta de
   información.
   ============================================================ */
function filaEstadoOperativoInfo() {
  return [...document.querySelectorAll('.fila-info-per')]
    .find(fila => fila.querySelector('.label-info-per')?.textContent.trim() === 'Estado operativo');
}

function aplicarEstadoOperativoPer(clave) {
  const est = ESTADOS_OPERATIVOS_PER[clave] || ESTADOS_OPERATIVOS_PER.disponible;

  const textoEl = document.getElementById('textoEstadoOperativoPer');
  const dotEl = document.getElementById('dotEstadoOperativoPer');
  if (textoEl) textoEl.textContent = est.texto;
  if (dotEl) dotEl.style.background = est.color;

  const fila = filaEstadoOperativoInfo();
  if (fila) {
    const badge = fila.querySelector('.badge-dash');
    if (badge) {
      badge.className = `badge-dash ${est.badge}`;
      badge.textContent = est.texto;
    }
  }

  document.querySelectorAll('#menuEstadoOperativoPer .dropdown-item').forEach(item => {
    item.classList.toggle('active', item.dataset.estado === clave);
  });
}

function cambiarEstadoOperativoPer(clave) {
  perfilGuardado.estado = clave;
  guardarPerfil();
  aplicarEstadoOperativoPer(clave);
}

function montarSelectorEstadoOperativoPer() {
  const original = document.querySelector('.estado-op-per');
  if (!original) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'dropdown';
  wrapper.innerHTML = `
    <button type="button" id="btnEstadoOperativoPer" class="estado-op-per btn p-0 border-0 bg-transparent dropdown-toggle"
      data-bs-toggle="dropdown" aria-expanded="false" style="cursor:pointer;">
      <span class="dot-per" id="dotEstadoOperativoPer"></span>
      <span id="textoEstadoOperativoPer">${original.textContent.trim()}</span>
    </button>
    <ul class="dropdown-menu dropdown-menu-end" id="menuEstadoOperativoPer" aria-labelledby="btnEstadoOperativoPer">
      ${Object.entries(ESTADOS_OPERATIVOS_PER).map(([clave, e]) =>
        `<li><a class="dropdown-item" href="#" data-estado="${clave}">${e.texto}</a></li>`
      ).join('')}
    </ul>
  `;

  original.replaceWith(wrapper);

  wrapper.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      cambiarEstadoOperativoPer(item.dataset.estado);
    });
  });

  aplicarEstadoOperativoPer(perfilGuardado.estado);
}

montarSelectorEstadoOperativoPer();