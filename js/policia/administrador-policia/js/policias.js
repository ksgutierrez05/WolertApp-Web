renderSidebarPolicia('policias');


// ---------- Claves de localStorage ----------
const LS_KEY_UNIDADES = 'unidadesPoliciales';    
const LS_KEY_POLICIAS = 'policiasPoliciales';
const LS_KEY_NEXT_POLICIA_ID = 'policiasPolicialesNextId';


const UNIDADES_DEFECTO = [
  { id: 1, nombre: 'Patrulla 101' },
  { id: 2, nombre: 'CAI La Nevada' },
  { id: 3, nombre: 'Moto 07' },
  { id: 4, nombre: 'Patrulla 205' },
  { id: 5, nombre: 'CAI Sicarare' },
  { id: 6, nombre: 'Moto 12' },
];

function cargarUnidades() {
  try {
    const guardado = localStorage.getItem(LS_KEY_UNIDADES);
    if (guardado) {
      const lista = JSON.parse(guardado);
      return lista.map(u => ({ id: u.id, nombre: u.nombre }));
    }
  } catch (e) {
    console.warn('No se pudo leer unidades desde localStorage:', e);
  }
  return UNIDADES_DEFECTO.map(u => ({ ...u }));
}

const UNIDADES = cargarUnidades();

// EstadoPolicia: DISPONIBLE | EN_SERVICIO | OCUPADO | FUERA_DE_SERVICIO
const ESTADOS_POLICIA = {
  DISPONIBLE: { label: 'Disponible', badge: 'badge-green-dash' },
  EN_SERVICIO: { label: 'En servicio', badge: 'badge-blue-dash' },
  OCUPADO: { label: 'Ocupado', badge: 'badge-amber-dash' },
  FUERA_DE_SERVICIO: { label: 'Fuera de servicio', badge: 'badge-red-dash' },
};

const POLICIAS_DEFECTO = [
  { id: 1, primerNombre: 'Sofía', segundoNombre: '', primerApellido: 'Gómez', segundoApellido: 'Ruiz', identificacion: '1065432101', placa: 'P-1042', rango: 'Comandante', unidadId: 1, estado: 'EN_SERVICIO', telefono: '3001234567', correo: 'sofia.gomez@wolertapp.co', username: 'sgomez' },
  { id: 2, primerNombre: 'Carlos', segundoNombre: 'Andrés', primerApellido: 'Pérez', segundoApellido: 'León', identificacion: '1065432102', placa: 'P-1043', rango: 'Subintendente', unidadId: 2, estado: 'DISPONIBLE', telefono: '3007654321', correo: 'carlos.perez@wolertapp.co', username: 'cperez' },
  { id: 3, primerNombre: 'Laura', segundoNombre: '', primerApellido: 'Martínez', segundoApellido: 'Díaz', identificacion: '1065432103', placa: 'P-1044', rango: 'Patrullero', unidadId: 3, estado: 'OCUPADO', telefono: '3009876543', correo: 'laura.martinez@wolertapp.co', username: 'lmartinez' },
  { id: 4, primerNombre: 'Jorge', segundoNombre: 'Luis', primerApellido: 'Rangel', segundoApellido: 'Ospino', identificacion: '1065432104', placa: 'P-1045', rango: 'Patrullero', unidadId: 4, estado: 'DISPONIBLE', telefono: '3012223344', correo: 'jorge.rangel@wolertapp.co', username: 'jrangel' },
  { id: 5, primerNombre: 'Daniela', segundoNombre: '', primerApellido: 'Suárez', segundoApellido: 'Peña', identificacion: '1065432105', placa: 'P-1046', rango: 'Intendente', unidadId: 2, estado: 'EN_SERVICIO', telefono: '3015556677', correo: 'daniela.suarez@wolertapp.co', username: 'dsuarez' },
  { id: 6, primerNombre: 'Miguel', segundoNombre: 'Ángel', primerApellido: 'Torres', segundoApellido: 'Cuello', identificacion: '1065432106', placa: 'P-1047', rango: 'Patrullero', unidadId: 6, estado: 'FUERA_DE_SERVICIO', telefono: '3018889900', correo: 'miguel.torres@wolertapp.co', username: 'mtorres' },
  { id: 7, primerNombre: 'Valentina', segundoNombre: '', primerApellido: 'Cotes', segundoApellido: 'Iguarán', identificacion: '1065432107', placa: 'P-1048', rango: 'Subintendente', unidadId: 5, estado: 'DISPONIBLE', telefono: '3021112233', correo: 'valentina.cotes@wolertapp.co', username: 'vcotes' },
];

function cargarPolicias() {
  try {
    const guardado = localStorage.getItem(LS_KEY_POLICIAS);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {
    console.warn('No se pudo leer policías desde localStorage:', e);
  }
  return POLICIAS_DEFECTO.map(p => ({ ...p }));
}

function cargarNextPoliciaId() {
  try {
    const guardado = localStorage.getItem(LS_KEY_NEXT_POLICIA_ID);
    if (guardado) return parseInt(guardado, 10);
  } catch (e) {
    console.warn('No se pudo leer el siguiente id de policía desde localStorage:', e);
  }
  return POLICIAS.length + 1;
}

let POLICIAS = cargarPolicias();
let nextPoliciaId = cargarNextPoliciaId();

// ---------- Persistencia ----------
function guardarPolicias() {
  try {
    localStorage.setItem(LS_KEY_POLICIAS, JSON.stringify(POLICIAS));
    localStorage.setItem(LS_KEY_NEXT_POLICIA_ID, String(nextPoliciaId));
  } catch (e) {
    console.warn('No se pudo guardar policías en localStorage:', e);
  }
}

function unidadPorId(id) {
  return UNIDADES.find(u => u.id === id);
}

function nombreCompletoPolicia(p) {
  return [p.primerNombre, p.segundoNombre, p.primerApellido, p.segundoApellido].filter(Boolean).join(' ');
}

function iniciales(nombre) {
  const partes = (nombre || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  return partes.length === 1
    ? partes[0].slice(0, 1).toUpperCase()
    : (partes[0].slice(0, 1) + partes[1].slice(0, 1)).toUpperCase();
}

const COLORES_AVATAR = ['#1c781e', '#154d8c', '#a91824', '#c9821c', '#5b3fa0', '#0a8f72'];
function colorAvatar(texto) {
  let hash = 0;
  for (let i = 0; i < (texto || '').length; i++) hash = texto.charCodeAt(i) + ((hash << 5) - hash);
  return COLORES_AVATAR[Math.abs(hash) % COLORES_AVATAR.length];
}

const modalPolicia = new bootstrap.Modal(document.getElementById('modalPolicia'));
const modalVerPolicia = new bootstrap.Modal(document.getElementById('modalVerPolicia'));

// ---------- Poblar select de unidades ----------
function poblarUnidadesSelect() {
  const selectForm = document.getElementById('policiaUnidad');
  const selectFiltro = document.getElementById('filtroUnidadPolicia');
  UNIDADES.forEach(u => {
    selectForm.insertAdjacentHTML('beforeend', `<option value="${u.id}">${u.nombre}</option>`);
    selectFiltro.insertAdjacentHTML('beforeend', `<option value="${u.id}">${u.nombre}</option>`);
  });
}

// ---------- KPIs ----------
function renderKpisPolicias() {
  const total = POLICIAS.length;
  const disponibles = POLICIAS.filter(p => p.estado === 'DISPONIBLE').length;
  const enServicio = POLICIAS.filter(p => p.estado === 'EN_SERVICIO').length;
  const ocupados = POLICIAS.filter(p => p.estado === 'OCUPADO').length;

  const kpis = [
    { color: 'blue', icon: 'bi-people', num: total, label: 'Total policías' },
    { color: 'green', icon: 'bi-person-check', num: disponibles, label: 'Disponibles' },
    { color: 'amber', icon: 'bi-shield-check', num: enServicio, label: 'En servicio' },
    { color: 'red', icon: 'bi-person-exclamation', num: ocupados, label: 'Ocupados' },
  ];

  document.getElementById('kpisPolicias').innerHTML = kpis.map(k => `
    <div class="col-6 col-xl-3">
      <div class="kpi-dash kpi-${k.color}-dash">
        <i class="bi ${k.icon} kpi-icon-dash"></i>
        <p class="kpi-num-dash">${k.num}</p>
        <p class="kpi-label-dash">${k.label}</p>
      </div>
    </div>`).join('');
}

// ---------- Tabla ----------
function renderTablaPolicias() {
  const texto = document.getElementById('buscarPolicia').value.trim().toLowerCase();
  const estado = document.getElementById('filtroEstadoPolicia').value;
  const unidadId = document.getElementById('filtroUnidadPolicia').value;

  const lista = POLICIAS.filter(p => {
    const nombre = nombreCompletoPolicia(p).toLowerCase();
    const coincideTexto = !texto || nombre.includes(texto) || p.placa.toLowerCase().includes(texto) || p.rango.toLowerCase().includes(texto);
    const coincideEstado = !estado || p.estado === estado;
    const coincideUnidad = !unidadId || p.unidadId === parseInt(unidadId, 10);
    return coincideTexto && coincideEstado && coincideUnidad;
  });

  const tbody = document.getElementById('tablaPolicias');
  const vacio = document.getElementById('policiasVacio');

  if (lista.length === 0) {
    tbody.innerHTML = '';
    vacio.classList.remove('d-none');
  } else {
    vacio.classList.add('d-none');
    tbody.innerHTML = lista.map(p => {
      const est = ESTADOS_POLICIA[p.estado] || { label: p.estado, badge: 'badge-dash' };
      const nombre = nombreCompletoPolicia(p);
      const unidad = unidadPorId(p.unidadId);
      return `
      <tr>
        <td>
          <div class="celda-persona-dash">
            <div class="avatar-sm-dash" style="background:${colorAvatar(nombre)};">${iniciales(nombre)}</div>
            <div>
              <div class="celda-titulo-dash">${nombre}</div>
              <div class="celda-sub-dash">${p.identificacion}</div>
            </div>
          </div>
        </td>
        <td style="width:110px;">${p.placa}</td>
        <td style="width:130px;">${p.rango}</td>
        <td style="width:150px;">${unidad ? unidad.nombre : '—'}</td>
        <td style="width:150px;"><span class="badge-dash ${est.badge}">${est.label}</span></td>
        <td style="width:110px;">
          <div class="tabla-acciones-dash">
            <button class="btn-icono-dash" title="Ver" onclick="verPolicia(${p.id})"><i class="bi bi-eye"></i></button>
            <button class="btn-icono-dash editar-dash" title="Editar" onclick="editarPolicia(${p.id})"><i class="bi bi-pencil"></i></button>
            <button class="btn-icono-dash borrar-dash" title="Eliminar" onclick="eliminarPolicia(${p.id})"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }
}

function refrescarPolicias() {
  renderKpisPolicias();
  renderTablaPolicias();
}

function policiaPorId(id) {
  return POLICIAS.find(p => p.id === id);
}

// ---------- Crear / editar ----------
document.getElementById('btnNuevoPolicia').addEventListener('click', () => {
  document.getElementById('formPolicia').reset();
  document.getElementById('policiaId').value = '';
  document.getElementById('modalPoliciaTitulo').textContent = 'Nuevo policía';
  document.getElementById('policiaPassword').required = true;
  document.getElementById('passwordHint').textContent = '*';
  modalPolicia.show();
});

function editarPolicia(id) {
  const p = policiaPorId(id);
  if (!p) return;
  document.getElementById('policiaId').value = p.id;
  document.getElementById('policiaCedula').value = p.identificacion;
  document.getElementById('policiaPlaca').value = p.placa;
  document.getElementById('policiaNombre1').value = p.primerNombre;
  document.getElementById('policiaNombre2').value = p.segundoNombre || '';
  document.getElementById('policiaApellido1').value = p.primerApellido;
  document.getElementById('policiaApellido2').value = p.segundoApellido || '';
  document.getElementById('policiaRango').value = p.rango;
  document.getElementById('policiaUnidad').value = p.unidadId;
  document.getElementById('policiaEstado').value = p.estado;
  document.getElementById('policiaTelefono').value = p.telefono || '';
  document.getElementById('policiaCorreo').value = p.correo || '';
  document.getElementById('policiaUsername').value = p.username;
  document.getElementById('policiaPassword').value = '';
  document.getElementById('policiaPassword').required = false;
  document.getElementById('passwordHint').textContent = '(dejar en blanco para no cambiarla)';
  document.getElementById('modalPoliciaTitulo').textContent = 'Editar policía';
  modalPolicia.show();
}

document.getElementById('formPolicia').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('policiaId').value;
  const datos = {
    identificacion: document.getElementById('policiaCedula').value.trim(),
    placa: document.getElementById('policiaPlaca').value.trim(),
    primerNombre: document.getElementById('policiaNombre1').value.trim(),
    segundoNombre: document.getElementById('policiaNombre2').value.trim(),
    primerApellido: document.getElementById('policiaApellido1').value.trim(),
    segundoApellido: document.getElementById('policiaApellido2').value.trim(),
    rango: document.getElementById('policiaRango').value,
    unidadId: parseInt(document.getElementById('policiaUnidad').value, 10),
    estado: document.getElementById('policiaEstado').value,
    telefono: document.getElementById('policiaTelefono').value.trim(),
    correo: document.getElementById('policiaCorreo').value.trim(),
    username: document.getElementById('policiaUsername').value.trim(),
  };

  if (id) {
    const p = policiaPorId(parseInt(id, 10));
    Object.assign(p, datos);
  } else {
    POLICIAS.push({ id: nextPoliciaId++, ...datos });
  }

  guardarPolicias();
  modalPolicia.hide();
  refrescarPolicias();
});

// ---------- Ver ----------
function verPolicia(id) {
  const p = policiaPorId(id);
  if (!p) return;
  const nombre = nombreCompletoPolicia(p);
  const est = ESTADOS_POLICIA[p.estado] || { label: p.estado, badge: 'badge-dash' };
  const unidad = unidadPorId(p.unidadId);
  document.getElementById('verPoliciaAvatar').style.background = colorAvatar(nombre);
  document.getElementById('verPoliciaAvatar').textContent = iniciales(nombre);
  document.getElementById('verPoliciaNombre').textContent = nombre;
  document.getElementById('verPoliciaEstado').className = `badge-dash ${est.badge}`;
  document.getElementById('verPoliciaEstado').textContent = est.label;
  document.getElementById('verPoliciaCedula').textContent = p.identificacion;
  document.getElementById('verPoliciaPlaca').textContent = p.placa;
  document.getElementById('verPoliciaRango').textContent = p.rango;
  document.getElementById('verPoliciaUnidad').textContent = unidad ? unidad.nombre : '—';
  document.getElementById('verPoliciaTelefono').textContent = p.telefono || '—';
  document.getElementById('verPoliciaCorreo').textContent = p.correo || '—';
  modalVerPolicia.show();
}

// ---------- Eliminar ----------
function eliminarPolicia(id) {
  const p = policiaPorId(id);
  if (!p) return;
  if (!confirm(`¿Eliminar a "${nombreCompletoPolicia(p)}"? Esta acción no se puede deshacer.`)) return;
  POLICIAS = POLICIAS.filter(x => x.id !== id);
  guardarPolicias();
  refrescarPolicias();
}

// ---------- Eventos de filtros ----------
document.getElementById('buscarPolicia').addEventListener('input', renderTablaPolicias);
document.getElementById('filtroEstadoPolicia').addEventListener('change', renderTablaPolicias);
document.getElementById('filtroUnidadPolicia').addEventListener('change', renderTablaPolicias);

// ---------- Inicio ----------
poblarUnidadesSelect();
guardarPolicias();
refrescarPolicias();