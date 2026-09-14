/* ============================================================
   WOLERTAPP · TRÁNSITO · AGENTE — Panel principal (lógica UI)
   ============================================================ */
(function () {
  'use strict';

  const ESTADOS_CASO = ['pendiente', 'en_camino', 'en_sitio', 'resuelto'];

  const ETIQUETAS_ESTADO = {
    pendiente: 'Pendiente',
    en_camino: 'En camino',
    en_sitio: 'En sitio'
  };

  const ETIQUETAS_ACCION = {
    pendiente: 'Marcar en camino',
    en_camino: 'Marcar en sitio',
    en_sitio: 'Marcar resuelto'
  };

  /* [01] Mis casos asignados: avanzar estado con cada clic --------- */
  function inicializarMisCasos() {
    const tabla = document.getElementById('tablaMisCasos');
    if (!tabla) return;

    const mensajeVacio = document.getElementById('mensajeMisCasosVacio');

    function actualizarEstadoVacio() {
      const quedanCasos = tabla.querySelectorAll('tbody tr.caso-row-ag').length > 0;
      if (mensajeVacio) mensajeVacio.classList.toggle('d-none', quedanCasos);
    }

    tabla.addEventListener('click', function (evento) {
      const boton = evento.target.closest('[data-accion]');
      if (!boton) return;

      const fila = boton.closest('.caso-row-ag');
      const estadoActual = fila.dataset.estado;
      const siguiente = ESTADOS_CASO[ESTADOS_CASO.indexOf(estadoActual) + 1];
      if (!siguiente) return;

      // Último paso: el caso se resuelve y sale de "mis casos"
      if (siguiente === 'resuelto') {
        fila.classList.add('resuelto-ag');
        fila.addEventListener('transitionend', function () {
          fila.remove();
          actualizarEstadoVacio();
        }, { once: true });
        return;
      }

      fila.dataset.estado = siguiente;

      const etiqueta = fila.querySelector('[data-estado-label]');
      if (etiqueta) {
        etiqueta.textContent = ETIQUETAS_ESTADO[siguiente];
        etiqueta.className = 'estado-badge-ag estado-' + siguiente + '-ag';
      }

      boton.textContent = ETIQUETAS_ACCION[siguiente];
    });
  }

  /* [02] Historial de casos: filtro por pestañas --------------------- */
  function inicializarHistorial() {
    const tabs = document.getElementById('tabsHistorial');
    const tabla = document.getElementById('tablaHistorial');
    if (!tabs || !tabla) return;

    const mensajeVacio = document.getElementById('mensajeHistorialVacio');
    const filas = Array.from(tabla.querySelectorAll('tbody tr'));

    tabs.addEventListener('click', function (evento) {
      const tab = evento.target.closest('.tab-ag');
      if (!tab) return;

      tabs.querySelectorAll('.tab-ag').forEach(function (t) {
        t.classList.remove('active-ag');
      });
      tab.classList.add('active-ag');

      const tipo = tab.dataset.tipo;
      let visibles = 0;

      filas.forEach(function (fila) {
        const coincide = tipo === 'todas' || fila.dataset.tipo === tipo;
        fila.classList.toggle('d-none', !coincide);
        if (coincide) visibles += 1;
      });

      if (mensajeVacio) mensajeVacio.classList.toggle('d-none', visibles > 0);
    });
  }

  /* [03] Paginación del historial (demo visual) ------------------------ */
  function inicializarPaginacion() {
    const paginas = document.querySelector('.paginas-ag');
    if (!paginas) return;

    paginas.addEventListener('click', function (evento) {
      const boton = evento.target.closest('button');
      if (!boton || boton.querySelector('i')) return; // ignora flecha siguiente/anterior

      paginas.querySelectorAll('button').forEach(function (b) {
        b.classList.remove('active-ag');
      });
      boton.classList.add('active-ag');
    });
  }

  /* [04] Buscador: filtra "Mis casos" por caso o barrio ------------------ */
  function inicializarBusqueda() {
    const input = document.querySelector('.search-dash input');
    const tabla = document.getElementById('tablaMisCasos');
    if (!input || !tabla) return;

    input.addEventListener('input', function () {
      const termino = input.value.trim().toLowerCase();
      tabla.querySelectorAll('tbody tr.caso-row-ag').forEach(function (fila) {
        const texto = fila.textContent.toLowerCase();
        fila.classList.toggle('d-none', termino !== '' && !texto.includes(termino));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    inicializarMisCasos();
    inicializarHistorial();
    inicializarPaginacion();
    inicializarBusqueda();
  });
})();