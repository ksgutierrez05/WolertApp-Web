
import { useState } from "react";

import Topbar from "../../Components/Central-policia/Topbar";

import {
  obtenerPerfilCentral,
} from "../../Services/configuracionCentralService";

import "../../css/Policia/central-policia/css/configuracion.css";

const VACIO = "No disponible";

function CampoPerfil({ icono, titulo, valor }) {
  return (
    <div className="col-12 col-md-6">
      <div className="perfil-campo">
        <div className="perfil-campo-icono">
          <i className={`bi ${icono}`} />
        </div>

        <div className="perfil-campo-contenido">
          <span className="perfil-campo-etiqueta">
            {titulo}
          </span>

          <strong className="perfil-campo-valor">
            {valor || VACIO}
          </strong>
        </div>
      </div>
    </div>
  );
}

function Configuracion() {
  const [perfil, setPerfil] = useState(obtenerPerfilCentral);

  function actualizarPerfil() {
    setPerfil(obtenerPerfilCentral());
  }

  const nombreCompleto = [
    perfil.nombres !== VACIO ? perfil.nombres : "",
    perfil.apellidos !== VACIO ? perfil.apellidos : "",
  ]
    .filter(Boolean)
    .join(" ") || "Usuario de Central Policía";

  return (
    <div className="configuracion-page">
      <Topbar placeholder="Mi perfil" />

      <main className="main-dash configuracion-main">
        <div className="container-fluid">
          <header className="perfil-encabezado">
            <div>
              <span className="perfil-subtitulo">
                <i className="bi bi-shield-check me-2" />
                CENTRAL DE RADIO
              </span>

              <h1>Mi perfil</h1>

              <p>
                Consulta tu información personal e
                institucional registrada en WolertApp.
              </p>
            </div>

            <button
              type="button"
              className="perfil-btn-actualizar"
              onClick={actualizarPerfil}
            >
              <i className="bi bi-arrow-clockwise" />
              Actualizar
            </button>
          </header>

          <section className="perfil-banner">
            <div className="perfil-banner-decoracion" />

            <div className="perfil-banner-contenido">
              <div className="perfil-avatar">
                <i className="bi bi-person-fill" />
              </div>

              <div className="perfil-banner-info">
                <span className="perfil-banner-etiqueta">
                  PERFIL INSTITUCIONAL
                </span>

                <h2>{nombreCompleto}</h2>

                <p>
                  <i className="bi bi-shield-fill-check me-2" />
                  {perfil.rol !== VACIO
                    ? perfil.rol
                    : "Central Policía"}
                </p>
              </div>
            </div>

            <div className="perfil-banner-insignia">
              <i className="bi bi-shield-shaded" />
            </div>
          </section>

          {!perfil.disponible && (
            <div className="perfil-aviso">
              <i className="bi bi-info-circle" />

              <span>
                Aún no se encontraron datos de tu perfil
                en la sesión. La información aparecerá
                cuando se conecte con el usuario autenticado.
              </span>
            </div>
          )}

          <div className="row g-4">
            <div className="col-12 col-xl-4">
              <section className="perfil-tarjeta perfil-resumen">
                <div className="perfil-tarjeta-titulo">
                  <i className="bi bi-person-badge" />
                  <h3>Identificación</h3>
                </div>

                <div className="perfil-identidad">
                  <div className="perfil-identidad-icono">
                    <i className="bi bi-person-vcard" />
                  </div>

                  <span>DOCUMENTO DE IDENTIDAD</span>

                  <strong>
                    {perfil.identificacion}
                  </strong>
                </div>

                <div className="perfil-resumen-fila">
                  <span>
                    <i className="bi bi-person me-2" />
                    Nombre
                  </span>
                  <strong>{perfil.nombres}</strong>
                </div>

                <div className="perfil-resumen-fila">
                  <span>
                    <i className="bi bi-award me-2" />
                    Rango
                  </span>
                  <strong>{perfil.rango}</strong>
                </div>

                <div className="perfil-resumen-fila">
                  <span>
                    <i className="bi bi-building me-2" />
                    Dependencia
                  </span>
                  <strong>{perfil.dependencia}</strong>
                </div>

                <div className="perfil-resumen-fila">
                  <span>
                    <i className="bi bi-shield-check me-2" />
                    Rol
                  </span>
                  <strong>{perfil.rol}</strong>
                </div>
              </section>
            </div>

            <div className="col-12 col-xl-8">
              <section className="perfil-tarjeta mb-4">
                <div className="perfil-tarjeta-titulo">
                  <i className="bi bi-person-lines-fill" />

                  <div>
                    <h3>Información personal</h3>
                    <p>Datos de identificación y contacto</p>
                  </div>
                </div>

                <div className="row g-3">
                  <CampoPerfil
                    icono="bi-person"
                    titulo="Nombres"
                    valor={perfil.nombres}
                  />

                  <CampoPerfil
                    icono="bi-person"
                    titulo="Apellidos"
                    valor={perfil.apellidos}
                  />

                  <CampoPerfil
                    icono="bi-person-vcard"
                    titulo="Número de identificación"
                    valor={perfil.identificacion}
                  />

                  <CampoPerfil
                    icono="bi-envelope"
                    titulo="Correo electrónico"
                    valor={perfil.correo}
                  />

                  <CampoPerfil
                    icono="bi-telephone"
                    titulo="Teléfono"
                    valor={perfil.telefono}
                  />
                </div>
              </section>

              <section className="perfil-tarjeta">
                <div className="perfil-tarjeta-titulo">
                  <i className="bi bi-shield-check" />

                  <div>
                    <h3>Información institucional</h3>
                    <p>Datos de tu vinculación policial</p>
                  </div>
                </div>

                <div className="row g-3">
                  <CampoPerfil
                    icono="bi-award"
                    titulo="Rango o grado"
                    valor={perfil.rango}
                  />

                  <CampoPerfil
                    icono="bi-building"
                    titulo="Dependencia"
                    valor={perfil.dependencia}
                  />

                  <CampoPerfil
                    icono="bi-shield"
                    titulo="Rol en el sistema"
                    valor={perfil.rol}
                  />

                  <CampoPerfil
                    icono="bi-person-badge"
                    titulo="Nombre de usuario"
                    valor={perfil.usuario}
                  />
                </div>
              </section>
            </div>
          </div>

          <footer className="perfil-pie">
            <i className="bi bi-lock me-2" />
            Información de perfil en modo de solo lectura.
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Configuracion;
