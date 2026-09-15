
renderSidebarPolicia('notificaciones');

const STORAGE_KEY_NOT = 'wolert_notificaciones';

const NOTIFICACIONES_INICIALES = [
  { id: 'N-501', grupo: 'Hoy', texto: 'Tienes una nueva alerta de alta prioridad asignada.', hora: 'Hace 6 min', leida: false, tipo: 'alerta', prioridad: 'alta' },
  { id: 'N-500', grupo: 'Hoy', texto: 'La Central de Radio modificó la prioridad de la alerta AT-1042.', hora: 'Hace 25 min', leida: false, tipo: 'central', prioridad: 'normal' },
  { id: 'N-497', grupo: 'Hoy', texto: 'La atención AT-1039 fue actualizada por la Central.', hora: 'Hace 1 h', leida: true, tipo: 'central', prioridad: 'normal' },
  { id: 'N-495', grupo: 'Hoy', texto: 'Nueva instrucción de la Central: reforzar sector Parque Simón Bolívar.', hora: 'Hace 2 h', leida: true, tipo: 'instruccion', prioridad: 'normal' },
  { id: 'N-490', grupo: 'Ayer', texto: 'Nueva alerta asignada: Persona sospechosa.', hora: '6:40 p. m.', leida: true, tipo: 'alerta', prioridad: 'normal' },
];

const ICONOS_TIPO_NOT = {
  alerta: 'bi-exclamation-triangle-fill',
  central: 'bi-broadcast',
  instruccion: 'bi-megaphone-fill',
  default: 'bi-bell-fill',
};

function cargarNotificaciones() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY_NOT);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {
    console.warn('No se pudo leer Notificaciones desde localStorage, usando datos de ejemplo.', e);
  }
  return structuredClone(NOTIFICACIONES_INICIALES);
}

function guardarNotificaciones() {
  try {
    localStorage.setItem(STORAGE_KEY_NOT, JSON.stringify(notificaciones));
  } catch (e) {
    console.warn('No se pudo guardar Notificaciones en localStorage.', e);
  }
}

let notificaciones = cargarNotificaciones();
let filtroActualNot = 'TODAS';

function contarNoLeidas() {
  return notificaciones.filter(n => !n.leida).length;
}

function actualizarContadores() {
  const total = notificaciones.length;
  const noLeidas = contarNoLeidas();

  const badgeTodas = document.getElementById('badgeTodasNot');
  const badgeNoLeidas = document.getElementById('badgeNoLeidasNot');
  if (badgeTodas) badgeTodas.textContent = total;
  if (badgeNoLeidas) badgeNoLeidas.textContent = noLeidas;

  const btnMarcar = document.getElementById('btnMarcarTodasNot');
  if (btnMarcar) btnMarcar.disabled = noLeidas === 0;

  const iconDot = document.querySelector('.icon-dot-dash');
  if (iconDot) iconDot.style.display = noLeidas > 0 ? 'block' : 'none';
}

function renderListaNot() {
  const cont = document.getElementById('listaNotificaciones');
  const visibles = notificaciones.filter(n => filtroActualNot === 'TODAS' || !n.leida);

  actualizarContadores();

  if (visibles.length === 0) {
    cont.innerHTML = `
      <div class="vacio-not">
        <i class="bi bi-check2-circle"></i>
        <p>No tienes notificaciones sin leer.</p>
      </div>`;
    return;
  }

  let grupoAnterior = null;
  let html = '';

  visibles.forEach(n => {
    if (n.grupo !== grupoAnterior) {
      html += `<div class="grupo-fecha-not">${n.grupo}</div>`;
      grupoAnterior = n.grupo;
    }
    const icono = ICONOS_TIPO_NOT[n.tipo] || ICONOS_TIPO_NOT.default;
    const clasePrioridad = n.prioridad === 'alta' ? 'prioridad-alta' : '';

    html += `
      <div class="fila-not ${!n.leida ? 'no-leida-not' : ''} ${clasePrioridad}" data-id="${n.id}">
        <div class="icono-not"><i class="bi ${icono}"></i></div>
        <div class="cuerpo-not">
          <div>
            <p class="texto-not">${n.texto}</p>
            <p class="hora-not">${n.hora}</p>
          </div>
          <span class="punto-not"></span>
        </div>
      </div>
    `;
  });

  cont.innerHTML = html;

  cont.querySelectorAll('.fila-not').forEach(el => {
    el.addEventListener('click', () => {
      const n = notificaciones.find(x => x.id === el.dataset.id);
      if (n && !n.leida) {
        n.leida = true;
        guardarNotificaciones();
        el.style.opacity = '0.5';
        setTimeout(renderListaNot, 150);
      }
    });
  });
}

document.getElementById('filtrosNot').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip-filtro-not');
  if (!btn) return;
  document.querySelectorAll('.chip-filtro-not').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  filtroActualNot = btn.dataset.filtro;
  renderListaNot();
});

document.getElementById('btnMarcarTodasNot').addEventListener('click', () => {
  notificaciones.forEach(n => n.leida = true);
  guardarNotificaciones();
  renderListaNot();
});

renderListaNot();