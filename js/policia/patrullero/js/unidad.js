// js/unidad.js
// Lógica de "Mi Unidad" del rol Patrullero.
// Consulta únicamente: no crea, elimina ni modifica integrantes.

renderSidebarPolicia('miunidad');

const ETIQUETAS_ESTADO_UNI = {
  DISPONIBLE: { texto: 'Disponible', clase: 'estado-disponible-uni' },
  EN_ATENCION: { texto: 'En atención', clase: 'estado-atencion-uni' },
  EN_CAMINO: { texto: 'En camino', clase: 'estado-camino-uni' },
};

const integrantesUnidad = [
  { nombre: 'Patrullero A. Gómez', rol: 'Patrullero', estado: 'DISPONIBLE' },
  { nombre: 'Patrullero L. Ramírez', rol: 'Patrullero', estado: 'EN_ATENCION' },
  { nombre: 'Patrullero D. Torres', rol: 'Patrullero', estado: 'EN_CAMINO' },
  { nombre: 'Patrullera M. Castro', rol: 'Patrullera', estado: 'DISPONIBLE' },
];

function inicialesUni(nombre) {
  return nombre.split(' ').filter(p => p.length > 1 || /[A-Za-zÁÉÍÓÚÑ]/.test(p))
    .slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

function renderKPIsUni() {
  document.getElementById('kpiTotalUni').textContent = integrantesUnidad.length;
  document.getElementById('kpiDisponiblesUni').textContent = integrantesUnidad.filter(i => i.estado === 'DISPONIBLE').length;
  document.getElementById('kpiAtencionUni').textContent = integrantesUnidad.filter(i => i.estado === 'EN_ATENCION').length;
  document.getElementById('kpiCaminoUni').textContent = integrantesUnidad.filter(i => i.estado === 'EN_CAMINO').length;
}

function renderIntegrantesUni() {
  const cont = document.getElementById('listaIntegrantesUni');
  cont.innerHTML = integrantesUnidad.map(i => {
    const est = ETIQUETAS_ESTADO_UNI[i.estado];
    return `
      <div class="fila-integrante-uni">
        <div class="avatar-integrante-uni">${inicialesUni(i.nombre)}</div>
        <div class="info-integrante-uni">
          <div class="nombre-uni">${i.nombre}</div>
          <div class="rol-uni">${i.rol}</div>
        </div>
        <span class="estado-integrante-uni ${est.clase}">
          <span class="dot-uni"></span>${est.texto}
        </span>
      </div>
    `;
  }).join('');
}

renderKPIsUni();
renderIntegrantesUni();