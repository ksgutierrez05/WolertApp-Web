
function PageHeader({ titulo, descripcion, children }) {
  return (
    <div className="mb-4">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div>
          <h1 className="page-title-dash">{titulo}</h1>

          {descripcion && (
            <p className="text-muted mb-0 mt-2">{descripcion}</p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}

export default PageHeader;
