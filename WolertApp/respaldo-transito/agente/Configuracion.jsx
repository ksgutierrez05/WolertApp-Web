
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../Components/transito/Layout";
import ConfiguracionCuenta from "../../../Components/transito/ConfiguracionCuenta";

import {
  obtenerPerfilAgente,
  obtenerUnidadAgente,
} from "../../../Services/agenteTransitoService";

import {
  obtenerSesionTransito,
} from "../../../Services/transitoApi";
import { cambiarPassword, logOut } from "../../../Services/UsuariosAPI";

const PREFERENCIAS_BASE = { avisosCasos: true, avisosCriticos: true, modoCompacto: false };
function leerPreferencias(idUsuario) {
  try { return { ...PREFERENCIAS_BASE, ...JSON.parse(localStorage.getItem(`wolert:preferencias-agente:${idUsuario || "sin-usuario"}`) || "{}") }; }
  catch { return { ...PREFERENCIAS_BASE }; }
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

  const [agente, setAgente] = useState(null);
  const [unidad, setUnidad] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const sesion = obtenerSesionTransito();
  const [preferencias, setPreferencias] = useState(() => leerPreferencias(sesion.idUsuario));
  const [avisoPreferencias, setAvisoPreferencias] = useState("");
  const [password, setPassword] = useState({ actual: "", nueva: "", confirmar: "" });
  const [errorPassword, setErrorPassword] = useState("");
  const [avisoPassword, setAvisoPassword] = useState("");
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("modo-compacto", preferencias.modoCompacto);
    return () => document.body.classList.remove("modo-compacto");
  }, [preferencias.modoCompacto]);

  function cambiarPreferencia(campo, valor) {
    const siguiente = { ...preferencias, [campo]: valor };
    try {
      localStorage.setItem(`wolert:preferencias-agente:${sesion.idUsuario || "sin-usuario"}`, JSON.stringify(siguiente));
      setPreferencias(siguiente);
      setAvisoPreferencias("Preferencia guardada en este dispositivo.");
    } catch { setAvisoPreferencias("No se pudo guardar la preferencia."); }
  }

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

    document.body.classList.remove("modo-compacto");
    logOut();
    [sessionStorage, localStorage].forEach((storage) => ["accessToken", "authToken", "jwt", "usuario", "user", "usuarioActual", "currentUser"].forEach((key) => storage.removeItem(key)));

    navigate("/login", {
      replace: true,
    });
  }

  async function guardarPassword(event) {
    event.preventDefault(); setErrorPassword(""); setAvisoPassword("");
    if (!sesion.idUsuario) return setErrorPassword("No encontramos el identificador de tu cuenta.");
    if (!password.actual || !password.nueva || !password.confirmar) return setErrorPassword("Completa los tres campos.");
    if (password.nueva.length < 8) return setErrorPassword("La nueva contraseña debe tener al menos 8 caracteres.");
    if (password.nueva !== password.confirmar) return setErrorPassword("La confirmación no coincide.");
    if (password.nueva === password.actual) return setErrorPassword("La nueva contraseña debe ser distinta a la actual.");
    try {
      setGuardandoPassword(true);
      await cambiarPassword(sesion.idUsuario, password.actual, password.nueva);
      setPassword({ actual: "", nueva: "", confirmar: "" }); setAvisoPassword("Contraseña actualizada correctamente.");
    } catch (err) { setErrorPassword(err.message || "No se pudo cambiar la contraseña."); }
    finally { setGuardandoPassword(false); }
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
      <div className="mb-4">
        <h1 className="section-title-dash">
          Configuración
        </h1>

        <p className="section-text-dash mb-0">
          Tu perfil y la información registrada
          en el sistema de Tránsito.
        </p>
      </div>

      <ConfiguracionCuenta />

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
            {datos.map((dato) => (
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

      <div className="panel-card-dash mb-3">
        <h2 className="panel-title-dash">Preferencias</h2>
        {avisoPreferencias && <div className="alert alert-success py-2" role="status">{avisoPreferencias}</div>}
        {[
          ["avisosCasos", "Avisos de casos asignados", "Preferencia para los avisos de casos nuevos."],
          ["avisosCriticos", "Avisos de prioridad crítica", "Preferencia para las alertas de casos críticos."],
          ["modoCompacto", "Modo compacto", "Reduce los espacios para mostrar más contenido."],
        ].map(([key, titulo, texto]) => (
          <Fila key={key} titulo={titulo} texto={texto}>
            <div className="form-check form-switch"><input className="form-check-input" type="checkbox" role="switch" aria-label={titulo} checked={preferencias[key]} onChange={(event) => cambiarPreferencia(key, event.target.checked)} /></div>
          </Fila>
        ))}
        <p className="text-muted small mt-3 mb-0">Se guardan en este navegador; la entrega de notificaciones depende del sistema.</p>
      </div>

      <div className="panel-card-dash mb-3">
        <h2 className="panel-title-dash">Seguridad</h2>
        {errorPassword && <div className="alert alert-danger" role="alert">{errorPassword}</div>}
        {avisoPassword && <div className="alert alert-success" role="status">{avisoPassword}</div>}
        <form onSubmit={guardarPassword} className="row g-3">
          {[["actual", "Contraseña actual", "current-password"], ["nueva", "Nueva contraseña", "new-password"], ["confirmar", "Confirmar nueva contraseña", "new-password"]].map(([key, label, autocomplete]) => (
            <div className="col-md-4" key={key}><label className="config-field-label-dash" htmlFor={`passwordAgente-${key}`}>{label}</label><input id={`passwordAgente-${key}`} className="form-control" type="password" autoComplete={autocomplete} minLength={key === "actual" ? undefined : 8} value={password[key]} onChange={(event) => setPassword({ ...password, [key]: event.target.value })} /></div>
          ))}
          <div className="col-12"><button type="submit" className="btn-secundario-dash" disabled={guardandoPassword}>{guardandoPassword ? "Actualizando..." : "Actualizar contraseña"}</button></div>
        </form>
      </div>

      <div className="panel-card-dash mb-3">
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

      <div className="panel-card-dash">
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
    </Layout>
  );
}
