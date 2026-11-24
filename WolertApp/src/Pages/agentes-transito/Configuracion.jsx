
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../Components/transito/Layout";
import ConfiguracionCuenta from "../../Components/transito/ConfiguracionCuenta";
import ConfiguracionContrasena from "../../Components/transito/ConfiguracionContrasena";
import "../../css/admin/configuracion.css";

import {
  obtenerPerfilAgente,
  obtenerUnidadAgente,
} from "../../Services/agenteTransitoService";

import {
  obtenerSesionTransito,
} from "../../Services/transitoApi";

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

  const [agente, setAgente] = useState(null);
  const [unidad, setUnidad] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    Promise.allSettled([
      obtenerPerfilAgente(),
      obtenerUnidadAgente(),
    ])
      .then(([perfil, datosUnidad]) => {
        if (!activo) return;

        if (perfil.status === "fulfilled") {
          setAgente(perfil.value);
        }

        if (
          datosUnidad.status === "fulfilled"
        ) {
          setUnidad(datosUnidad.value);
        }

        const fallos = [
          perfil,
          datosUnidad,
        ].filter(
          (resultado) =>
            resultado.status === "rejected"
        );

        if (fallos.length) {
          setError(
            fallos
              .map(
                (resultado) =>
                  resultado.reason?.message ||
                  "No se pudo cargar el perfil"
              )
              .join(" | ")
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const sesion = obtenerSesionTransito();
  const usuario = sesion.usuario || {};

  const nombre =
    agente?.nombreUsuario ||
    agente?.nombreCompleto ||
    usuario.nombreCompleto ||
    usuario.nombre ||
    usuario.username ||
    "Agente de Tránsito";

  const iniciales = nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0))
    .join("")
    .toUpperCase();

  const datos = [
    {
      label: "Grupo",
      valor:
        unidad?.nombre ||
        agente?.nombreUnidad ||
        "No asignado",
    },
    {
      label: "Zona",
      valor:
        unidad?.nombreBarrio ||
        unidad?.nombreComuna ||
        agente?.barrioNombre ||
        "No registrada",
    },
    {
      label: "Cédula",
      valor:
        agente?.cedula ||
        agente?.numeroDocumento ||
        usuario.cedula ||
        "No disponible",
    },
    {
      label: "Correo",
      valor:
        agente?.correo ||
        agente?.email ||
        usuario.correo ||
        usuario.email ||
        "No disponible",
    },
    {
      label: "Usuario",
      valor:
        agente?.username ||
        usuario.username ||
        "No disponible",
    },
    {
      label: "Teléfono",
      valor:
        agente?.telefono ||
        "No disponible",
    },
    {
      label: "Placa",
      valor:
        agente?.placa ||
        "No disponible",
    },
    {
      label: "Rango",
      valor:
        agente?.rango ||
        "No disponible",
    },
    {
      label: "Estado",
      valor:
        agente?.estadoAgente ||
        "No disponible",
    },
  ];

  function cerrarSesion() {
    const confirmar = window.confirm(
      "¿Seguro que deseas cerrar sesión?"
    );

    if (!confirmar) return;

    const claves = [
      "token",
      "accessToken",
      "authToken",
      "jwt",
      "usuario",
      "user",
      "usuarioActual",
      "currentUser",
    ];

    for (const almacenamiento of [
      sessionStorage,
      localStorage,
    ]) {
      claves.forEach((clave) =>
        almacenamiento.removeItem(clave)
      );
    }

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <Layout
      rol="agente"
      titulo="Configuración"
      activo="configuracion"
      busqueda={{
        placeholder: "Buscar...",
      }}
    >
      <div className="admin-config-page transito-config-page">
      <header className="admin-config-hero mb-4">
        <div>
        <span><i className="bi bi-sliders me-1" /> CUENTA Y PREFERENCIAS</span>
        <h1 className="section-title-dash">
          Configuración
        </h1>

        <p className="section-text-dash mb-0">
          Tu perfil y la información registrada
          en el sistema de Tránsito.
        </p>
        </div>
        <div className="admin-config-hero__badge"><i className="bi bi-shield-check" /> Ajustes de tu cuenta</div>
      </header>

      <ConfiguracionCuenta />
      <ConfiguracionContrasena />

      {cargando && (
        <div className="alert alert-info" role="status">
          Cargando perfil...
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="perfil-hero-dash mb-4">
        <div className="perfil-hero-top-dash">
          <div className="perfil-hero-avatar-dash">
            {iniciales}
          </div>

          <div>
            <div className="perfil-hero-eyebrow-dash">
              Agente de Tránsito
            </div>

            <h2 className="perfil-hero-nombre-dash">
              {nombre}
            </h2>
          </div>
        </div>

        <div className="perfil-hero-body-dash">
          <div className="perfil-hero-datos-dash">
            {datos.filter((dato) => ["Grupo", "Zona", "Placa", "Rango", "Estado"].includes(dato.label)).map((dato) => (
              <div
                key={dato.label}
                className="perfil-hero-dato-dash"
              >
                <span>
                  {dato.label}
                </span>

                <strong>
                  {dato.valor}
                </strong>
              </div>
            ))}
          </div>

          <p className="perfil-hero-nota-dash">
            <i className="bi bi-info-circle me-1" />
            ¿Algún dato incorrecto? Solicita su
            actualización al administrador de Tránsito.
          </p>
        </div>
      </div>

      <div className="panel-card-dash card-panel-dash mb-3">
        <h2 className="panel-title-dash">
          Información de la cuenta
        </h2>

        <Fila
          titulo="Tipo de usuario"
          texto="Agente de Tránsito"
        >
          <i className="bi bi-person-badge fs-5 text-secondary" />
        </Fila>

        <Fila
          titulo="Identificador de usuario"
          texto={
            agente?.idUsuario ??
            sesion.idUsuario ??
            "No disponible"
          }
        >
          <i className="bi bi-hash fs-5 text-secondary" />
        </Fila>
      </div>

      <div className="panel-card-dash card-panel-dash">
        <h2 className="panel-title-dash">
          Cuenta
        </h2>

        <Fila
          titulo="Cerrar sesión"
          texto="Sal de tu cuenta en este dispositivo."
        >
          <button
            type="button"
            className="btn-secundario-dash"
            onClick={cerrarSesion}
          >
            <i className="bi bi-box-arrow-right me-2" />
            Cerrar sesión
          </button>
        </Fila>
      </div>
      </div>
    </Layout>
  );
}
