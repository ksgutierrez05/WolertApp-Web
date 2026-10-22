
import { useState } from 'react';
import Topbar from '../../Components/Administrador-policia/Topbar';
import Kpis from '../../Components/Administrador-policia/Kpicard';
import '../../css/Policia/administrador-policia/css/historial.css';

function Historial() {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [rangoFecha, setRangoFecha] = useState('todos');
  const [unidadSeleccionada, setUnidadSeleccionada] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  const limpiarFiltros = () => {
    setEstadoSeleccionado('');
    setRangoFecha('todos');
    setUnidadSeleccionada('todas');
    setBusqueda('');
  };

  return (
    <>
      <Topbar placeholder="Buscar por alerta, barrio, unidad, policía..." />

      <main className="main-dash historial-page">
        <div className="container-fluid historial-contenido">

          {/* Encabezado */}
          <header className="historial-encabezado">
            <div className="historial-icono-principal">
              <i className="bi bi-clock-history" aria-hidden="true" />
            </div>

            <div className="historial-titulo-bloque">
              <h1>Historial de Atenciones</h1>
              <p>
                Registro completo de alertas atendidas por las unidades policiales.
              </p>
            </div>
          </header>

          {/* KPI existente, sin agregar datos */}
          <section
            className="historial-kpis"
            aria-label="Indicadores del historial"
          >
            <Kpis grupo="historial" />
          </section>

          {/* Filtros */}
          <section className="historial-panel-filtros">
            <div className="historial-panel-filtros-cabecera">
              <div className="historial-filtro-icono">
                <i className="bi bi-funnel" aria-hidden="true" />
              </div>

              <div>
                <h2>Filtros de historial</h2>
                <p>Refina la búsqueda por estado, fecha o unidad.</p>
              </div>

              <button
                type="button"
                className="historial-limpiar"
                onClick={limpiarFiltros}
              >
                <i className="bi bi-arrow-repeat" aria-hidden="true" />
                Limpiar filtros
              </button>
            </div>

            <div className="historial-panel-filtros-cuerpo">
              <label className="historial-control-filtro">
                <i className="bi bi-calendar3" aria-hidden="true" />
                <span>
                  <small>Rango de fechas</small>
                  <select
                    value={rangoFecha}
                    onChange={(e) => setRangoFecha(e.target.value)}
                  >
                    <option value="todos">Todos los rangos</option>
                    <option value="hoy">Hoy</option>
                    <option value="ayer">Ayer</option>
                  </select>
                </span>
              </label>

              <label className="historial-control-filtro">
                <i className="bi bi-people" aria-hidden="true" />
                <span>
                  <small>Unidad policial</small>
                  <select
                    value={unidadSeleccionada}
                    onChange={(e) => setUnidadSeleccionada(e.target.value)}
                  >
                    <option value="todas">Todas las unidades</option>
                  </select>
                </span>
              </label>

              <label className="historial-control-filtro">
                <i className="bi bi-clock-history" aria-hidden="true" />
                <span>
                  <small>Estado de la atención</small>
                  <select
                    value={estadoSeleccionado}
                    onChange={(e) => setEstadoSeleccionado(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value="FINALIZADA">Finalizadas</option>
                    <option value="EN_PROCESO">En proceso</option>
                    <option value="PENDIENTE">Pendientes</option>
                    <option value="CANCELADA">Canceladas</option>
                  </select>
                </span>
              </label>

              <label className="historial-control-busqueda">
                <i className="bi bi-search" aria-hidden="true" />
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por alerta, barrio, unidad..."
                  aria-label="Buscar atenciones"
                />
              </label>
            </div>
          </section>

          {/* Línea de tiempo: estructura visual vacía */}
          <section className="historial-panel-timeline">
            <div className="historial-timeline-cabecera">
              <div className="historial-timeline-icono">
                <i className="bi bi-clock" aria-hidden="true" />
              </div>

              <div>
                <h2>Línea de tiempo</h2>
                <p>Más recientes primero</p>
              </div>
            </div>

            <div className="historial-timeline-lista">
              {[1, 2, 3].map((elemento) => (
                <div
                  className="historial-timeline-placeholder"
                  key={elemento}
                  aria-hidden="true"
                >
                  <div className="historial-placeholder-fecha" />

                  <div className="historial-placeholder-marcador">
                    <span />
                  </div>

                  <div className="historial-placeholder-tarjeta">
                    <div className="historial-placeholder-icono" />

                    <div className="historial-placeholder-texto">
                      <span />
                      <span />
                      <span />
                    </div>

                    <div className="historial-placeholder-tiempo" />
                    <div className="historial-placeholder-resumen" />

                    <i className="bi bi-chevron-right" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default Historial;
