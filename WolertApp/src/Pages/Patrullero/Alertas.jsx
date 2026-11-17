
import { useState } from 'react';
import PageHeader from '../../Components/Patrullero/Pageheader';
import Kpis from '../../Components/Patrullero/Kpicard';
import usePatrullero from '../../Utils/usePatrullero';
import { FormatearFecha } from '../../Services/PoliciaService';

import '../../css/Policia/Patrullero/css/alertas.css';

export default function Alertas() {
  const [filtro, setFiltro] = useState('todas');
  const { datos, cargando, error, recargar } = usePatrullero();

  const alertas = [...(datos?.alertas || [])].sort((a, b) => {
    const orden = { ALTA: 0, MEDIA: 1, BAJA: 2 };

    return (
      (orden[String(a.prioridad).toUpperCase()] ?? 3) -
      (orden[String(b.prioridad).toUpperCase()] ?? 3)
    );
  });

  const filtradas = filtro === 'todas'
    ? alertas
    : alertas.filter(
        a => String(a.prioridad || '').toLowerCase() === filtro
      );

  const nuevas = alertas.filter(a =>
    datos?.asignaciones.some(
      x =>
        Number(x.idAlerta) === Number(a.idAlerta) &&
        x.estadoAsignacion === 'ASIGNADA'
    )
  );

  const valores = {
    total: alertas.length,
    prioridadAlta: alertas.filter(
      a => String(a.prioridad).toUpperCase() === 'ALTA'
    ).length,
    nuevas: nuevas.length,
    vistas: '—'
  };

  return (
    <div className="container-fluid mis-alertas-patrullero">
      <PageHeader
        titulo="Mis Alertas"
        descripcion="Alertas relacionadas con las asignaciones de tu unidad, ordenadas por prioridad."
      />

      <section aria-label="Indicadores de alertas">
        <Kpis grupo="alertas" valores={valores} />
      </section>

      <div
        className="al-filterbar"
        role="group"
        aria-label="Filtrar alertas por prioridad"
      >
        {['todas', 'alta', 'media', 'baja'].map(op => (
          <button
            key={op}
            type="button"
            className={`al-chip ${filtro === op ? 'active' : ''}`}
            onClick={() => setFiltro(op)}
            aria-pressed={filtro === op}
          >
            {op === 'todas'
              ? 'Todas'
              : op[0].toUpperCase() + op.slice(1)}
          </button>
        ))}
      </div>

      {cargando && (
        <p role="status">Cargando alertas...</p>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button type="button" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && (
        <div className="al-list">
          {filtradas.length === 0 ? (
            <div className="card-panel-dash al-vacio">
              <span className="al-vacio-icono">
                <i className="bi bi-inbox" aria-hidden="true" />
              </span>

              <h3>No hay alertas para mostrar</h3>

              <p>
                No hay alertas de tu unidad con este filtro.
              </p>
            </div>
          ) : (
            filtradas.map(a => (
              <article
                key={a.idAlerta}
                className="card-panel-dash p-3 mb-3"
              >
                <div className="d-flex justify-content-between gap-2">
                  <h3 className="h6 mb-2">
                    Alerta #{a.idAlerta} · {a.tipo || 'Sin tipo'}
                  </h3>

                  <span>
                    {a.prioridad || 'Sin prioridad'}
                  </span>
                </div>

                <p className="mb-2">
                  {a.descripcion || 'Sin descripción'}
                </p>

                <small>
                  {a.barrioNombre || 'Barrio no registrado'}
                  {' · '}
                  {a.estado || 'Sin estado'}
                  {' · '}
                  {FormatearFecha(a.fecha)}
                </small>
              </article>
            ))
          )}
        </div>
      )}

      <small className="d-block mt-2">
        La API de alertas devuelve hasta 200 registros recientes;
        podrían faltar alertas antiguas.
      </small>
    </div>
  );
}
