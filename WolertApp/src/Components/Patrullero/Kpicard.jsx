import { KPIS_PATRULLERO_CONFIG } from './Kpisconfig';
import '../../css/Policia/Patrullero/css/kpicard.css';

function Kpis({ grupo, valores = {} }) {
  const config = KPIS_PATRULLERO_CONFIG[grupo];

  if (!config) return null;

  const {
    columnas = 'col-6 col-xl-3',
    claseFila = 'row g-3 mb-4',
    items = [],
  } = config;

  return (
    <div className={claseFila}>
      {items.map((item) => {
        const valor = valores[item.clave] ?? '–';
        const tono = item.tono || 'verde';

        return (
          <div className={columnas} key={item.clave}>
            <article className={`kpi-card-policial tono-${tono}`}>
              <div className="kpi-card-icono">
                <i className={`bi ${item.icono}`} aria-hidden="true" />
              </div>

              <div className="kpi-card-info">
                <span className="kpi-card-titulo">{item.etiqueta}</span>

                <strong className="kpi-card-valor" id={item.id}>
                  {valor}
                </strong>
              </div>

              <span className="kpi-card-flecha" aria-hidden="true">
                <i className="bi bi-chevron-right" />
              </span>
            </article>
          </div>
        );
      })}
    </div>
  );
}

export default Kpis;