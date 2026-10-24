
import Topbar from '../../Components/Central-policia/Topbar';
import '../../css/Policia/central-policia/css/configuracion.css';

function Configuracion() {
  return (
    <>
      <Topbar placeholder="Buscar en configuración..." />

      <main className="main-dash">
        <div className="container-fluid">
          {/* Encabezado */}
          <header className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
            <div>
              <h1 className="page-title-dash">
                Configuración de perfil
              </h1>
              <p className="cfg-subtitle-dash">
                Actualiza tus datos personales y tu contraseña.
                Esta información identifica tu cuenta como operador.
              </p>
            </div>

            <button
              className="btn btn-cv-azul rounded-pill px-3"
              type="button"
            >
              <i className="bi bi-check2 me-1" />
              Guardar cambios
            </button>
          </header>

          {/* Portada del perfil */}
          <section className="cfg-hero-dash mb-4">
            <div className="cfg-hero-cover-dash" />

            <div className="cfg-hero-body-dash">
              <div className="cfg-avatar-wrap-dash">
                <div className="cfg-avatar-preview-dash">
                  CR
                </div>

                <button
                  type="button"
                  className="cfg-avatar-edit-dash"
                  title="Cambiar foto"
                >
                  <i className="bi bi-camera-fill" />
                </button>
              </div>

              <div className="cfg-hero-info-dash">
                <h2 className="cfg-hero-nombre-dash">
                  Operador de radio
                </h2>

                <div className="cfg-hero-meta-dash">
                  <span className="cfg-hero-cargo-dash">
                    <i className="bi bi-shield-check" />
                    Operador de radio
                  </span>

                  <span className="cfg-hero-correo-dash">
                    <i className="bi bi-envelope" />
                    Sin correo registrado
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 cfg-quitar-foto-dash"
              >
                <i className="bi bi-trash3 me-1" />
                Quitar foto
              </button>
            </div>
          </section>

          <div className="row g-4">
            {/* Columna principal */}
            <div className="col-12 col-xl-8">
              {/* Datos personales */}
              <section className="card-panel-dash p-4 mb-4">
                <div className="cfg-section-head-dash">
                  <i className="bi bi-person-vcard cfg-section-icon-dash" />
                  <div>
                    <h2 className="cfg-section-title-dash">
                      Datos personales
                    </h2>
                    <p className="cfg-section-sub-dash">
                      Información con la que te identificamos en el sistema.
                    </p>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="cfg-label-dash" htmlFor="perfilNombre">
                      Nombre completo
                    </label>
                    <div className="cfg-input-icon-dash">
                      <i className="bi bi-person" />
                      <input
                        id="perfilNombre"
                        type="text"
                        className="form-control cfg-input-dash"
                        placeholder="Nombre y apellidos"
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="cfg-label-dash" htmlFor="perfilCargo">
                      Cargo
                    </label>
                    <div className="cfg-input-icon-dash">
                      <i className="bi bi-shield-check" />
                      <input
                        id="perfilCargo"
                        type="text"
                        className="form-control cfg-input-dash"
                        placeholder="Ej. Operador de radio"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="cfg-label-dash" htmlFor="perfilCorreo">
                      Correo electrónico
                    </label>
                    <div className="cfg-input-icon-dash">
                      <i className="bi bi-envelope" />
                      <input
                        id="perfilCorreo"
                        type="email"
                        className="form-control cfg-input-dash"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="cfg-label-dash" htmlFor="perfilTelefono">
                      Teléfono
                    </label>
                    <div className="cfg-input-icon-dash">
                      <i className="bi bi-telephone" />
                      <input
                        id="perfilTelefono"
                        type="tel"
                        className="form-control cfg-input-dash"
                        placeholder="Ej. 300 000 0000"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Contraseña */}
              <section className="card-panel-dash p-4">
                <div className="cfg-section-head-dash">
                  <i className="bi bi-shield-lock cfg-section-icon-dash" />
                  <div>
                    <h2 className="cfg-section-title-dash">
                      Contraseña
                    </h2>
                    <p className="cfg-section-sub-dash">
                      Déjala en blanco si no quieres cambiarla.
                    </p>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <label className="cfg-label-dash" htmlFor="perfilPassActual">
                      Contraseña actual
                    </label>
                    <div className="cfg-input-icon-dash">
                      <i className="bi bi-lock" />
                      <input
                        id="perfilPassActual"
                        type="password"
                        className="form-control cfg-input-dash"
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="cfg-label-dash" htmlFor="perfilPassNueva">
                      Nueva contraseña
                    </label>
                    <div className="cfg-input-icon-dash">
                      <i className="bi bi-key" />
                      <input
                        id="perfilPassNueva"
                        type="password"
                        className="form-control cfg-input-dash"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="cfg-label-dash" htmlFor="perfilPassConfirmar">
                      Confirmar nueva contraseña
                    </label>
                    <div className="cfg-input-icon-dash">
                      <i className="bi bi-key-fill" />
                      <input
                        id="perfilPassConfirmar"
                        type="password"
                        className="form-control cfg-input-dash"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>

                <ul className="cfg-checklist-dash">
                  <li><i className="bi bi-circle" /> Mínimo 8 caracteres</li>
                  <li><i className="bi bi-circle" /> Una letra mayúscula</li>
                  <li><i className="bi bi-circle" /> Un número</li>
                  <li><i className="bi bi-circle" /> Un símbolo (!@#$...)</li>
                </ul>

                <div className="cfg-error-dash d-none">
                  <i className="bi bi-exclamation-circle" />
                  <span>Las contraseñas nuevas no coinciden.</span>
                </div>
              </section>
            </div>

            {/* Columna lateral */}
            <div className="col-12 col-xl-4">
              <div className="cfg-side-dash">
                <section className="card-panel-dash p-4 mb-4">
                  <div className="cfg-section-head-dash">
                    <i className="bi bi-info-circle cfg-section-icon-dash" />
                    <div>
                      <h2 className="cfg-section-title-dash">
                        Resumen de cuenta
                      </h2>
                      <p className="cfg-section-sub-dash">
                        Así te ven otros operadores en Central.
                      </p>
                    </div>
                  </div>

                  <div className="cfg-resumen-item-dash">
                    <span>Nombre</span>
                    <strong>—</strong>
                  </div>
                  <div className="cfg-resumen-item-dash">
                    <span>Cargo</span>
                    <strong>—</strong>
                  </div>
                  <div className="cfg-resumen-item-dash">
                    <span>Correo</span>
                    <strong>—</strong>
                  </div>
                  <div className="cfg-resumen-item-dash">
                    <span>Teléfono</span>
                    <strong>—</strong>
                  </div>
                </section>

                <section className="card-panel-dash p-4">
                  <div className="cfg-section-head-dash">
                    <i className="bi bi-shield-exclamation cfg-section-icon-dash" />
                    <div>
                      <h2 className="cfg-section-title-dash">
                        Consejos de seguridad
                      </h2>
                    </div>
                  </div>

                  <ul className="cfg-tips-dash">
                    <li>
                      <i className="bi bi-check2" />
                      No compartas tu contraseña con otros operadores.
                    </li>
                    <li>
                      <i className="bi bi-check2" />
                      Cambia tu contraseña periódicamente.
                    </li>
                    <li>
                      <i className="bi bi-check2" />
                      Verifica que tu correo esté siempre actualizado.
                    </li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Configuracion;
