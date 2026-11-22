
import { useEffect, useState } from "react";
import Layout from "../../Components/transito/Layout";

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
  const [configuracion, setConfiguracion] =
    useState(leerConfiguracion);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!mensaje) return;

    // El mensaje se conserva hasta el siguiente cambio.
  }, [mensaje]);

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

  return (
    <Layout
      rol="central"
      titulo="Configuración"
      activo="configuracion"
      busqueda={{
        placeholder: "Buscar por caso, barrio o agente...",
      }}
    >
      <header className="st-header mb-4">
        <div>
          <span className="st-eyebrow">
            CENTRAL DE TRÁNSITO
          </span>

          <h1>Configuración</h1>

          <p>
            Preferencias de notificaciones y del turno
            de despacho.
          </p>
        </div>
      </header>

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

        <Fila
          titulo="Contraseña"
          texto="El cambio de contraseña requiere el endpoint de seguridad de tu API."
        >
          <button
            type="button"
            className="btn-secundario-dash"
            disabled
            title="Pendiente de integrar con el backend"
          >
            Cambiar contraseña
          </button>
        </Fila>

        <Fila
          titulo="Sesiones activas"
          texto="Cierra el acceso desde otros dispositivos conectados a tu cuenta."
        >
          <button
            type="button"
            className="btn-secundario-dash"
            disabled
            title="Pendiente de integrar con el backend"
          >
            Cerrar otras sesiones
          </button>
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
