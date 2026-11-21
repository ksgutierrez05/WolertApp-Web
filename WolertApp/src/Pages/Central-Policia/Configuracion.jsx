
import { useEffect, useState } from "react";
import Topbar from "../../Components/Central-policia/Topbar";
import { obtenerPerfilCentral } from "../../Services/configuracionCentralService";
import "../../css/Policia/central-policia/css/configuracion.css";

const VACIO = "No disponible";

function Dato({ icono, titulo, valor }) {
  return (
    <div className="config-dato">
      <i className={`bi ${icono}`} />
      <div>
        <span>{titulo}</span>
        <strong>{valor || VACIO}</strong>
      </div>
    </div>
  );
}

export default function Configuracion() {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setCargando(true);
    setError("");

    obtenerPerfilCentral(controller.signal)
      .then((datos) => {
        if (!controller.signal.aborted) setPerfil(datos);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setPerfil(null);
        setError(err.message || "No se pudo cargar el perfil.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false);
      });

    return () => controller.abort();
  }, [recarga]);

  const nombre = perfil
    ? [perfil.nombres, perfil.apellidos]
        .filter((v) => v && v !== VACIO)
        .join(" ") || "Usuario de Central Policía"
    : "Central de Policía";

  return (
    <div className="configuracion-page">
      <Topbar placeholder="Mi perfil" />

      <main className="main-dash configuracion-main">
        <header className="config-header">
          <div>
            <span className="config-kicker">
              <i className="bi bi-shield-check me-2" />
              CENTRAL DE RADIO
            </span>
            <h1>Configuración</h1>
            <p>Información de tu cuenta y perfil institucional.</p>
          </div>

          <button
            className="config-btn"
            disabled={cargando}
            onClick={() => setRecarga((n) => n + 1)}
          >
            <i className="bi bi-arrow-clockwise me-2" />
            {cargando ? "Cargando..." : "Actualizar"}
          </button>
        </header>

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2" />
            {error}
          </div>
        )}

        <section className="config-banner">
          <div className="config-avatar">
            <i className="bi bi-person-fill" />
          </div>
          <div>
            <span>PERFIL INSTITUCIONAL</span>
            <h2>{nombre}</h2>
            <p>
              <i className="bi bi-shield-fill-check me-2" />
              {perfil?.rol || "Central Policía"}
            </p>
          </div>
        </section>

        {cargando && (
          <p className="config-mensaje">
            Consultando información del usuario...
          </p>
        )}

        {perfil && !cargando && (
          <div className="config-grid">
            <section className="config-card">
              <h3>
                <i className="bi bi-person-badge me-2" />
                Identificación
              </h3>

              <div className="config-documento">
                <i className="bi bi-person-vcard" />
                <span>DOCUMENTO DE IDENTIDAD</span>
                <strong>{perfil.identificacion}</strong>
              </div>

              <Dato
                icono="bi-person"
                titulo="Nombre completo"
                valor={nombre}
              />
              <Dato
                icono="bi-person-circle"
                titulo="Usuario"
                valor={perfil.usuario}
              />
              <Dato
                icono="bi-shield"
                titulo="Rol"
                valor={perfil.rol}
              />
            </section>

            <div className="config-columna">
              <section className="config-card">
                <h3>
                  <i className="bi bi-person-lines-fill me-2" />
                  Información personal
                </h3>

                <div className="config-campos">
                  <Dato icono="bi-person" titulo="Nombres" valor={perfil.nombres} />
                  <Dato icono="bi-person" titulo="Apellidos" valor={perfil.apellidos} />
                  <Dato icono="bi-envelope" titulo="Correo electrónico" valor={perfil.correo} />
                  <Dato icono="bi-telephone" titulo="Teléfono" valor={perfil.telefono} />
                </div>
              </section>

              <section className="config-card">
                <h3>
                  <i className="bi bi-building me-2" />
                  Información institucional
                </h3>

                <div className="config-campos">
                  <Dato icono="bi-shield-check" titulo="Rol en el sistema" valor={perfil.rol} />
                  <Dato icono="bi-person-badge" titulo="Nombre de usuario" valor={perfil.usuario} />
                  <Dato icono="bi-check-circle" titulo="Estado de cuenta" valor={perfil.estado} />
                  <Dato icono="bi-geo-alt" titulo="Barrio registrado" valor={perfil.barrio} />
                </div>
              </section>
            </div>
          </div>
        )}

        <footer className="config-footer">
          <i className="bi bi-lock me-2" />
          Información consultada desde WOLERTAPP. Perfil de solo lectura.
        </footer>
      </main>
    </div>
  );
}
