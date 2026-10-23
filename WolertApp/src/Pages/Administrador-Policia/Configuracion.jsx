
import { useRef, useState } from 'react';
import Topbar from '../../Components/Administrador-policia/Topbar';
import '../../css/Policia/administrador-policia/css/configuracion.css';

function Configuracion() {
  const inputFotoRef = useRef(null);
  const [foto, setFoto] = useState('');
  const [nombre, setNombre] = useState('Sofía Gómez');
  const [correo, setCorreo] = useState('sofia.gomez@wolertapp.com');
  const [telefono, setTelefono] = useState('+57 300 123 4567');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const [password, setPassword] = useState({
    actual: '',
    nueva: '',
    confirmar: '',
  });

  const iniciales = nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase() || '')
    .join('') || 'US';

  const seleccionarFoto = (event) => {
    const archivo = event.target.files?.[0];

    if (!archivo) return;

    if (!['image/jpeg', 'image/png'].includes(archivo.type)) {
      setMensaje('Selecciona una imagen JPG o PNG.');
      event.target.value = '';
      return;
    }

    if (archivo.size > 2 * 1024 * 1024) {
      setMensaje('La imagen no puede superar los 2 MB.');
      event.target.value = '';
      return;
    }

    setFoto(URL.createObjectURL(archivo));
    setMensaje('');
    event.target.value = '';
  };

  const guardarCambios = (event) => {
    event.preventDefault();
    setMensaje('Diseño preparado. La función de guardado se conectará al backend.');
  };

  const actualizarPassword = (event) => {
    event.preventDefault();

    if (!password.actual || !password.nueva || !password.confirmar) {
      setMensaje('Completa todos los campos de contraseña.');
      return;
    }

    if (password.nueva.length < 8) {
      setMensaje('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password.nueva !== password.confirmar) {
      setMensaje('Las contraseñas nuevas no coinciden.');
      return;
    }

    setMensaje('Formulario validado. Falta conectar el servicio del backend.');
  };

  return (
    <>
      <Topbar placeholder="Buscar por alerta, barrio, unidad, policía..." />

      <main className="main-dash configuracion-page">
        <div className="container-fluid">

          {/* Encabezado */}
          <header className="config-header">
            <div>
              <span className="config-eyebrow">
                <i className="bi bi-sliders2 me-2" />
                PREFERENCIAS DE USUARIO
              </span>

              <h1 className="config-title">Configuración</h1>

              <p className="config-subtitle">
                Administra tu información personal y las opciones de seguridad.
              </p>
            </div>

            <div className="config-header-icon">
              <i className="bi bi-person-gear" />
            </div>
          </header>

          <div className="row g-4">

            {/* Tarjeta de perfil */}
            <div className="col-lg-4">
              <section className="card config-profile-card h-100">
                <div className="config-profile-top">
                  <span className="config-section-eyebrow">
                    PERFIL DE USUARIO
                  </span>

                  <div className="config-avatar-wrap">
                    {foto ? (
                      <img
                        src={foto}
                        alt="Foto de perfil"
                        className="config-avatar-img"
                      />
                    ) : (
                      <span className="config-avatar-fallback">
                        {iniciales}
                      </span>
                    )}

                    <button
                      type="button"
                      className="config-avatar-edit"
                      title="Cambiar foto"
                      aria-label="Cambiar foto de perfil"
                      onClick={() => inputFotoRef.current?.click()}
                    >
                      <i className="bi bi-camera-fill" />
                    </button>

                    <input
                      ref={inputFotoRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      hidden
                      onChange={seleccionarFoto}
                    />
                  </div>

                  <h2 className="config-profile-name">{nombre}</h2>

                  <span className="config-role-badge">
                    <i className="bi bi-shield-check" />
                    Comandante de Estación
                  </span>
                </div>

                <div className="config-profile-details">
                  <div className="config-detail-row">
                    <span className="config-detail-icon">
                      <i className="bi bi-geo-alt" />
                    </span>

                    <div className="config-detail-info">
                      <span>Estación asignada</span>
                      <strong>Estación Norte</strong>
                    </div>

                    <i className="bi bi-lock-fill config-lock-icon" />
                  </div>

                  <div className="config-detail-row">
                    <span className="config-detail-icon">
                      <i className="bi bi-person-badge" />
                    </span>

                    <div className="config-detail-info">
                      <span>Rol del sistema</span>
                      <strong>Comandante de Estación</strong>
                    </div>

                    <i className="bi bi-lock-fill config-lock-icon" />
                  </div>

                  <p className="config-photo-hint">
                    <i className="bi bi-info-circle me-1" />
                    JPG o PNG · Máximo 2 MB
                  </p>
                </div>
              </section>
            </div>

            {/* Formularios */}
            <div className="col-lg-8">

              {/* Información personal */}
              <section className="card config-card mb-4">
                <div className="config-card-heading">
                  <span className="config-card-icon">
                    <i className="bi bi-person-lines-fill" />
                  </span>

                  <div>
                    <h2>Información personal</h2>
                    <p>Actualiza tus datos de contacto.</p>
                  </div>
                </div>

                <form onSubmit={guardarCambios}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="config-label" htmlFor="configNombre">
                        Nombre completo
                      </label>
                      <input
                        id="configNombre"
                        className="form-control config-input"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="config-label" htmlFor="configCorreo">
                        Correo electrónico
                      </label>
                      <input
                        id="configCorreo"
                        type="email"
                        className="form-control config-input"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="config-label" htmlFor="configTelefono">
                        Número de teléfono
                      </label>
                      <input
                        id="configTelefono"
                        type="tel"
                        className="form-control config-input"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="config-label">Rol</label>
                      <div className="form-control config-input config-readonly">
                        <i className="bi bi-lock-fill" />
                        Comandante de Estación
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="config-label">Estación asignada</label>
                      <div className="form-control config-input config-readonly">
                        <i className="bi bi-lock-fill" />
                        Estación Norte
                      </div>
                    </div>
                  </div>

                  <div className="config-form-footer">
                    <button type="submit" className="btn config-btn-primary">
                      <i className="bi bi-check2 me-1" />
                      Guardar cambios
                    </button>
                  </div>
                </form>
              </section>

              {/* Seguridad */}
              <section className="card config-card">
                <div className="config-card-heading config-security-heading">
                  <span className="config-card-icon">
                    <i className="bi bi-shield-lock" />
                  </span>

                  <div className="config-security-heading-text">
                    <h2>Seguridad de la cuenta</h2>
                    <p>Gestiona la contraseña de acceso.</p>
                  </div>

                  <button
                    type="button"
                    className="btn config-btn-secondary"
                    aria-expanded={mostrarPassword}
                    onClick={() => {
                      setMostrarPassword((actual) => !actual);
                      setMensaje('');
                    }}
                  >
                    <i className={`bi ${mostrarPassword ? 'bi-x-lg' : 'bi-key'} me-1`} />
                    {mostrarPassword ? 'Cancelar' : 'Cambiar contraseña'}
                  </button>
                </div>

                {!mostrarPassword && (
                  <div className="config-security-note">
                    <i className="bi bi-shield-check" />
                    <span>
                      Se recomienda utilizar una contraseña única de al menos
                      8 caracteres.
                    </span>
                  </div>
                )}

                {mostrarPassword && (
                  <form className="config-password-form" onSubmit={actualizarPassword}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="config-label" htmlFor="configPassActual">
                          Contraseña actual
                        </label>
                        <input
                          id="configPassActual"
                          type="password"
                          autoComplete="current-password"
                          className="form-control config-input"
                          value={password.actual}
                          onChange={(e) =>
                            setPassword({ ...password, actual: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="config-label" htmlFor="configPassNueva">
                          Nueva contraseña
                        </label>
                        <input
                          id="configPassNueva"
                          type="password"
                          autoComplete="new-password"
                          minLength={8}
                          className="form-control config-input"
                          value={password.nueva}
                          onChange={(e) =>
                            setPassword({ ...password, nueva: e.target.value })
                          }
                          required
                        />
                        <small className="config-input-hint">
                          Mínimo 8 caracteres.
                        </small>
                      </div>

                      <div className="col-md-6">
                        <label className="config-label" htmlFor="configPassConfirmar">
                          Confirmar nueva contraseña
                        </label>
                        <input
                          id="configPassConfirmar"
                          type="password"
                          autoComplete="new-password"
                          minLength={8}
                          className="form-control config-input"
                          value={password.confirmar}
                          onChange={(e) =>
                            setPassword({ ...password, confirmar: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="config-form-footer">
                      <button
                        type="button"
                        className="btn config-btn-secondary"
                        onClick={() => {
                          setPassword({ actual: '', nueva: '', confirmar: '' });
                          setMostrarPassword(false);
                          setMensaje('');
                        }}
                      >
                        Cancelar
                      </button>

                      <button type="submit" className="btn config-btn-primary">
                        <i className="bi bi-check2 me-1" />
                        Actualizar contraseña
                      </button>
                    </div>
                  </form>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Aviso visual */}
      {mensaje && (
        <div className="config-toast" role="status" aria-live="polite">
          <i className="bi bi-info-circle-fill" />
          <span>{mensaje}</span>
          <button
            type="button"
            aria-label="Cerrar aviso"
            onClick={() => setMensaje('')}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}
    </>
  );
}

export default Configuracion;
