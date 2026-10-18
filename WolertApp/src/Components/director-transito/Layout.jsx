import { useEffect, useState } from "react";
import Sidebar from './SideBar.jsx';

export default function Layout({
  titulo,
  activo,
  placeholderBusqueda = 'Buscar...',
  claseTopbar = 'mb-5',
  avatar = 'D',
  notificaciones = '9+',
  children,
}) {
  const [railColapsado, setRailColapsado] = useState(true);

  useEffect(() => {
    document.title = `WolertApp - ${titulo}`;
  }, [titulo]);

  useEffect(() => {
    document.body.className = `rol-transito ${railColapsado ? 'rail-collapsed' : ''}`.trim();
    document.body.dataset.rol = 'transito';
    return () => {
      document.body.className = '';
      delete document.body.dataset.rol;
    };
  }, [railColapsado]);

  return (
    <div className="d-flex" id="wrapperDash">
      <Sidebar activo={activo} />
      <main className="main-dash flex-grow-1">
        <div className="container-fluid px-4 py-4">

          <div className={`row g-3 align-items-center ${claseTopbar}`}>
            <div className="col">
              <div className="input-group search-dash">
                <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control border-0" placeholder={placeholderBusqueda} />
              </div>
            </div>
            <div className="col-auto">
              <button className="btn btn-light rounded-circle position-relative icon-btn-dash">
                <i className="bi bi-bell"></i>
                <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle">{notificaciones}</span>
              </button>
            </div>
            <div className="col-auto">
              <span className="avatar-dash" id="railToggle" title="Mostrar/ocultar perfil"
                onClick={() => setRailColapsado((colapsado) => !colapsado)}>{avatar}</span>
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}