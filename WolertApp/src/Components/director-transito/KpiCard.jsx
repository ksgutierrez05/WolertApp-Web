export default function KpiCard({ color, valor, etiqueta, icono, variante = 'caja' }) {
  return (
    <div className="col-md-3">
      <div className={`kpi-card-dash border-${color}-dash`}>
        <div className="kpi-content-dash">
          <div className="kpi-value-dash">{valor}</div>
          <div className="kpi-label-dash">{etiqueta}</div>
        </div>
        {variante === 'caja'
          ? <span className={`kpi-icon-box-dash bg-${color}-dash`}><i className={`bi ${icono}`}></i></span>
          : <i className={`bi ${icono} kpi-icon-dash`}></i>}
      </div>
    </div>
  );
}