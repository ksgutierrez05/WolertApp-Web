import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../Components/Patrullero/Pageheader';
import '../../css/Policia/Patrullero/css/configuracion.css';

function Configuracion() {
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);

  function cerrarSesion() {
    if (!window.confirm('¿Seguro que deseas cerrar sesión?')) return;

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('rol');
      sessionStorage.clear();
    } catch (error) {
      console.warn('No se pudo limpiar el almacenamiento', error);
    }

    navigate('/');
  }

  return (
    <div className="container-fluid configuracion-patrullero">
      <PageHeader
        titulo="Configuración"
        descripcion="Administra tu perfil, tus preferencias y la seguridad de tu cuenta."
      />

      {/* Cabecera del perfil */}
      <section className="cf-perfil" aria-label="Resumen del perfil">
        <div className="cf-perfil-avatar" aria-hidden="true">
          <i className="bi bi-person" />
        </div>

        <div className="cf-perfil-texto">
          <h2 className="cf-perfil-nombre">Nombre del patrullero</h2>
          <p className="cf-perfil-sub">
            Patrullero · Unidad — · CAI —
          </p>
        </div>

        <span className="cf-perfil-estado">
          <span className="cf-perfil-dot" aria-hidden="true" />
          Sin estado
        </span>
      </section>

      <div className="row g-4">
        {/* Columna izquierda */}
        <div className="col-lg-7 d-flex flex-column gap-4">
          {/* Información personal (editable) */}
          <section className="card-panel-dash cf-panel" aria-labelledby="cf-personal-titulo">
            <div className="cf-panel-cabecera">
              <h2 className="cf-titulo" id="cf-personal-titulo">
                <i className="bi bi-person-lines-fill" aria-hidden="true" />
                Información personal
              </h2>

              {!editando && (
                <button
                  type="button"
                  className="cf-btn-editar"
                  onClick={() => setEditando(true)}
                >
                  <i className="bi bi-pencil" aria-hidden="true" />
                  Editar
                </button>
              )}
            </div>

            <div className="cf-fila">
              <label className="cf-label" htmlFor="cf-nombre">Nombre</label>
              {editando ? (
                <input id="cf-nombre" type="text" className="cf-input" placeholder="Tu nombre completo" />
              ) : (
                <span className="cf-valor">—</span>
              )}
            </div>

            <div className="cf-fila">
              <label className="cf-label" htmlFor="cf-telefono">Teléfono de contacto</label>
              {editando ? (
                <input id="cf-telefono" type="tel" className="cf-input" placeholder="300 000 0000" />
              ) : (
                <span className="cf-valor">—</span>
              )}
            </div>

            <div className="cf-fila">
              <label className="cf-label" htmlFor="cf-correo">Correo electrónico</label>
              {editando ? (
                <input id="cf-correo" type="email" className="cf-input" placeholder="correo@ejemplo.com" />
              ) : (
                <span className="cf-valor">—</span>
              )}
            </div>

            {editando && (
              <div className="cf-edicion-acciones">
                <button
                  type="button"
                  className="btn btn-light border btn-sm"
                  onClick={() => setEditando(false)}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn btn-cv-azul btn-sm"
                  onClick={() => setEditando(false)}
                >
                  Guardar cambios
                </button>
              </div>
            )}
          </section>

          {/* Información institucional (solo lectura) */}
          <section className="card-panel-dash cf-panel" aria-labelledby="cf-inst-titulo">
            <div className="cf-panel-cabecera">
              <h2 className="cf-titulo" id="cf-inst-titulo">
                <i className="bi bi-building" aria-hidden="true" />
                Información institucional
              </h2>

              <span className="cf-solo-lectura">
                <i className="bi bi-lock" aria-hidden="true" />
                Solo lectura
              </span>
            </div>

            <p className="cf-nota">
              Estos datos los administra la Central de Radio.
            </p>

            <div className="cf-fila">
              <span className="cf-label">Identificación</span>
              <span className="cf-valor">—</span>
            </div>

            <div className="cf-fila">
              <span className="cf-label">Código operativo</span>
              <span className="cf-valor">—</span>
            </div>

            <div className="cf-fila">
              <span className="cf-label">Estación</span>
              <span className="cf-valor">—</span>
            </div>

            <div className="cf-fila">
              <span className="cf-label">CAI</span>
              <span className="cf-valor">—</span>
            </div>

            <div className="cf-fila">
              <span className="cf-label">Unidad</span>
              <span className="cf-valor">—</span>
            </div>
          </section>
        </div>

        {/* Columna derecha */}
        <div className="col-lg-5 d-flex flex-column gap-4">
          {/* Preferencias */}
          <section className="card-panel-dash cf-panel" aria-labelledby="cf-pref-titulo">
            <h2 className="cf-titulo" id="cf-pref-titulo">
              <i className="bi bi-sliders" aria-hidden="true" />
              Preferencias
            </h2>

            <div className="cf-opcion">
              <span className="cf-opcion-icono"><i className="bi bi-bell" aria-hidden="true" /></span>
              <div className="cf-opcion-texto">
                <p className="cf-opcion-titulo">Notificaciones</p>
                <p className="cf-opcion-desc">Recibir avisos de alertas y de la Central</p>
              </div>
              <div className="form-check form-switch m-0">
                <input className="form-check-input" type="checkbox" role="switch" aria-label="Notificaciones" defaultChecked />
              </div>
            </div>

            <div className="cf-opcion">
              <span className="cf-opcion-icono"><i className="bi bi-volume-up" aria-hidden="true" /></span>
              <div className="cf-opcion-texto">
                <p className="cf-opcion-titulo">Sonido</p>
                <p className="cf-opcion-desc">Reproducir sonido al recibir una alerta</p>
              </div>
              <div className="form-check form-switch m-0">
                <input className="form-check-input" type="checkbox" role="switch" aria-label="Sonido" defaultChecked />
              </div>
            </div>

            <div className="cf-opcion">
              <span className="cf-opcion-icono"><i className="bi bi-phone-vibrate" aria-hidden="true" /></span>
              <div className="cf-opcion-texto">
                <p className="cf-opcion-titulo">Vibración</p>
                <p className="cf-opcion-desc">Vibrar al recibir una notificación</p>
              </div>
              <div className="form-check form-switch m-0">
                <input className="form-check-input" type="checkbox" role="switch" aria-label="Vibración" />
              </div>
            </div>

            <div className="cf-opcion">
              <span className="cf-opcion-icono"><i className="bi bi-map" aria-hidden="true" /></span>
              <div className="cf-opcion-texto">
                <p className="cf-opcion-titulo">Preferencias del mapa</p>
                <p className="cf-opcion-desc">Mostrar tráfico y unidades cercanas</p>
              </div>
              <div className="form-check form-switch m-0">
                <input className="form-check-input" type="checkbox" role="switch" aria-label="Preferencias del mapa" defaultChecked />
              </div>
            </div>
          </section>

          {/* Cuenta */}
          <section className="card-panel-dash cf-panel" aria-labelledby="cf-cuenta-titulo">
            <h2 className="cf-titulo" id="cf-cuenta-titulo">
              <i className="bi bi-shield-lock" aria-hidden="true" />
              Cuenta
            </h2>

            <button type="button" className="cf-accion">
              <span className="cf-accion-izq">
                <i className="bi bi-key" aria-hidden="true" />
                Cambiar contraseña
              </span>
              <i className="bi bi-chevron-right" aria-hidden="true" />
            </button>

            <button type="button" className="cf-accion cf-accion--peligro" onClick={cerrarSesion}>
              <span className="cf-accion-izq">
                <i className="bi bi-box-arrow-right" aria-hidden="true" />
                Cerrar sesión
              </span>
              <i className="bi bi-chevron-right" aria-hidden="true" />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Configuracion;