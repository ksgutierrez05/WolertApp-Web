// Patrullero/js/alertas.js
// Lógica de la página "Mis Alertas": monta el sidebar y filtra la
// lista por prioridad al hacer clic en los chips de arriba.
// Cuando haya backend, este archivo es el lugar para reemplazar
// las tarjetas de ejemplo del HTML por las alertas reales del
// Patrullero, y para conectar los botones "Aceptar alerta"
// (que deben mover el caso a Mis Atenciones).

document.addEventListener('DOMContentLoaded', () => {
  renderSidebarPolicia('misalertas');

  const chips = document.querySelectorAll('.al-chip');
  const tarjetas = document.querySelectorAll('.al-card');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filtro = chip.dataset.filter;
      tarjetas.forEach(card => {
        const coincide = filtro === 'todas' || card.dataset.priority === filtro;
        card.closest('.al-card-col').style.display = coincide ? '' : 'none';
      });
    });
  });
});