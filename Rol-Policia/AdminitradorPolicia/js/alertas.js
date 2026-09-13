renderSidebarPolicia('alertas');

// Datos de ejemplo — misma forma que el modelo Alerta.java
// (tipoalerta, barrio, direccion, estado de EstadoAlerta.java, fechaHora)
const alertas = [
  { id: 1, tipo: "Homicidio",  barrio: "Centro",       direccion: "Cra 5 con Calle 16", fecha: "2026-09-12 08:14", estado: "PENDIENTE" },
  { id: 2, tipo: "Robo",       barrio: "Centro",       direccion: "Calle 12 # 8-40",    fecha: "2026-09-12 07:58", estado: "EN_ATENCION" },
  { id: 3, tipo: "Robo",       barrio: "Sicarare",     direccion: "Cra 9 # 20-15",      fecha: "2026-09-12 07:44", estado: "UNIDAD_ASIGNADA" },
  { id: 4, tipo: "Disturbio",  barrio: "La Nevada",    direccion: "Calle 30 # 6-22",    fecha: "2026-09-12 07:12", estado: "RECIBIDA" },
  { id: 5, tipo: "Robo",       barrio: "Cañaguate",    direccion: "Cra 14 # 11-05",     fecha: "2026-09-12 06:52", estado: "RESUELTA" },
  { id: 6, tipo: "Accidente de tránsito", barrio: "Garupal", direccion: "Av. Principal # 2-30", fecha: "2026-09-12 06:10", estado: "CANCELADA" },
];

const badgeClaseEstado = {
  PENDIENTE: "badge-red-dash",
  RECIBIDA: "badge-blue-dash",
  EN_ATENCION: "badge-amber-dash",
  UNIDAD_ASIGNADA: "badge-blue-dash",
  RESUELTA: "badge-green-dash",
  CANCELADA: "badge-dash",
};

const badgeLabelEstado = {
  PENDIENTE: "Pendiente",
  RECIBIDA: "Recibida",
  EN_ATENCION: "En atención",
  UNIDAD_ASIGNADA: "Unidad asignada",
  RESUELTA: "Resuelta",
  CANCELADA: "Cancelada",
};

function pintarAlertas(lista) {
  document.getElementById('filaAlertas').innerHTML = lista.map(a => `
    <tr>
      <td>
        <p class="nombre-alerta-dash mb-0">${a.tipo}</p>
        <p class="sub-alerta-dash mb-0">ID #${String(a.id).padStart(3, '0')}</p>
      </td>
      <td>${a.barrio}</td>
      <td>${a.direccion}</td>
      <td>${a.fecha}</td>
      <td><span class="badge-dash ${badgeClaseEstado[a.estado]}">${badgeLabelEstado[a.estado]}</span></td>
      <td>
        <div class="acciones-alerta-dash">
          <button class="btn btn-light" title="Ver en mapa"><i class="bi bi-geo-alt"></i></button>
          <button class="btn btn-light" title="Ver detalle"><i class="bi bi-eye"></i></button>
          <button class="btn btn-light" title="Asignar unidad"><i class="bi bi-car-front"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function actualizarKpis(lista) {
  document.getElementById('kpiTotal').textContent = lista.length;
  document.getElementById('kpiPendientes').textContent = lista.filter(a => a.estado === 'PENDIENTE').length;
  document.getElementById('kpiAtencion').textContent = lista.filter(a => a.estado === 'EN_ATENCION').length;
  document.getElementById('kpiResueltas').textContent = lista.filter(a => a.estado === 'RESUELTA').length;
}

// Filtros por estado
document.getElementById('filtrosAlertas').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip-filtro-dash');
  if (!chip) return;
  document.querySelectorAll('#filtrosAlertas .chip-filtro-dash').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  const filtro = chip.dataset.filtro;
  pintarAlertas(filtro === 'todas' ? alertas : alertas.filter(a => a.estado === filtro));
});

// Buscador por tipo, barrio o dirección
document.getElementById('buscarAlerta').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  pintarAlertas(alertas.filter(a =>
    a.tipo.toLowerCase().includes(q) ||
    a.barrio.toLowerCase().includes(q) ||
    a.direccion.toLowerCase().includes(q)
  ));
});

actualizarKpis(alertas);
pintarAlertas(alertas);