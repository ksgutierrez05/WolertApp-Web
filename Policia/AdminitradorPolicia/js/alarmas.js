renderSidebarPolicia('alarmas');

// Datos de ejemplo — misma forma que el modelo Alarma.java
// (id_alarma, nombre, barrio, latitud, longitud, radio_cobertura, estado)
const alarmas = [
  { id: 1, nombre: "Alarma La Nevada 1", barrio: "La Nevada",     lat: 10.4631, lng: -73.2532, radio: 150, estado: "ACTIVA" },
  { id: 2, nombre: "Alarma Cañaguate",   barrio: "Cañaguate",     lat: 10.4550, lng: -73.2461, radio: 200, estado: "INACTIVA" },
  { id: 3, nombre: "Alarma Almendros",   barrio: "Los Almendros", lat: 10.4702, lng: -73.2598, radio: 120, estado: "EN_MANTENIMIENTO" },
  { id: 4, nombre: "Alarma Sicarare",    barrio: "Sicarare",      lat: 10.4489, lng: -73.2705, radio: 180, estado: "ACTIVA" },
  { id: 5, nombre: "Alarma Garupal",     barrio: "Garupal",       lat: 10.4675, lng: -73.2390, radio: 160, estado: "INACTIVA" },
];

const badgeClaseEstado = {
  ACTIVA: "badge-red-dash",
  INACTIVA: "badge-green-dash",
  EN_MANTENIMIENTO: "badge-amber-dash",
};

const badgeLabelEstado = {
  ACTIVA: "Activa",
  INACTIVA: "Inactiva",
  EN_MANTENIMIENTO: "En mantenimiento",
};

function pintarAlarmas(lista) {
  document.getElementById('filaAlarmas').innerHTML = lista.map(a => `
    <tr>
      <td>
        <p class="nombre-alarma-dash mb-0">${a.nombre}</p>
        <p class="sub-alarma-dash mb-0">ID #${String(a.id).padStart(3, '0')}</p>
      </td>
      <td>${a.barrio}</td>
      <td>${a.lat.toFixed(4)}, ${a.lng.toFixed(4)}</td>
      <td>${a.radio} m</td>
      <td><span class="badge-dash ${badgeClaseEstado[a.estado]}">${badgeLabelEstado[a.estado]}</span></td>
      <td>
        <div class="acciones-alarma-dash">
          <button class="btn btn-light" title="Ver en mapa"><i class="bi bi-geo-alt"></i></button>
          <button class="btn btn-light" title="Editar"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-light" title="${a.estado === 'ACTIVA' ? 'Desactivar' : 'Activar'}"><i class="bi bi-power"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function actualizarKpis(lista) {
  document.getElementById('kpiTotal').textContent = lista.length;
  document.getElementById('kpiActivas').textContent = lista.filter(a => a.estado === 'ACTIVA').length;
  document.getElementById('kpiInactivas').textContent = lista.filter(a => a.estado === 'INACTIVA').length;
  document.getElementById('kpiMantenimiento').textContent = lista.filter(a => a.estado === 'EN_MANTENIMIENTO').length;
}

// Filtros por estado
document.getElementById('filtrosAlarmas').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip-filtro-dash');
  if (!chip) return;
  document.querySelectorAll('.chip-filtro-dash').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  const filtro = chip.dataset.filtro;
  pintarAlarmas(filtro === 'todas' ? alarmas : alarmas.filter(a => a.estado === filtro));
});

// Buscador por nombre o barrio
document.getElementById('buscarAlarma').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  pintarAlarmas(alarmas.filter(a => a.nombre.toLowerCase().includes(q) || a.barrio.toLowerCase().includes(q)));
});

actualizarKpis(alarmas);
pintarAlarmas(alarmas);