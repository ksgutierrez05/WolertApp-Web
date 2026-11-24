
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../Components/transito/Layout";
import ConfiguracionCuenta from "../../../Components/transito/ConfiguracionCuenta";
import { cambiarPassword, logOut } from "../../../Services/UsuariosAPI";
import { obtenerSesionTransito } from "../../../Services/transitoApi";

const CLAVE = "wolert_central_transito_config";

const INICIAL = {
  sonidoCasos: true,
  avisoCritico: true,
  turno: "2:00 p.m. – 10:00 p.m.",
  tiempoReasignacion: "5 minutos",
  reasignacionAutomatica: false,
};

function leerConfiguracion() {
  try {
    const guardado = JSON.parse(
      localStorage.getItem(CLAVE) || "null"
    );

    if (
      guardado &&
      typeof guardado === "object" &&
      !Array.isArray(guardado)
    ) {
      return { ...INICIAL, ...guardado };
    }
  } catch {
    // Mantener la configuración inicial.
  }

  return { ...INICIAL };
}

function Fila({ titulo, texto, children }) {
  return (
    <div className="config-row-dash">
      <div>
        <div className="config-label-dash">
          {titulo}
        </div>
        <div className="config-text-dash">
          {texto}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Configuracion() {
  const navigate = useNavigate();
  const sesion = obtenerSesionTransito();
  const [configuracion, setConfiguracion] =
    useState(leerConfiguracion);
  const [mensaje, setMensaje] = useState("");
  const [password, setPassword] = useState({ actual: "", nueva: "", confirmar: "" });
  const [errorPassword, setErrorPassword] = useState("");
  const [avisoPassword, setAvisoPassword] = useState("");
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  function actualizar(campo, valor) {
    setConfiguracion((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
    setMensaje("");
  }

  function guardar() {
    try {
      localStorage.setItem(
        CLAVE,
        JSON.stringify(configuracion)
      );

      setMensaje(
        "Preferencias guardadas en este navegador."
      );
    } catch {
      setMensaje(
        "No se pudieron guardar las preferencias."
      );
    }
  }

  async function guardarPassword(event) {
    event.preventDefault(); setErrorPassword(""); setAvisoPassword("");
    if (!sesion.idUsuario) return setErrorPassword("No encontramos el identificador de tu cuenta.");
    if (!password.actual || !password.nueva || !password.confirmar) return setErrorPassword("Completa los tres campos.");
    if (password.nueva.length < 8) return setErrorPassword("La nueva contraseña debe tener al menos 8 caracteres.");
    if (password.nueva !== password.confirmar) return setErrorPassword("La confirmación no coincide.");
    if (password.actual === password.nueva) return setErrorPassword("La nueva contraseña debe ser distinta a la actual.");
    try {
      setGuardandoPassword(true);
      await cambiarPassword(sesion.idUsuario, password.actual, password.nueva);
      setPassword({ actual: "", nueva: "", confirmar: "" }); setAvisoPassword("Contraseña actualizada correctamente.");
    } catch (error) { setErrorPassword(error.message || "No se pudo actualizar la contraseña."); }
    finally { setGuardandoPassword(false); }
  }

  function cerrarSesion() {
    if (!window.confirm("¿Seguro que quieres cerrar sesión?")) return;
    logOut();
    [sessionStorage, localStorage].forEach((storage) => ["accessToken", "authToken", "jwt", "usuario", "user", "usuarioActual", "currentUser"].forEach((key) => storage.removeItem(key)));
    navigate("/login", { replace: true });
  }

  return (
    <Layout
      rol="central"
      titulo="Configuración"
      activo="configuracion"
      busqueda={{
        placeholder: "Buscar por caso, barrio o agente...",
      }}
    >
      <div className="mb-4">
        <h1 className="section-title-dash">
          Configuración
        </h1>

        <p className="section-text-dash mb-0">
          Preferencias de notificaciones y del turno
          de despacho.
        </p>
      </div>

      <ConfiguracionCuenta />

      {mensaje && (
        <div
          className={`alert ${
            mensaje.startsWith("No se")
              ? "alert-warning"
              : "alert-success"
          }`}
          role="status"
        >
          {mensaje}
        </div>
      )}

      <div className="panel-card-dash mb-3">
        <h2 className="panel-title-dash">
          Notificaciones
        </h2>

        <Fila
          titulo="Sonido al recibir un caso nuevo"
          texto="Reproduce una alerta sonora cada vez que llega un reporte sin asignar."
        >
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              aria-label="Sonido al recibir un caso nuevo"
              checked={configuracion.sonidoCasos}
              onChange={(e) =>
                actualizar(
                  "sonidoCasos",
                  e.target.checked
                )
              }
            />
          </div>
        </Fila>

        <Fila
          titulo="Aviso de espera crítica"
          texto="Notifica cuando un caso lleva más de 10 minutos sin ser asignado."
        >
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              aria-label="Aviso de espera crítica"
              checked={configuracion.avisoCritico}
              onChange={(e) =>
                actualizar(
                  "avisoCritico",
                  e.target.checked
                )
              }
            />
          </div>
        </Fila>

        <p className="text-muted small mt-3 mb-0">
          Estas preferencias se almacenan localmente.
          Los avisos automáticos necesitan integración
          con el sistema de notificaciones.
        </p>
      </div>

      <div className="panel-card-dash mb-3">
        <h2 className="panel-title-dash">
          Turno de despacho
        </h2>

        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label
              className="config-field-label-dash"
              htmlFor="turnoCentral"
            >
              Horario del turno
            </label>

            <select
              id="turnoCentral"
              className="form-select"
              value={configuracion.turno}
              onChange={(e) =>
                actualizar("turno", e.target.value)
              }
            >
              <option>
                6:00 a.m. – 2:00 p.m.
              </option>
              <option>
                2:00 p.m. – 10:00 p.m.
              </option>
              <option>
                10:00 p.m. – 6:00 a.m.
              </option>
            </select>
          </div>

          <div className="col-md-4">
            <label
              className="config-field-label-dash"
              htmlFor="tiempoReasignacionCentral"
            >
              Reasignar si el agente no responde en
            </label>

            <select
              id="tiempoReasignacionCentral"
              className="form-select"
              value={configuracion.tiempoReasignacion}
              onChange={(e) =>
                actualizar(
                  "tiempoReasignacion",
                  e.target.value
                )
              }
            >
              <option>3 minutos</option>
              <option>5 minutos</option>
              <option>10 minutos</option>
            </select>
          </div>

          <div className="col-md-4">
            <div className="form-check form-switch d-flex align-items-center gap-2">
              <input
                id="reasignacionAutomaticaCentral"
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={
                  configuracion.reasignacionAutomatica
                }
                onChange={(e) =>
                  actualizar(
                    "reasignacionAutomatica",
                    e.target.checked
                  )
                }
              />

              <label
                htmlFor="reasignacionAutomaticaCentral"
                className="config-label-dash mb-0"
              >
                Reasignación automática
              </label>
            </div>
          </div>
        </div>

        <p className="text-muted small mt-3 mb-0">
          El horario y la reasignación se guardan
          como preferencias. No modifican los turnos
          ni reasignan casos en el backend.
        </p>
      </div>

      <div className="panel-card-dash mb-3">
        <h2 className="panel-title-dash">
          Cuenta
        </h2>

        <p className="config-text-dash mb-3">Actualiza la contraseña de tu cuenta.</p>
        {errorPassword && <div className="alert alert-danger" role="alert">{errorPassword}</div>}
        {avisoPassword && <div className="alert alert-success" role="status">{avisoPassword}</div>}
        <form onSubmit={guardarPassword} className="row g-3">
          {[["actual", "Contraseña actual", "current-password"], ["nueva", "Nueva contraseña", "new-password"], ["confirmar", "Confirmar nueva contraseña", "new-password"]].map(([key, label, autocomplete]) => (
            <div className="col-md-4" key={key}><label className="config-field-label-dash" htmlFor={`passwordCentral-${key}`}>{label}</label><input id={`passwordCentral-${key}`} className="form-control" type="password" autoComplete={autocomplete} minLength={key === "actual" ? undefined : 8} value={password[key]} onChange={(event) => setPassword({ ...password, [key]: event.target.value })} /></div>
          ))}
          <div className="col-12"><button type="submit" className="btn-secundario-dash" disabled={guardandoPassword}>{guardandoPassword ? "Actualizando..." : "Actualizar contraseña"}</button></div>
        </form>
        <Fila titulo="Sesiones activas" texto="Cierra la sesión de Central en este dispositivo.">
          <button type="button" className="btn-secundario-dash" onClick={cerrarSesion}>Cerrar sesión</button>
        </Fila>
      </div>

      <div className="d-flex justify-content-end mt-3">
        <button
          type="button"
          className="btn-asignar-dash"
          onClick={guardar}
        >
          <i className="bi bi-check2-circle me-2" />
          Guardar preferencias
        </button>
      </div>
    </Layout>
  );
}
