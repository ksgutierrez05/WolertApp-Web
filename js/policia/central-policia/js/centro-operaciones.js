// js/centro-operaciones.js
// Lógica propia de la página Centro de Operaciones (Central de Radio)

const CO_STORAGE_KEY = 'wolertapp_centro_operaciones_cache';

function guardarDatosEnCache(datos) {
  try {
    localStorage.setItem(CO_STORAGE_KEY, JSON.stringify(datos));
  } catch (err) {
    console.error('No se pudo guardar el caché del centro de operaciones:', err);
  }
}

function cargarDatosDesdeCache() {
  try {
    const guardado = localStorage.getItem(CO_STORAGE_KEY);
    return guardado ? JSON.parse(guardado) : null;
  } catch (err) {
    console.error('No se pudo leer el caché del centro de operaciones:', err);
    return null;
  }
}

async function obtenerDatosCentro() {
  return {
    kpis: {
      alertasActivas: 12,
      prioridadCritica: 3,
      sinAsignar: 5,
      enCamino: 4,
      enElSitio: 2,
      resueltasHoy: 18,
      sinRespuesta: 1
    },

    alertasRecientes: [
      { caso: 'WL-00125', tipo: 'Robo', icono: 'bi-shield-exclamation', prioridad: 'Alta', ubicacion: 'Carrera 15 #20-30', hora: '18:20', estado: 'Sin asignar' },
      { caso: 'WL-00126', tipo: 'Persona sospechosa', icono: 'bi-person-exclamation', prioridad: 'Media', ubicacion: 'Calle 8 #12-05', hora: '18:32', estado: 'Nueva' },
      { caso: 'WL-00120', tipo: 'Accidente', icono: 'bi-car-front', prioridad: 'Alta', ubicacion: 'Av. Circunvalar', hora: '18:05', estado: 'Asignada' }
    ],

    atencionesActivas: [
      { caso: 'WL-00120', tipo: 'Accidente', unidad: 'U-04', estado: 'En camino', eta: '3 min' },
      { caso: 'WL-00121', tipo: 'Alteración del orden', unidad: 'U-02', estado: 'En el sitio', eta: 'Llegó 18:31' }
    ],

    mapa: {
      alertas: [
        { label: 'Nuevas', valor: 2, color: 'var(--color-blue)' },
        { label: 'Sin asignar', valor: 5, color: 'var(--color-amber)' },
        { label: 'Asignadas', valor: 3, color: 'var(--color-blue)' },
        { label: 'En el sitio', valor: 2, color: 'var(--color-amber)' },
        { label: 'Resueltas', valor: 18, color: 'var(--color-green)' }
      ],
      unidades: [
        { label: 'Disponibles', valor: 9, color: 'var(--color-green)' },
        { label: 'En camino', valor: 4, color: 'var(--color-blue)' },
        { label: 'Fuera de servicio', valor: 1, color: 'var(--color-danger)' }
      ]
    }
  };
}

/* ========================= FECHA Y HORA ========================= */

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function actualizarFechaHora() {
  const ahora = new Date();
  setTexto('fechaActual', `${DIAS[ahora.getDay()]}, ${ahora.getDate()} de ${MESES[ahora.getMonth()]}`);
  setTexto('horaActual', ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
}

/* ========================= BADGES ========================= */

const PRIORIDAD_BADGE = { Alta: 'badge-red-dash', Crítica: 'badge-red-dash', Media: 'badge-amber-dash', Baja: 'badge-blue-dash' };
const ESTADO_BADGE = { 'Sin asignar': 'badge-amber-dash', Nueva: 'badge-blue-dash', Asignada: 'badge-green-dash', 'En camino': 'badge-blue-dash', 'En el sitio': 'badge-amber-dash' };

/* ========================= UTILIDAD GENERAL ========================= */

function setTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = valor;
}

/* ========================= KPIs ========================= */

function renderKpis(kpis) {
  const mapa = {
    kpiAlertasActivas: kpis.alertasActivas,
    kpiPrioridadCritica: kpis.prioridadCritica,
    kpiSinAsignar: kpis.sinAsignar,
    kpiEnCamino: kpis.enCamino,
    kpiEnElSitio: kpis.enElSitio,
    kpiResueltasHoy: kpis.resueltasHoy,
    kpiSinRespuesta: kpis.sinRespuesta,
    heroAlertasCurso: kpis.alertasActivas,
    heroSinAsignarTxt: kpis.sinAsignar,
    heroSinRespuestaTxt: kpis.sinRespuesta
  };

  Object.entries(mapa).forEach(([id, valor]) => setTexto(id, valor));
}

/* ========================= ALERTAS RECIENTES ========================= */

function renderAlertasRecientes(alertas) {
  const contenedor = document.getElementById('tablaAlertasRecientes');
  if (!contenedor) return;

  contenedor.innerHTML = alertas.map(alerta => `
    <tr>
      <td class="caso-dash">#${alerta.caso}</td>
      <td>
        <div class="tipo-cell-dash" title="${alerta.tipo}">
          <i class="bi ${alerta.icono}"></i>
          <span>${alerta.tipo}</span>
        </div>
      </td>
      <td><span class="badge-dash ${PRIORIDAD_BADGE[alerta.prioridad] || 'badge-blue-dash'}">${alerta.prioridad}</span></td>
      <td class="meta-muted-dash" title="${alerta.ubicacion}">${alerta.ubicacion}</td>
      <td class="meta-muted-dash">${alerta.hora}</td>
      <td><span class="badge-dash ${ESTADO_BADGE[alerta.estado] || 'badge-blue-dash'}">${alerta.estado}</span></td>
      <td><a href="#" class="btn btn-sm btn-cv-azul" title="Gestionar alerta"><i class="bi bi-arrow-right"></i></a></td>
    </tr>
  `).join('');
}

/* ========================= ATENCIONES ACTIVAS ========================= */

function renderAtencionesActivas(atenciones) {
  const contenedor = document.getElementById('tablaAtencionesActivas');
  if (!contenedor) return;

  contenedor.innerHTML = atenciones.map(atencion => `
    <tr>
      <td class="caso-dash">#${atencion.caso}</td>
      <td title="${atencion.tipo}">${atencion.tipo}</td>
      <td class="meta-muted-dash">${atencion.unidad}</td>
      <td><span class="badge-dash ${ESTADO_BADGE[atencion.estado] || 'badge-blue-dash'}">${atencion.estado}</span></td>
      <td class="meta-muted-dash">${atencion.eta}</td>
    </tr>
  `).join('');
}

/* ========================= MAPA - LEYENDAS ========================= */

function renderMapaLeyenda(id, filas) {
  const contenedor = document.getElementById(id);
  if (!contenedor) return;

  contenedor.innerHTML = filas.map(fila => `
    <div class="mapa-fila-dash">
      <span class="dot" style="background-color: ${fila.color};"></span>
      <span class="lbl-dash">${fila.label}</span>
      <span class="num-dash">${fila.valor}</span>
    </div>
  `).join('');
}

/* ========================= RENDER GENERAL ========================= */

function renderTodo(datos) {
  renderKpis(datos.kpis);
  renderAlertasRecientes(datos.alertasRecientes);
  renderAtencionesActivas(datos.atencionesActivas);
  renderMapaLeyenda('mapaLeyendaAlertas', datos.mapa.alertas);
  renderMapaLeyenda('mapaLeyendaUnidades', datos.mapa.unidades);
}

/* ========================= INICIO ========================= */

document.addEventListener('DOMContentLoaded', async () => {
  actualizarFechaHora();
  setInterval(actualizarFechaHora, 1000);


  const cache = cargarDatosDesdeCache();
  if (cache) renderTodo(cache);

  try {
    const datos = await obtenerDatosCentro();
    guardarDatosEnCache(datos);
    renderTodo(datos);
  } catch (err) {
    console.error('No se pudieron obtener los datos del centro de operaciones:', err);
  }
});