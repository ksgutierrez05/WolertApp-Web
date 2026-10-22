
import { useState } from 'react';
import Topbar from '../../Components/Administrador-policia/Topbar';
import Kpis from '../../Components/Administrador-policia/Kpicard';
import '../../css/Policia/administrador-policia/css/reportes.css';

function Reportes() {
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState('');
  const [estado, setEstado] = useState('');
  const [barrio, setBarrio] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const limpiarFiltros = () => {
    setBusqueda('');
    setTipo('');
    setEstado('');
    setBarrio('');
    setDesde('');
    setHasta('');
  };

  const exportarCsv = () => {
    // La exportación se conectará cuando estén disponibles los datos reales.
  };

  const hayFiltros = Boolean(
    busqueda || tipo || estado || barrio || desde || hasta
  );

  return (
    <>
      <Topbar placeholder="Buscar por alerta, barrio, unidad, policía..." />

      <main className="main-dash reportes-page">
        <div className="container-fluid">

          {/* Encabezado */}
          <div className="header-vista-dash mb-4">
            <div>
              <h1>Reportes del Sistema</h1>
              <p>Resumen general de actividad operativa.</p>
            </div>

            <button
              type="button"
              className="btn-cv-verde"
              onClick={exportarCsv}
            >
              <i className="bi bi-download" aria-hidden="true" />
              Exportar CSV
            </button>
          </div>

          {/* KPI compartidos */}
          <section id="kpisReportes" className="mb-4">
            <Kpis grupo="reportes" />
          </section>

          {/* Filtros */}
          <section className="filtros-toolbar-dash mb-3">
            <div className="search-dash flex-grow-1 d-flex align-items-center input-group">
              <span className="input-group-text bg-transparent border-0">
                <i className="bi bi-search" />
              </span>

              <input
                type="search"
                id="filtroBuscarReporte"
                className="form-control border-0 bg-transparent"
                placeholder="Buscar en la descripción de las alertas..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <select
              id="filtroTipo"
              className="form-select"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="">Todos los tipos</option>
            </select>

            <select
              id="filtroEstadoReporte"
              className="form-select"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="FINALIZADA">Finalizada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>

            <select
              id="filtroBarrioReporte"
              className="form-select"
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
            >
              <option value="">Todos los barrios</option>
            </select>

            <div className="rango-fechas-dash">
              <input
                type="date"
                id="filtroDesde"
                title="Desde"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />

              <span>—</span>

              <input
                type="date"
                id="filtroHasta"
                title="Hasta"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>

            {hayFiltros && (
              <button
                type="button"
                className="btn-limpiar-link-dash"
                onClick={limpiarFiltros}
              >
                <i className="bi bi-x-circle me-1" />
                Limpiar filtros
              </button>
            )}
          </section>

          {/* Tabla de reportes */}
          <section className="card-panel-dash mb-4">
            <div className="tabla-header-dash">
              <span style={{ width: '36px' }}>#</span>
              <span style={{ width: '110px' }}>Tipo</span>
              <span style={{ width: '110px' }}>Barrio</span>
              <span style={{ width: '130px' }}>Estado</span>
              <span style={{ width: '130px' }}>Fecha y hora</span>
              <span className="flex-grow-1">Descripción</span>
              <span style={{ width: '110px' }}>Unidad</span>
              <span style={{ width: '130px' }}>Atendida por</span>
            </div>

            <div className="table-responsive">
              <table className="tabla-dash">
                <tbody id="tablaReportes">
                  {/* Aquí se mostrarán los reportes reales. */}
                </tbody>
              </table>
            </div>

            <div className="tabla-vacio-dash">
              No hay reportes para mostrar.
            </div>

            <div className="tabla-footer-dash">
              <span className="celda-sub-dash" id="reportesMostrando" />

              <div
                className="paginacion-dash"
                id="reportesPaginacion"
              />
            </div>
          </section>

        </div>
      </main>
    </>
  );
}

export default Reportes;
