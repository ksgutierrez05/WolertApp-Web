
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../Components/Patrullero/Pageheader';
import usePatrullero from '../../Utils/usePatrullero';

import '../../css/Policia/Patrullero/css/configuracion.css';

export default function Configuracion() {
  const navigate = useNavigate();

  const { datos, cargando, error } = usePatrullero();
  const p = datos?.policia;

  function cerrarSesion() {
    if (!window.confirm('¿Seguro que deseas cerrar sesión?')) {
      return;
    }

    [
      'token',
      'usuario',
      'rol',
      'idUsuario',
      'username'
    ].forEach(k => localStorage.removeItem(k));

    sessionStorage.clear();

    navigate('/', { replace: true });
  }

  const fila = (etiqueta, valor) => (
    <div className="cf-fila">
      <span className="cf-label">
        {etiqueta}
      </span>

      <span className="cf-valor">
        {valor || '—'}
      </span>
    </div>
  );

  return (
    <div className="container-fluid configuracion-patrullero">
      <PageHeader
        titulo="Configuración"
        descripcion="Consulta tu perfil y la información institucional de tu cuenta."
      />

      {cargando && (
        <p role="status">Cargando perfil...</p>
      )}

      {error && (
        <p className="alert alert-danger" role="alert">
          {error}
        </p>
      )}

      {/* Perfil */}
      <section
        className="cf-perfil"
        aria-label="Resumen del perfil"
      >
        <div
          className="cf-perfil-avatar"
          aria-hidden="true"
        >
          <i className="bi bi-person" />
        </div>

        <div className="cf-perfil-texto">
          <h2 className="cf-perfil-nombre">
            {p?.nombreUsuario || 'Nombre del patrullero'}
          </h2>

          <p className="cf-perfil-sub">
            {p?.rango || 'Patrullero'}
            {' · '}
            Unidad {p?.nombreUnidad || '—'}
          </p>
        </div>

        <span className="cf-perfil-estado">
          <span
            className="cf-perfil-dot"
            aria-hidden="true"
          />

          {p?.estado || 'Sin estado'}
        </span>
      </section>

      <div className="row g-4">
        <div className="col-lg-7 d-flex flex-column gap-4">
          {/* Información personal */}
          <section
            className="card-panel-dash cf-panel"
            aria-labelledby="cf-personal-titulo"
          >
            <div className="cf-panel-cabecera">
              <h2
                className="cf-titulo"
                id="cf-personal-titulo"
              >
                <i
                  className="bi bi-person-lines-fill"
                  aria-hidden="true"
                />
                Información personal
              </h2>

              <span className="cf-solo-lectura">
                <i
                  className="bi bi-lock"
                  aria-hidden="true"
                />
                {' '}Solo lectura
              </span>
            </div>

            {fila('Nombre', p?.nombreUsuario)}
            {fila('Teléfono de contacto', p?.telefono)}
            {fila('Correo electrónico', p?.correo)}
          </section>

          {/* Información institucional */}
          <section
            className="card-panel-dash cf-panel"
            aria-labelledby="cf-inst-titulo"
          >
            <div className="cf-panel-cabecera">
              <h2
                className="cf-titulo"
                id="cf-inst-titulo"
              >
                <i
                  className="bi bi-building"
                  aria-hidden="true"
                />
                Información institucional
              </h2>

              <span className="cf-solo-lectura">
                <i
                  className="bi bi-lock"
                  aria-hidden="true"
                />
                {' '}Solo lectura
              </span>
            </div>

            <p className="cf-nota">
              Estos datos los administra la Central de Radio.
            </p>

            {fila('Identificación', p?.cedula)}
            {fila('Placa', p?.placa)}
            {fila('Rango', p?.rango)}
            {fila('Unidad', p?.nombreUnidad)}
            {fila('Barrio', p?.barrioNombre)}
          </section>
        </div>

        <div className="col-lg-5 d-flex flex-column gap-4">
          {/* Preferencias */}
          <section
            className="card-panel-dash cf-panel"
            aria-labelledby="cf-pref-titulo"
          >
            <h2
              className="cf-titulo"
              id="cf-pref-titulo"
            >
              <i
                className="bi bi-sliders"
                aria-hidden="true"
              />
              Preferencias
            </h2>

            <p className="cf-nota">
              Las preferencias de sonido, vibración y mapas
              no tienen integración confirmada con la API.
              Se mantienen deshabilitadas para evitar mostrar
              cambios ficticios.
            </p>
          </section>

          {/* Cuenta */}
          <section
            className="card-panel-dash cf-panel"
            aria-labelledby="cf-cuenta-titulo"
          >
            <h2
              className="cf-titulo"
              id="cf-cuenta-titulo"
            >
              <i
                className="bi bi-shield-lock"
                aria-hidden="true"
              />
              Cuenta
            </h2>

            <button
              type="button"
              className="cf-accion"
              disabled
            >
              <span className="cf-accion-izq">
                <i
                  className="bi bi-key"
                  aria-hidden="true"
                />
                Cambiar contraseña (no disponible)
              </span>
            </button>

            <button
              type="button"
              className="cf-accion cf-accion--peligro"
              onClick={cerrarSesion}
            >
              <span className="cf-accion-izq">
                <i
                  className="bi bi-box-arrow-right"
                  aria-hidden="true"
                />
                Cerrar sesión
              </span>

              <i
                className="bi bi-chevron-right"
                aria-hidden="true"
              />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
