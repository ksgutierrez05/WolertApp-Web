import { useEffect, useState } from 'react';
import SidebarDirector from './director-transito/Sidebar';
import SidebarCentral from './central-transito/SideBar';


const ROLES = {
  director: { Sidebar: SidebarDirector, avatar: 'D',  notificaciones: '9+' },
  central: { Sidebar: SidebarCentral, avatar: 'C',  notificaciones: '9+' },
  
};

export default function Layout({ rol = 'director', titulo, activo, busqueda, claseTopbar = 'mb-5', avatar, notificaciones, children }) {
  const cfg = ROLES[rol];
  const Sidebar = cfg.Sidebar;
  const [railColapsado, setRailColapsado] = useState(true);

  useEffect(() => { document.title = `WolertApp - ${titulo}`; }, [titulo]);

  useEffect(() => {
    document.body.classList.add('rol-transito');
    document.body.dataset.rol = 'transito';
    return () => {
      document.body.classList.remove('rol-transito', 'rail-collapsed');
      delete document.body.dataset.rol;
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('rail-collapsed', railColapsado);
  }, [railColapsado]);

  return (
    // pg-... no hace nada hoy; queda por si después quieres limitar un CSS a una sola página
    <div className={`d-flex pg-${rol}-${activo}`} id="wrapperDash">
      <Sidebar activo={activo} />
      <main className="main-dash flex-grow-1">
        <div className="container-fluid px-4 py-4">

          <div className={`row g-3 align-items-center ${claseTopbar}`}>
            <div className="col">
              <div className="input-group search-dash">
                <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control border-0"
                  placeholder={busqueda?.placeholder ?? 'Buscar...'}
                  value={busqueda?.valor ?? ''}
                  onChange={(e) => busqueda?.onChange?.(e.target.value)} />
              </div>
            </div>
            <div className="col-auto">
              <button className="btn btn-light rounded-circle position-relative icon-btn-dash">
                <i className="bi bi-bell"></i>
                <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle">
                  {notificaciones ?? cfg.notificaciones}
                </span>
              </button>
            </div>
            <div className="col-auto">
              <span className="avatar-dash" id="railToggle" title="Mostrar/ocultar perfil"
                onClick={() => setRailColapsado((v) => !v)}>{avatar ?? cfg.avatar}</span>
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}