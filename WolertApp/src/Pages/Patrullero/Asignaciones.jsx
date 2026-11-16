
import { useMemo, useState } from 'react';
import PageHeader from '../../Components/Patrullero/Pageheader';
import Kpis from '../../Components/Patrullero/Kpicard';
import usePatrullero from '../../Utlis/usePatrullero';

import {
  EsHoy,
  FinalizarAsignacion,
  FormatearFecha,
  RegistrarLlegada
} from '../../Services/PoliciaService';

import '../../css/Policia/Patrullero/css/asignaciones.css';

export default function MisAsignaciones() {
  const { datos, cargando, error, recargar } = usePatrullero();

  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState('');
  const [fecha, setFecha] = useState('');
  const [seleccionId, setSeleccionId] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [accionError, setAccionError] = useState('');
  const [accionOk, setAccionOk] = useState('');

  const asignaciones = datos?.asignaciones || [];

  const alertasPorId = useMemo(
    () => new Map(
      (datos?.alertas || []).map(
        a => [Number(a.idAlerta), a]
      )
    ),
    [datos]
  );

  const seleccion = asignaciones.find(
    a => a.idAsignacion === seleccionId
  ) || null;

  const opciones = [
    ['todas', 'Todas'],
    ['activas', 'Activas'],
    ['asignadas', 'Asignadas'],
    ['resueltas', 'Resueltas']
  ];

  const filtradas = asignaciones.filter(a => {
    const estado = String(
      a.estadoAsignacion || ''
    ).toUpperCase();

    if (
      filtro === 'activas' &&
      estado !== 'EN_ATENCION'
    ) return false;

    if (
      filtro === 'asignadas' &&
      estado !== 'ASIGNADA'
    ) return false;

    if (
      filtro === 'resueltas' &&
      estado !== 'FINALIZADA'
    ) return false;

    if (
      busqueda &&
      !String(a.idAlerta).includes(busqueda) &&
      !String(a.idAsignacion).includes(busqueda)
    ) return false;

    if (
      tipo &&
      alertasPorId.get(Number(a.idAlerta))?.tipo !== tipo
    ) return false;

    if (fecha) {
      if (!a.fecha) return false;

      const f = new Date(a.fecha);

      if (Number.isNaN(f.getTime())) return false;

      const fechaAsignacion = [
        f.getFullYear(),
        String(f.getMonth() + 1).padStart(2, '0'),
        String(f.getDate()).padStart(2, '0')
      ].join('-');

      if (fechaAsignacion !== fecha) return false;
    }

    return true;
  });

  const tipos = [
    ...new Set(
      (datos?.alertas || [])
        .map(a => a.tipo)
        .filter(Boolean)
    )
  ];

  const valores = {
    total: asignaciones.filter(
      a => a.estadoAsignacion === 'EN_ATENCION'
    ).length,
    enCamino: '—',
    enSitio: '—',
    resueltasHoy: (datos?.atenciones || []).filter(
      a => a.estadoFinal === 'FINALIZADA' &&
        EsHoy(a.fechaAtencion)
    ).length
  };

  async function ejecutar(accion) {
    if (!seleccion) return;

    setOcupado(true);
    setAccionError('');
    setAccionOk('');

    try {
      if (accion === 'llegada') {
        await RegistrarLlegada(seleccion.idAsignacion);
      } else {
        await FinalizarAsignacion(seleccion.idAsignacion);
      }

      await recargar();

      setAccionOk('Asignación actualizada correctamente.');
    } catch (e) {
      setAccionError(e.message);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="container-fluid mis-asignaciones-patrullero">
      <PageHeader
        titulo="Mis Asignaciones"
        descripcion="Asignaciones que la Central de Radio dio a tu unidad."
      />

      <section aria-label="Indicadores de asignaciones">
        <Kpis grupo="atenciones" valores={valores} />
      </section>

      {cargando && (
        <p role="status">Cargando asignaciones...</p>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button type="button" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}

      <div className="row g-4 align-items-start">
        {/* Lista de asignaciones */}
        <section
          className="col-lg-5"
          aria-label="Lista de asignaciones"
        >
          <div className="card-panel-dash as-panel">
            <div
              className="as-filterbar"
              role="group"
              aria-label="Filtrar asignaciones por estado"
            >
              {opciones.map(([clave, etiqueta]) => (
                <button
                  type="button"
                  key={clave}
                  className={`as-chip ${filtro === clave ? 'active' : ''}`}
                  onClick={() => setFiltro(clave)}
                  aria-pressed={filtro === clave}
                >
                  {etiqueta}
                </button>
              ))}
            </div>

            <div className="as-buscador">
              <i
                className="bi bi-search"
                aria-hidden="true"
              />

              <input
                type="text"
                className="as-campo"
                placeholder="Buscar por número de caso…"
                aria-label="Buscar por número de caso"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>

            <div className="as-filtros-extra">
              <select
                className="as-campo"
                aria-label="Tipo de alerta"
                value={tipo}
                onChange={e => setTipo(e.target.value)}
              >
                <option value="">Tipo de alerta</option>

                {tipos.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="as-campo"
                aria-label="Filtrar por fecha"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
              />
            </div>

            {!cargando && !error && (
              filtradas.length === 0 ? (
                <div className="as-vacio">
                  <span className="as-vacio-icono">
                    <i
                      className="bi bi-clipboard2-check"
                      aria-hidden="true"
                    />
                  </span>

                  <h3>No hay asignaciones</h3>

                  <p>
                    La Central todavía no ha asignado casos
                    con esos filtros.
                  </p>
                </div>
              ) : (
                <div className="d-grid gap-2 mt-3">
                  {filtradas.map(a => (
                    <button
                      type="button"
                      key={a.idAsignacion}
                      className={`btn text-start border ${
                        seleccionId === a.idAsignacion
                          ? 'btn-light'
                          : 'btn-outline-secondary'
                      }`}
                      onClick={() => setSeleccionId(a.idAsignacion)}
                    >
                      <strong>
                        Asignación #{a.idAsignacion}
                      </strong>

                      <div>
                        Alerta #{a.idAlerta} ·{' '}
                        {alertasPorId.get(Number(a.idAlerta))?.tipo ||
                          'Sin tipo'}
                      </div>

                      <small>
                        {a.estadoAsignacion}
                        {' · '}
                        {FormatearFecha(a.fecha)}
                      </small>
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        </section>

        {/* Detalle */}
        <section
          className="col-lg-7"
          aria-label="Detalle de la asignación"
        >
          <div className="card-panel-dash as-detalle">
            <div className="as-detalle-cabecera">
              <h2 className="as-detalle-titulo">
                <i
                  className="bi bi-info-circle"
                  aria-hidden="true"
                />
                {' '}Detalle de la asignación
              </h2>

              <span className="as-estado-vacio">
                {seleccion?.estadoAsignacion || 'Sin selección'}
              </span>
            </div>

            {!seleccion ? (
              <div className="as-detalle-vacio">
                <span className="as-vacio-icono as-vacio-icono--grande">
                  <i
                    className="bi bi-cursor"
                    aria-hidden="true"
                  />
                </span>

                <h3>Selecciona una asignación</h3>

                <p>
                  Elige una de la lista para ver su detalle
                  y actualizar su estado.
                </p>
              </div>
            ) : (
              <div className="p-3">
                <h3 className="h6">
                  Asignación #{seleccion.idAsignacion}
                  {' · '}
                  Alerta #{seleccion.idAlerta}
                </h3>

                <p>
                  <strong>Unidad:</strong>{' '}
                  {seleccion.unidadNombre || '—'}
                </p>

                <p>
                  <strong>Fecha:</strong>{' '}
                  {FormatearFecha(seleccion.fecha)}
                </p>

                <p>
                  <strong>Tipo:</strong>{' '}
                  {alertasPorId.get(Number(seleccion.idAlerta))?.tipo ||
                    '—'}
                </p>

                <p>
                  <strong>Observación:</strong>{' '}
                  {seleccion.observacion || 'Sin observaciones'}
                </p>

                <p>
                  <strong>Descripción de la alerta:</strong>{' '}
                  {alertasPorId.get(Number(seleccion.idAlerta))
                    ?.descripcion ||
                    'No disponible en las 200 alertas recientes'}
                </p>
              </div>
            )}

            <div
              className="as-pasos"
              aria-label="Avance de la asignación"
            >
              {[
                ['bi-send', 'Asignada'],
                ['bi-geo-alt', 'En atención'],
                ['bi-check2-circle', 'Finalizada']
              ].map(([icono, texto]) => (
                <div className="as-paso" key={texto}>
                  <span className="as-paso-punto">
                    <i
                      className={`bi ${icono}`}
                      aria-hidden="true"
                    />
                  </span>

                  <span className="as-paso-texto">
                    {texto}
                  </span>
                </div>
              ))}
            </div>

            {accionError && (
              <p className="alert alert-danger" role="alert">
                {accionError}
              </p>
            )}

            {accionOk && (
              <p className="alert alert-success" role="status">
                {accionOk}
              </p>
            )}

            <div className="as-acciones">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled
                title="No existe endpoint para marcar En camino"
              >
                <i
                  className="bi bi-signpost-split me-1"
                  aria-hidden="true"
                />
                Voy en camino
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={
                  !seleccion ||
                  seleccion.estadoAsignacion !== 'ASIGNADA' ||
                  ocupado
                }
                onClick={() => ejecutar('llegada')}
              >
                <i
                  className="bi bi-geo-alt me-1"
                  aria-hidden="true"
                />
                Llegué al sitio
              </button>

              <button
                type="button"
                className="btn btn-cv-azul btn-sm"
                disabled={
                  !seleccion ||
                  seleccion.estadoAsignacion !== 'EN_ATENCION' ||
                  ocupado
                }
                onClick={() => ejecutar('finalizar')}
                title="Requiere atención FINALIZADA registrada"
              >
                <i
                  className="bi bi-check2-circle me-1"
                  aria-hidden="true"
                />
                Marcar como resuelta
              </button>
            </div>

            <small className="d-block mt-2">
              Para finalizar, primero debe existir una atención
              FINALIZADA. El backend valida esta condición.
            </small>
          </div>
        </section>
      </div>
    </div>
  );
}
