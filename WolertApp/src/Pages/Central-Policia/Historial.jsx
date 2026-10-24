
import Topbar from '../../Components/Central-policia/Topbar';
import Kpis from '../../Components/Central-policia/Kpicard';
import '../../css/Policia/central-policia/css/historial.css';

function Historial() {
  return (
    <>
      <Topbar placeholder="Buscar caso..." />

      <main className="historial-main">
        {/* Encabezado */}
        <header className="historial-header">
          <div>
            <span className="historial-kicker">
              <i className="bi bi-record-circle-fill me-2" />
              CENTRAL DE RADIO
            </span>

            <h1>
              <i className="bi bi-clock-history me-2" />
              Historial
            </h1>

            <p>Consulta el registro histórico de casos.</p>
          </div>
        </header>

        {/* KPI compartidos */}
        <Kpis
          grupo="historial"
          valores={{
            totalCasos: 0,
            casosResueltos: 0,
            casosCriticos: 0,
            casosConInforme: 0,
          }}
        />

        {/* Filtros: únicamente diseño */}
        <section className="historial-panel historial-filtros-panel">
          <div className="historial-filtros">
            <div className="historial-field historial-busqueda">
              <i className="bi bi-search" />
              <input
                type="text"
                className="form-control historial-input"
                placeholder="Buscar por número, descripción o fecha..."
                aria-label="Buscar casos"
              />
            </div>

            <div className="historial-field">
              <i className="bi bi-calendar3" />
              <select
                className="form-select historial-input"
                defaultValue=""
                aria-label="Rango de fechas"
              >
                <option value="" disabled>Rango de fechas</option>
                <option>Hoy</option>
                <option>Últimos 7 días</option>
                <option>Últimos 30 días</option>
                <option>Personalizado</option>
              </select>
            </div>

            <div className="historial-field">
              <i className="bi bi-folder2" />
              <select
                className="form-select historial-input"
                defaultValue=""
                aria-label="Estado"
              >
                <option value="" disabled>Estado</option>
                <option>Pendiente</option>
                <option>En atención</option>
                <option>Resuelto</option>
                <option>Cerrado</option>
              </select>
            </div>

            <div className="historial-field">
              <i className="bi bi-list-ul" />
              <select
                className="form-select historial-input"
                defaultValue=""
                aria-label="Categoría"
              >
                <option value="" disabled>Categoría</option>
                <option>Robo</option>
                <option>Accidente</option>
                <option>Emergencia</option>
                <option>Persona sospechosa</option>
              </select>
            </div>

            <button
              type="button"
              className="btn historial-btn-filtrar"
              disabled
            >
              <i className="bi bi-funnel me-2" />
              Filtrar
            </button>
          </div>
        </section>

        {/* Tabla sin datos */}
        <section className="historial-contenido">
          <div className="historial-table-panel">
            <div className="table-responsive">
              <table className="table historial-table mb-0">
                <thead>
                  <tr>
                    <th>FECHA / HORA</th>
                    <th>NÚMERO DE CASO</th>
                    <th>DESCRIPCIÓN</th>
                    <th>ESTADO</th>
                    <th>CATEGORÍA</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>

                <tbody>
                  {/* Aquí se mostrarán los casos cuando exista backend */}
                </tbody>
              </table>
            </div>

            <div className="historial-empty">
              <i className="bi bi-file-earmark-text historial-empty-icon" />

              <h3>No hay resultados</h3>

              <p>
                Aquí aparecerán los casos del historial.
              </p>
            </div>
          </div>

          {/* Panel visual de detalle */}
          <aside className="historial-detalle-panel">
            <div className="historial-detalle-header">
              <h2>Detalle del caso</h2>
              <button
                type="button"
                className="historial-detalle-cerrar"
                aria-label="Cerrar detalle"
                disabled
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="historial-detalle-body">
              {[
                'Número de caso',
                'Fecha / Hora',
                'Descripción',
                'Estado',
                'Categoría',
                'Unidad asignada',
                'Observaciones',
              ].map((campo) => (
                <div className="historial-detalle-item" key={campo}>
                  <span>{campo}:</span>
                  <strong>—</strong>
                </div>
              ))}
            </div>

            <div className="historial-detalle-footer">
              <button
                type="button"
                className="btn historial-btn-cerrar"
                disabled
              >
                Cerrar
              </button>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}

export default Historial;
