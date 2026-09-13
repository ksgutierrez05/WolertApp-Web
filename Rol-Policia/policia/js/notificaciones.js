// js/notificaciones.js
// Lógica de "Notificaciones" del rol Patrullero.
// Distinto de Alarmas: aquí van comunicaciones informativas, no urgencias.

renderSidebarPolicia('notificaciones');

let notificaciones = [
  { id: 'N-501', grupo: 'Hoy', texto: 'Tienes una nueva alerta de alta prioridad asignada.', hora: 'Hace 6 min', leida: false },
  { id: 'N-500', grupo: 'Hoy', texto: 'La Central de Radio modificó la prioridad de la alerta AT-1042.', hora: 'Hace 25 min', leida: false },
  { id: 'N-497', grupo: 'Hoy', texto: 'La atención AT-1039 fue actualizada por la Central.', hora: 'Hace 1 h', leida: true },
  { id: 'N-495', grupo: 'Hoy', texto: 'Nueva instrucción de la Central: reforzar sector Parque Simón Bolívar.', hora: 'Hace 2 h', leida: true },
  { id: 'N-490', grupo: 'Ayer', texto: 'Nueva alerta asignada: Persona sospechosa.', hora: '6:40 p. m.', leida: true },
];

let filtroActualNot = 'TODAS';

function renderListaNot() {
  const cont = document.getElementById('listaNotificaciones');
  const visibles = notificaciones.filter(n => filtroActualNot === 'TODAS' || !n.leida);

  if (visibles.length === 0) {
    cont.innerHTML = `<p style="font-size:12.5px;color:var(--subtle);text-align:center;padding:24px 0;">No tienes notificaciones sin leer.</p>`;
    return;
  }

  let grupoAnterior = null;
  let html = '';

  visibles.forEach(n => {
    if (n.grupo !== grupoAnterior) {
      html += `<div class="grupo-fecha-not">${n.grupo}</div>`;
      grupoAnterior = n.grupo;
    }
    html += `
      <div class="fila-not ${!n.leida ? 'no-leida-not' : ''}" data-id="${n.id}">
        <span class="punto-not"></span>
        <div class="cuerpo-not">
          <p class="texto-not">${n.texto}</p>
          <p class="hora-not">${n.hora}</p>
        </div>
      </div>
    `;
  });

  cont.innerHTML = html;

  cont.querySelectorAll('.fila-not').forEach(el => {
    el.addEventListener('click', () => {
      const n = notificaciones.find(x => x.id === el.dataset.id);
      if (n) n.leida = true;
      renderListaNot();
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
  renderListaNot();
});

renderListaNot();