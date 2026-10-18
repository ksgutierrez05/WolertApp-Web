import { useState } from 'react';
import Layout from '../../Components/director-transito/Layout';

export default function Catalogo() {
  const [tab, setTab] = useState('zonas');

  return (
    <Layout titulo="Catálogos de Tránsito" activo="catalogo"
      busqueda={{ placeholder: 'Buscar por caso, barrio o agente...' }}>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="section-title-dash">Catálogos de Tránsito</h1>
          <p className="section-text-dash mb-0">Administra las zonas y los tipos de caso del módulo de Tránsito.</p>
        </div>
        <button className="btn btn-primary rounded-pill fw-bold btn-nuevo-dash"
          data-bs-toggle="modal" data-bs-target="#modalCatalogo">
          <i className="bi bi-plus-lg me-2"></i>Nuevo
        </button>
      </div>

      <div className="table-card-dash">
        <div className="d-flex gap-2 tabs-dash mb-4">
          <button className={`tab-dash ${tab === 'zonas' ? 'active-dash' : ''}`} onClick={() => setTab('zonas')}>
            Zonas y sectores (4)
          </button>
          <button className={`tab-dash ${tab === 'tipos' ? 'active-dash' : ''}`} onClick={() => setTab('tipos')}>
            Tipos de caso (4)
          </button>
        </div>

        {/* zonas y sectores */}
        <div className={`tab-panel-dash ${tab === 'zonas' ? '' : 'd-none'}`}>
          <table className="table align-middle mb-0">
            <thead>
              <tr><th>Zona / sector</th><th>Casos este mes</th><th>Agentes asignados</th><th className="text-end">Acciones</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Zona Norte</td><td>14</td><td>4</td>
                <td className="text-end">
                  <button className="btn btn-light btn-sm me-1"><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-light btn-sm"><i className="bi bi-trash"></i></button>
                </td>
              </tr>
              <tr>
                <td>Centro</td><td>18</td><td>5</td>
                <td className="text-end">
                  <button className="btn btn-light btn-sm me-1"><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-light btn-sm"><i className="bi bi-trash"></i></button>
                </td>
              </tr>
              <tr>
                <td>Sector La Nevada</td><td>7</td><td>3</td>
                <td className="text-end">
                  <button className="btn btn-light btn-sm me-1"><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-light btn-sm"><i className="bi bi-trash"></i></button>
                </td>
              </tr>
              <tr>
                <td>Los Fundadores</td><td>8</td><td>3</td>
                <td className="text-end">
                  <button className="btn btn-light btn-sm me-1"><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-light btn-sm"><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* tipos de caso */}
        <div className={`tab-panel-dash ${tab === 'tipos' ? '' : 'd-none'}`}>
          <table className="table align-middle mb-0">
            <thead>
              <tr><th>Tipo de caso</th><th>Casos este mes</th><th>Prioridad</th><th className="text-end">Acciones</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Accidente</td><td>13</td>
                <td><span className="badge-dash badge-red-dash">Alta</span></td>
                <td className="text-end">
                  <button className="btn btn-light btn-sm me-1"><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-light btn-sm"><i className="bi bi-trash"></i></button>
                </td>
              </tr>
              <tr>
                <td>Semáforo dañado</td><td>7</td>
                <td><span className="badge-dash badge-amber-dash">Media</span></td>
                <td className="text-end">
                  <button className="btn btn-light btn-sm me-1"><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-light btn-sm"><i className="bi bi-trash"></i></button>
                </td>
              </tr>
              <tr>
                <td>Choque</td><td>4</td>
                <td><span className="badge-dash badge-red-dash">Alta</span></td>
                <td className="text-end">
                  <button className="btn btn-light btn-sm me-1"><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-light btn-sm"><i className="bi bi-trash"></i></button>
                </td>
              </tr>
              <tr>
                <td>Embotellamiento</td><td>4</td>
                <td><span className="badge-dash badge-green-dash">Baja</span></td>
                <td className="text-end">
                  <button className="btn btn-light btn-sm me-1"><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-light btn-sm"><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* modal crear / editar */}
      <div className="modal fade" id="modalCatalogo" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">Nueva zona / sector</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              <form id="formCatalogo">
                <div className="mb-3">
                  <label className="form-label">Nombre de la zona / sector</label>
                  <input type="text" className="form-control" required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Casos este mes</label>
                  <input type="number" min="0" className="form-control" defaultValue="0" required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Agentes asignados</label>
                  <input type="number" min="0" className="form-control" defaultValue="0" />
                </div>
              </form>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" className="btn btn-primary rounded-pill px-4 fw-bold">Guardar</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
