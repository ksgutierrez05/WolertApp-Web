function Sidebar() {
  return (
    <nav className="sidebar">
      <ul className="sidebar__menu">
        <li className="sidebar__item">
          <a href="#" className="sidebar__link">Inicio</a>
        </li>
        <li className="sidebar__item">
          <a href="#" className="sidebar__link">Usuarios</a>
        </li>
        <li className="sidebar__item">
          <a href="#" className="sidebar__link">Alertas</a>
        </li>
        <li className="sidebar__item">
          <a href="#" className="sidebar__link">Configuración</a>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;