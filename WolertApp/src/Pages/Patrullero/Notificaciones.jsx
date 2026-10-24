import { useState } from 'react';
import PageHeader from '../../Components/Patrullero/Pageheader';
import '../../css/Policia/Patrullero/css/notificaciones.css';

function Notificaciones() {
  const [filtro, setFiltro] = useState('todas');

  return (
    <div className="container-fluid notificaciones-patrullero">
      <PageHeader
        titulo="Notificaciones"
        descripcion="Comunicaciones recibidas de la Central de Radio y del sistema."
      />

      <div className="nt-barra">
        <div
          className="nt-filterbar"
          role="group"
          aria-label="Filtrar notificaciones"
        >
          <button
            type="button"
            className={`nt-chip ${filtro === 'todas' ? 'active' : ''}`}
            onClick={() => setFiltro('todas')}
            aria-pressed={filtro === 'todas'}
          >
            Todas
          </button>

          <button
            type="button"
            className={`nt-chip ${filtro === 'no-leidas' ? 'active' : ''}`}
            onClick={() => setFiltro('no-leidas')}
            aria-pressed={filtro === 'no-leidas'}
          >
            No leídas
          </button>
        </div>

        <button type="button" className="nt-marcar-todas" disabled>
          <i className="bi bi-check2-all" aria-hidden="true" />
          Marcar todas como leídas
        </button>
      </div>

      <section className="card-panel-dash nt-panel" aria-label="Lista de notificaciones">
        <div className="nt-vacio">
          <span className="nt-vacio-icono">
            <i className="bi bi-bell-slash" aria-hidden="true" />
          </span>

          <h3>No tienes notificaciones</h3>

          <p>
            Los avisos de la Central de Radio y del sistema
            aparecerán aquí.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Notificaciones;