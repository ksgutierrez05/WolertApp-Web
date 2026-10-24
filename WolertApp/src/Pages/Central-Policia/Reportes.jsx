
import Topbar from '../../Components/Central-policia/Topbar';
import Kpis from '../../Components/Central-policia/Kpicard';
import '../../css/Policia/central-policia/css/reportes.css';

function Reportes() {
  const camposInforme = [
    'Número de caso',
    'Fecha y hora',
    'Tipo de alerta',
    'Prioridad',
    'Zona',
    'Patrullero',
    'Estado',
    'Resultado',
    'Tiempo de respuesta',
  ];

  return (
    <>
      <Topbar placeholder="Buscar caso, patrullero o zona..." />

      <main className="main-dash reportes-page">
        <div className="container-fluid">
          {/* Título sin icono ni encabezado adicional */}
          <header className="reportes-header">
            <h1 className="reportes-titulo">Reportes</h1>
            <p>
              Consulta, analiza y genera informes de los casos gestionados
              por Central.
            </p>
          </header>

          {/* KPI compartidos */}
          <Kpis
            grupo="reportes"
            valores={{
              total: 0,
              resueltos: 0,
              pendientes: 0,
              conInforme: 0,
            }}
          />

          {/* Filtros visuales */}
          <section className="card-panel-dash reportes-filtros">
            <div className="reportes-filtros-titulo">
              <div>
                <i className="bi bi-funnel me-2" />
                Filtros de búsqueda
                <p>Selecciona los criterios para consultar los casos.</p>
              </div>

              <button type="button" className="btn reportes-btn-limpiar" disabled>
                <i className="bi bi-arrow-counterclockwise me-1" />
                Limpiar
              </button>
            </div>

            <div className="reportes-filtros-grid">
              <div>
                <label htmlFor="filtroTipo">Tipo</label>
                <select id="filtroTipo" className="form-select" defaultValue="todos">
                  <option value="todos">Todos los tipos</option>
                  <option>Robo</option>
                  <option>Violencia</option>
                  <option>Accidente</option>
                  <option>Persona sospechosa</option>
                  <option>Emergencia</option>
                  <option>Alteración del orden público</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="filtroPrioridad">Prioridad</label>
                <select id="filtroPrioridad" className="form-select" defaultValue="todos">
                  <option value="todos">Todas</option>
                  <option>Crítica</option>
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                </select>
              </div>

              <div>
                <label htmlFor="filtroEstado">Estado</label>
                <select id="filtroEstado" className="form-select" defaultValue="todos">
                  <option value="todos">Todos</option>
                  <option>Recibida</option>
                  <option>Clasificada</option>
                  <option>Asignada</option>
                  <option>En atención</option>
                  <option>Resuelta</option>
                  <option>Informe</option>
                  <option>Cerrada</option>
                </select>
              </div>

              <div>
                <label htmlFor="filtroResultado">Resultado</label>
                <select id="filtroResultado" className="form-select" defaultValue="todos">
                  <option value="todos">Todos</option>
                  <option>Resuelto</option>
                  <option>Sin novedad</option>
                  <option>Atención realizada</option>
                  <option>Requiere seguimiento</option>
                  <option>Remitido a otra entidad</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="filtroPatrullero">Patrullero</label>
                <select id="filtroPatrullero" className="form-select" defaultValue="todos">
                  <option value="todos">Todos los patrulleros</option>
                </select>
              </div>

              <div>
                <label htmlFor="filtroZona">Zona</label>
                <select id="filtroZona" className="form-select" defaultValue="todos">
                  <option value="todos">Todas las zonas</option>
                </select>
              </div>

              <div>
                <label htmlFor="filtroDesde">Desde</label>
                <input id="filtroDesde" type="date" className="form-control" />
              </div>

              <div>
                <label htmlFor="filtroHasta">Hasta</label>
                <input id="filtroHasta" type="date" className="form-control" />
              </div>
            </div>
          </section>

          {/* Tabla y vista previa */}
          <div className="reportes-contenido">
            <section className="card-panel-dash reportes-tabla-panel">
              <div className="reportes-tabla-header">
                <div>
                  <h2>Casos gestionados</h2>
                  <span>Historial de casos e informes generados</span>
                </div>

                <button type="button" className="btn reportes-btn-principal" disabled>
                  <i className="bi bi-file-earmark-pdf me-2" />
                  Generar reporte
                </button>
              </div>

              <div className="table-responsive">
                <table className="table reportes-tabla">
                  <thead>
                    <tr>
                      <th>Caso</th>
                      <th>Tipo</th>
                      <th>Prioridad</th>
                      <th>Zona</th>
                      <th>Patrullero</th>
                      <th>Resultado</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody />
                </table>
              </div>

              <div className="reportes-vacio">
                <i className="bi bi-file-earmark-x" />
                <strong>No hay reportes para mostrar</strong>
                <span>Aquí aparecerán los casos gestionados por Central.</span>
              </div>
            </section>

            <aside className="card-panel-dash reportes-informe-preview">
              <div className="reportes-tabla-header">
                <div>
                  <h2>Vista previa del informe</h2>
                  <span>Detalle visual de un informe de caso</span>
                </div>

                <button type="button" className="btn reportes-btn-limpiar" disabled>
                  <i className="bi bi-printer me-1" />
                  Imprimir
                </button>
              </div>

              <div className="reportes-informe-body">
                <section className="informe-seccion">
                  <h3 className="informe-titulo">Información general</h3>
                  <div className="informe-grid">
                    {camposInforme.map((campo) => (
                      <div className="informe-dato" key={campo}>
                        <span className="informe-dato-label">{campo}</span>
                        <strong className="informe-dato-valor">—</strong>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="informe-seccion">
                  <h3 className="informe-titulo">Descripción del caso</h3>
                  <div className="informe-texto">
                    La descripción del caso aparecerá en este espacio.
                  </div>
                </section>

                <section className="informe-seccion">
                  <h3 className="informe-titulo">Observaciones de Central</h3>
                  <div className="informe-texto informe-central">
                    Las observaciones y actuaciones realizadas aparecerán aquí.
                  </div>
                </section>

                <section className="informe-seccion">
                  <h3 className="informe-titulo">Línea de tiempo</h3>
                  <div className="informe-linea-tiempo">
                    {[
                      'Recepción del caso',
                      'Atención y seguimiento',
                      'Resultado final',
                    ].map((evento) => (
                      <div className="informe-evento" key={evento}>
                        <span className="informe-hora">—</span>
                        <div className="informe-evento-texto">{evento}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

export default Reportes;
