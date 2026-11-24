
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../Components/transito/Layout";
import ConfiguracionCuenta from "../../../Components/transito/ConfiguracionCuenta";
import { cambiarPassword, logOut } from "../../../Services/UsuariosAPI";
import { obtenerSesionTransito } from "../../../Services/transitoApi";

const CLAVE_CONFIGURACION = "wolert_director_transito_config";

const CONFIGURACION_INICIAL = {
  nombreSecretaria: "Secretaría de Tránsito",
  correo: "",
  telefono: "",
  zonaHoraria: "America/Bogota",
  notificarCriticos: true,
  resumenDiario: true,
  notificarAgentes: false,
  oscuro: false,
};

function leerConfiguracion() {
  try {
    const guardado = localStorage.getItem(CLAVE_CONFIGURACION);

    if (!guardado) {
      return CONFIGURACION_INICIAL;
    }

    const datos = JSON.parse(guardado);

    return {
      ...CONFIGURACION_INICIAL,
      ...datos,
    };
  } catch {
    return CONFIGURACION_INICIAL;
  }
}

export default function Configuracion() {
  const navigate = useNavigate();
  const idUsuario = obtenerSesionTransito().idUsuario;
  const [configuracion, setConfiguracion] = useState(
    leerConfiguracion
  );
  const [mensaje, setMensaje] = useState("");
  const [password, setPassword] = useState({ actual: "", nueva: "", confirmar: "" });
  const [mensajeSeguridad, setMensajeSeguridad] = useState("");
  const [errorSeguridad, setErrorSeguridad] = useState("");
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  useEffect(() => {
    document.body.classList.toggle(
      "tema-oscuro",
      configuracion.oscuro
    );

    return () => {
      document.body.classList.remove("tema-oscuro");
    };
  }, [configuracion.oscuro]);

  function actualizar(campo, valor) {
    setConfiguracion((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    setMensaje("");
  }

  function guardarCambios() {
    try {
      localStorage.setItem(
        CLAVE_CONFIGURACION,
        JSON.stringify(configuracion)
      );

      setMensaje(
        "Configuración guardada en este navegador."
      );
    } catch {
      setMensaje(
        "No fue posible guardar la configuración."
      );
    }
  }

  async function guardarPassword(event) {
    event.preventDefault();
    setErrorSeguridad("");
    setMensajeSeguridad("");
    if (!idUsuario) return setErrorSeguridad("No encontramos el identificador de tu cuenta.");
    if (!password.actual || !password.nueva || !password.confirmar) return setErrorSeguridad("Completa los tres campos.");
    if (password.nueva.length < 8) return setErrorSeguridad("La nueva contraseña debe tener al menos 8 caracteres.");
    if (password.nueva !== password.confirmar) return setErrorSeguridad("La confirmación no coincide.");
    if (password.actual === password.nueva) return setErrorSeguridad("La nueva contraseña debe ser distinta a la actual.");
    try {
      setGuardandoPassword(true);
      await cambiarPassword(idUsuario, password.actual, password.nueva);
      setPassword({ actual: "", nueva: "", confirmar: "" });
      setMensajeSeguridad("Contraseña actualizada correctamente.");
    } catch (error) {
      setErrorSeguridad(error.message || "No se pudo actualizar la contraseña.");
    } finally { setGuardandoPassword(false); }
  }

  function cerrarSesion() {
    if (!window.confirm("¿Seguro que quieres cerrar sesión?")) return;
    document.body.classList.remove("tema-oscuro");
    logOut();
    navigate("/login", { replace: true });
  }

  return (
    <Layout
      titulo="Configuración de Tránsito"
      activo="configuracion"
      busqueda={{
        placeholder: "Buscar por caso, barrio o agente...",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="section-title-dash">
            Configuración
          </h1>

          <p className="section-text-dash mb-0">
            Ajusta los datos generales, notificaciones
            y seguridad del módulo de Tránsito.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary rounded-pill fw-bold btn-nuevo-dash"
          onClick={guardarCambios}
        >
          <i className="bi bi-check-lg me-2" />
          Guardar cambios
        </button>
      </div>

      <ConfiguracionCuenta />

      {mensaje && (
        <div
          className={`alert ${
            mensaje.startsWith("No fue")
              ? "alert-danger"
              : "alert-success"
          }`}
          role="status"
        >
          {mensaje}
        </div>
      )}

      <div className="table-card-dash mb-4">
        {(
          <div className="row g-4">
            <div className="col-md-6">
              <label
                htmlFor="nombreSecretaria"
                className="form-label-dash"
              >
                Nombre de la secretaría
              </label>

              <input
                id="nombreSecretaria"
                type="text"
                className="form-control input-dash"
                value={configuracion.nombreSecretaria}
                onChange={(e) =>
                  actualizar(
                    "nombreSecretaria",
                    e.target.value
                  )
                }
              />
            </div>

            <div className="col-md-6">
              <label
                htmlFor="correoContacto"
                className="form-label-dash"
              >
                Correo de contacto
              </label>

              <input
                id="correoContacto"
                type="email"
                className="form-control input-dash"
                placeholder="correo@institucion.gov.co"
                value={configuracion.correo}
                onChange={(e) =>
                  actualizar("correo", e.target.value)
                }
              />
            </div>

            <div className="col-md-6">
              <label
                htmlFor="telefonoContacto"
                className="form-label-dash"
              >
                Teléfono de atención
              </label>

              <input
                id="telefonoContacto"
                type="tel"
                className="form-control input-dash"
                placeholder="Teléfono de contacto"
                value={configuracion.telefono}
                onChange={(e) =>
                  actualizar("telefono", e.target.value)
                }
              />
            </div>

            <div className="col-md-6">
              <label
                htmlFor="zonaHoraria"
                className="form-label-dash"
              >
                Zona horaria
              </label>

              <select
                id="zonaHoraria"
                className="form-select input-dash"
                value={configuracion.zonaHoraria}
                onChange={(e) =>
                  actualizar(
                    "zonaHoraria",
                    e.target.value
                  )
                }
              >
                <option value="America/Bogota">
                  América/Bogotá (GMT-5)
                </option>

                <option value="America/Mexico_City">
                  América/Ciudad de México
                </option>
              </select>
            </div>
          </div>
        )}

        {(
          <div>
            <h2 className="subsection-title-dash mb-3">
              Notificaciones
            </h2>

            <div className="alert alert-info small">
              Estas opciones guardan tus preferencias
              en el navegador. El envío real de alertas
              y correos requiere integración con la API.
            </div>

            <div className="setting-row-dash">
              <div>
                <p className="setting-name-dash">
                  Casos críticos
                </p>

                <p className="setting-desc-dash mb-0">
                  Preferencia para recibir alertas
                  de casos de prioridad alta.
                </p>
              </div>

              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input switch-dash"
                  checked={
                    configuracion.notificarCriticos
                  }
                  onChange={(e) =>
                    actualizar(
                      "notificarCriticos",
                      e.target.checked
                    )
                  }
                  aria-label="Notificar casos críticos"
                />
              </div>
            </div>

            <div className="setting-row-dash">
              <div>
                <p className="setting-name-dash">
                  Resumen diario
                </p>

                <p className="setting-desc-dash mb-0">
                  Preferencia para recibir un resumen
                  de la actividad diaria.
                </p>
              </div>

              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input switch-dash"
                  checked={
                    configuracion.resumenDiario
                  }
                  onChange={(e) =>
                    actualizar(
                      "resumenDiario",
                      e.target.checked
                    )
                  }
                  aria-label="Resumen diario"
                />
              </div>
            </div>

            <div className="setting-row-dash border-0">
              <div>
                <p className="setting-name-dash">
                  Nuevos agentes registrados
                </p>

                <p className="setting-desc-dash mb-0">
                  Preferencia para recibir avisos
                  cuando se registre un agente.
                </p>
              </div>

              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input switch-dash"
                  checked={
                    configuracion.notificarAgentes
                  }
                  onChange={(e) =>
                    actualizar(
                      "notificarAgentes",
                      e.target.checked
                    )
                  }
                  aria-label="Notificar nuevos agentes"
                />
              </div>
            </div>
          </div>
        )}

        {(
          <div>
            <h2 className="subsection-title-dash mb-3">
              Seguridad
            </h2>

            <form onSubmit={guardarPassword}>
              {errorSeguridad && <div className="alert alert-danger" role="alert">{errorSeguridad}</div>}
              {mensajeSeguridad && <div className="alert alert-success" role="status">{mensajeSeguridad}</div>}
              <div className="row g-4">
              <div className="col-md-6">
                <label htmlFor="passwordActualDirector" className="form-label-dash">
                  Contraseña actual
                </label>
                <input
                  id="passwordActualDirector"
                  type="password"
                  className="form-control input-dash"
                  autoComplete="current-password"
                  value={password.actual}
                  onChange={(e) => setPassword({ ...password, actual: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="passwordNuevaDirector" className="form-label-dash">
                  Nueva contraseña
                </label>
                <input
                  id="passwordNuevaDirector"
                  type="password"
                  className="form-control input-dash"
                  autoComplete="new-password"
                  minLength={8}
                  value={password.nueva}
                  onChange={(e) => setPassword({ ...password, nueva: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="passwordConfirmarDirector" className="form-label-dash">Confirmar nueva contraseña</label>
                <input id="passwordConfirmarDirector" type="password" className="form-control input-dash" autoComplete="new-password" minLength={8} value={password.confirmar} onChange={(e) => setPassword({ ...password, confirmar: e.target.value })} />
              </div>
              </div>
              <button type="submit" className="btn btn-primary rounded-pill fw-bold btn-nuevo-dash mt-3" disabled={guardandoPassword}>
                {guardandoPassword ? "Actualizando..." : "Actualizar contraseña"}
              </button>
            </form>
            <div className="setting-row-dash border-0 mt-4">
              <div><p className="setting-name-dash">Verificación en dos pasos</p><p className="setting-desc-dash mb-0">Esta función requiere soporte de autenticación de dos factores en el servidor.</p></div>
              <span className="badge text-bg-secondary">No disponible</span>
            </div>
            <div className="setting-row-dash border-0">
              <div><p className="setting-name-dash">Sesión</p><p className="setting-desc-dash mb-0">Cierra tu acceso en este dispositivo.</p></div>
              <button type="button" className="btn-secundario-dash" onClick={cerrarSesion}>Cerrar sesión</button>
              </div>
          </div>
        )}

        {(
          <div>
            <h2 className="subsection-title-dash mb-3">
              Apariencia
            </h2>

            <div className="setting-row-dash border-0">
              <div>
                <p className="setting-name-dash">
                  Tema oscuro
                </p>

                <p className="setting-desc-dash mb-0">
                  Cambia la apariencia del panel
                  a modo oscuro.
                </p>
              </div>

              <div className="form-check form-switch">
                <input
                  className="form-check-input switch-dash"
                  type="checkbox"
                  id="temaOscuroSwitch"
                  checked={configuracion.oscuro}
                  onChange={(e) =>
                    actualizar(
                      "oscuro",
                      e.target.checked
                    )
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
