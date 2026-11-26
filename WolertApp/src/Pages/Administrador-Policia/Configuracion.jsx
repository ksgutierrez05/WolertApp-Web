
import { useEffect, useState } from "react";
import Topbar from "../../Components/Administrador-policia/Topbar";
import { useFeedback } from "../../Components/Feedback/useFeedback";
import "../../css/Policia/administrador-policia/css/configuracion.css";

const API = (
  import.meta.env.VITE_API_URL || "https://localhost:7138"
).replace(/\/$/, "");

function obtenerIdUsuario() {
  const valor = localStorage.getItem("idUsuario");
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function obtenerToken() {
  return localStorage.getItem("token");
}

function obtenerIniciales(nombre) {
  if (!nombre) return "AP";

  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0))
    .join("")
    .toUpperCase();
}

function CampoInformativo({ etiqueta, valor, icono }) {
  return (
    <div className="config-field">
      <label className="config-label">{etiqueta}</label>

      <div className="config-input config-readonly">
        <i className={`bi ${icono}`} aria-hidden="true" />
        <span>{valor || "No disponible"}</span>
      </div>
    </div>
  );
}

function Configuracion() {
  const { toast } = useFeedback();
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  const [tema, setTema] = useState(
    () => localStorage.getItem("preferenciaTemaAdmin") || "claro"
  );

  const [notificacionesVisuales, setNotificacionesVisuales] =
    useState(
      () =>
        localStorage.getItem("preferenciaNotificacionesAdmin") !==
        "false"
    );

  useEffect(() => {
    if (error) toast.errorFrom(error, "No se pudo cargar el perfil.", "Error al cargar perfil");
  }, [error, toast]);

  useEffect(() => {
    const controller = new AbortController();
    const token = obtenerToken();
    const idUsuario = obtenerIdUsuario();

    async function cargarPerfil() {
      if (!token || !idUsuario) {
        setUsuario(null);
        setCargando(false);
        return;
      }

      try {
        const respuesta = await fetch(
          `${API}/api/Usuarios/${idUsuario}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (!respuesta.ok) {
          throw new Error(
            `No se pudo consultar el perfil (${respuesta.status}).`
          );
        }

        const datos = await respuesta.json();

        if (!controller.signal.aborted) {
          setUsuario(datos);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || "Error al consultar el perfil.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    // Se ejecuta de forma asíncrona para evitar
    // el aviso react-hooks/set-state-in-effect.
    const iniciar = Promise.resolve().then(() => {
      if (controller.signal.aborted) return;

      setCargando(true);
      setError("");
      return cargarPerfil();
    });

    void iniciar;

    return () => controller.abort();
  }, [recarga]);

  const nombreCompleto = usuario
    ? [
        usuario.primerNombre,
        usuario.segundoNombre,
        usuario.primerApellido,
        usuario.segundoApellido,
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  const nombreMostrar = nombreCompleto || "Administrador de Policía";

  const rol = usuario?.rolNombre || "ADMIN_POLICIA";

  function guardarPreferencias() {
    localStorage.setItem("preferenciaTemaAdmin", tema);

    localStorage.setItem(
      "preferenciaNotificacionesAdmin",
      String(notificacionesVisuales)
    );

    toast.success("Las preferencias se guardaron en este navegador.", "Cambios guardados");
  }

  function actualizar() {
    setRecarga((anterior) => anterior + 1);
  }

  return (
    <>
      <Topbar />

      <div className="configuracion-page">
        <div className="config-header">
          <div>
            <span className="config-eyebrow">
              <i className="bi bi-grid me-2" />
              ADMINISTRACIÓN POLICIAL / AJUSTES
            </span>

            <h1 className="config-title">Configuración</h1>

            <p className="config-subtitle">
              Gestiona la información de tu cuenta y tus preferencias.
            </p>
          </div>

          <div className="config-header-icon">
            <i className="bi bi-gear-wide-connected" />
          </div>
        </div>

        {error && (
          <div className="config-alert config-alert-error">
            <i className="bi bi-exclamation-triangle" />
            <span>{error}</span>
            <button type="button" onClick={actualizar}>
              Reintentar
            </button>
          </div>
        )}

        {!obtenerToken() && (
          <div className="config-alert config-alert-info">
            <i className="bi bi-info-circle" />
            <span>
              Vista de preparación: cuando se conecte el inicio de
              sesión, aquí aparecerán los datos reales del administrador.
            </span>
          </div>
        )}

        <div className="row g-4">
          {/* COLUMNA IZQUIERDA */}
          <div className="col-12 col-xl-4">
            <div className="config-profile-card">
              <div className="config-profile-cover" />

              <div className="config-profile-top">
                <div className="config-avatar-wrap">
                  <span className="config-avatar-fallback">
                    {obtenerIniciales(nombreCompleto)}
                  </span>
                </div>

                <h2 className="config-profile-name">
                  {cargando ? "Cargando perfil..." : nombreMostrar}
                </h2>

                <span className="config-role-badge">
                  <i className="bi bi-shield-check" />
                  {rol.replaceAll("_", " ")}
                </span>

                <p className="config-profile-description">
                  Panel de administración policial de WolertApp.
                </p>
              </div>

              <div className="config-profile-details">
                <div className="config-detail-row">
                  <span className="config-detail-icon">
                    <i className="bi bi-envelope" />
                  </span>

                  <div className="config-detail-info">
                    <span>Correo electrónico</span>
                    <strong>
                      {usuario?.correo || "No disponible"}
                    </strong>
                  </div>
                </div>

                <div className="config-detail-row">
                  <span className="config-detail-icon">
                    <i className="bi bi-person-badge" />
                  </span>

                  <div className="config-detail-info">
                    <span>Nombre de usuario</span>
                    <strong>
                      {usuario?.username || "No disponible"}
                    </strong>
                  </div>
                </div>

                <div className="config-detail-row">
                  <span className="config-detail-icon">
                    <i className="bi bi-telephone" />
                  </span>

                  <div className="config-detail-info">
                    <span>Teléfono</span>
                    <strong>
                      {usuario?.telefono || "No disponible"}
                    </strong>
                  </div>
                </div>

                <div className="config-detail-row">
                  <span className="config-detail-icon">
                    <i className="bi bi-check-circle" />
                  </span>

                  <div className="config-detail-info">
                    <span>Estado de la cuenta</span>
                    <strong>
                      {usuario?.estado || "Pendiente de sesión"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="config-profile-footer">
                <button
                  type="button"
                  className="config-btn-secondary"
                  onClick={actualizar}
                  disabled={cargando}
                >
                  <i className="bi bi-arrow-clockwise" />
                  Actualizar información
                </button>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="col-12 col-xl-8">
            <div className="config-content-stack">
              {/* INFORMACIÓN PERSONAL */}
              <section className="config-card">
                <div className="config-card-heading">
                  <span className="config-card-icon">
                    <i className="bi bi-person-lines-fill" />
                  </span>

                  <div>
                    <h2>Información personal</h2>
                    <p>
                      Datos asociados a tu cuenta en WolertApp.
                    </p>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <CampoInformativo
                      etiqueta="Nombre completo"
                      valor={nombreCompleto}
                      icono="bi-person"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <CampoInformativo
                      etiqueta="Correo electrónico"
                      valor={usuario?.correo}
                      icono="bi-envelope"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <CampoInformativo
                      etiqueta="Número de teléfono"
                      valor={usuario?.telefono}
                      icono="bi-telephone"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <CampoInformativo
                      etiqueta="Rol asignado"
                      valor={rol}
                      icono="bi-shield-lock"
                    />
                  </div>
                </div>

                <div className="config-security-note">
                  <i className="bi bi-info-circle" />
                  <span>
                    Estos datos se consultan desde la API.
                    No se modifican desde esta pantalla.
                  </span>
                </div>
              </section>

              {/* SEGURIDAD */}
              <section className="config-card">
                <div className="config-card-heading">
                  <span className="config-card-icon">
                    <i className="bi bi-shield-lock" />
                  </span>

                  <div>
                    <h2>Seguridad de la cuenta</h2>
                    <p>
                      Información sobre el acceso y la protección
                      de tu cuenta.
                    </p>
                  </div>
                </div>

                <div className="config-security-panel">
                  <span className="config-security-panel-icon">
                    <i className="bi bi-key" />
                  </span>

                  <div>
                    <strong>Contraseña de acceso</strong>
                    <p>
                      El cambio de contraseña estará disponible
                      cuando se integre el endpoint correspondiente.
                    </p>
                  </div>

                  <span className="config-coming-soon">
                    Próximamente
                  </span>
                </div>
              </section>

              {/* PREFERENCIAS */}
              <section className="config-card">
                <div className="config-card-heading">
                  <span className="config-card-icon">
                    <i className="bi bi-sliders" />
                  </span>

                  <div>
                    <h2>Preferencias</h2>
                    <p>
                      Personaliza algunas opciones de tu navegador.
                    </p>
                  </div>
                </div>

                <div className="config-preference-row">
                  <div className="config-preference-info">
                    <span className="config-preference-icon">
                      <i className="bi bi-palette" />
                    </span>

                    <div>
                      <strong>Preferencia de apariencia</strong>
                      <p>
                        Guarda tu elección para una futura
                        integración del tema visual.
                      </p>
                    </div>
                  </div>

                  <select
                    className="form-select config-select"
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                  >
                    <option value="claro">Claro</option>
                    <option value="oscuro">Oscuro</option>
                  </select>
                </div>

                <div className="config-preference-row">
                  <div className="config-preference-info">
                    <span className="config-preference-icon">
                      <i className="bi bi-bell" />
                    </span>

                    <div>
                      <strong>Preferencia de notificaciones</strong>
                      <p>
                        Guarda si deseas recibir avisos visuales
                        cuando esa función esté integrada.
                      </p>
                    </div>
                  </div>

                  <div className="form-check form-switch">
                    <input
                      className="form-check-input config-switch"
                      type="checkbox"
                      id="configNotificaciones"
                      checked={notificacionesVisuales}
                      onChange={(e) =>
                        setNotificacionesVisuales(e.target.checked)
                      }
                    />
                    <label
                      className="visually-hidden"
                      htmlFor="configNotificaciones"
                    >
                      Preferencia de notificaciones
                    </label>
                  </div>
                </div>

                <div className="config-form-footer">
                  <button
                    type="button"
                    className="config-btn-primary"
                    onClick={guardarPreferencias}
                  >
                    <i className="bi bi-check2-circle" />
                    Guardar preferencias
                  </button>
                </div>
              </section>

              {/* INFORMACIÓN DEL SISTEMA */}
              <section className="config-card">
                <div className="config-card-heading">
                  <span className="config-card-icon">
                    <i className="bi bi-info-circle" />
                  </span>

                  <div>
                    <h2>Información del sistema</h2>
                    <p>
                      Detalles generales del módulo administrativo.
                    </p>
                  </div>
                </div>

                <div className="config-system-grid">
                  <div>
                    <span>Aplicación</span>
                    <strong>WolertApp</strong>
                  </div>

                  <div>
                    <span>Módulo</span>
                    <strong>Administrador Policía</strong>
                  </div>

                  <div>
                    <span>API configurada</span>
                    <strong className="config-api-url">{API}</strong>
                  </div>

                  <div>
                    <span>Autenticación</span>
                    <strong>
                      {obtenerToken()
                        ? "Token disponible"
                        : "Sin sesión conectada"}
                    </strong>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default Configuracion;
