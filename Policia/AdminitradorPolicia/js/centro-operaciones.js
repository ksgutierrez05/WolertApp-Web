

renderSidebarPolicia('centrooperaciones');

const alerts = [
  { title: "HOMICIDIO — CASIMIRO RAUL MAESTRE", sub: "Centro", status: "pendiente", time: "Hace 12 min" },
  { title: "ROBO — CENTRO", sub: "Centro", status: "atencion", time: "Hace 28 min" },
  { title: "ROBO — CENTRO", sub: "Centro", status: "asignada", time: "Hace 42 min" },
  { title: "ROBO — CENTRO", sub: "Centro", status: "recibida", time: "Hace 1 h" },
  { title: "ROBO — CENTRO", sub: "Centro", status: "resuelta", time: "Hace 1 h 20 min" },
];


const badgeClass = {
  pendiente: "badge-red-dash",
  atencion: "badge-amber-dash",
  asignada: "badge-blue-dash",
  recibida: "badge-blue-dash",
  resuelta: "badge-green-dash",
  cancelada: "badge-dash",
};

const badgeLabel = {
  pendiente: "Pendiente",
  atencion: "En atención",
  asignada: "Unidad asignada",
  recibida: "Recibida",
  resuelta: "Resuelta",
  cancelada: "Cancelada",
};

document.getElementById('alerts').innerHTML = alerts.map(a => `
  <div class="alert-row-dash">
    <span class="ic-dash"><i class="bi bi-bell"></i></span>
    <div class="flex-grow-1 min-w-0">
      <p class="info-title-dash mb-0">${a.title}</p>
      <p class="info-sub-dash mb-0">${a.sub}</p>
    </div>
    <span class="badge-dash ${badgeClass[a.status]}">${badgeLabel[a.status]}</span>
    <span class="alert-time-dash">${a.time}</span>
  </div>`).join('');