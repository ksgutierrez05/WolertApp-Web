renderSidebarPolicia('tipoalertas');

const modalTipo = new bootstrap.Modal(document.getElementById('modalTipo'));

// ---------- Persistencia en localStorage ----------
// Solo se guardan los campos que el formulario realmente captura:
// nombre del tipo de alerta y prioridad (el id se conserva para poder
// editar/eliminar, pero no es un dato "de negocio" adicional).
const STORAGE_KEY_TIPOS = 'wolertapp_tipos_alerta';

function guardarTiposEnStorage() {
  try {
    const datos = TIPOS.map(t => ({ id: t.id, nombre: t.nombre, prioridad: t.prioridad }));
    localStorage.setItem(STORAGE_KEY_TIPOS, JSON.stringify(datos));
  } catch (err) {
    console.error('No se pudo guardar en localStorage:', err);
  }
}

function cargarTiposDesdeStorage() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY_TIPOS);
    if (!guardado) return null;
    const datos = JSON.parse(guardado);
    if (Array.isArray(datos) && datos.length) {
      return datos.map(d => ({ id: d.id, nombre: d.nombre, prioridad: d.prioridad }));
    }
  } catch (err) {
    console.error('No se pudo leer localStorage:', err);
  }
  return null;
}

// ---------- Datos ----------
// Simula lo que hoy trae TipoAlertaService.listar() desde MySQL.
// TipoAlerta: { id, nombre, prioridad } — prioridad: ALTA | MEDIA | BAJA
// Si ya hay datos guardados en localStorage (creados/editados por el
// usuario), se usan esos; si no, se parte de este set de ejemplo.

const PRIORIDADES = {
  ALTA: { label: 'Alta', badge: 'badge-red-dash', color: 'var(--color-danger)' },
  MEDIA: { label: 'Media', badge: 'badge-amber-dash', color: 'var(--color-amber)' },
  BAJA: { label: 'Baja', badge: 'badge-green-dash', color: 'var(--color-green)' },
};

const TIPOS_SEMILLA = [
  { id: 1, nombre: 'Robo / Asalto', prioridad: 'ALTA' },
  { id: 2, nombre: 'Incendio', prioridad: 'ALTA' },
  { id: 3, nombre: 'Accidente de tránsito', prioridad: 'ALTA' },
  { id: 4, nombre: 'Riña / Alteración del orden', prioridad: 'MEDIA' },
  { id: 5, nombre: 'Persona sospechosa', prioridad: 'MEDIA' },
  { id: 6, nombre: 'Emergencia médica', prioridad: 'ALTA' },
  { id: 7, nombre: 'Vandalismo', prioridad: 'MEDIA' },
  { id: 8, nombre: 'Animal en la vía pública', prioridad: 'BAJA' },
  { id: 9, nombre: 'Ruido excesivo', prioridad: 'BAJA' },
];

let TIPOS = cargarTiposDesdeStorage();
if (!TIPOS) {
  TIPOS = TIPOS_SEMILLA.map(t => ({ ...t }));
  guardarTiposEnStorage();
}

let nextTipoId = TIPOS.reduce((max, t) => Math.max(max, t.id), 0) + 1;

function tipoPorId(id) {
  return TIPOS.find(t => t.id === id);
}

// Misma lógica de categorización visual que ya usa la app (badgeAlerta
// en TiposAdminView): agrupa por nombre para mostrar un ícono acorde.
function categoriaDe(nombre) {
  const n = (nombre || '').toUpperCase();
  if (n.includes('ROB') || n.includes('ASALT')) return { texto: 'Delito', icon: 'bi-exclamation-octagon' };
  if (n.includes('SOSPECH')) return { texto: 'Vigilancia', icon: 'bi-eye' };
  if (n.includes('ANIMAL')) return { texto: 'Fauna', icon: 'bi-emoji-smile' };
  if (n.includes('INCEND')) return { texto: 'Incendio', icon: 'bi-fire' };
  if (n.includes('RUIDO') || n.includes('ALTER') || n.includes('RIÑA')) return { texto: 'Alteración', icon: 'bi-volume-up' };
  if (n.includes('MÉDI') || n.includes('MEDIC')) return { texto: 'Médica', icon: 'bi-heart-pulse' };
  if (n.includes('ACCID')) return { texto: 'Accidente', icon: 'bi-car-front' };
  if (n.includes('VANDAL')) return { texto: 'Vandalismo', icon: 'bi-hammer' };
  return { texto: 'General', icon: 'bi-bell' };
}

// Paleta de colores suaves (pastel) para diferenciar cada tipo a
// simple vista, independiente de su prioridad. Cada tipo conserva
// siempre el mismo color mientras no cambie de nombre.
const PALETA_SUAVE = [
  { bg: '#e8f0fb', fg: '#3d6fb4' }, // azul suave
  { bg: '#f3e8fb', fg: '#8452b0' }, // lila suave
  { bg: '#e3f8ec', fg: '#2f9e6b' }, // verde suave
  { bg: '#fdf0e3', fg: '#c07a2e' }, // durazno suave
  { bg: '#fce8ef', fg: '#c1548a' }, // rosa suave
  { bg: '#e6f6f6', fg: '#2f9494' }, // turquesa suave
  { bg: '#f6f2e2', fg: '#a68b2c' }, // arena suave
  { bg: '#ececfb', fg: '#6b63c9' }, // indigo suave
  { bg: '#eaf4e2', fg: '#6b9a3f' }, // oliva suave
  { bg: '#fbe9e6', fg: '#c06a53' }, // terracota suave
];

function colorSuaveTipo(t) {
  let hash = 0;
  const clave = `${t.id}-${t.nombre}`;
  for (let i = 0; i < clave.length; i++) hash = clave.charCodeAt(i) + ((hash << 5) - hash);
  return PALETA_SUAVE[Math.abs(hash) % PALETA_SUAVE.length];
}

// ---------- KPIs (tarjetas verdes) ----------
function renderKpisTipos() {
  const total = TIPOS.length;
  const alta = TIPOS.filter(t => t.prioridad === 'ALTA').length;
  const media = TIPOS.filter(t => t.prioridad === 'MEDIA').length;
  const baja = TIPOS.filter(t => t.prioridad === 'BAJA').length;

  const kpis = [
    { icon: 'bi-tags-fill', num: total, label: 'Tipos registrados' },
    { icon: 'bi-exclamation-triangle-fill', num: alta, label: 'Prioridad alta' },
    { icon: 'bi-clock-fill', num: media, label: 'Prioridad media' },
    { icon: 'bi-shield-fill-check', num: baja, label: 'Prioridad baja' },
  ];

  document.getElementById('kpisTipoAlertas').innerHTML = kpis.map(k => `
    <div class="col-6 col-xl-3">
      <div class="kpi-tipo-dash">
        <div class="kpi-icon-circle-dash"><i class="bi ${k.icon}"></i></div>
        <p class="kpi-num-tipo-dash">${k.num}</p>
        <p class="kpi-label-tipo-dash">${k.label}</p>
      </div>
    </div>`).join('');
}

// ---------- Tabla ----------
let filtroPrioridad = '';

function renderTablaTipos() {
  const texto = document.getElementById('buscarTipo').value.trim().toLowerCase();

  const lista = TIPOS
    .filter(t => !texto || t.nombre.toLowerCase().includes(texto))
    .filter(t => !filtroPrioridad || t.prioridad === filtroPrioridad)
    .sort((a, b) => {
      const orden = { ALTA: 0, MEDIA: 1, BAJA: 2 };
      return orden[a.prioridad] - orden[b.prioridad];
    });

  const tbody = document.getElementById('tablaTipos');
  const vacio = document.getElementById('tiposVacio');

  if (lista.length === 0) {
    tbody.innerHTML = '';
    vacio.classList.remove('d-none');
    return;
  }
  vacio.classList.add('d-none');

  tbody.innerHTML = lista.map(t => {
    const prio = PRIORIDADES[t.prioridad] || { label: t.prioridad, badge: 'badge-dash', color: 'var(--subtle)' };
    const cat = categoriaDe(t.nombre);
    const suave = colorSuaveTipo(t);
    return `
    <tr>
      <td>
        <div class="celda-persona-dash">
          <div class="avatar-sm-dash" style="background:${suave.bg};color:${suave.fg};"><i class="bi ${cat.icon}"></i></div>
          <div>
            <div class="celda-titulo-dash">${t.nombre}</div>
            <div class="celda-sub-dash">Tipo #${String(t.id).padStart(3, '0')}</div>
          </div>
        </div>
      </td>
      <td style="width:150px;">
        <span class="badge-dash ${prio.badge}">
          <span class="prioridad-barra-dash"><span class="prioridad-punto-dash" style="background:${prio.color};"></span>${prio.label}</span>
        </span>
      </td>
      <td style="width:160px;"><span class="categoria-chip-dash" style="background:${suave.bg};color:${suave.fg};"><i class="bi ${cat.icon}"></i>${cat.texto}</span></td>
      <td style="width:110px;">
        <div class="tabla-acciones-dash">
          <button class="btn-icono-dash editar-dash" title="Editar" onclick="editarTipo(${t.id})"><i class="bi bi-pencil"></i></button>
          <button class="btn-icono-dash borrar-dash" title="Eliminar" onclick="eliminarTipo(${t.id})"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function refrescarTipos() {
  renderKpisTipos();
  renderTablaTipos();
}

// ---------- Selector visual de prioridad (modal) ----------
function seleccionarPrioridad(valor) {
  document.getElementById('tipoPrioridad').value = valor;
  document.querySelectorAll('.prioridad-opcion-dash').forEach(op => {
    op.classList.toggle('seleccionada', op.dataset.valor === valor);
    op.querySelector('input').checked = op.dataset.valor === valor;
  });
}

document.getElementById('prioridadPicker').addEventListener('click', (e) => {
  const op = e.target.closest('.prioridad-opcion-dash');
  if (!op) return;
  seleccionarPrioridad(op.dataset.valor);
});

// ---------- Crear / editar ----------
document.getElementById('btnNuevoTipo').addEventListener('click', () => {
  document.getElementById('formTipo').reset();
  document.getElementById('tipoId').value = '';
  seleccionarPrioridad('');
  document.getElementById('modalTipoTitulo').textContent = 'Nuevo tipo de alerta';
  modalTipo.show();
});

function editarTipo(id) {
  const t = tipoPorId(id);
  if (!t) return;
  document.getElementById('tipoId').value = t.id;
  document.getElementById('tipoNombre').value = t.nombre;
  seleccionarPrioridad(t.prioridad);
  document.getElementById('modalTipoTitulo').textContent = 'Editar tipo de alerta';
  modalTipo.show();
}

document.getElementById('formTipo').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('tipoId').value;
  const nombre = document.getElementById('tipoNombre').value.trim();
  const prioridad = document.getElementById('tipoPrioridad').value;

  if (!prioridad) {
    alert('Selecciona la prioridad del tipo de alerta.');
    return;
  }

  if (id) {
    const t = tipoPorId(parseInt(id, 10));
    Object.assign(t, { nombre, prioridad });
  } else {
    TIPOS.push({ id: nextTipoId++, nombre, prioridad });
  }

  guardarTiposEnStorage();
  modalTipo.hide();
  refrescarTipos();
});

// ---------- Eliminar ----------
function eliminarTipo(id) {
  const t = tipoPorId(id);
  if (!t) return;
  if (!confirm(`¿Eliminar el tipo de alerta "${t.nombre}"? Esta acción no se puede deshacer.`)) return;
  TIPOS = TIPOS.filter(x => x.id !== id);
  guardarTiposEnStorage();
  refrescarTipos();
}

// ---------- Eventos de filtros ----------
document.getElementById('buscarTipo').addEventListener('input', renderTablaTipos);
document.getElementById('chipsPrioridad').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip-prioridad-dash');
  if (!btn) return;
  document.querySelectorAll('#chipsPrioridad .chip-prioridad-dash').forEach(c => c.classList.remove('activo'));
  btn.classList.add('activo');
  filtroPrioridad = btn.dataset.prioridad;
  renderTablaTipos();
});

// ---------- Inicio ----------
refrescarTipos();