// js/central/mapa-operativo.js
// Lógica visual de la pantalla "Próximamente" del Mapa Operativo.
// No consume datos reales: solo genera pulsos aleatorios sobre el
// radar decorativo y anima la barra de "avance del desarrollo".

const MAPOP_PORCENTAJE_AVANCE = 65; // valor fijo mostrado en la barra

function crearBlipAleatorio(radar) {
  const radioMaximo = radar.clientWidth / 2 - 18;
  const angulo = Math.random() * Math.PI * 2;
  const radio = Math.random() * radioMaximo;

  const x = radar.clientWidth / 2 + Math.cos(angulo) * radio;
  const y = radar.clientHeight / 2 + Math.sin(angulo) * radio;

  const blip = document.createElement('div');
  blip.className = 'mapop-blip-dash';
  blip.style.left = `${x}px`;
  blip.style.top = `${y}px`;

  radar.appendChild(blip);

  blip.addEventListener('animationend', () => blip.remove());
}

function iniciarPulsosRadar() {
  const radar = document.getElementById('mapopRadar');
  if (!radar) return;

  setInterval(() => crearBlipAleatorio(radar), 900);
}

function animarProgreso() {
  const barra = document.getElementById('mapopProgressBar');
  const label = document.getElementById('mapopProgressLabel');
  if (!barra || !label) return;

  requestAnimationFrame(() => {
    barra.style.width = `${MAPOP_PORCENTAJE_AVANCE}%`;
    label.textContent = `Avance del desarrollo: ${MAPOP_PORCENTAJE_AVANCE}%`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  iniciarPulsosRadar();
  animarProgreso();
});