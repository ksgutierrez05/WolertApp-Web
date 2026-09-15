renderSidebarPolicia('unidades');

// ---------- Datos de ejemplo (en memoria + localStorage) ----------
// Simula lo que hoy trae UnidadPolicialDAO desde MySQL. Al conectar
// el backend real, basta con reemplazar las funciones cargarUnidades()/
// guardarUnidades() por llamadas fetch() a la API.

const BARRIOS = ['Centro', 'La Nevada', 'Cañaguate', 'Los Almendros', 'Sicarare', 'La Popa'];

// EstadoUnidadPolicial: ACTIVA | INACTIVA | OPERATIVA
const ESTADOS_UNIDAD = {
  OPERATIVA: { label: 'Operativa', badge: 'badge-green-dash' },
  ACTIVA: { label: 'Activa', badge: 'badge-amber-dash' },
  INACTIVA: { label: 'Inactiva', badge: 'badge-dash' },
};

// ---------- Claves de localStorage ----------
const LS_KEY_UNIDADES = 'unidadesPoliciales';
const LS_KEY_NEXT_ID = 'unidadesPolicialesNextId';
const LS_KEY_POLICIAS_POR_UNIDAD = 'policiasPorUnidad';

const UNIDADES_DEFECTO = [
  { id: 1, nombre: 'Patrulla 101', barrio: 'Centro', estado: 'OPERATIVA', lat: 10.4631, lng: -73.2532 },
  { id: 2, nombre: 'CAI La Nevada', barrio: 'La Nevada', estado: 'OPERATIVA', lat: 10.4702, lng: -73.2598 },
  { id: 3, nombre: 'Moto 07', barrio: 'Cañaguate', estado: 'ACTIVA', lat: 10.4550, lng: -73.2461 },
  { id: 4, nombre: 'Patrulla 205', barrio: 'Los Almendros', estado: 'OPERATIVA', lat: 10.4489, lng: -73.2705 },
  { id: 5, nombre: 'CAI Sicarare', barrio: 'Sicarare', estado: 'INACTIVA', lat: 10.4415, lng: -73.2380 },
  { id: 6, nombre: 'Moto 12', barrio: 'La Popa', estado: 'ACTIVA', lat: 10.4667, lng: -73.2610 },
];

// Conteo de policías por unidad. Reemplaza esto por la relación real
// cuando esta vista se conecte con PoliciaDAO / UnidadPolicialDAO.
const POLICIAS_POR_UNIDAD_DEFECTO = { 1: 1, 2: 2, 3: 1, 4: 1, 5: 1, 6: 1 };

// ---------- Carga inicial desde localStorage ----------
function cargarUnidades() {
  try {
    const guardado = localStorage.getItem(LS_KEY_UNIDADES);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {
    console.warn('No se pudo leer unidades desde localStorage:', e);
  }
  return UNIDADES_DEFECTO.map(u => ({ ...u }));
}

function cargarPoliciasPorUnidad() {
  try {
    const guardado = localStorage.getItem(LS_KEY_POLICIAS_POR_UNIDAD);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {
    console.warn('No se pudo leer policías por unidad desde localStorage:', e);
  }
  return { ...POLICIAS_POR_UNIDAD_DEFECTO };
}

function cargarNextId() {
  try {
    const guardado = localStorage.getItem(LS_KEY_NEXT_ID);
    if (guardado) return parseInt(guardado, 10);
  } catch (e) {
    console.warn('No se pudo leer el siguiente id desde localStorage:', e);
  }
  return UNIDADES.length + 1;
}

let UNIDADES = cargarUnidades();
const POLICIAS_POR_UNIDAD = cargarPoliciasPorUnidad();
let nextUnidadId = cargarNextId();

// ---------- Persistencia ----------
function guardarUnidades() {
  try {
    localStorage.setItem(LS_KEY_UNIDADES, JSON.stringify(UNIDADES));
    localStorage.setItem(LS_KEY_NEXT_ID, String(nextUnidadId));
  } catch (e) {
    console.warn('No se pudo guardar unidades en localStorage:', e);
  }
}

function guardarPoliciasPorUnidad() {
  try {
    localStorage.setItem(LS_KEY_POLICIAS_POR_UNIDAD, JSON.stringify(POLICIAS_POR_UNIDAD));
  } catch (e) {
    console.warn('No se pudo guardar policías por unidad en localStorage:', e);
  }
}

function unidadPorId(id) {
  return UNIDADES.find(u => u.id === id);
}

function policiasDeUnidad(unidadId) {
  return POLICIAS_POR_UNIDAD[unidadId] || 0;
}

const COLORES_AVATAR = ['#1c781e', '#154d8c', '#a91824', '#c9821c', '#5b3fa0', '#0a8f72'];
function colorAvatar(texto) {
  let hash = 0;
  for (let i = 0; i < (texto || '').length; i++) hash = texto.charCodeAt(i) + ((hash << 5) - hash);
  return COLORES_AVATAR[Math.abs(hash) % COLORES_AVATAR.length];
}

const modalUnidad = new bootstrap.Modal(document.getElementById('modalUnidad'));
const modalVerUnidad = new bootstrap.Modal(document.getElementById('modalVerUnidad'));

// ---------- Poblar selects de barrio ----------
function poblarBarrios() {
  const selectForm = document.getElementById('unidadBarrio');
  const selectFiltro = document.getElementById('filtroBarrioUnidad');
  BARRIOS.forEach(b => {
    selectForm.insertAdjacentHTML('beforeend', `<option value="${b}">${b}</option>`);
    selectFiltro.insertAdjacentHTML('beforeend', `<option value="${b}">${b}</option>`);
  });
}

// ---------- KPIs ----------
function renderKpisUnidades() {
  const total = UNIDADES.length;
  const operativas = UNIDADES.filter(u => u.estado === 'OPERATIVA').length;
  const activas = UNIDADES.filter(u => u.estado === 'ACTIVA').length;
  const inactivas = UNIDADES.filter(u => u.estado === 'INACTIVA').length;

  const kpis = [
    { color: 'blue', icon: 'bi-car-front', num: total, label: 'Total de unidades' },
    { color: 'green', icon: 'bi-shield-check', num: operativas, label: 'Operativas' },
    { color: 'amber', icon: 'bi-clock', num: activas, label: 'Activas' },
    { color: 'red', icon: 'bi-power', num: inactivas, label: 'Inactivas' },
  ];

  document.getElementById('kpisUnidades').innerHTML = kpis.map(k => `
    <div class="col-6 col-xl-3">
      <div class="kpi-dash kpi-${k.color}-dash">
        <i class="bi ${k.icon} kpi-icon-dash"></i>
        <p class="kpi-num-dash">${k.num}</p>
        <p class="kpi-label-dash">${k.label}</p>
      </div>
    </div>`).join('');
}

// ---------- Tabla ----------
function renderTablaUnidades() {
  const texto = document.getElementById('buscarUnidad').value.trim().toLowerCase();
  const estado = document.getElementById('filtroEstadoUnidad').value;
  const barrio = document.getElementById('filtroBarrioUnidad').value;

  const lista = UNIDADES.filter(u => {
    const coincideTexto = !texto || u.nombre.toLowerCase().includes(texto) || u.barrio.toLowerCase().includes(texto);
    const coincideEstado = !estado || u.estado === estado;
    const coincideBarrio = !barrio || u.barrio === barrio;
    return coincideTexto && coincideEstado && coincideBarrio;
  });

  const tbody = document.getElementById('tablaUnidades');
  const vacio = document.getElementById('unidadesVacio');

  if (lista.length === 0) {
    tbody.innerHTML = '';
    vacio.classList.remove('d-none');
  } else {
    vacio.classList.add('d-none');
    tbody.innerHTML = lista.map(u => {
      const est = ESTADOS_UNIDAD[u.estado] || { label: u.estado, badge: 'badge-dash' };
      const nPolicias = policiasDeUnidad(u.id);
      return `
      <tr>
        <td>
          <div class="celda-persona-dash">
            <div class="avatar-sm-dash" style="background:${colorAvatar(u.nombre)};"><i class="bi bi-car-front"></i></div>
            <div>
              <div class="celda-titulo-dash">${u.nombre}</div>
              <div class="celda-sub-dash">Unidad #${String(u.id).padStart(3, '0')}</div>
            </div>
          </div>
        </td>
        <td style="width:150px;">${u.barrio}</td>
        <td style="width:130px;"><span class="badge-dash ${est.badge}">${est.label}</span></td>
        <td style="width:110px;">${nPolicias}</td>
        <td style="width:150px;" class="celda-sub-dash">${u.lat.toFixed(4)}, ${u.lng.toFixed(4)}</td>
        <td style="width:110px;">
          <div class="tabla-acciones-dash">
            <button class="btn-icono-dash" title="Ver" onclick="verUnidad(${u.id})"><i class="bi bi-eye"></i></button>
            <button class="btn-icono-dash editar-dash" title="Editar" onclick="editarUnidad(${u.id})"><i class="bi bi-pencil"></i></button>
            <button class="btn-icono-dash borrar-dash" title="Eliminar" onclick="eliminarUnidad(${u.id})"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }
}

function refrescarUnidades() {
  renderKpisUnidades();
  renderTablaUnidades();
}

// ---------- Crear / editar ----------
document.getElementById('btnNuevaUnidad').addEventListener('click', () => {
  document.getElementById('formUnidad').reset();
  document.getElementById('unidadId').value = '';
  document.getElementById('modalUnidadTitulo').textContent = 'Nueva unidad';
  modalUnidad.show();
});

function editarUnidad(id) {
  const u = unidadPorId(id);
  if (!u) return;
  document.getElementById('unidadId').value = u.id;
  document.getElementById('unidadNombre').value = u.nombre;
  document.getElementById('unidadBarrio').value = u.barrio;
  document.getElementById('unidadEstado').value = u.estado;
  document.getElementById('unidadLat').value = u.lat;
  document.getElementById('unidadLng').value = u.lng;
  document.getElementById('modalUnidadTitulo').textContent = 'Editar unidad';
  modalUnidad.show();
}

document.getElementById('formUnidad').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('unidadId').value;
  const datos = {
    nombre: document.getElementById('unidadNombre').value.trim(),
    barrio: document.getElementById('unidadBarrio').value,
    estado: document.getElementById('unidadEstado').value,
    lat: parseFloat(document.getElementById('unidadLat').value),
    lng: parseFloat(document.getElementById('unidadLng').value),
  };

  if (id) {
    const u = unidadPorId(parseInt(id, 10));
    Object.assign(u, datos);
  } else {
    UNIDADES.push({ id: nextUnidadId++, ...datos });
  }

  guardarUnidades();
  modalUnidad.hide();
  refrescarUnidades();
});

// ---------- Ver ----------
function verUnidad(id) {
  const u = unidadPorId(id);
  if (!u) return;
  const est = ESTADOS_UNIDAD[u.estado] || { label: u.estado, badge: 'badge-dash' };
  document.getElementById('verUnidadAvatar').style.background = colorAvatar(u.nombre);
  document.getElementById('verUnidadNombre').textContent = u.nombre;
  document.getElementById('verUnidadEstado').className = `badge-dash ${est.badge}`;
  document.getElementById('verUnidadEstado').textContent = est.label;
  document.getElementById('verUnidadBarrio').textContent = u.barrio;
  document.getElementById('verUnidadCoords').textContent = `${u.lat.toFixed(4)}, ${u.lng.toFixed(4)}`;
  document.getElementById('verUnidadPolicias').textContent = policiasDeUnidad(u.id);
  modalVerUnidad.show();
}

// ---------- Eliminar ----------
function eliminarUnidad(id) {
  const u = unidadPorId(id);
  if (!u) return;
  if (!confirm(`¿Eliminar la unidad "${u.nombre}"? Esta acción no se puede deshacer.`)) return;
  UNIDADES = UNIDADES.filter(x => x.id !== id);
  delete POLICIAS_POR_UNIDAD[id];
  guardarUnidades();
  guardarPoliciasPorUnidad();
  refrescarUnidades();
}

// ---------- Eventos de filtros ----------
document.getElementById('buscarUnidad').addEventListener('input', renderTablaUnidades);
document.getElementById('filtroEstadoUnidad').addEventListener('change', renderTablaUnidades);
document.getElementById('filtroBarrioUnidad').addEventListener('change', renderTablaUnidades);

// ---------- Inicio ----------
poblarBarrios();
guardarUnidades();
guardarPoliciasPorUnidad();
refrescarUnidades();