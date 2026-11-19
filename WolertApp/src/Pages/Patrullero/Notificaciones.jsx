
import { useEffect, useState } from 'react';
import PageHeader from '../../Components/Patrullero/Pageheader';

import {
  ListarMisNotificaciones,
  FormatearFecha,
  ObtenerIdUsuario
} from '../../Services/PoliciaService';

import '../../css/Policia/Patrullero/css/notificaciones.css';

function Notificaciones() {
  const [filtro, setFiltro] = useState('todas');
  const [notificaciones, setNotificaciones] = useState([]);
  const [leidas, setLeidas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const claveLecturas = `notificacionesLeidas:${ObtenerIdUsuario() ?? 'sin-usuario'}`;

  useEffect(() => {
    let activo = true;

    async function cargarNotificaciones() {
      try {
        setCargando(true);

        const guardadas = JSON.parse(
          localStorage.getItem(claveLecturas) || '[]'
        );

        const datos = await ListarMisNotificaciones();

        if (!activo) return;

        setLeidas(Array.isArray(guardadas) ? guardadas : []);
        setNotificaciones(datos);

      } catch (err) {
        if (activo) {
          setError(err.message);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarNotificaciones();

    return () => {
      activo = false;
    };
  }, [claveLecturas]);

  function guardarLeidas(ids) {
    const nuevas = [...new Set(ids)];

    setLeidas(nuevas);

    localStorage.setItem(
      claveLecturas,
      JSON.stringify(nuevas)
    );
  }

  function marcarLeida(id) {
    guardarLeidas([...leidas, id]);
  }

  function marcarTodas() {
    const ids = notificaciones.map(
      n => n.idNotificacion
    );

    guardarLeidas([...leidas, ...ids]);
  }

  const filtradas = notificaciones.filter(n => {
    if (filtro === 'no-leidas') {
      return !leidas.includes(n.idNotificacion);
    }

    return true;
  });

  const pendientes = notificaciones.filter(
    n => !leidas.includes(n.idNotificacion)
  ).length;

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
            No leídas ({pendientes})
          </button>
        </div>

        <button
          type="button"
          className="nt-marcar-todas"
          onClick={marcarTodas}
          disabled={cargando || pendientes === 0}
        >
          <i
            className="bi bi-check2-all"
            aria-hidden="true"
          />
          {' '}Marcar todas como leídas
        </button>
      </div>

      {cargando && (
        <p role="status">
          Cargando notificaciones...
        </p>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <section
        className="card-panel-dash nt-panel"
        aria-label="Lista de notificaciones"
      >
        {!cargando && !error && (
          filtradas.length === 0 ? (
            <div className="nt-vacio">
              <span className="nt-vacio-icono">
                <i
                  className="bi bi-bell-slash"
                  aria-hidden="true"
                />
              </span>

              <h3>
                {filtro === 'no-leidas'
                  ? 'No tienes notificaciones pendientes'
                  : 'No tienes notificaciones'}
              </h3>

              <p>
                Los avisos de la Central de Radio y del sistema
                aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="d-grid gap-3">
              {filtradas.map(n => (
                <article
                  key={n.idNotificacion}
                  className="border rounded p-3"
                >
                  <div className="d-flex justify-content-between gap-2">
                    <div>
                      <p className="mb-2">
                        {n.mensaje || 'Nueva notificación'}
                      </p>

                      <small>
                        {FormatearFecha(n.fecha)}
                      </small>

                      {n.idAlerta != null && (
                        <p className="mb-0">
                          <small>
                            Alerta #{n.idAlerta}
                          </small>
                        </p>
                      )}
                    </div>

                    {!leidas.includes(n.idNotificacion) && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => marcarLeida(n.idNotificacion)}
                      >
                        Marcar leída
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )
        )}
      </section>
    </div>
  );
}

export default Notificaciones;
