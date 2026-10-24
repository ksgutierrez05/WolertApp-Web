
function Topbar({
  placeholder = 'Buscar...',
  valor = '',
  onCambio,
  iniciales = '',
  children,
}) {
  return (
    <div className="d-flex align-items-center gap-3 mb-4">
      <div className="search-dash input-group flex-grow-1">
        <span className="input-group-text bg-transparent border-0">
          <i className="bi bi-search" />
        </span>

        <input
          type="text"
          className="form-control border-0 bg-transparent"
          placeholder={placeholder}
          value={valor}
          onChange={(event) => onCambio?.(event.target.value)}
        />
      </div>

      <button
        type="button"
        className="icon-btn-dash btn btn-light rounded-circle"
        aria-label="Notificaciones"
      >
        <i className="bi bi-bell" />
        {children}
      </button>

      <span className="avatar-dash">{iniciales}</span>
    </div>
  );
}

export default Topbar;
