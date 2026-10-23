import { Link } from 'react-router-dom';
import logoTransito from '../../../../public/img/secretaria transito.png';

export default function Sidebar({ activo }) {
  return (
    <aside className="sidebar-dash" id="sidebarDash">
      <div className="d-flex align-items-center brand-dash">
        <span className="brand-icon-dash">
        <img src={logoTransito} alt="Logo Tránsito" className="brand-logo-img-dash" />
        </span>
        <span className="brand-name-dash">
          <span className="d-block">Secretaria de</span>
          <span className="d-block">Tránsito</span>
        </span>
      </div>

      <p className="glabel-dash">General</p>
      <nav className="nav flex-column menu-dash">
        <Link to="/transito/director/panel" className={activo === 'panel' ? 'active' : ''}>
          <span className="ic-dash"><i className="bi bi-house"></i></span>
          <span className="lbl-dash">Principal</span>
        </Link>
      </nav>

      <p className="glabel-dash">Operación</p>
      <nav className="nav flex-column menu-dash">
        <Link to="/transito/director/agentes" className={activo === 'agentes' ? 'active' : ''}>
          <span className="ic-dash"><i className="bi bi-briefcase"></i></span>
          <span className="lbl-dash">Agentes</span>
        </Link>
        <Link to="/transito/director/casos" className={activo === 'casos' ? 'active' : ''}>
          <span className="ic-dash"><i className="bi bi-file-earmark-text"></i></span>
          <span className="lbl-dash">Casos</span>
        </Link>
        <Link to="/transito/director/catalogo" className={activo === 'catalogo' ? 'active' : ''}>
          <span className="ic-dash"><i className="bi bi-book"></i></span>
          <span className="lbl-dash">Catálogo</span>
        </Link>
        <Link to="/transito/director/semaforos" className={activo === 'semaforo' ? 'active' : ''}>
          <span className="ic-dash"><i className="bi bi-stoplights"></i></span>
          <span className="lbl-dash">Semáforos</span>
        </Link>
        <a href="#" className={activo === 'mapa' ? 'active' : ''}>
          <span className="ic-dash"><i className="bi bi-geo-alt"></i></span>
          <span className="lbl-dash">Mapa</span>
        </a>
      </nav>

      <p className="glabel-dash">Gestión</p>
      <nav className="nav flex-column menu-dash">
        <Link to="/transito/director/reportes" className={activo === 'reportes' ? 'active' : ''}>
          <span className="ic-dash"><i className="bi bi-bar-chart-line"></i></span>
          <span className="lbl-dash">Reportes</span>
        </Link>
        <Link to="/transito/director/configuracion" className={activo === 'configuracion' ? 'active' : ''}>
          <span className="ic-dash"><i className="bi bi-gear"></i></span>
          <span className="lbl-dash">Configuración</span>
        </Link>
      </nav>

      <div className="flex-grow-1"></div>

      <a href="#" className="logout-dash">
        <span className="ic-dash"><i className="bi bi-box-arrow-left"></i></span>
        <span className="lbl-dash">Cerrar sesión</span>
      </a>
    </aside>
  );
}
