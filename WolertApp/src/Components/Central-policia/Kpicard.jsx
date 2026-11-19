import { KPIS_CENTRAL_CONFIG } from './Kpisconfig';
import '../../css/Policia/central-policia/css/kpicard.css';

function Kpis({ grupo, valores = {} }) {
  const config = KPIS_CENTRAL_CONFIG[grupo];

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
        const tono = item.tono || 'petroleo';

        return (
          <div className={columnas} key={item.clave}>
            <article
              className={`kpi-central-card tono-${tono}${item.destacada ? ' es-destacada' : ''}`}
            >
              <div className="kpi-central-icono">
                <i className={`bi ${item.icono}`} aria-hidden="true" />
              </div>

              <div className="kpi-central-info">
                <span className="kpi-central-titulo">{item.etiqueta}</span>

                <strong className="kpi-central-valor" id={item.id}>
                  {valor}
                </strong>

                {item.descripcion && (
                  <span className="kpi-central-descripcion">
                    {item.descripcion}
                  </span>
                )}
              </div>

              <span className="kpi-central-flecha" aria-hidden="true">
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