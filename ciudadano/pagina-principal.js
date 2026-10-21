document.addEventListener('DOMContentLoaded', () => {
  inicializarMisAlertas();
  inicializarFiltrosUltimasAlertas();
  inicializarSOS();
});
 
/* [01] MIS ALERTAS — cancelar una alerta propia -------------------- */
function inicializarMisAlertas() {
  const tabla = document.getElementById('tablaMisAlertas');
  const mensajeVacio = document.getElementById('mensajeMisAlertasVacio');
  const kpiAlertasActivas = document.getElementById('kpiAlertasActivas');
 
  if (!tabla) return;
 
  tabla.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-accion]');
    if (!boton || boton.disabled) return;
 
    const fila = boton.closest('.alerta-row-usu');
    if (!fila) return;
 
    const confirmar = window.confirm('¿Deseas cancelar esta alerta? Se notificará a la policía.');
    if (!confirmar) return;
 
    fila.classList.add('cancelada-usu');
    fila.addEventListener('transitionend', () => {
      fila.remove();
      actualizarContadorAlertas();
      verificarMisAlertasVacias();
    }, { once: true });
  });
 
  function actualizarContadorAlertas() {
    if (!kpiAlertasActivas) return;
    const filasRestantes = tabla.querySelectorAll('tbody tr.alerta-row-usu').length;
    kpiAlertasActivas.textContent = filasRestantes;
  }
 
  function verificarMisAlertasVacias() {
    const filasRestantes = tabla.querySelectorAll('tbody tr.alerta-row-usu').length;
    if (mensajeVacio) {
      mensajeVacio.classList.toggle('d-none', filasRestantes !== 0);
    }
  }
}
 
/* [02] ÚLTIMAS ALERTAS — filtro por tipo (tabs) ---------------------- */
function inicializarFiltrosUltimasAlertas() {
  const contenedorTabs = document.getElementById('tabsUltimasAlertas');
  const tabla = document.getElementById('tablaUltimasAlertas');
  const mensajeVacio = document.getElementById('mensajeUltimasAlertasVacio');
 
  if (!contenedorTabs || !tabla) return;
 
  const filas = Array.from(tabla.querySelectorAll('tbody tr[data-tipo]'));
 
  contenedorTabs.addEventListener('click', (evento) => {
    const tab = evento.target.closest('.tab-usu');
    if (!tab) return;
 
    contenedorTabs.querySelectorAll('.tab-usu').forEach((t) => t.classList.remove('active-usu'));
    tab.classList.add('active-usu');
 
    const tipoSeleccionado = tab.dataset.tipo;
    let visibles = 0;
 
    filas.forEach((fila) => {
      const coincide = tipoSeleccionado === 'todas' || fila.dataset.tipo === tipoSeleccionado;
      fila.classList.toggle('d-none', !coincide);
      if (coincide) visibles += 1;
    });
 
    if (mensajeVacio) {
      mensajeVacio.classList.toggle('d-none', visibles !== 0);
    }
  });
}
 
/* [03] BOTÓN SOS — confirmación y envío de emergencia ---------------- */
function inicializarSOS() {
  const botonConfirmar = document.getElementById('confirmarSOS');
  const toastElemento = document.getElementById('toastSOS');
  const modalElemento = document.getElementById('modalSOS');
 
  if (!botonConfirmar) return;
 
  botonConfirmar.addEventListener('click', () => {
    enviarAlertaSOS();
 
    const modalInstancia = window.bootstrap
      ? window.bootstrap.Modal.getOrCreateInstance(modalElemento)
      : null;
    if (modalInstancia) modalInstancia.hide();
 
    if (toastElemento && window.bootstrap) {
      const toastInstancia = window.bootstrap.Toast.getOrCreateInstance(toastElemento, { delay: 5000 });
      toastInstancia.show();
    }
  });
}
 
function enviarAlertaSOS() {
  // Punto de integración: aquí se conectaría con el backend
  // (por ejemplo, un PreparedCallableStatement hacia
  // pr_insertar_alerta / pr_asignar_unidad_cercana) enviando
  // la geolocalización real del ciudadano.
  agregarAlertaSOSaMisAlertas();
  incrementarKpiAlertasActivas();
}
 
function agregarAlertaSOSaMisAlertas() {
  const tabla = document.getElementById('tablaMisAlertas');
  const cuerpo = tabla ? tabla.querySelector('tbody') : null;
  const mensajeVacio = document.getElementById('mensajeMisAlertasVacio');
  if (!cuerpo) return;
 
  const nuevoId = `sos-${Date.now()}`;
  const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
 
  const fila = document.createElement('tr');
  fila.className = 'alerta-row-usu';
  fila.dataset.id = nuevoId;
  fila.dataset.estado = 'pendiente';
  fila.innerHTML = `
    <td><span class="badge-dash badge-red-dash">SOS</span></td>
    <td>
      <div class="info-title-dash">Mi ubicación actual</div>
      <div class="info-sub-dash">Enviada hoy · ${hora}</div>
    </td>
    <td><span class="estado-badge-usu estado-pendiente-usu" data-estado-label>Pendiente</span></td>
    <td class="text-end"><button class="cancelar-btn-usu" data-id="${nuevoId}" data-accion>Cancelar</button></td>
  `;
 
  cuerpo.prepend(fila);
  if (mensajeVacio) mensajeVacio.classList.add('d-none');
}
 
function incrementarKpiAlertasActivas() {
  const kpi = document.getElementById('kpiAlertasActivas');
  if (!kpi) return;
  kpi.textContent = String(Number(kpi.textContent) + 1);
}