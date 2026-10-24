import { useState } from 'react';
import PageHeader from '../../Components/Patrullero/Pageheader';
import Kpis from '../../Components/Patrullero/Kpicard';
import '../../css/Policia/Patrullero/css/asignaciones.css';

function MisAsignaciones() {
  const [filtro, setFiltro] = useState('todas');

  return (
    <div className="container-fluid mis-asignaciones-patrullero">
      <PageHeader
        titulo="Mis Asignaciones"
        descripcion="Asignaciones que la Central de Radio le dio a tu unidad y que atiendes en campo."
      />

      {/* Indicadores: las tarjetas se definen en Kpisconfig.js */}
      <section aria-label="Indicadores de asignaciones">
        <Kpis grupo="asignaciones" />
      </section>

      <div className="row g-4 align-items-start">
        {/* Lista */}
        <section className="col-lg-5" aria-label="Lista de asignaciones">
          <div className="card-panel-dash as-panel">
            <div
              className="as-filterbar"
              role="group"
              aria-label="Filtrar asignaciones por estado"
            >
              <button
                type="button"
                className={`as-chip ${filtro === 'todas' ? 'active' : ''}`}
                onClick={() => setFiltro('todas')}
                aria-pressed={filtro === 'todas'}
              >
                Todas
              </button>

              <button
                type="button"
                className={`as-chip ${filtro === 'activas' ? 'active' : ''}`}
                onClick={() => setFiltro('activas')}
                aria-pressed={filtro === 'activas'}
              >
                Activas
              </button>

              <button
                type="button"
                className={`as-chip ${filtro === 'asignadas' ? 'active' : ''}`}
                onClick={() => setFiltro('asignadas')}
                aria-pressed={filtro === 'asignadas'}
              >
                Asignadas
              </button>

              <button
                type="button"
                className={`as-chip ${filtro === 'en-camino' ? 'active' : ''}`}
                onClick={() => setFiltro('en-camino')}
                aria-pressed={filtro === 'en-camino'}
              >
                En camino
              </button>

              <button
                type="button"
                className={`as-chip ${filtro === 'en-sitio' ? 'active' : ''}`}
                onClick={() => setFiltro('en-sitio')}
                aria-pressed={filtro === 'en-sitio'}
              >
                En el sitio
              </button>

              <button
                type="button"
                className={`as-chip ${filtro === 'resueltas' ? 'active' : ''}`}
                onClick={() => setFiltro('resueltas')}
                aria-pressed={filtro === 'resueltas'}
              >
                Resueltas
              </button>
            </div>

            <div className="as-buscador">
              <i className="bi bi-search" aria-hidden="true" />
              <input
                type="text"
                className="as-campo"
                placeholder="Buscar por número de caso…"
                aria-label="Buscar por número de caso"
              />
            </div>

            <div className="as-filtros-extra">
              <select className="as-campo" aria-label="Tipo de alerta" defaultValue="">
                <option value="">Tipo de alerta</option>
              </select>

              <input
                type="date"
                className="as-campo"
                aria-label="Filtrar por fecha"
              />
            </div>

            <div className="as-vacio">
              <span className="as-vacio-icono">
                <i className="bi bi-clipboard2-check" aria-hidden="true" />
              </span>

              <h3>No hay asignaciones</h3>

              <p>
                Las asignaciones de tu unidad aparecerán aquí
                cuando la Central te las envíe.
              </p>
            </div>
          </div>
        </section>

        {/* Detalle */}
        <section className="col-lg-7" aria-label="Detalle de la asignación">
          <div className="card-panel-dash as-detalle">
            <div className="as-detalle-cabecera">
              <h2 className="as-detalle-titulo">
                <i className="bi bi-info-circle" aria-hidden="true" />
                Detalle de la asignación
              </h2>

              <span className="as-estado-vacio">Sin selección</span>
            </div>

            <div className="as-detalle-vacio">
              <span className="as-vacio-icono as-vacio-icono--grande">
                <i className="bi bi-cursor" aria-hidden="true" />
              </span>

              <h3>Selecciona una asignación</h3>

              <p>
                Elige una de la lista para ver su detalle y
                actualizar su estado.
              </p>
            </div>

            <div className="as-pasos" aria-label="Avance de la asignación">
              <div className="as-paso">
                <span className="as-paso-punto">
                  <i className="bi bi-send" aria-hidden="true" />
                </span>
                <span className="as-paso-texto">Asignada</span>
              </div>

              <div className="as-paso">
                <span className="as-paso-punto">
                  <i className="bi bi-signpost-split" aria-hidden="true" />
                </span>
                <span className="as-paso-texto">En camino</span>
              </div>

              <div className="as-paso">
                <span className="as-paso-punto">
                  <i className="bi bi-geo-alt" aria-hidden="true" />
                </span>
                <span className="as-paso-texto">En el sitio</span>
              </div>

              <div className="as-paso">
                <span className="as-paso-punto">
                  <i className="bi bi-check2-circle" aria-hidden="true" />
                </span>
                <span className="as-paso-texto">Resuelta</span>
              </div>
            </div>

            <div className="as-acciones">
              <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
                <i className="bi bi-signpost-split me-1" aria-hidden="true" />
                Voy en camino
              </button>

              <button type="button" className="btn btn-outline-secondary btn-sm" disabled>
                <i className="bi bi-geo-alt me-1" aria-hidden="true" />
                Llegué al sitio
              </button>

              <button type="button" className="btn btn-cv-azul btn-sm" disabled>
                <i className="bi bi-check2-circle me-1" aria-hidden="true" />
                Marcar como resuelta
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default MisAsignaciones;