

import Topbar from '../../Components/Administrador-policia/Topbar';
import '../../css/Policia/administrador-policia/css/configuracion.css';

function Configuracion() {
  return (
    <>
      <Topbar placeholder="Buscar en el sistema..." />

      <main className="container-fluid px-3 px-lg-4 py-4 configuracion-page">
        {/* Encabezado */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <div className="configuracion-eyebrow">
              <i className="bi bi-sliders2 me-2"></i>
              ADMINISTRACIÓN
            </div>

            <h2 className="configuracion-title mb-1">
              Configuración
            </h2>

            <p className="configuracion-subtitle mb-0">
              Consulta las opciones de tu cuenta y seguridad.
            </p>
          </div>

          <div className="configuracion-header-icon">
            <i className="bi bi-gear-wide-connected"></i>
          </div>
        </div>

        <div className="row g-4">
          {/* Menú lateral informativo */}
          <div className="col-12 col-xl-3">
            <div className="configuracion-card configuracion-menu">
              <div className="configuracion-menu-heading">
                OPCIONES DE CUENTA
              </div>

              <div className="configuracion-menu-item active">
                <i className="bi bi-person-circle"></i>
                <span>Mi perfil</span>
              </div>

              <div className="configuracion-menu-item">
                <i className="bi bi-shield-lock"></i>
                <span>Seguridad</span>
              </div>

              <div className="configuracion-menu-item">
                <i className="bi bi-bell"></i>
                <span>Notificaciones</span>
              </div>

              <div className="configuracion-menu-item">
                <i className="bi bi-info-circle"></i>
                <span>Información de la cuenta</span>
              </div>

              <div className="configuracion-menu-note mt-4">
                <i className="bi bi-info-circle-fill"></i>
                <p className="mb-0">
                  Esta sección es únicamente informativa.
                  Las opciones todavía no están conectadas
                  a las funciones del sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="col-12 col-xl-9">
            {/* Perfil */}
            <section className="configuracion-card mb-4">
              <div className="configuracion-section-header">
                <div className="configuracion-section-icon">
                  <i className="bi bi-person-vcard"></i>
                </div>

                <div>
                  <h5 className="mb-1">Mi perfil</h5>
                  <p className="mb-0">
                    Información personal de la cuenta.
                  </p>
                </div>
              </div>

              <div className="configuracion-profile">
                <div className="configuracion-avatar">
                  <i className="bi bi-person-fill"></i>
                </div>

                <div>
                  <h6 className="mb-1">Perfil de usuario</h6>
                  <p className="mb-0">
                    Administrador de Policía
                  </p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    className="form-control configuracion-input"
                    placeholder="No disponible"
                    disabled
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    className="form-control configuracion-input"
                    placeholder="No disponible"
                    disabled
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">
                    Número de teléfono
                  </label>
                  <input
                    type="tel"
                    className="form-control configuracion-input"
                    placeholder="No disponible"
                    disabled
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">
                    Rol asignado
                  </label>
                  <input
                    type="text"
                    className="form-control configuracion-input"
                    value=""
                    placeholder="No disponible"
                    disabled
                    readOnly
                  />
                </div>
              </div>
            </section>

            {/* Seguridad */}
            <section className="configuracion-card mb-4">
              <div className="configuracion-section-header">
                <div className="configuracion-section-icon">
                  <i className="bi bi-shield-lock"></i>
                </div>

                <div>
                  <h5 className="mb-1">Seguridad de la cuenta</h5>
                  <p className="mb-0">
                    Opciones relacionadas con el acceso al sistema.
                  </p>
                </div>
              </div>

              <div className="configuracion-option">
                <div className="configuracion-option-icon">
                  <i className="bi bi-key"></i>
                </div>

                <div className="flex-grow-1">
                  <h6>Cambiar contraseña</h6>
                  <p>
                    La actualización de contraseña aún no está disponible.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn configuracion-btn-outline"
                  disabled
                >
                  <i className="bi bi-lock me-2"></i>
                  No disponible
                </button>
              </div>

              <div className="configuracion-option">
                <div className="configuracion-option-icon">
                  <i className="bi bi-box-arrow-right"></i>
                </div>

                <div className="flex-grow-1">
                  <h6>Cerrar sesión</h6>
                  <p>
                    Finalizar la sesión actual del usuario.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn configuracion-btn-outline"
                  disabled
                >
                  No disponible
                </button>
              </div>
            </section>

            {/* Notificaciones */}
            <section className="configuracion-card mb-4">
              <div className="configuracion-section-header">
                <div className="configuracion-section-icon">
                  <i className="bi bi-bell"></i>
                </div>

                <div>
                  <h5 className="mb-1">Notificaciones</h5>
                  <p className="mb-0">
                    Avisos relacionados con la actividad policial.
                  </p>
                </div>
              </div>

              <div className="configuracion-notification">
                <div className="configuracion-notification-icon">
                  <i className="bi bi-bell-fill"></i>
                </div>

                <div>
                  <h6>Nuevas alertas</h6>
                  <p>
                    Avisos sobre alertas recibidas por el sistema.
                  </p>
                </div>

                <span className="configuracion-status">
                  <i className="bi bi-lock-fill me-1"></i>
                  No disponible
                </span>
              </div>

              <div className="configuracion-notification">
                <div className="configuracion-notification-icon">
                  <i className="bi bi-clock-history"></i>
                </div>

                <div>
                  <h6>Alertas pendientes</h6>
                  <p>
                    Avisos sobre alertas que requieren seguimiento.
                  </p>
                </div>

                <span className="configuracion-status">
                  <i className="bi bi-lock-fill me-1"></i>
                  No disponible
                </span>
              </div>

              <div className="configuracion-notification">
                <div className="configuracion-notification-icon">
                  <i className="bi bi-file-earmark-text"></i>
                </div>

                <div>
                  <h6>Actualizaciones de reportes</h6>
                  <p>
                    Información sobre cambios en los reportes.
                  </p>
                </div>

                <span className="configuracion-status">
                  <i className="bi bi-lock-fill me-1"></i>
                  No disponible
                </span>
              </div>
            </section>

            {/* Información de la cuenta */}
            <section className="configuracion-card">
              <div className="configuracion-section-header">
                <div className="configuracion-section-icon">
                  <i className="bi bi-info-square"></i>
                </div>

                <div>
                  <h5 className="mb-1">
                    Información de la cuenta
                  </h5>
                  <p className="mb-0">
                    Datos administrativos asociados al usuario.
                  </p>
                </div>
              </div>

              <div className="configuracion-info-grid">
                <div className="configuracion-info-item">
                  <span>Rol del usuario</span>
                  <div>
                    <i className="bi bi-person-badge me-2"></i>
                    Administrador de Policía
                  </div>
                </div>

                <div className="configuracion-info-item">
                  <span>Estación o dependencia</span>
                  <div>
                    <i className="bi bi-building me-2"></i>
                    No disponible
                  </div>
                </div>

                <div className="configuracion-info-item">
                  <span>Estado de la cuenta</span>
                  <div>
                    <i className="bi bi-circle me-2"></i>
                    No disponible
                  </div>
                </div>

                <div className="configuracion-info-item">
                  <span>Identificador de usuario</span>
                  <div>
                    <i className="bi bi-fingerprint me-2"></i>
                    No disponible
                  </div>
                </div>
              </div>

              <div className="configuracion-readonly-note mt-4">
                <i className="bi bi-shield-check me-2"></i>
                La información administrativa se muestra como
                consulta y no puede modificarse desde esta página.
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export default Configuracion;
