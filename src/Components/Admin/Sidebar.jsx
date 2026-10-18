import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <nav className="sidebar">
      <ul className="sidebar__menu">
        <li className="sidebar__item">
          <Link to="/admin" className="sidebar__link">Inicio</Link>
        </li>
        <li className="sidebar__item">
          <Link to="/admin/usuarios" className="sidebar__link">Usuarios</Link>
        </li>
        <li className="sidebar__item">
          <Link to="/admin/usuarios/nuevo" className="sidebar__link">Nuevo Usuario</Link>
        </li>
        <li className="sidebar__item">
          <Link to="#" className="sidebar__link">Alertas</Link>
        </li>
        <li className="sidebar__item">
          <Link to="#" className="sidebar__link">Configuración</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;
