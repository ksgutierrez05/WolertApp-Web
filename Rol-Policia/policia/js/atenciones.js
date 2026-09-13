// js/patrullero/mis-atenciones.js
// Lógica de la pantalla "Mis Atenciones" del rol Patrullero.
// Requiere que este archivo se cargue DESPUÉS de sidebar.js, y que
// el HTML tenga los ids: sidebarDash, kpiTotal, kpiCamino, kpiSitio,
// kpiPorCerrar, filtrosAt, listaAt, panelDetalleAt.

renderSidebarPatrullero('atenciones');

/* ============================================================
   DATOS DE EJEMPLO
   En producción esto viene del backend (alertas aceptadas por
   el patrullero autenticado). Se deja aquí como arreglo simple
   para que el flujo de estados sea fácil de probar visualmente.
   ============================================================ */
const FLUJO_ESTADOS = ['ACEPTADA', 'EN_CAMINO', 'EN_SITIO', 'ATENDIDA', 'CERRADA'];

const ETIQUETAS_ESTADO = {
  ACEPTADA:  { texto: 'Aceptada',    corto: 'Aceptada' },
  EN_CAMINO: { texto: 'En camino',   corto: 'En camino' },
  EN_SITIO:  { texto: 'En el sitio', corto: 'En el sitio' },
  ATENDIDA:  { texto: 'Atendida',    corto: 'Atendida' },
  CERRADA:   { texto: 'Cerrada',     corto: 'Cerrada' },
};

// Texto del botón principal según el estado actual (acción que avanza al siguiente paso)
const ACCION_SIGUIENTE = {
  ACEPTADA:  'Salir hacia el sitio',
  EN_CAMINO: 'Ya llegué al sitio',
  EN_SITIO:  'Marcar como atendida',
};

let atenciones = [
  {
    id: 'AT-1042',
    tipo: 'Robo en establecimiento',
    prioridad: 'alta',
    ubicacion: 'Carrera 9 # 14-32, Centro',
    hora: '14:32',
    descripcion: 'Ciudadano reporta robo en establecimiento comercial.',
    estado: 'EN_CAMINO',
    observaciones: '', resultado: '', novedades: '', personas: '',
  },
  {
    id: 'AT-1039',
    tipo: 'Riña callejera',
    prioridad: 'media',
    ubicacion: 'Calle 16 con Carrera 7',
    hora: '13:10',
    descripcion: 'Se reporta altercado entre dos personas en vía pública.',
    estado: 'EN_SITIO',
    observaciones: '', resultado: '', novedades: '', personas: '',
  },
  {
    id: 'AT-1031',
    tipo: 'Persona sospechosa',
    prioridad: 'baja',
    ubicacion: 'Parque Simón Bolívar',
    hora: '11:47',
    descripcion: 'Vecino reporta persona merodeando vehículos parqueados.',
    estado: 'ACEPTADA',
    observaciones: '', resultado: '', novedades: '', personas: '',
  },
];

let filtroActual = 'TODAS';
let idSeleccionado = atenciones[0].id;

function atencionPorId(id) {
  return atenciones.find(a => a.id === id);
}

function renderKPIs() {
  document.getElementById('kpiTotal').textContent = atenciones.filter(a => a.estado !== 'CERRADA').length;
  document.getElementById('kpiCamino').textContent = atenciones.filter(a => a.estado === 'EN_CAMINO').length;
  document.getElementById('kpiSitio').textContent = atenciones.filter(a => a.estado === 'EN_SITIO').length;
  document.getElementById('kpiPorCerrar').textContent = atenciones.filter(a => a.estado === 'ATENDIDA').length;
}

function renderLista() {
  const cont = document.getElementById('listaAt');
  const visibles = atenciones.filter(a => filtroActual === 'TODAS' || a.estado === filtroActual);

  if (visibles.length === 0) {
    cont.innerHTML = `<p style="font-size:12.5px;color:var(--subtle);text-align:center;padding:24px 0;">No hay atenciones en este filtro.</p>`;
    return;
  }

  cont.innerHTML = visibles.map(a => `
    <div class="tarjeta-at ${a.id === idSeleccionado ? 'selected' : ''}" data-id="${a.id}">
      <div class="prioridad-barra-at prioridad-${a.prioridad}-at"></div>
      <div class="tipo-at">${a.tipo}</div>
      <div class="meta-at">
        <span class="badge-dash ${a.estado === 'ATENDIDA' ? 'badge-green-dash' : 'badge-blue-dash'}">${ETIQUETAS_ESTADO[a.estado].corto}</span>
        <span><i class="bi bi-geo-alt"></i> ${a.ubicacion}</span>
      </div>
      <div class="meta-at mt-1"><i class="bi bi-clock"></i> ${a.hora} · ${a.id}</div>
    </div>
  `).join('');

  cont.querySelectorAll('.tarjeta-at').forEach(el => {
    el.addEventListener('click', () => {
      idSeleccionado = el.dataset.id;
      renderLista();
      renderDetalle();
    });
  });
}

function renderStepper(estadoActual) {
  const idxActual = FLUJO_ESTADOS.indexOf(estadoActual);
  return FLUJO_ESTADOS.map((estado, idx) => {
    const hecho = idx < idxActual;
    const actual = idx === idxActual;
    const linea = idx < FLUJO_ESTADOS.length - 1
      ? `<div class="linea-at ${idx < idxActual ? 'hecho-at' : ''}"></div>`
      : '';
    return `
      <div class="paso-at ${hecho ? 'hecho-at' : ''} ${actual ? 'actual-at' : ''}">
        <div class="circulo-at">${hecho ? '<i class="bi bi-check-lg"></i>' : idx + 1}</div>
        <span class="txt-paso-at">${ETIQUETAS_ESTADO[estado].corto}</span>
      </div>
      ${linea}
    `;
  }).join('');
}

function renderDetalle() {
  const panel = document.getElementById('panelDetalleAt');
  const a = atencionPorId(idSeleccionado);

  if (!a) {
    panel.innerHTML = `
      <div class="vacio-at">
        <i class="bi bi-clipboard2-check"></i>
        <p class="mb-0">Selecciona una atención de la lista<br>para ver su detalle y actualizar su estado.</p>
      </div>`;
    return;
  }

  const mostrarFormularioCierre = (a.estado === 'EN_SITIO' || a.estado === 'ATENDIDA');
  const yaCerrada = a.estado === 'CERRADA';
  const accionTexto = ACCION_SIGUIENTE[a.estado];

  panel.innerHTML = `
    <div class="cabecera-detalle-at">
      <div>
        <h2>${a.tipo}</h2>
        <div class="meta-at">
          <span class="badge-dash badge-blue-dash">${a.id}</span>
          <span><i class="bi bi-geo-alt"></i> ${a.ubicacion}</span>
          <span><i class="bi bi-clock"></i> ${a.hora}</span>
        </div>
      </div>
      <span class="badge-dash ${a.prioridad === 'alta' ? 'badge-red-dash' : a.prioridad === 'media' ? 'badge-amber-dash' : 'badge-blue-dash'}">
        Prioridad ${a.prioridad}
      </span>
    </div>

    <div class="stepper-at">${renderStepper(a.estado)}</div>

    <div class="fila-info-at">
      <div class="label-info-at">Descripción</div>
      <div>${a.descripcion}</div>
    </div>
    <div class="fila-info-at">
      <div class="label-info-at">Estado actual</div>
      <div>${ETIQUETAS_ESTADO[a.estado].texto}</div>
    </div>

    ${mostrarFormularioCierre ? `
      <div class="form-cierre-at">
        <p class="section-title-dash mb-3" style="font-size:14px;">Registro de la atención</p>

        <div class="mb-3">
          <label>Observaciones <span class="req-at">*</span></label>
          <textarea class="form-control" rows="2" id="campoObservaciones" placeholder="¿Qué encontraste en el sitio?">${a.observaciones}</textarea>
        </div>

        <div class="mb-3">
          <label>Resultado de la atención <span class="req-at">*</span></label>
          <textarea class="form-control" rows="2" id="campoResultado" placeholder="Ej: Caso resuelto, se recuperó el bien, se trasladó a estación...">${a.resultado}</textarea>
        </div>

        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <label>Novedades</label>
            <input type="text" class="form-control" id="campoNovedades" placeholder="Opcional" value="${a.novedades}">
          </div>
          <div class="col-md-6">
            <label>Personas involucradas</label>
            <input type="text" class="form-control" id="campoPersonas" placeholder="Opcional" value="${a.personas}">
          </div>
        </div>

        <label>Evidencias</label>
        <div class="evidencia-drop-at">
          <i class="bi bi-camera me-1"></i> Toca para adjuntar fotografías del procedimiento
        </div>
      </div>

      <div class="aviso-campos-at" id="avisoCamposAt">
        <i class="bi bi-exclamation-circle"></i>
        <span>Completa observaciones y resultado antes de finalizar la atención.</span>
      </div>
    ` : ''}

    <div class="acciones-detalle-at">
      ${accionTexto ? `<button class="btn-accion-principal-at" id="btnAvanzarAt">${accionTexto}</button>` : ''}
      ${a.estado === 'ATENDIDA' ? `<button class="btn-finalizar-at" id="btnFinalizarAt"><i class="bi bi-check2-circle me-1"></i>Finalizar atención</button>` : ''}
      ${yaCerrada ? `<span class="badge-dash badge-green-dash">Esta atención ya está cerrada</span>` : ''}
    </div>
  `;

  const btnAvanzar = document.getElementById('btnAvanzarAt');
  if (btnAvanzar) {
    btnAvanzar.addEventListener('click', () => avanzarEstado(a.id));
  }

  const btnFinalizar = document.getElementById('btnFinalizarAt');
  if (btnFinalizar) {
    btnFinalizar.addEventListener('click', () => finalizarAtencion(a.id));
  }
}

function guardarCamposFormulario(a) {
  const obs = document.getElementById('campoObservaciones');
  const res = document.getElementById('campoResultado');
  const nov = document.getElementById('campoNovedades');
  const per = document.getElementById('campoPersonas');
  if (obs) a.observaciones = obs.value.trim();
  if (res) a.resultado = res.value.trim();
  if (nov) a.novedades = nov.value.trim();
  if (per) a.personas = per.value.trim();
}

function avanzarEstado(id) {
  const a = atencionPorId(id);
  if (!a) return;
  guardarCamposFormulario(a);

  const idxActual = FLUJO_ESTADOS.indexOf(a.estado);
  if (idxActual < FLUJO_ESTADOS.length - 2) { // no avanza automáticamente a CERRADA
    a.estado = FLUJO_ESTADOS[idxActual + 1];
  }
  renderKPIs();
  renderLista();
  renderDetalle();
}

function finalizarAtencion(id) {
  const a = atencionPorId(id);
  if (!a) return;
  guardarCamposFormulario(a);

  // Información mínima obligatoria antes de cerrar el caso
  if (!a.observaciones || !a.resultado) {
    const aviso = document.getElementById('avisoCamposAt');
    if (aviso) aviso.style.display = 'flex';
    return;
  }

  a.estado = 'CERRADA';
  renderKPIs();
  renderLista();
  renderDetalle();
}

document.getElementById('filtrosAt').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip-filtro-at');
  if (!btn) return;
  document.querySelectorAll('.chip-filtro-at').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  filtroActual = btn.dataset.filtro;
  renderLista();
});

renderKPIs();
renderLista();
renderDetalle();