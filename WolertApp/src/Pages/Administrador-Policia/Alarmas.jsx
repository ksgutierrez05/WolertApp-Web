import Topbar from '../../Components/Administrador-policia/Topbar';
import Kpis from '../../Components/Administrador-policia/Kpicard';
import '../../css/Policia/administrador-policia/css/Alarmas.css';

function Alarmas() {
  return (
    <>
     <Topbar
              iniciales="SG"
              placeholder="Buscar por nombre o barrio..."
           />

      <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <p className="page-title-dash fw-bold m-0">Alarmas</p>
          <p className="info-sub-dash m-0">
            Gestión y monitoreo de las alarmas comunitarias registradas por barrio.
          </p>
        </div>
        <button className="btn btn-cv-azul rounded-pill d-inline-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i> Nueva alarma
        </button>
      </div>

      <Kpis grupo="alarmas" />

      <div className="d-flex gap-2 flex-wrap mb-3">
        <button className="chip-filtro-dash active">Todas <span className="chip-count-dash">0</span></button>
        <button className="chip-filtro-dash">Activas <span className="chip-count-dash">0</span></button>
        <button className="chip-filtro-dash">Inactivas <span className="chip-count-dash">0</span></button>
        <button className="chip-filtro-dash">En mantenimiento <span className="chip-count-dash">0</span></button>
      </div>

      <div className="card-panel-dash p-3">
        <div className="table-responsive">
          <table className="table table-borderless align-middle tabla-alarmas-dash mb-0">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Barrio</th>
                <th>Estado</th>
                <th>Radio (m)</th>
                <th>Coordenadas</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
        <p className="text-center text-muted py-4 m-0">No se encontraron alarmas.</p>
      </div>
    </>
  );
}

export default Alarmas;