import Layout from '../../Components/director-transito/Layout';
import KpiCard from '../..Components/director-transito/KpiCard';

export default function Semaforos() {
  return (
    <Layout titulo="Semáforos" activo="semaforos"
      busqueda={{ placeholder: 'Buscar por código, ubicación o barrio...' }}>

      <div className="row align-items-center mb-4">
        <div className="col">
          <h1 className="section-title-dash">Semáforos</h1>
          <p className="section-text-dash mb-0">Consulta, registra y da seguimiento al estado de los semáforos de la ciudad.</p>
        </div>
        <div className="col-auto">
          <button type="button" className="btn btn-primario-dash" data-bs-toggle="modal" data-bs-target="#modalSemaforo">
            <i className="bi bi-plus-lg me-1"></i> Nuevo semáforo
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <KpiCard color="blue" valor="3" label="Total de semáforos" icono="bi-signpost-2" />
        <KpiCard color="green" valor="1" label="Funcionando" icono="bi-check2-circle" />
        <KpiCard color="red" valor="1" label="Dañados" icono="bi-exclamation-triangle" />
        <KpiCard color="amber" valor="1" label="En mantenimiento" icono="bi-tools" />
      </div>

      <div className="table-card-dash">
        <div className="filtros-fila-dash mb-3">
          <div className="input-group search-dash filtros-busqueda-dash">
            <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
            <input type="text" className="form-control border-0" placeholder="Buscar por código, ubicación o barrio..." />
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="pill-filtro-dash pill-funcionando-dash">Funcionando</button>
            <button type="button" className="pill-filtro-dash pill-danado-dash">Dañado</button>
            <button type="button" className="pill-filtro-dash pill-mantenimiento-dash">En mantenimiento</button>
          </div>
          <button type="button" className="btn btn-light btn-sm">
            <i className="bi bi-x-circle me-1"></i> Limpiar
          </button>
        </div>

        <div className="d-flex gap-2 tabs-dash mb-3">
          <button className="tab-dash-sem active-dash">Todas (3)</button>
          <button className="tab-dash-sem">Vehicular (2)</button>
          <button className="tab-dash-sem">Peatonal (1)</button>
        </div>

        <table className="table align-middle mb-0">
          <thead>
            <tr><th>Código</th><th>Ubicación</th><th>Barrio</th><th>Tipo</th><th>Estado</th><th>Última revisión</th><th className="text-end">&nbsp;</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><b>SEM-001</b></td>
              <td>Cra 19 con Calle 16</td>
              <td>La Popa</td>
              <td>Vehicular</td>
              <td><span className="badge-dash badge-green-dash">Funcionando</span></td>
              <td>2026-09-02</td>
              <td className="text-end"><button className="btn btn-light btn-sm"><i className="bi bi-pencil"></i></button></td>
            </tr>
            <tr>
              <td><b>SEM-002</b></td>
              <td>Calle 9 con Cra 12</td>
              <td>Centro</td>
              <td>Peatonal</td>
              <td><span className="badge-dash badge-red-dash">Dañado</span></td>
              <td>2026-08-28</td>
              <td className="text-end"><button className="btn btn-light btn-sm"><i className="bi bi-pencil"></i></button></td>
            </tr>
            <tr>
              <td><b>SEM-003</b></td>
              <td>Av. Los Fundadores</td>
              <td>Los Fundadores</td>
              <td>Vehicular</td>
              <td><span className="badge-dash badge-amber-dash">En mantenimiento</span></td>
              <td>2026-09-08</td>
              <td className="text-end"><button className="btn btn-light btn-sm"><i className="bi bi-pencil"></i></button></td>
            </tr>
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">Mostrando 3 de 3 semáforos</span>
          <div className="d-flex gap-1">
            <button className="page-btn-dash active-dash">1</button>
            <button className="page-btn-dash">2</button>
            <button className="page-btn-dash">3</button>
            <button className="page-btn-dash"><i className="bi bi-chevron-right"></i></button>
          </div>
        </div>
      </div>

      {/* modal: crear / editar semáforo */}
      <div className="modal fade modal-dash" id="modalSemaforo" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form id="formSemaforo">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo semáforo</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="inputCodigo" className="form-label-dash">Código</label>
                  <input type="text" className="form-control form-control-dash" id="inputCodigo" defaultValue="SEM-004" readOnly />
                </div>
                <div className="mb-3">
                  <label htmlFor="inputUbicacion" className="form-label-dash">Ubicación</label>
                  <input type="text" className="form-control form-control-dash" id="inputUbicacion" placeholder="Ej: Cra 19 con Calle 16" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="inputBarrio" className="form-label-dash">Barrio</label>
                  <input type="text" className="form-control form-control-dash" id="inputBarrio" placeholder="Ej: La Popa" required />
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="inputTipo" className="form-label-dash">Tipo</label>
                    <select className="form-select form-control-dash" id="inputTipo">
                      <option value="vehicular">Vehicular</option>
                      <option value="peatonal">Peatonal</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="inputEstado" className="form-label-dash">Estado</label>
                    <select className="form-select form-control-dash" id="inputEstado">
                      <option value="funcionando">Funcionando</option>
                      <option value="danado">Dañado</option>
                      <option value="mantenimiento">En mantenimiento</option>
                    </select>
                  </div>
                </div>
                <div className="mb-1 mt-3">
                  <label htmlFor="inputRevision" className="form-label-dash">Última revisión</label>
                  <input type="date" className="form-control form-control-dash" id="inputRevision" required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" className="btn btn-primario-dash">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
