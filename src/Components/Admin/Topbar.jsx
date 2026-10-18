function Topbar() {
  return (
    <header className="top-bar">
      <div className="top-bar__left">
        <h2>WolertApp - Admin</h2>
      </div>
      <div className="top-bar__right">
        <span className="top-bar__user">Administrador</span>
        <button className="top-bar__button">Cerrar sesión</button>
      </div>
    </header>
  );
}

export default TopBar;