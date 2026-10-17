// ==========================================================
// alarmas.js
// CRUD de alarmas comunitarias usando localStorage como
// almacenamiento local (mientras no hay backend conectado).
// Misma forma de datos que el modelo Alarma.java:
// (id_alarma, nombre, barrio, latitud, longitud, radio_cobertura, estado)
// ==========================================================

const STORAGE_KEY = 'wolertapp_alarmas';

// Datos semilla, solo se usan la primera vez (si localStorage está vacío)
const alarmasSemilla = [
  { id: 1, nombre: "Alarma La Nevada 1", barrio: "La Nevada",     lat: 10.4631, lng: -73.2532, radio: 150, estado: "ACTIVA" },
  { id: 2, nombre: "Alarma Cañaguate",   barrio: "Cañaguate",     lat: 10.4550, lng: -73.2461, radio: 200, estado: "INACTIVA" },
  { id: 3, nombre: "Alarma Almendros",   barrio: "Los Almendros", lat: 10.4702, lng: -73.2598, radio: 120, estado: "EN_MANTENIMIENTO" },
  { id: 4, nombre: "Alarma Sicarare",    barrio: "Sicarare",      lat: 10.4489, lng: -73.2705, radio: 180, estado: "ACTIVA" },
  { id: 5, nombre: "Alarma Garupal",     barrio: "Garupal",       lat: 10.4675, lng: -73.2390, radio: 160, estado: "INACTIVA" },
];

const badgeClaseEstado = {
  ACTIVA: "badge-green-dash",
  INACTIVA: "badge-muted-dash",
  EN_MANTENIMIENTO: "badge-amber-dash",
};

const badgeLabelEstado = {
  ACTIVA: "Activa",
  INACTIVA: "Inactiva",
  EN_MANTENIMIENTO: "En mantenimiento",
};

let alarmas = [];
let filtroActual = 'todas';
let busquedaActual = '';

// ---------- Persistencia (localStorage) ----------

function cargarAlarmas() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) {
      alarmas = JSON.parse(guardado);
    } else {
      alarmas = [...alarmasSemilla];
      guardarAlarmas();
    }
  } catch (err) {
    console.error('Error leyendo alarmas de localStorage:', err);
    alarmas = [...alarmasSemilla];
  }
}

function guardarAlarmas() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarmas));
  } catch (err) {
    console.error('Error guardando alarmas en localStorage:', err);
  }
}

function siguienteId() {
  return alarmas.length ? Math.max(...alarmas.map(a => a.id)) + 1 : 1;
}

// ---------- Render ----------

function obtenerListaFiltrada() {
  let lista = filtroActual === 'todas'
    ? alarmas
    : alarmas.filter(a => a.estado === filtroActual);

  if (busquedaActual) {
    lista = lista.filter(a =>
      a.nombre.toLowerCase().includes(busquedaActual) ||
      a.barrio.toLowerCase().includes(busquedaActual)
    );
  }
  return lista;
}

function pintarAlarmas() {
  const lista = obtenerListaFiltrada();
  const tbody = document.getElementById('filaAlarmas');
  const mensajeVacio = document.getElementById('mensajeVacio');

  if (!lista.length) {
    tbody.innerHTML = '';
    mensajeVacio.classList.remove('d-none');
    return;
  }
  mensajeVacio.classList.add('d-none');

  tbody.innerHTML = lista.map(a => `
    <tr>
      <td><span class="nombre-alarma-dash">${escapeHtml(a.nombre)}</span></td>
      <td>${escapeHtml(a.barrio)}</td>
      <td><span class="badge-dash ${badgeClaseEstado[a.estado]}">${badgeLabelEstado[a.estado]}</span></td>
      <td>${a.radio}</td>
      <td><span class="coordenadas-dash">${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}</span></td>
      <td class="text-end">
        <div class="acciones-alarma-dash justify-content-end">
          <button class="btn btn-icon-dash btn-ver-dash" title="Ver" data-id="${a.id}"><i class="bi bi-eye"></i></button>
          <button class="btn btn-icon-dash btn-editar-dash" title="Editar" data-id="${a.id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-icon-dash btn-eliminar-dash" title="Eliminar" data-id="${a.id}"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function actualizarKpis() {
  document.getElementById('kpiTotalAlarmas').textContent = alarmas.length;
  document.getElementById('kpiActivas').textContent = alarmas.filter(a => a.estado === 'ACTIVA').length;
  document.getElementById('kpiInactivas').textContent = alarmas.filter(a => a.estado === 'INACTIVA').length;
  document.getElementById('kpiMantenimiento').textContent = alarmas.filter(a => a.estado === 'EN_MANTENIMIENTO').length;

  document.getElementById('chipTodas').textContent = alarmas.length;
  document.getElementById('chipActivas').textContent = alarmas.filter(a => a.estado === 'ACTIVA').length;
  document.getElementById('chipInactivas').textContent = alarmas.filter(a => a.estado === 'INACTIVA').length;
  document.getElementById('chipMantenimiento').textContent = alarmas.filter(a => a.estado === 'EN_MANTENIMIENTO').length;
}

function refrescarVista() {
  actualizarKpis();
  pintarAlarmas();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Modal: crear / editar ----------

const modalFormEl = document.getElementById('modalFormAlarma');
const modalForm = new bootstrap.Modal(modalFormEl);
const formAlarma = document.getElementById('formAlarma');

function abrirFormularioNuevo() {
  formAlarma.reset();
  document.getElementById('alarmaId').value = '';
  document.getElementById('modalFormTitulo').textContent = 'Nueva alarma';
  document.getElementById('alarmaEstado').value = 'ACTIVA';
  modalForm.show();
}

function abrirFormularioEditar(id) {
  const alarma = alarmas.find(a => a.id === id);
  if (!alarma) return;

  document.getElementById('alarmaId').value = alarma.id;
  document.getElementById('alarmaNombre').value = alarma.nombre;
  document.getElementById('alarmaBarrio').value = alarma.barrio;
  document.getElementById('alarmaLat').value = alarma.lat;
  document.getElementById('alarmaLng').value = alarma.lng;
  document.getElementById('alarmaRadio').value = alarma.radio;
  document.getElementById('alarmaEstado').value = alarma.estado;
  document.getElementById('modalFormTitulo').textContent = 'Editar alarma';
  modalForm.show();
}

formAlarma.addEventListener('submit', (e) => {
  e.preventDefault();

  const id = document.getElementById('alarmaId').value;
  const datos = {
    nombre: document.getElementById('alarmaNombre').value.trim(),
    barrio: document.getElementById('alarmaBarrio').value.trim(),
    lat: parseFloat(document.getElementById('alarmaLat').value),
    lng: parseFloat(document.getElementById('alarmaLng').value),
    radio: parseInt(document.getElementById('alarmaRadio').value, 10),
    estado: document.getElementById('alarmaEstado').value,
  };

  if (!datos.nombre || !datos.barrio || isNaN(datos.lat) || isNaN(datos.lng) || isNaN(datos.radio)) {
    return; // el required de los inputs ya cubre la mayoría de casos
  }

  if (id) {
    // Editar
    const idx = alarmas.findIndex(a => a.id === parseInt(id, 10));
    if (idx !== -1) {
      alarmas[idx] = { ...alarmas[idx], ...datos };
    }
  } else {
    // Crear
    alarmas.push({ id: siguienteId(), ...datos });
  }

  guardarAlarmas();
  refrescarVista();
  modalForm.hide();
});

// ---------- Modal: ver detalle ----------

const modalVerEl = document.getElementById('modalVerAlarma');
const modalVer = new bootstrap.Modal(modalVerEl);

function abrirVerAlarma(id) {
  const a = alarmas.find(x => x.id === id);
  if (!a) return;

  document.getElementById('verAlarmaContenido').innerHTML = `
    <p class="mb-2"><strong>Nombre:</strong> ${escapeHtml(a.nombre)}</p>
    <p class="mb-2"><strong>Barrio:</strong> ${escapeHtml(a.barrio)}</p>
    <p class="mb-2"><strong>Estado:</strong> <span class="badge-dash ${badgeClaseEstado[a.estado]}">${badgeLabelEstado[a.estado]}</span></p>
    <p class="mb-2"><strong>Radio de cobertura:</strong> ${a.radio} m</p>
    <p class="mb-0"><strong>Coordenadas:</strong> ${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}</p>
  `;
  modalVer.show();
}

// ---------- Eliminar ----------

function eliminarAlarma(id) {
  const alarma = alarmas.find(a => a.id === id);
  if (!alarma) return;

  const confirmado = confirm(`¿Eliminar la alarma "${alarma.nombre}"? Esta acción no se puede deshacer.`);
  if (!confirmado) return;

  alarmas = alarmas.filter(a => a.id !== id);
  guardarAlarmas();
  refrescarVista();
}

// ---------- Eventos ----------

document.getElementById('btnNuevaAlarma').addEventListener('click', abrirFormularioNuevo);

document.getElementById('filaAlarmas').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  const id = parseInt(btn.dataset.id, 10);

  if (btn.classList.contains('btn-ver-dash')) abrirVerAlarma(id);
  else if (btn.classList.contains('btn-editar-dash')) abrirFormularioEditar(id);
  else if (btn.classList.contains('btn-eliminar-dash')) eliminarAlarma(id);
});

document.getElementById('filtrosAlarmas').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip-filtro-dash');
  if (!chip) return;
  document.querySelectorAll('.chip-filtro-dash').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  filtroActual = chip.dataset.filtro;
  pintarAlarmas();
});

document.getElementById('buscarAlarma').addEventListener('input', (e) => {
  busquedaActual = e.target.value.trim().toLowerCase();
  pintarAlarmas();
});

// ---------- Arranque ----------

cargarAlarmas();
refrescarVista();