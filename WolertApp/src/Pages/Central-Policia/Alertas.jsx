
import { useMemo, useRef, useState, useEffect } from 'react';
import { Modal } from 'bootstrap';
import '../../css/policia/central-policia/css/alertas.css';

const FILTROS = [
  { texto: 'Todas', valor: 'todas' },
  { texto: 'Nuevas', valor: 'Nueva' },
  { texto: 'Clasificadas', valor: 'Clasificada' },
  { texto: 'Asignadas', valor: 'Asignada' },
  { texto: 'En atención', valor: 'En atención' },
  { texto: 'Críticas', valor: '__criticas', peligro: true },
  { texto: 'Sin respuesta', valor: '__sinrespuesta', peligro: true },
];

const ALERTAS_INICIALES = [];

const FORMULARIO_VACIO = {
  tipo: 'Robo',
  prioridad: 'Media',
  nivel: 'Atención normal',
  zona: '',
  nota: '',
  patrullero: '',
};

function normalizar(texto) {
  return String(texto ?? '').toLowerCase().trim();
}

function obtenerPrioridad(alerta) {
  return normalizar(alerta.prioridadCentral || alerta.prioridad);
}

function esCritica(alerta) {
  return ['crítica', 'critica', 'alta'].includes(obtenerPrioridad(alerta));
}

function esSinRespuesta(alerta) {
  return Boolean(alerta.sinRespuesta);
}

function Alertas() {
  const [alertas, setAlertas] = useState(ALERTAS_INICIALES);
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('todas');
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [notas, setNotas] = useState([]);
  const [patrulleroSeleccionado, setPatrulleroSeleccionado] = useState('');
  const [clasificacionGuardada, setClasificacionGuardada] = useState(false);

  const modalRef = useRef(null);
  const instanciaModal = useRef(null);

  useEffect(() => {
    if (!modalRef.current) return undefined;

    instanciaModal.current = new Modal(modalRef.current);

    return () => {
      instanciaModal.current?.dispose();
      instanciaModal.current = null;
    };
  }, []);

  const alertasFiltradas = useMemo(() => {
    const termino = normalizar(busqueda);

    return alertas.filter((alerta) => {
      const coincideBusqueda = [
        alerta.caso,
        alerta.tipo,
        alerta.direccion,
        alerta.ubicacion,
        alerta.barrio,
        alerta.estado,
      ].some((dato) => normalizar(dato).includes(termino));

      let coincideFiltro = true;

      if (filtroActivo === '__criticas') {
        coincideFiltro = esCritica(alerta);
      } else if (filtroActivo === '__sinrespuesta') {
        coincideFiltro = esSinRespuesta(alerta);
      } else if (filtroActivo !== 'todas') {
        coincideFiltro = alerta.estado === filtroActivo;
      }

      return coincideBusqueda && coincideFiltro;
    });
  }, [alertas, busqueda, filtroActivo]);

  const totalActivas = alertas.filter(
    (alerta) => !['Resuelta', 'Cerrada'].includes(alerta.estado)
  ).length;

  const totalCriticas = alertas.filter(esCritica).length;

  const totalSinClasificar = alertas.filter(
    (alerta) => !alerta.tipoCentral || !alerta.prioridadCentral
  ).length;

  const totalSinRespuesta = alertas.filter(esSinRespuesta).length;

  const totalNuevas = alertas.filter(
    (alerta) => alerta.estado === 'Nueva'
  ).length;

  function abrirGestion(alerta) {
    setAlertaSeleccionada(alerta);

    setFormulario({
      tipo: alerta.tipoCentral || alerta.tipo || 'Robo',
      prioridad: alerta.prioridadCentral || alerta.prioridad || 'Media',
      nivel: alerta.nivel || 'Atención normal',
      zona: alerta.zona || alerta.barrio || '',
      nota: '',
      patrullero: alerta.patrulleroId || '',
    });

    setNotas(alerta.notasCentral || []);
    setPatrulleroSeleccionado(alerta.patrulleroId || '');
    setClasificacionGuardada(false);

    instanciaModal.current?.show();
  }

  function actualizarFormulario(campo, valor) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
    setClasificacionGuardada(false);
  }

  function guardarClasificacion() {
    if (!alertaSeleccionada) return;

    setAlertas((actual) =>
      actual.map((alerta) =>
        alerta.id === alertaSeleccionada.id
          ? {
              ...alerta,
              tipoCentral: formulario.tipo,
              prioridadCentral: formulario.prioridad,
              nivel: formulario.nivel,
              zona: formulario.zona,
              estado:
                alerta.estado === 'Nueva'
                  ? 'Clasificada'
                  : alerta.estado,
            }
          : alerta
      )
    );

    setAlertaSeleccionada((actual) => ({
      ...actual,
      tipoCentral: formulario.tipo,
      prioridadCentral: formulario.prioridad,
      nivel: formulario.nivel,
      zona: formulario.zona,
      estado:
        actual.estado === 'Nueva' ? 'Clasificada' : actual.estado,
    }));

    setClasificacionGuardada(true);
  }

  function agregarNota() {
    const texto = formulario.nota.trim();

    if (!texto || !alertaSeleccionada) return;

    const nuevaNota = {
      id: `${Date.now()}`,
      texto,
      fecha: new Date().toLocaleString('es-CO'),
    };

    const nuevasNotas = [...notas, nuevaNota];

    setNotas(nuevasNotas);
    setFormulario((actual) => ({ ...actual, nota: '' }));

    setAlertas((actual) =>
      actual.map((alerta) =>
        alerta.id === alertaSeleccionada.id
          ? { ...alerta, notasCentral: nuevasNotas }
          : alerta
      )
    );
  }

  function asignarPatrullero() {
    if (!alertaSeleccionada || !patrulleroSeleccionado) return;

    setAlertas((actual) =>
      actual.map((alerta) =>
        alerta.id === alertaSeleccionada.id
          ? {
              ...alerta,
              patrulleroId: patrulleroSeleccionado,
              patrulleroNombre: patrulleroSeleccionado,
              estado: 'Asignada',
              sinRespuesta: false,
            }
          : alerta
      )
    );

    setAlertaSeleccionada((actual) => ({
      ...actual,
      patrulleroId: patrulleroSeleccionado,
      patrulleroNombre: patrulleroSeleccionado,
      estado: 'Asignada',
      sinRespuesta: false,
    }));
  }

  function cambiarEstado(alerta, estado) {
    setAlertas((actual) =>
      actual.map((item) =>
        item.id === alerta.id ? { ...item, estado } : item
      )
    );
  }

  function renderPrioridad(prioridad) {
    const clase = normalizar(prioridad).replace('í', 'i');

    return (
      <span className={`al-prioridad al-prioridad-${clase}`}>
        {prioridad || 'Sin definir'}
      </span>
    );
  }

  function renderEstado(estado) {
    const clase = normalizar(estado)
      .replaceAll(' ', '-')
      .replace('ó', 'o');

    return (
      <span className={`badge-dash al-estado-${clase}`}>
        {estado || 'Nueva'}
      </span>
    );
  }

  return (
    <>
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="search-dash flex-grow-1 d-flex align-items-center input-group">
          <span className="input-group-text bg-transparent border-0">
            <i className="bi bi-search" />
          </span>

          <input
            type="text"
            className="form-control border-0 bg-transparent"
            placeholder="Buscar por caso, tipo, dirección o barrio…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn icon-btn-dash rounded-circle bg-white border-0"
          aria-label="Notificaciones"
          title="Notificaciones"
        >
          <i className="bi bi-bell" />
          <span className="icon-dot-dash" />
        </button>

        <span className="avatar-dash">CR</span>
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h1 className="page-title-dash">
            <i className="bi bi-exclamation-triangle me-2" />
            Alertas entrantes
          </h1>

          <p className="info-sub-dash mb-0">
            Reportes recibidos desde los ciudadanos, listos para analizar,
            clasificar y despachar.
          </p>
        </div>

        <span className="badge-dash badge-red-dash" id="badgeNuevas">
          {totalNuevas} alertas nuevas
        </span>
      </div>

      {/* Indicadores */}
      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3">
          <div className="kpi-central-card tono-petroleo">
            <div className="kpi-central-icono">
              <i className="bi bi-inboxes" />
            </div>
            <div className="kpi-central-info">
              <span className="kpi-central-titulo">Alertas activas</span>
              <strong className="kpi-central-valor">{totalActivas}</strong>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="kpi-central-card tono-rojo">
            <div className="kpi-central-icono">
              <i className="bi bi-fire" />
            </div>
            <div className="kpi-central-info">
              <span className="kpi-central-titulo">Prioridad crítica/alta</span>
              <strong className="kpi-central-valor">{totalCriticas}</strong>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="kpi-central-card tono-ambar">
            <div className="kpi-central-icono">
              <i className="bi bi-hourglass-split" />
            </div>
            <div className="kpi-central-info">
              <span className="kpi-central-titulo">Sin clasificar</span>
              <strong className="kpi-central-valor">{totalSinClasificar}</strong>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="kpi-central-card tono-azul">
            <div className="kpi-central-icono">
              <i className="bi bi-wifi-off" />
            </div>
            <div className="kpi-central-info">
              <span className="kpi-central-titulo">Sin respuesta</span>
              <strong className="kpi-central-valor">{totalSinRespuesta}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="al-filterbar">
        {FILTROS.map((filtro) => (
          <button
            key={filtro.valor}
            type="button"
            className={[
              'al-chip',
              filtroActivo === filtro.valor ? 'active' : '',
              filtro.peligro ? 'al-chip-danger' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => setFiltroActivo(filtro.valor)}
          >
            {filtro.texto}
          </button>
        ))}
      </div>

      {/* Lista de alertas */}
      <div className="row g-3" id="listaAlertas">
        {alertasFiltradas.map((alerta) => (
          <div className="col-12 col-xl-6" key={alerta.id}>
            <article className="al-card">
              <div className="al-card-header">
                <div>
                  <span className="al-modal-caso">
                    {alerta.caso || `#WL-${alerta.id}`}
                  </span>
                  <h5 className="al-card-titulo">
                    {alerta.tipoCentral || alerta.tipo || 'Alerta recibida'}
                  </h5>
                </div>

                {renderEstado(alerta.estado)}
              </div>

              <div className="al-card-body">
                <div className="al-card-dato">
                  <i className="bi bi-geo-alt" />
                  <span>
                    {alerta.direccion || alerta.ubicacion || alerta.barrio || 'Ubicación no especificada'}
                  </span>
                </div>

                <div className="al-card-dato">
                  <i className="bi bi-clock" />
                  <span>{alerta.fechaHora || alerta.hora || 'Hora no disponible'}</span>
                </div>

                <div className="al-card-dato">
                  <i className="bi bi-flag" />
                  {renderPrioridad(alerta.prioridadCentral || alerta.prioridad)}
                </div>
              </div>

              <div className="al-card-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => cambiarEstado(alerta, 'En atención')}
                >
                  <i className="bi bi-play-circle me-1" />
                  En atención
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-cv-azul"
                  onClick={() => abrirGestion(alerta)}
                >
                  Gestionar alerta
                  <i className="bi bi-arrow-right ms-2" />
                </button>
              </div>
            </article>
          </div>
        ))}
      </div>

      {alertasFiltradas.length === 0 && (
        <div className="al-empty">
          <i className="bi bi-inbox" />
          <p className="mb-0">
            {alertas.length === 0
              ? 'Todavía no hay alertas para mostrar.'
              : 'No hay alertas que coincidan con este filtro.'}
          </p>
        </div>
      )}

      {/* Modal de gestión */}
      <div
        className="modal fade"
        id="modalGestionAlerta"
        tabIndex="-1"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content al-modal">
            <div className="modal-header al-modal-header">
              <div>
                <p className="al-modal-caso mb-0">
                  {alertaSeleccionada?.caso || `#WL-${alertaSeleccionada?.id ?? '—'}`}
                </p>
                <h5 className="modal-title al-modal-title">
                  Gestionar alerta
                </h5>
              </div>

              <div className="d-flex align-items-center gap-2">
                {renderEstado(alertaSeleccionada?.estado)}
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Cerrar"
                />
              </div>
            </div>

            <div className="modal-body">
              {alertaSeleccionada && esSinRespuesta(alertaSeleccionada) && (
                <div className="al-alert-warning">
                  <i className="bi bi-exclamation-triangle-fill" />
                  <span>El patrullero no ha confirmado la atención.</span>
                </div>
              )}

              {/* Reporte original */}
              <section className="al-section">
                <h6 className="al-section-title">
                  <i className="bi bi-person-lines-fill" />
                  Reporte del ciudadano
                  <span className="al-locked">
                    <i className="bi bi-lock-fill" /> original, no editable
                  </span>
                </h6>

                <div className="al-report-grid">
                  <div>
                    <span className="label-col-dash">Tipo reportado</span>
                    <p className="mb-0">{alertaSeleccionada?.tipo || '—'}</p>
                  </div>
                  <div>
                    <span className="label-col-dash">Fecha y hora</span>
                    <p className="mb-0">{alertaSeleccionada?.fechaHora || '—'}</p>
                  </div>
                  <div>
                    <span className="label-col-dash">Ubicación</span>
                    <p className="mb-0">
                      {alertaSeleccionada?.direccion || alertaSeleccionada?.ubicacion || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="label-col-dash">Prioridad inicial</span>
                    <p className="mb-0">{alertaSeleccionada?.prioridad || '—'}</p>
                  </div>
                  <div>
                    <span className="label-col-dash">Contacto</span>
                    <p className="mb-0">{alertaSeleccionada?.contacto || '—'}</p>
                  </div>
                  <div>
                    <span className="label-col-dash">Distancia a patrulleros</span>
                    <p className="mb-0">{alertaSeleccionada?.distancia || '—'}</p>
                  </div>
                </div>

                <div className="al-desc-box mt-2">
                  <i className="bi bi-quote" />
                  <p className="mb-0">
                    {alertaSeleccionada?.descripcion || 'Sin descripción disponible.'}
                  </p>
                </div>

                <div className="al-evidence">
                  <i className="bi bi-paperclip" />{' '}
                  {alertaSeleccionada?.evidencias || 'Sin evidencias adjuntas'}
                </div>
              </section>

              {/* Clasificación */}
              <section className="al-section">
                <h6 className="al-section-title">
                  <i className="bi bi-tags-fill" />
                  Clasificación de Central
                </h6>

                <div className="row g-2">
                  <div className="col-sm-6">
                    <label className="al-label" htmlFor="cTipo">Tipo de caso</label>
                    <select
                      id="cTipo"
                      className="form-select form-select-sm"
                      value={formulario.tipo}
                      onChange={(e) => actualizarFormulario('tipo', e.target.value)}
                    >
                      {['Robo', 'Accidente', 'Persona sospechosa', 'Violencia', 'Emergencia', 'Alteración del orden público', 'Otro'].map((tipo) => (
                        <option key={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-sm-6">
                    <label className="al-label" htmlFor="cPrioridad">Prioridad</label>
                    <select
                      id="cPrioridad"
                      className="form-select form-select-sm"
                      value={formulario.prioridad}
                      onChange={(e) => actualizarFormulario('prioridad', e.target.value)}
                    >
                      {['Baja', 'Media', 'Alta', 'Crítica'].map((prioridad) => (
                        <option key={prioridad}>{prioridad}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-sm-6">
                    <label className="al-label" htmlFor="cNivel">Nivel de atención</label>
                    <select
                      id="cNivel"
                      className="form-select form-select-sm"
                      value={formulario.nivel}
                      onChange={(e) => actualizarFormulario('nivel', e.target.value)}
                    >
                      {['Atención normal', 'Atención prioritaria', 'Atención inmediata'].map((nivel) => (
                        <option key={nivel}>{nivel}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-sm-6">
                    <label className="al-label" htmlFor="cZona">Zona (comuna / barrio / sector)</label>
                    <input
                      id="cZona"
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Ej. Comuna 3 — Centro"
                      value={formulario.zona}
                      onChange={(e) => actualizarFormulario('zona', e.target.value)}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2">
                  {clasificacionGuardada && (
                    <span className="al-saved-hint">
                      <i className="bi bi-check-circle-fill" /> Clasificación guardada
                    </span>
                  )}

                  <button
                    type="button"
                    className="btn btn-cv-azul btn-sm ms-auto"
                    onClick={guardarClasificacion}
                  >
                    Guardar clasificación
                  </button>
                </div>
              </section>

              {/* Notas de Central */}
              <section className="al-section">
                <h6 className="al-section-title">
                  <i className="bi bi-journal-plus" />
                  Información agregada por Central
                </h6>

                <p className="al-hint">
                  Observaciones, hallazgos o contexto recopilado durante la gestión.
                </p>

                <div className="al-notas">
                  {notas.map((nota) => (
                    <div className="al-nota" key={nota.id}>
                      <p className="mb-1">{nota.texto}</p>
                      <small>{nota.fecha}</small>
                    </div>
                  ))}
                </div>

                <div className="d-flex gap-2 mt-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Escribe una observación..."
                    value={formulario.nota}
                    onChange={(e) => actualizarFormulario('nota', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        agregarNota();
                      }
                    }}
                  />

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm text-nowrap"
                    onClick={agregarNota}
                  >
                    Agregar
                  </button>
                </div>
              </section>

              {/* Despacho */}
              <section className="al-section">
                <h6 className="al-section-title">
                  <i className="bi bi-broadcast-pin" />
                  Despacho
                </h6>

                {alertaSeleccionada?.patrulleroNombre && (
                  <div className="al-asignado-actual">
                    <i className="bi bi-car-front-fill" />
                    <div>
                      <p className="mb-0 fw-bold">
                        {alertaSeleccionada.patrulleroNombre}
                      </p>
                      <p className="mb-0 al-meta-inline">Patrullero asignado</p>
                    </div>
                  </div>
                )}

                <p className="al-hint mb-2">
                  Selecciona un patrullero disponible para atender el caso.
                </p>

                <div className="al-patrulleros">
                  <label className="al-label" htmlFor="cPatrullero">
                    Patrullero o unidad
                  </label>
                  <input
                    id="cPatrullero"
                    className="form-control form-control-sm"
                    placeholder="Ingresa el identificador del patrullero"
                    value={patrulleroSeleccionado}
                    onChange={(e) => setPatrulleroSeleccionado(e.target.value)}
                  />
                </div>

                <div className="d-flex justify-content-end mt-2">
                  <button
                    type="button"
                    className="btn btn-cv-azul btn-sm"
                    disabled={!patrulleroSeleccionado.trim()}
                    onClick={asignarPatrullero}
                  >
                    Asignar patrullero
                  </button>
                </div>
              </section>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Alertas;
