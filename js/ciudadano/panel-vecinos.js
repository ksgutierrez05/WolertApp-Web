/* ============================================================
   VECINOS.JS
   Solo lectura: muestra el listado de vecinos guardado en
   localStorage. El sidebar vive aparte en sidebar.js.
   ============================================================ */

const VECINOS_STORAGE_KEY = 'wolertapp_vecinos_ciudadano';

// -------- Datos de prueba (solo se usan si no hay nada guardado) --------
const VECINOS_PRUEBA = [
  {
    id: 1,
    nombre: 'María González',
    direccion: 'Cra 12 # 8-40',
    distancia: 'A 80 m',
    telefono: '300 512 4487',
    estado: 'verificado',
  },
  {
    id: 2,
    nombre: 'Carlos Ramírez',
    direccion: 'Cra 12 # 8-52',
    distancia: 'A 140 m',
    telefono: '301 884 2210',
    estado: 'verificado',
  },
  {
    id: 3,
    nombre: 'Luisa Fernanda Ortiz',
    direccion: 'Calle 9 # 11-18',
    distancia: 'A 210 m',
    telefono: '312 099 7765',
    estado: 'pendiente',
  },
  {
    id: 4,
    nombre: 'Andrés Torres',
    direccion: 'Calle 9 # 11-24',
    distancia: 'A 260 m',
    telefono: '318 402 3391',
    estado: 'verificado',
  },
  {
    id: 5,
    nombre: 'Diana Patricia Rojas',
    direccion: 'Cra 13 # 7-05',
    distancia: 'A 340 m',
    telefono: '304 771 6602',
    estado: 'pendiente',
  },
];

// -------- Storage helpers --------
function cargarVecinos() {
  try {
    const raw = localStorage.getItem(VECINOS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VECINOS_STORAGE_KEY, JSON.stringify(VECINOS_PRUEBA));
      return VECINOS_PRUEBA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo vecinos de localStorage:', e);
    return VECINOS_PRUEBA;
  }
}

// -------- Helpers --------
function iniciales(nombre) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');
}

// -------- Render --------
function renderVecinos() {
  const cont = document.getElementById('listaVecinos');
  if (!cont) return;

  const vecinos = cargarVecinos();

  if (vecinos.length === 0) {
    cont.innerHTML = `
      <div class="vecinos-empty-dash">
        <i class="bi bi-people"></i>
        Aún no tienes vecinos registrados.
      </div>
    `;
    return;
  }

  cont.innerHTML = vecinos.map(v => `
    <div class="vecino-item-dash">
      <span class="vecino-avatar-dash">${iniciales(v.nombre)}</span>
      <div class="vecino-body-dash">
        <div class="vecino-top-row-dash">
          <span class="info-title-dash">${v.nombre}</span>
          ${v.estado === 'verificado'
            ? '<span class="badge-dash badge-green-dash">Verificado</span>'
            : '<span class="badge-dash badge-amber-dash">Pendiente</span>'}
        </div>
        <div class="vecino-meta-dash">
          <span><i class="bi bi-geo-alt"></i> ${v.direccion} · ${v.distancia}</span>
          <span><i class="bi bi-telephone"></i> ${v.telefono}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// -------- Init --------
document.addEventListener('DOMContentLoaded', () => {
  renderSidebarCiudadano('vecinos'); // definido en sidebar.js
  renderVecinos();
});