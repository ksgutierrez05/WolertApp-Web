import { useState } from 'react';
import PageHeader from '../../Components/Patrullero/Pageheader';
import Kpis from '../../Components/Patrullero/Kpicard';
import '../../css/Policia/Patrullero/css/alertas.css';

function Alertas() {
  const [filtro, setFiltro] = useState('todas');

  return (
    <div className="container-fluid mis-alertas-patrullero">
      {/* Encabezado de página */}
      <PageHeader
        titulo="Mis Alertas"
        descripcion="Alertas que la Central te asignó, ordenadas por prioridad."
      />

      {/* Indicadores: las tarjetas se definen en Kpisconfig.js */}
      <section aria-label="Indicadores de alertas">
        <Kpis grupo="alertas" />
      </section>

      {/* Filtros por prioridad */}
      <div
        className="al-filterbar"
        role="group"
        aria-label="Filtrar alertas por prioridad"
      >
        <button
          type="button"
          className={`al-chip ${filtro === 'todas' ? 'active' : ''}`}
          onClick={() => setFiltro('todas')}
          aria-pressed={filtro === 'todas'}
        >
          Todas
        </button>

        <button
          type="button"
          className={`al-chip ${filtro === 'alta' ? 'active' : ''}`}
          onClick={() => setFiltro('alta')}
          aria-pressed={filtro === 'alta'}
        >
          Alta
        </button>

        <button
          type="button"
          className={`al-chip ${filtro === 'media' ? 'active' : ''}`}
          onClick={() => setFiltro('media')}
          aria-pressed={filtro === 'media'}
        >
          Media
        </button>

        <button
          type="button"
          className={`al-chip ${filtro === 'baja' ? 'active' : ''}`}
          onClick={() => setFiltro('baja')}
          aria-pressed={filtro === 'baja'}
        >
          Baja
        </button>
      </div>

      {/* Lista de alertas */}
      <div className="al-list">
        <div className="card-panel-dash al-vacio">
          <span className="al-vacio-icono">
            <i className="bi bi-inbox" aria-hidden="true" />
          </span>

          <h3>No hay alertas asignadas</h3>

          <p>
            Las alertas que la Central te asigne aparecerán aquí
            para consultar sus detalles.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Alertas;