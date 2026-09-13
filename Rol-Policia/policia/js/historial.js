// js/historial.js
// Lógica de "Historial" del rol Patrullero.
// Muestra únicamente las atenciones ya realizadas por este patrullero.

renderSidebarPatrullero('historial');

const historialAtenciones = [
  {
    id: 'AT-1042',
    tipo: 'Robo',
    estado: 'CERRADA',
    zona: 'Centro',
    fecha: '2026-09-13',
    ubicacion: 'Carrera 9 # 14-32, Centro',
    horaAsignacion: '14:10',
    horaAceptacion: '14:12',
    horaLlegada: '14:25',
    horaCierre: '14:58',
    observaciones: 'Se encontró establecimiento con vitrina forzada, sin personas presentes.',
    resultado: 'Se recuperó parte de la mercancía. Caso remitido a Fiscalía.',
    evidencias: ['Foto vitrina', 'Foto mercancía recuperada'],
  },
  {
    id: 'AT-0998',
    tipo: 'Riña',
    estado: 'CERRADA',
    zona: 'Calle 16',
    fecha: '2026-09-12',
    ubicacion: 'Calle 16 con Carrera 7',
    horaAsignacion: '12:00',
    horaAceptacion: '12:02',
    horaLlegada: '12:11',
    horaCierre: '12:40',
    observaciones: 'Altercado verbal entre dos comerciantes, sin lesiones.',
    resultado: 'Se dejó constancia y se solicitó compromiso de no agresión.',
    evidencias: ['Acta de compromiso'],
  },
  {
    id: 'AT-0975',
    tipo: 'Accidente',
    estado: 'ATENDIDA',
    zona: 'Av. Circunvalar',
    fecha: '2026-09-12',
    ubicacion: 'Av. Circunvalar con Calle 30',
    horaAsignacion: '09:40',
    horaAceptacion: '09:41',
    horaLlegada: '09:52',
    horaCierre: '—',
    observaciones: 'Choque leve entre dos vehículos, sin heridos.',
    resultado: 'Pendiente informe final de tránsito.',
    evidencias: ['Foto vehículos'],
  },
  {
    id: 'AT-0960',
    tipo: 'Persona sospechosa',
    estado: 'CERRADA',
    zona: 'Parque Simón Bolívar',
    fecha: '2026-09-11',
    ubicacion: 'Parque Simón Bolívar',
    horaAsignacion: '18:20',
    horaAceptacion: '18:21',
    horaLlegada: '18:33',
    horaCierre: '18:50',
    observaciones: 'Persona identificada, sin antecedentes ni objetos ilícitos.',
    resultado: 'Se verificó identidad y se permitió continuar su recorrido.',
    evidencias: [],
  },
];

let idSeleccionadoHis = null;

function aplicarFiltrosHis() {
  const fecha = document.getElementById('filtroFechaHis').value;
  const tipo = document.getElementById('filtroTipoHis').value;
  const estado = document.getElementById('filtroEstadoHis').value;
  const zona = document.getElementById('filtroZonaHis').value.trim().toLowerCase();
  const caso = document.getElementById('filtroCasoHis').value.trim().toLowerCase();

  return historialAtenciones.filter(a => {
    if (fecha && a.fecha !== fecha) return false;
    if (tipo && a.tipo !== tipo) return false;
    if (estado && a.estado !== estado) return false;
    if (zona && !a.zona.toLowerCase().includes(zona)) return false;
    if (caso && !a.id.toLowerCase().includes(caso)) return false;
    return true;
  });
}

function atencionPorIdHis(id) {
  return historialAtenciones.find(a => a.id === id);
}

function formatearFechaHis(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-');
  return `${dia}/${mes}/${anio}`;
}

function renderListaHis() {
  const cont = document.getElementById('listaHis');
  const visibles = aplicarFiltrosHis();

  if (visibles.length === 0) {
    cont.innerHTML = `<p style="font-size:12.5px;color:var(--subtle);text-align:center;padding:24px 0;">No hay atenciones para estos filtros.</p>`;
    return;
  }

  let fechaAnterior = null;
  let html = '';

  visibles.forEach(a => {
    if (a.fecha !== fechaAnterior) {
      html += `<div class="grupo-fecha-his">${formatearFechaHis(a.fecha)}</div>`;
      fechaAnterior = a.fecha;
    }
    html += `
      <div class="tarjeta-his ${a.id === idSeleccionadoHis ? 'selected' : ''}" data-id="${a.id}">
        <div class="tipo-his">${a.tipo}</div>
        <div class="meta-his">
          <span class="badge-dash ${a.estado === 'CERRADA' ? 'badge-green-dash' : 'badge-blue-dash'}">${a.estado === 'CERRADA' ? 'Cerrada' : 'Atendida'}</span>
          <span><i class="bi bi-geo-alt"></i> ${a.zona}</span>
          <span>${a.id}</span>
        </div>
      </div>
    `;
  });

  cont.innerHTML = html;

  cont.querySelectorAll('.tarjeta-his').forEach(el => {
    el.addEventListener('click', () => {
      idSeleccionadoHis = el.dataset.id;
      renderListaHis();
      renderDetalleHis();
    });
  });
}

function renderDetalleHis() {
  const panel = document.getElementById('panelDetalleHis');
  const a = atencionPorIdHis(idSeleccionadoHis);

  if (!a) {
    panel.innerHTML = `
      <div class="vacio-his">
        <i class="bi bi-file-earmark-text"></i>
        <p class="mb-0">Selecciona una atención del historial<br>para ver el detalle completo.</p>
      </div>`;
    return;
  }

  panel.innerHTML = `
    <div class="cabecera-his">
      <div>
        <h2>${a.tipo}</h2>
        <div class="meta-his">
          <span class="badge-dash badge-blue-dash">${a.id}</span>
          <span><i class="bi bi-geo-alt"></i> ${a.ubicacion}</span>
          <span><i class="bi bi-calendar3"></i> ${formatearFechaHis(a.fecha)}</span>
        </div>
      </div>
      <span class="badge-dash ${a.estado === 'CERRADA' ? 'badge-green-dash' : 'badge-blue-dash'}">${a.estado === 'CERRADA' ? 'Cerrada' : 'Atendida'}</span>
    </div>

    <div class="linea-tiempo-his">
      <div class="paso-tiempo-his"><span class="lbl-tiempo-his">Asignación</span>${a.horaAsignacion}</div>
      <div class="paso-tiempo-his"><span class="lbl-tiempo-his">Aceptación</span>${a.horaAceptacion}</div>
      <div class="paso-tiempo-his"><span class="lbl-tiempo-his">Llegada</span>${a.horaLlegada}</div>
      <div class="paso-tiempo-his"><span class="lbl-tiempo-his">Cierre</span>${a.horaCierre}</div>
    </div>

    <div class="fila-info-his">
      <div class="label-info-his">Observaciones</div>
      <div>${a.observaciones}</div>
    </div>
    <div class="fila-info-his">
      <div class="label-info-his">Resultado</div>
      <div>${a.resultado}</div>
    </div>
    <div class="fila-info-his">
      <div class="label-info-his">Evidencias</div>
      <div>
        ${a.evidencias.length
          ? `<div class="evidencias-his">${a.evidencias.map(e => `<span class="chip-evidencia-his">${e}</span>`).join('')}</div>`
          : '<span style="color:var(--subtle);">Sin evidencias registradas</span>'}
      </div>
    </div>
  `;
}

document.getElementById('btnFiltrarHis').addEventListener('click', () => {
  renderListaHis();
});

renderListaHis();
renderDetalleHis();