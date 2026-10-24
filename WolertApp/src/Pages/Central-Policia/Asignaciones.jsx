import { useState } from 'react';
import Topbar from '../../Components/Central-policia/Topbar';
import Kpis from '../../Components/Central-policia/Kpicard';
import '../../css/Policia/central-policia/css/asignaciones.css';

function Asignaciones() {
  const [pestanaActiva, setPestanaActiva] = useState('pendientes');
  const [busqueda, setBusqueda] = useState('');

  return (
    <>
      <Topbar
        placeholder="Buscar caso, patrullero o zona..."
        iniciales="OC"
      />

      <div className="container-fluid">
        {/* Encabezado */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <div>
            <h1 className="page-title-dash">
              Asignación
            </h1>

            <p className="text-muted mb-0" style={{ fontSize: '13.5px' }}>
              Selecciona una alerta clasificada y asigna el patrullero más
              adecuado. Las reasignaciones requieren confirmación.
            </p>
          </div>
        </div>

        {/* KPI */}
        <Kpis grupo="asignaciones" />

        {/* Cuerpo */}
        <div className="asig-layout">
          {/* Lista de alertas */}
          <section className="asig-col-list card-panel-dash">
            {/* Pestañas */}
            <div className="asig-tabs" role="tablist">
              <button
                type="button"
                className={`asig-tab ${
                  pestanaActiva === 'pendientes' ? 'active' : ''
                }`}
                role="tab"
                aria-selected={pestanaActiva === 'pendientes'}
                onClick={() => setPestanaActiva('pendientes')}
              >
                Por asignar
                <span className="asig-tab-count">—</span>
              </button>

              <button
                type="button"
                className={`asig-tab ${
                  pestanaActiva === 'seguimiento' ? 'active' : ''
                }`}
                role="tab"
                aria-selected={pestanaActiva === 'seguimiento'}
                onClick={() => setPestanaActiva('seguimiento')}
              >
                En seguimiento
                <span className="asig-tab-count">—</span>
              </button>
            </div>

            {/* Buscador */}
            <div className="asig-search">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-funnel" />
                </span>

                <input
                  type="text"
                  className="form-control"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Filtrar por número de caso, tipo o zona..."
                  aria-label="Filtrar alertas"
                />
              </div>
            </div>

            {/* Lista visual */}
            <div
              className={`asig-lista ${
                pestanaActiva !== 'pendientes' ? 'd-none' : ''
              }`}
              role="tabpanel"
            >
              <div className="estado-vacio-dash">
                <i className="bi bi-inbox" />
                <p className="mb-0">No hay alertas para mostrar.</p>
              </div>
            </div>

            <div
              className={`asig-lista ${
                pestanaActiva !== 'seguimiento' ? 'd-none' : ''
              }`}
              role="tabpanel"
            >
              <div className="estado-vacio-dash">
                <i className="bi bi-clipboard-check" />
                <p className="mb-0">No hay asignaciones en seguimiento.</p>
              </div>
            </div>
          </section>

          {/* Detalle */}
          <section
            className="asig-col-detalle card-panel-dash"
            aria-live="polite"
          >
            <div className="estado-vacio-dash">
              <i className="bi bi-broadcast-pin" />
              <p className="mb-0">Selecciona una alerta para ver su detalle.</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default Asignaciones;