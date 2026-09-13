// js/patrullero/centro-operaciones.js
// Lógica de arranque de la página Centro de Operaciones (Patrullero).
// Por ahora solo monta el sidebar; cuando haya backend, este archivo
// es el lugar para reemplazar los datos de ejemplo del HTML
// (estado, KPIs, atención activa, alertas, unidad, alarmas) por
// datos reales, sin tocar el HTML ni el CSS.

document.addEventListener('DOMContentLoaded', () => {
  renderSidebarPolicia('centrooperaciones');
});