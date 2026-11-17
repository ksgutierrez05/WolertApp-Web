
function Topbar({
  iniciales = 'CR',
  placeholder = 'Buscar por caso, unidad, barrio...',
  valor,
  onCambio,
}) {
  const controlado = onCambio !== undefined;

  return (
    <div className="topbar-dash d-flex align-items-center gap-3 mb-4">
      <div className="search-dash flex-grow-1 d-flex align-items-center input-group">
        <span className="input-group-text bg-transparent border-0">
          <i className="bi bi-search" />
        </span>

        <input
          type="text"
          className="form-control border-0 bg-transparent"
          placeholder={placeholder}
          {...(controlado
            ? {
                value: valor ?? '',
                onChange: (e) => onCambio(e.target.value),
              }
            : {})}
        />
      </div>

      <button
        type="button"
        className="icon-btn-dash btn btn-light rounded-circle position-relative flex-shrink-0"
        aria-label="Notificaciones"
      >
        <i className="bi bi-bell" />
        <span className="dot-danger-dash position-absolute top-0 end-0" />
      </button>

      <span className="avatar-dash flex-shrink-0">{iniciales}</span>
    </div>
  );
}

export default Topbar;
