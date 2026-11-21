
function Topbar({
  iniciales = '',
  children,
  placeholder = 'Buscar por alerta, barrio, unidad, policía…',
  valor,
  onCambio,
}) {
  // Si la página pasa onCambio, el buscador funciona como input controlado.
  const controlado = onCambio !== undefined;

  return (
    <div className="d-flex align-items-center gap-3 mb-4">
      {/* Buscador */}
      <div className="search-dash flex-grow-1 d-flex align-items-center input-group">
        <span className="input-group-text bg-transparent border-0">
          <i className="bi bi-search"></i>
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

      {/* Campana de notificaciones global */}
      <button
        type="button"
        className="icon-btn-dash btn btn-light rounded-circle position-relative flex-shrink-0"
        aria-label="Notificaciones"
        title="Notificaciones"
      >
        <i className="bi bi-bell"></i>
        <span className="dot-danger-dash position-absolute top-0 end-0"></span>
      </button>

      {/* Otros elementos opcionales */}
      {children}

      {/* Avatar */}
      <span className="avatar-dash flex-shrink-0">
        {iniciales}
      </span>
    </div>
  );
}

export default Topbar;
