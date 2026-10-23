export default function KpiCard({ color, valor, label, etiqueta, icono, variante = 'caja' }) {
  const texto = etiqueta ?? label;

  if (variante === 'panel') {
    return (
      <div className="col-6 col-lg-3">
        <div className={`kpi-dash kpi-${color}-dash`}>
          <i className={`bi ${icono} kpi-icon-dash`}></i>
          <div className="kpi-num-dash">{valor}</div>
          <div className="kpi-label-dash">{texto}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-md-3">
      <div className={`kpi-card-dash border-${color}-dash`}>
        <div className="kpi-content-dash">
          <div className="kpi-value-dash">{valor}</div>
          <div className="kpi-label-dash">{texto}</div>
        </div>
        {variante === 'caja'
          ? <span className={`kpi-icon-box-dash bg-${color}-dash`}><i className={`bi ${icono}`}></i></span>
          : <i className={`bi ${icono} kpi-icon-dash`}></i>}
      </div>
    </div>
  );
}