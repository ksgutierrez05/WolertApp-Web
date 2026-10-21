/* ============================================================
   ALERTAS.JS
   Alertas reportadas por vecinos. El sidebar vive aparte en
   sidebar.js. Persistencia en localStorage.
   ============================================================ */

const ALERTAS_STORAGE_KEY = 'wolertapp_alertas_ciudadano';

// Ubicación del usuario actual (para calcular los KPIs "en mi comuna"
// y "en mi barrio"). En producción esto vendría del perfil del usuario.
const MI_BARRIO = 'Los Fundadores';
const MI_COMUNA = 'Comuna 3';

// -------- Datos de prueba (solo se usan si no hay nada guardado) --------
const ALERTAS_PRUEBA = [
  {
    id: 1,
    tipo: 'robo',
    titulo: 'Robo a transeúnte',
    descripcion: 'Dos personas en moto le arrebataron el celular a una vecina.',
    vecino: 'María González',
    barrio: 'Los Fundadores',
    comuna: 'Comuna 3',
    direccion: 'Cra 12 # 8-40',
    tiempo: Date.now() - 1000 * 60 * 12,
    estado: 'activa',
  },
  {
    id: 2,
    tipo: 'disturbio',
    titulo: 'Riña en la vía pública',
    descripcion: 'Discusión entre varias personas frente al parque principal.',
    vecino: 'Carlos Ramírez',
    barrio: 'Los Fundadores',
    comuna: 'Comuna 3',
    direccion: 'Calle 9 con Cra 12',
    tiempo: Date.now() - 1000 * 60 * 45,
    estado: 'en_atencion',
  },
  {
    id: 3,
    tipo: 'sospechoso',
    titulo: 'Persona merodeando',
    descripcion: 'Un hombre estuvo observando varias viviendas por más de una hora.',
    vecino: 'Luisa Fernanda Ortiz',
    barrio: 'San Joaquín',
    comuna: 'Comuna 3',
    direccion: 'Calle 9 # 11-18',
    tiempo: Date.now() - 1000 * 60 * 60 * 2,
    estado: 'activa',
  },
  {
    id: 4,
    tipo: 'accidente',
    titulo: 'Choque entre dos vehículos',
    descripcion: 'Accidente de tránsito sin heridos graves, tráfico congestionado.',
    vecino: 'Andrés Torres',
    barrio: 'El Prado',
    comuna: 'Comuna 5',
    direccion: 'Av. Principal con Cra 13',
    tiempo: Date.now() - 1000 * 60 * 60 * 5,
    estado: 'cerrada',
  },
  {
    id: 5,
    tipo: 'incendio',
    titulo: 'Conato de incendio',
    descripcion: 'Humo saliendo de un lote baldío, bomberos ya fueron notificados.',
    vecino: 'Diana Patricia Rojas',
    barrio: 'Los Fundadores',
    comuna: 'Comuna 3',
    direccion: 'Cra 13 # 7-05',
    tiempo: Date.now() - 1000 * 60 * 60 * 9,
    estado: 'en_atencion',
  },
  {
    id: 6,
    tipo: 'robo',
    titulo: 'Hurto a vivienda',
    descripcion: 'Reportan intento de ingreso forzado a una casa mientras los dueños no estaban.',
    vecino: 'Andrés Torres',
    barrio: 'San Joaquín',
    comuna: 'Comuna 3',
    direccion: 'Calle 9 # 11-24',
    tiempo: Date.now() - 1000 * 60 * 60 * 27,
    estado: 'cerrada',
  },
];

const CONFIG_TIPO_ALERTA = {
  robo: { icon: 'bi-shield-exclamation', badge: 'badge-red-dash', texto: 'Robo' },
  accidente: { icon: 'bi-car-front', badge: 'badge-amber-dash', texto: 'Accidente' },
  disturbio: { icon: 'bi-people-fill', badge: 'badge-blue-dash', texto: 'Disturbio' },
  incendio: { icon: 'bi-fire', badge: 'badge-red-dash', texto: 'Incendio' },
  sospechoso: { icon: 'bi-eye', badge: 'badge-blue-dash', texto: 'Sospechoso' },
};

const CONFIG_ESTADO_ALERTA = {
  activa: { clase: 'wait-urgent-dash', texto: 'Activa' },
  en_atencion: { clase: 'wait-warn-dash', texto: 'En atención' },
  cerrada: { clase: 'badge-green-dash', texto: 'Cerrada' },
};

let filtroAlertasActual = 'todas';

// -------- Storage helpers --------
function cargarAlertas() {
  try {
    const raw = localStorage.getItem(ALERTAS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ALERTAS_STORAGE_KEY, JSON.stringify(ALERTAS_PRUEBA));
      return ALERTAS_PRUEBA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo alertas de localStorage:', e);
    return ALERTAS_PRUEBA;
  }
}

// -------- Helpers de presentación --------
function tiempoRelativoAlerta(timestamp) {
  const diffMs = Date.now() - timestamp;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Ahora mismo';
  if (min < 60) return `Hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `Hace ${dias} d`;
}

// -------- KPIs --------
function actualizarKpisAlertas(lista) {
  const total = lista.length;
  const enComuna = lista.filter(a => a.comuna === MI_COMUNA).length;
  const enBarrio = lista.filter(a => a.barrio === MI_BARRIO).length;

  const elTotal = document.getElementById('kpiAlertasTotal');
  const elComuna = document.getElementById('kpiAlertasComuna');
  const elBarrio = document.getElementById('kpiAlertasBarrio');

  if (elTotal) elTotal.textContent = total;
  if (elComuna) elComuna.textContent = enComuna;
  if (elBarrio) elBarrio.textContent = enBarrio;

  const labelComuna = document.getElementById('kpiAlertasComunaLabel');
  const labelBarrio = document.getElementById('kpiAlertasBarrioLabel');
  if (labelComuna) labelComuna.textContent = `Alertas en ${MI_COMUNA}`;
  if (labelBarrio) labelBarrio.textContent = `Alertas en ${MI_BARRIO}`;
}

// -------- Render --------
function renderAlertas() {
  const cont = document.getElementById('listaAlertas');
  if (!cont) return;

  const todas = cargarAlertas().sort((a, b) => b.tiempo - a.tiempo);
  actualizarKpisAlertas(todas);

  const filtradas = todas.filter(a => {
    if (filtroAlertasActual === 'todas') return true;
    if (filtroAlertasActual === 'mi_barrio') return a.barrio === MI_BARRIO;
    if (filtroAlertasActual === 'mi_comuna') return a.comuna === MI_COMUNA;
    return true;
  });

  if (filtradas.length === 0) {
    cont.innerHTML = `
      <div class="alertas-empty-dash">
        <i class="bi bi-shield-check"></i>
        No hay alertas para mostrar.
      </div>
    `;
    return;
  }

  cont.innerHTML = filtradas.map(a => {
    const cfgTipo = CONFIG_TIPO_ALERTA[a.tipo] || { icon: 'bi-exclamation-triangle', badge: 'badge-blue-dash', texto: 'Alerta' };
    const cfgEstado = CONFIG_ESTADO_ALERTA[a.estado] || { clase: 'wait-warn-dash', texto: 'Pendiente' };

    return `
      <div class="alerta-item-dash">
        <span class="alerta-icon-dash tipo-${a.tipo}"><i class="bi ${cfgTipo.icon}"></i></span>
        <div class="alerta-body-dash">
          <div class="alerta-top-row-dash">
            <span class="info-title-dash">${a.titulo}</span>
            <span class="badge-dash ${cfgTipo.badge}">${cfgTipo.texto}</span>
            <span class="wait-dash ${cfgEstado.clase}">${cfgEstado.texto}</span>
          </div>
          <p class="info-sub-dash mb-0">${a.descripcion}</p>
          <div class="alerta-meta-dash">
            <span><i class="bi bi-person"></i> Reportado por ${a.vecino}</span>
            <span><i class="bi bi-geo-alt"></i> ${a.direccion} · ${a.barrio}</span>
          </div>
        </div>
        <span class="alerta-time-dash">${tiempoRelativoAlerta(a.tiempo)}</span>
      </div>
    `;
  }).join('');
}

// -------- Eventos --------
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.alertas-tab-dash');
  if (tab) {
    document.querySelectorAll('.alertas-tab-dash').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    filtroAlertasActual = tab.dataset.filtro;
    renderAlertas();
  }
});

// -------- Init --------
document.addEventListener('DOMContentLoaded', () => {
  renderSidebarCiudadano('alertas'); // definido en sidebar.js
  renderAlertas();
});