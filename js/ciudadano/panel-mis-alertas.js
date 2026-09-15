

const MISALERTAS_STORAGE_KEY = 'wolertapp_misalertas_ciudadano';

const MISALERTAS_PRUEBA = [
  {
    id: 1,
    tipo: 'robo',
    titulo: 'Robo a transeúnte',
    descripcion: 'Dos personas en moto me arrebataron el celular cuando salía de la tienda.',
    direccion: 'Cra 12 # 8-40',
    barrio: 'Los Fundadores',
    comuna: 'Comuna 3',
    fecha: Date.now() - 1000 * 60 * 60 * 2,
    estado: 'activa',
    notas: 'La moto era negra, sin placa visible. Dos hombres, uno con chaqueta roja.',
  },
  {
    id: 2,
    tipo: 'sospechoso',
    titulo: 'Persona merodeando en la cuadra',
    descripcion: 'Un hombre estuvo parado frente a varias casas por más de una hora, tomando fotos.',
    direccion: 'Calle 9 # 11-18',
    barrio: 'Los Fundadores',
    comuna: 'Comuna 3',
    fecha: Date.now() - 1000 * 60 * 60 * 26,
    estado: 'en_atencion',
    notas: 'Vestía gorra azul y camiseta blanca. Se fue caminando hacia la Cra 13.',
  },
  {
    id: 3,
    tipo: 'disturbio',
    titulo: 'Riña frente al parque',
    descripcion: 'Varias personas discutiendo fuerte, subió el tono y hubo empujones.',
    direccion: 'Calle 9 con Cra 12',
    barrio: 'Los Fundadores',
    comuna: 'Comuna 3',
    fecha: Date.now() - 1000 * 60 * 60 * 72,
    estado: 'cerrada',
    notas: 'La policía llegó a los 15 minutos y dispersó al grupo.',
  },
];

const CONFIG_TIPO_MISALERTA = {
  robo: { icon: 'bi-shield-exclamation', badge: 'badge-red-dash', texto: 'Robo' },
  accidente: { icon: 'bi-car-front', badge: 'badge-amber-dash', texto: 'Accidente' },
  disturbio: { icon: 'bi-people-fill', badge: 'badge-blue-dash', texto: 'Disturbio' },
  incendio: { icon: 'bi-fire', badge: 'badge-red-dash', texto: 'Incendio' },
  sospechoso: { icon: 'bi-eye', badge: 'badge-blue-dash', texto: 'Sospechoso' },
};

const CONFIG_ESTADO_MISALERTA = {
  activa: { clase: 'wait-urgent-dash', texto: 'Activa' },
  en_atencion: { clase: 'wait-warn-dash', texto: 'En atención' },
  cerrada: { clase: 'badge-green-dash', texto: 'Cerrada' },
};

let filtroMisAlertasActual = 'todas';

// -------- Storage helpers --------
function cargarMisAlertas() {
  try {
    const raw = localStorage.getItem(MISALERTAS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MISALERTAS_STORAGE_KEY, JSON.stringify(MISALERTAS_PRUEBA));
      return MISALERTAS_PRUEBA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo mis alertas de localStorage:', e);
    return MISALERTAS_PRUEBA;
  }
}

// -------- Helpers de presentación --------
function tiempoRelativoMisAlertas(timestamp) {
  const diffMs = Date.now() - timestamp;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Ahora mismo';
  if (min < 60) return `Hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `Hace ${dias} d`;
}

function fechaCompleta(timestamp) {
  const f = new Date(timestamp);
  return f.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// -------- KPIs --------
function actualizarKpisMisAlertas(lista) {
  const total = lista.length;
  const activas = lista.filter(a => a.estado === 'activa' || a.estado === 'en_atencion').length;
  const cerradas = lista.filter(a => a.estado === 'cerrada').length;

  const elTotal = document.getElementById('kpiMisAlertasTotal');
  const elActivas = document.getElementById('kpiMisAlertasActivas');
  const elCerradas = document.getElementById('kpiMisAlertasCerradas');

  if (elTotal) elTotal.textContent = total;
  if (elActivas) elActivas.textContent = activas;
  if (elCerradas) elCerradas.textContent = cerradas;
}

// -------- Render --------
function renderMisAlertas() {
  const cont = document.getElementById('listaMisAlertas');
  if (!cont) return;

  const todas = cargarMisAlertas().sort((a, b) => b.fecha - a.fecha);
  actualizarKpisMisAlertas(todas);

  const filtradas = todas.filter(a => {
    if (filtroMisAlertasActual === 'todas') return true;
    if (filtroMisAlertasActual === 'activa') return a.estado === 'activa' || a.estado === 'en_atencion';
    if (filtroMisAlertasActual === 'cerrada') return a.estado === 'cerrada';
    return true;
  });

  if (filtradas.length === 0) {
    cont.innerHTML = `
      <div class="misalertas-empty-dash">
        <i class="bi bi-clipboard-x"></i>
        Aún no has reportado alertas en esta categoría.
      </div>
    `;
    return;
  }

  cont.innerHTML = filtradas.map(a => {
    const cfgTipo = CONFIG_TIPO_MISALERTA[a.tipo] || { icon: 'bi-exclamation-triangle', badge: 'badge-blue-dash', texto: 'Alerta' };
    const cfgEstado = CONFIG_ESTADO_MISALERTA[a.estado] || { clase: 'wait-warn-dash', texto: 'Pendiente' };

    return `
      <div class="mireporte-item-dash" data-id="${a.id}">
        <div class="mireporte-cabecera-dash">
          <span class="mireporte-icon-dash tipo-${a.tipo}"><i class="bi ${cfgTipo.icon}"></i></span>
          <div class="mireporte-body-dash">
            <div class="mireporte-top-row-dash">
              <span class="info-title-dash">${a.titulo}</span>
              <span class="badge-dash ${cfgTipo.badge}">${cfgTipo.texto}</span>
              <span class="wait-dash ${cfgEstado.clase}">${cfgEstado.texto}</span>
            </div>
            <p class="info-sub-dash mb-0">${a.descripcion}</p>
            <div class="mireporte-meta-dash">
              <span><i class="bi bi-geo-alt"></i> ${a.direccion} · ${a.barrio}</span>
            </div>
          </div>
          <span class="mireporte-time-dash">${tiempoRelativoMisAlertas(a.fecha)}</span>
          <i class="bi bi-chevron-down mireporte-chevron-dash"></i>
        </div>

        <div class="mireporte-detalle-dash">
          <div class="mireporte-detalle-inner-dash">
            <div class="detalle-fila-dash">
              <span class="detalle-label-dash">Tipo de alerta</span>
              <span class="detalle-valor-dash">${cfgTipo.texto}</span>
            </div>
            <div class="detalle-fila-dash">
              <span class="detalle-label-dash">Descripción</span>
              <span class="detalle-valor-dash">${a.descripcion}</span>
            </div>
            <div class="detalle-fila-dash">
              <span class="detalle-label-dash">Dirección</span>
              <span class="detalle-valor-dash">${a.direccion}</span>
            </div>
            <div class="detalle-fila-dash">
              <span class="detalle-label-dash">Barrio / Comuna</span>
              <span class="detalle-valor-dash">${a.barrio} · ${a.comuna}</span>
            </div>
            <div class="detalle-fila-dash">
              <span class="detalle-label-dash">Fecha del reporte</span>
              <span class="detalle-valor-dash">${fechaCompleta(a.fecha)}</span>
            </div>
            <div class="detalle-fila-dash">
              <span class="detalle-label-dash">Estado actual</span>
              <span class="detalle-valor-dash">${cfgEstado.texto}</span>
            </div>
            <div class="detalle-fila-dash">
              <span class="detalle-label-dash">Notas que agregué</span>
              <span class="detalle-valor-dash">${a.notas || 'Sin notas adicionales'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// -------- Eventos --------
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.misalertas-tab-dash');
  if (tab) {
    document.querySelectorAll('.misalertas-tab-dash').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    filtroMisAlertasActual = tab.dataset.filtro;
    renderMisAlertas();
    return;
  }

  const cabecera = e.target.closest('.mireporte-cabecera-dash');
  if (cabecera) {
    const item = cabecera.closest('.mireporte-item-dash');
    item.classList.toggle('abierto');
  }
});

// -------- Init --------
document.addEventListener('DOMContentLoaded', () => {
  renderSidebarCiudadano('misalertas'); // definido en sidebar.js
  renderMisAlertas();
});