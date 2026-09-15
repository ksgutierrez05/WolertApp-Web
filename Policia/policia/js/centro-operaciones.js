

const STORAGE_KEY = 'wolert_centro_operaciones';

const ICONOS_ALERTA = {
  'rina':        { icon: 'bi-people-fill',            color: 'alta' },
  'sospechoso':  { icon: 'bi-person-bounding-box',     color: 'media' },
  'robo':        { icon: 'bi-shield-exclamation',      color: 'alta' },
  'accidente':   { icon: 'bi-car-front-fill',          color: 'media' },
  'ruido':       { icon: 'bi-volume-up-fill',          color: 'baja' },
  'default':     { icon: 'bi-exclamation-circle-fill', color: 'media' }
};

const ESTADO_INICIAL = {
  kpis: {
    alertasAsignadas: 2,
    atencionActiva: 1,
    atendidasHoy: 4,
    companerosUnidad: 3
  },
  atencionActiva: {
    titulo: '🚔 Robo en establecimiento',
    estado: 'En camino',
    direccion: 'Carrera 15 # 8-42, Centro',
    hora: 'Asignada a las 14:32',
    origen: 'Reportado por ciudadano',
    distancia: '1.4 km · 5 min estimados'
  },
  alertas: [
    {
      id: 'a1', tipo: 'rina', titulo: 'Riña entre vecinos',
      desc: 'Altercado con posible agresión física en zona residencial.',
      direccion: 'Calle 9 # 4-21', tiempo: 'Hace 6 min', prioridad: 'alta'
    },
    {
      id: 'a2', tipo: 'sospechoso', titulo: 'Persona sospechosa',
      desc: 'Merodeando frente a conjunto residencial.',
      direccion: 'Av. Simón Bolívar # 12-10', tiempo: 'Hace 18 min', prioridad: 'media'
    }
  ],
  unidad: [
    { iniciales: 'LC', nombre: 'Patrullero Castro', estado: 'disponible', texto: 'Disponible' },
    { iniciales: 'MG', nombre: 'Patrullero Gómez',  estado: 'atencion',   texto: 'En atención' },
    { iniciales: 'AT', nombre: 'Patrullero Torres', estado: 'camino',     texto: 'En camino' }
  ],
  alarmas: [
    { icon: 'bi-megaphone-fill', texto: 'La Central cambió la prioridad de tu atención activa a <b>Alta</b>.', tiempo: 'Hace 4 min' },
    { icon: 'bi-exclamation-triangle-fill', texto: 'Nueva instrucción de la Central de Radio para tu unidad.', tiempo: 'Hace 22 min' }
  ]
};

function cargarEstado() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {
    console.warn('No se pudo leer el estado guardado, usando valores por defecto.', e);
  }
  return structuredClone(ESTADO_INICIAL);
}

function guardarEstado(estado) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch (e) {
    console.warn('No se pudo guardar el estado en localStorage.', e);
  }
}

let estado = cargarEstado();

function renderKPIs() {
  const nums = document.querySelectorAll('.kpi-num-dash');
  const valores = [
    estado.kpis.alertasAsignadas,
    estado.kpis.atencionActiva,
    estado.kpis.atendidasHoy,
    estado.kpis.companerosUnidad
  ];
  nums.forEach((el, i) => { if (valores[i] !== undefined) el.textContent = valores[i]; });
}

function renderAtencionActiva() {
  const a = estado.atencionActiva;
  const cont = document.querySelector('.co-active');
  if (!cont) return;

  if (!a) {
    cont.innerHTML = `
      <div class="co-active-empty text-center py-4">
        <i class="bi bi-check2-circle" style="font-size:2rem;"></i>
        <p class="mb-0 mt-2">No hay atenciones activas por ahora.</p>
      </div>`;
    return;
  }

  cont.querySelector('.co-active-title').textContent = a.titulo;
  cont.querySelector('.badge-dash').textContent = a.estado;
  const metas = cont.querySelectorAll('.co-active-meta span');
  if (metas[0]) metas[0].innerHTML = `<i class="bi bi-geo-alt-fill"></i> ${a.direccion}`;
  if (metas[1]) metas[1].innerHTML = `<i class="bi bi-clock-fill"></i> ${a.hora}`;
  if (metas[2]) metas[2].innerHTML = `<i class="bi bi-person-fill"></i> ${a.origen}`;
  const distancia = cont.querySelector('.co-route-info b');
  if (distancia) distancia.textContent = a.distancia;
}

function renderAlertas() {
  const cont = document.querySelector('.card-panel-dash.p-3.h-100');
  if (!cont) return;

  if (estado.alertas.length === 0) {
    cont.innerHTML = `
      <div class="text-center py-4">
        <i class="bi bi-bell-slash" style="font-size:1.8rem;"></i>
        <p class="mb-0 mt-2">Sin alertas nuevas por el momento.</p>
      </div>`;
    return;
  }

  cont.innerHTML = estado.alertas.map(al => {
    const icono = ICONOS_ALERTA[al.tipo] || ICONOS_ALERTA.default;
    return `
      <div class="co-alert-item" data-id="${al.id}">
        <span class="co-alert-icon co-alert-icon-${al.prioridad}">
          <i class="bi ${icono.icon}"></i>
        </span>
        <div class="co-alert-body">
          <p class="co-alert-title">${al.titulo}</p>
          <p class="co-alert-desc">${al.desc}</p>
          <div class="co-alert-foot">
            <span><i class="bi bi-geo-alt-fill"></i> ${al.direccion}</span>
            <span><i class="bi bi-clock-fill"></i> ${al.tiempo}</span>
          </div>
        </div>
        <div class="co-alert-actions">
          <button class="btn btn-cv-azul btn-sm btn-aceptar-alerta" data-id="${al.id}">Aceptar</button>
        </div>
      </div>`;
  }).join('');

  cont.querySelectorAll('.btn-aceptar-alerta').forEach(btn => {
    btn.addEventListener('click', () => aceptarAlerta(btn.dataset.id));
  });
}

function renderUnidad() {
  const items = document.querySelectorAll('.co-team-item');
  estado.unidad.forEach((m, i) => {
    const item = items[i];
    if (!item) return;
    item.querySelector('.co-team-avatar').textContent = m.iniciales;
    item.querySelector('.co-team-name').textContent = m.nombre;
    const dot = item.querySelector('.dot');
    dot.className = `dot dot-${m.estado}`;
    item.querySelector('.co-team-status').innerHTML =
      `<span class="dot dot-${m.estado}"></span> ${m.texto}`;
  });
}

function renderAlarmas() {
  const items = document.querySelectorAll('.co-alarma-item');
  estado.alarmas.forEach((al, i) => {
    const item = items[i];
    if (!item) return;
    item.querySelector('.co-alarma-icon').innerHTML = `<i class="bi ${al.icon}"></i>`;
    item.querySelector('.co-alarma-text').innerHTML = al.texto;
    item.querySelector('.co-alarma-time').textContent = al.tiempo;
  });
}

function aceptarAlerta(id) {
  const idx = estado.alertas.findIndex(a => a.id === id);
  if (idx === -1) return;

  estado.alertas.splice(idx, 1);
  estado.kpis.alertasAsignadas = Math.max(0, estado.kpis.alertasAsignadas - 1);
  estado.kpis.atendidasHoy += 1;

  guardarEstado(estado);
  renderKPIs();
  renderAlertas();
}

function renderTodo() {
  renderKPIs();
  renderAtencionActiva();
  renderAlertas();
  renderUnidad();
  renderAlarmas();
}

document.addEventListener('DOMContentLoaded', () => {
  renderSidebarPolicia('centrooperaciones');
  renderTodo();
});