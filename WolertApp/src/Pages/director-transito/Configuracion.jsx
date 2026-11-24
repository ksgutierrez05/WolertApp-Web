
import { useEffect, useState } from "react";
import Layout from "../../Components/transito/Layout";
import ConfiguracionCuenta from "../../Components/transito/ConfiguracionCuenta";
import ConfiguracionContrasena from "../../Components/transito/ConfiguracionContrasena";
import "../../css/admin/configuracion.css";

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
  const [tab, setTab] = useState("general");
  const [configuracion, setConfiguracion] = useState(
    leerConfiguracion
  );
  const [mensaje, setMensaje] = useState("");

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

  const pestañas = [
    { id: "general", nombre: "General" },
    { id: "notificaciones", nombre: "Notificaciones" },
    { id: "seguridad", nombre: "Seguridad" },
    { id: "apariencia", nombre: "Apariencia" },
  ];

  return (
    <Layout
      titulo="Configuración de Tránsito"
      activo="configuracion"
      busqueda={{
        placeholder: "Buscar por caso, barrio o agente...",
      }}
    >
      <div className="admin-config-page transito-config-page">
      <div className="admin-config-hero">
        <div>
          <span><i className="bi bi-sliders me-1" /> CUENTA Y PREFERENCIAS</span>
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
          className="btn btn-cv-azul"
          onClick={guardarCambios}
        >
          <i className="bi bi-check-lg me-2" />
          Guardar cambios
        </button>
      </div>

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

      <ConfiguracionCuenta />

      <div className="card-panel-dash transito-config-panel mb-4">
        <div className="d-flex gap-2 tabs-dash mb-4 flex-wrap">
          {pestañas.map((pestaña) => (
            <button
              key={pestaña.id}
              type="button"
              className={`tab-dash ${
                tab === pestaña.id ? "active-dash" : ""
              }`}
              onClick={() => setTab(pestaña.id)}
            >
              {pestaña.nombre}
            </button>
          ))}
        </div>

        {tab === "general" && (
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

        {tab === "notificaciones" && (
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

        {tab === "seguridad" && (
          <div>
            <h2 className="subsection-title-dash mb-3">Seguridad</h2>
            <ConfiguracionContrasena embedded />
          </div>
        )}
        {tab === "apariencia" && (
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
      </div>
    </Layout>
  );
}
