import Layout from '../../Components/director-transito/Layout';
import KpiCard from '../../Components/director-transito/KpiCard';

export default function Agentes() {
  return (
    <Layout titulo="Agentes de Tránsito" activo="agentes"
      busqueda={{ placeholder: 'Buscar por agente, zona o placa...' }}>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="section-title-dash">Agentes de Tránsito</h1>
          <p className="section-text-dash mb-0">Gestiona el personal de campo asignado al módulo de Tránsito.</p>
        </div>
        <button type="button" className="btn btn-primary rounded-pill fw-bold btn-nuevo-dash"
          data-bs-toggle="modal" data-bs-target="#modalAgente">
          <i className="bi bi-person-plus me-2"></i>Nuevo agente
        </button>
      </div>

      <div className="row g-3 mb-4">
        <KpiCard variante="plano" color="blue" valor="3" label="Agentes totales" icono="bi-people" />
        <KpiCard variante="plano" color="green" valor="2" label="Activos ahora" icono="bi-person-check" />
        <KpiCard variante="plano" color="red" valor="1" label="Inactivos" icono="bi-person-dash" />
        <KpiCard variante="plano" color="amber" valor="2.1 min" label="Tiempo prom. de atención" icono="bi-stopwatch" />
      </div>

      <div className="table-card-dash">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div className="d-flex gap-2 tabs-dash">
            <button className="tab-dash active-dash">Todos (3)</button>
            <button className="tab-dash">Activos (2)</button>
            <button className="tab-dash">Inactivos (1)</button>
          </div>
          <div className="input-group search-panel-dash">
            <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
            <input type="text" className="form-control border-0" placeholder="Buscar agente, cédula o zona..." />
          </div>
        </div>

        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Agente</th><th>Zona asignada</th><th>Estado</th>
              <th>Casos atendidos (mes)</th><th>Tiempo prom. atención</th><th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="info-title-dash">Jorge Ramírez</div>
                <div className="info-sub-dash">CC 1065.234.812</div>
              </td>
              <td>Zona Norte</td>
              <td><span className="badge-dash badge-green-dash">Activo</span></td>
              <td>24</td>
              <td>2.0 min</td>
              <td className="text-end"><button className="btn btn-light btn-sm"><i className="bi bi-trash"></i></button></td>
            </tr>
            <tr>
              <td>
                <div className="info-title-dash">Camilo Vega</div>
                <div className="info-sub-dash">CC 1085.223.910</div>
              </td>
              <td>Centro</td>
              <td><span className="badge-dash badge-green-dash">Activo</span></td>
              <td>18</td>
              <td>2.4 min</td>
              <td className="text-end"><button className="btn btn-light btn-sm"><i className="bi bi-trash"></i></button></td>
            </tr>
            <tr>
              <td>
                <div className="info-title-dash">Marta Ruiz</div>
                <div className="info-sub-dash">CC 1042.118.377</div>
              </td>
              <td>Los Fundadores</td>
              <td><span className="badge-dash badge-red-dash">Inactivo</span></td>
              <td>9</td>
              <td>3.1 min</td>
              <td className="text-end"><button className="btn btn-light btn-sm"><i className="bi bi-trash"></i></button></td>
            </tr>
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">Mostrando 3 agentes</span>
          <div className="d-flex gap-1"><button className="page-btn-dash active-dash">1</button></div>
        </div>
      </div>

      {/* modal: nuevo agente */}
      <div className="modal fade" id="modalAgente" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content modal-dash">
            <div className="modal-header border-0 pb-0">
              <h5 className="panel-title-dash mb-0">Nuevo agente de tránsito</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <form id="formAgente">
              <div className="modal-body">
                <div className="mb-3">
                  <label className="config-field-label-dash">Nombre completo</label>
                  <input type="text" className="form-control" placeholder="Ej: Camilo Vega" required />
                </div>
                <div className="mb-3">
                  <label className="config-field-label-dash">Cédula</label>
                  <input type="text" className="form-control" placeholder="Ej: CC 1085.223.910" required />
                </div>
                <div className="mb-3">
                  <label className="config-field-label-dash">Zona asignada</label>
                  <select className="form-select" required defaultValue="">
                    <option value="" disabled>Selecciona una zona</option>
                    <option>Zona Norte</option>
                    <option>Centro</option>
                    <option>Sector La Nevada</option>
                    <option>Los Fundadores</option>
                  </select>
                </div>
                <div className="mb-1">
                  <label className="config-field-label-dash">Estado inicial</label>
                  <select className="form-select" defaultValue="activo">
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn-secundario-dash" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" className="btn-guardar-dash">Guardar agente</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
