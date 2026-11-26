import {
  activarNotificacionesPush,
  desactivarNotificacionesPush,
  obtenerSuscripcionesPush
} from "../../Services/webPushService";
import { useEffect, useMemo, useState } from "react";
import "../../css/global.css";
import "../../css/temas.css";
import "../../css/ciudadano/encabezados-ciudadano.css";
import "../../css/ciudadano/panel-configuracion.css";
import { cambiarPassword, editarUsuario, obtenerUsuarioPorId } from "../../Services/UsuariosAPI";
import {
  guardarPreferenciasCiudadano,
  obtenerPreferenciasCiudadano,
} from "../../Services/PreferenciasCiudadano";

const camposIniciales = (usuario = {}) => ({
  primerNombre: usuario.primerNombre || "",
  segundoNombre: usuario.segundoNombre || "",
  primerApellido: usuario.primerApellido || "",
  segundoApellido: usuario.segundoApellido || "",
  correo: usuario.correo || "",
  telefono: usuario.telefono || "",
  calle: usuario.calle || "",
  carrera: usuario.carrera || "",
  etapa: usuario.etapa || "",
  manzana: usuario.manzana || "",
  casa: usuario.casa || "",
});

function Switch({ id, checked, onChange, label, disabled = false }) {
  return (
    <label className="citizen-settings__switch" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span aria-hidden="true" />
      <b>{label}</b>
    </label>
  );
}

export default function Configuracion() {
  const idUsuario = localStorage.getItem("idUsuario");
  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState(camposIniciales());
  const [preferencias, setPreferencias] = useState(() => obtenerPreferenciasCiudadano());
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [error, setError] = useState("");
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirmar, setPassConfirmar] = useState("");
  const [passError, setPassError] = useState("");
  const [passAviso, setPassAviso] = useState("");
  const [cambiandoPass, setCambiandoPass] = useState(false);

  useEffect(() => {
    if (!idUsuario) {
      setError("No encontramos una sesión activa. Vuelve a iniciar sesión.");
      setCargando(false);
      return;
    }

    obtenerUsuarioPorId(idUsuario)
      .then((data) => {
        setUsuario(data);
        setForm(camposIniciales(data));
      })
      .catch((err) => setError(err.message || "No se pudo cargar tu perfil."))
      .finally(() => setCargando(false));
  }, [idUsuario]);

  useEffect(() => {
    document.body.classList.toggle("modo-compacto", preferencias.modoCompacto);
  }, [preferencias.modoCompacto]);

  const nombre = useMemo(
    () =>
      [form.primerNombre, form.primerApellido].filter(Boolean).join(" ") ||
      usuario?.username ||
      "Mi cuenta",
    [form, usuario]
  );
  const iniciales = nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  const [pushActivo, setPushActivo] = useState(false);
  const [pushProcesando, setPushProcesando] = useState(false);

  useEffect(() => {
    if (!idUsuario) return;

    let vigente = true;

    obtenerSuscripcionesPush()
      .then(async (datos) => {
        const id = localStorage.getItem("idSuscripcionPush");
        const registro = await navigator.serviceWorker?.getRegistration();
        const suscripcion = await registro?.pushManager.getSubscription();

        if (vigente) {
          setPushActivo(Boolean(suscripcion && datos.some(s =>
            String(s.idSuscripcionPush) === id &&
            s.estado === "ACTIVA"
          )));
        }
      })
      .catch(() => {
        if (vigente) setPushActivo(false);
      });

    return () => { vigente = false; };
  }, [idUsuario]);

  async function cambiarPush(value) {
    setPushProcesando(true);
    setError("");
    setAviso("");

    try {
      if (value) {
        await activarNotificacionesPush(500);
        setPushActivo(true);
        setAviso("Notificaciones cercanas activadas correctamente.");
      } else {
        await desactivarNotificacionesPush();
        setPushActivo(false);
        setAviso("Notificaciones del dispositivo desactivadas.");
      }
    } catch (err) {
      setError(err.message || "No se pudo actualizar el dispositivo.");
    } finally {
      setPushProcesando(false);
    }
  }

  const cambiarPreferencia = (key, value) => {
    const nuevas = guardarPreferenciasCiudadano({ ...preferencias, [key]: value });
    setPreferencias(nuevas);
    setAviso("Preferencia guardada en este dispositivo.");
    setError("");
  };

  async function guardarPerfil(event) {
    event.preventDefault();
    setError("");
    setAviso("");

    if (!form.primerNombre.trim() || !form.primerApellido.trim() || !form.correo.trim()) {
      setError("Completa tu nombre, apellido y correo para guardar los cambios.");
      return;
    }

    const barrioId = usuario.barrioId ?? usuario.idBarrio;
    if (barrioId === undefined || barrioId === null) {
      setError("No se puede guardar porque el servidor no devolvió el barrio asociado a tu cuenta.");
      return;
    }

    const textoONulo = (value) => value.trim() || null;

    try {
      setGuardando(true);
      await editarUsuario(idUsuario, {
        cedula: usuario.cedula,
        barrioId,
        primerNombre: form.primerNombre.trim(),
        segundoNombre: textoONulo(form.segundoNombre),
        primerApellido: form.primerApellido.trim(),
        segundoApellido: textoONulo(form.segundoApellido),
        correo: form.correo.trim(),
        telefono: textoONulo(form.telefono),
        username: usuario.username,
        calle: textoONulo(form.calle),
        carrera: textoONulo(form.carrera),
        etapa: textoONulo(form.etapa),
        manzana: textoONulo(form.manzana),
        casa: textoONulo(form.casa),
      });
      const actualizado = await obtenerUsuarioPorId(idUsuario);
      setUsuario(actualizado);
      setForm(camposIniciales(actualizado));
      setEditando(false);
      setAviso("Tu perfil se actualizó correctamente.");
    } catch (err) {
      setError(err.message || "No se pudieron guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarContrasena(event) {
    event.preventDefault();
    setPassError("");
    setPassAviso("");

    if (!passActual || !passNueva || !passConfirmar) {
      setPassError("Completa los tres campos.");
      return;
    }
    if (passNueva.length < 8) {
      setPassError("Usa al menos 8 caracteres para tu nueva contraseña.");
      return;
    }
    if (passNueva !== passConfirmar) {
      setPassError("La confirmación no coincide.");
      return;
    }
    if (passActual === passNueva) {
      setPassError("Elige una contraseña distinta a la actual.");
      return;
    }

    try {
      setCambiandoPass(true);
      await cambiarPassword(idUsuario, passActual, passNueva);
      setPassActual("");
      setPassNueva("");
      setPassConfirmar("");
      setPassAviso("Contraseña actualizada correctamente.");
    } catch (err) {
      setPassError(err.message || "No se pudo actualizar la contraseña.");
    } finally {
      setCambiandoPass(false);
    }
  }

  if (cargando) {
    return (
      <main className="citizen-settings">
        <div className="citizen-settings__loading">
          <span /> Cargando tu configuración…
        </div>
      </main>
    );
  }

  if (!usuario) {
    return (
      <main className="citizen-settings">
        <div className="citizen-settings__message is-error" role="alert">
          {error || "No se pudo cargar tu perfil."}
        </div>
      </main>
    );
  }

  const CAMPOS = [
    ["primerNombre", "Primer nombre", "text", true],
    ["segundoNombre", "Segundo nombre", "text"],
    ["primerApellido", "Primer apellido", "text", true],
    ["segundoApellido", "Segundo apellido", "text"],
    ["correo", "Correo electrónico", "email", true],
    ["telefono", "Teléfono", "tel"],
    ["calle", "Calle", "text"],
    ["carrera", "Carrera", "text"],
    ["etapa", "Etapa", "text"],
    ["manzana", "Manzana", "text"],
    ["casa", "Casa", "text"],
  ];

  return (
    <main className="citizen-settings">
      <header className="citizen-settings__hero">
        <div>
          <span className="citizen-settings__eyebrow">
            <i className="bi bi-sliders" /> TU CUENTA Y PREFERENCIAS
          </span>
          <h1>Configuración</h1>
          <p>Actualiza tus datos y decide qué avisos quieres ver. Te explicamos cada ajuste.</p>
        </div>
        <div className="citizen-settings__hero-badge">
          <i className="bi bi-shield-check" />
          <span>Cuenta protegida</span>
        </div>
      </header>

      {(error || aviso) && (
        <div
          className={`citizen-settings__message ${error ? "is-error" : "is-success"}`}
          role={error ? "alert" : "status"}
        >
          <i className={`bi ${error ? "bi-exclamation-circle-fill" : "bi-check-circle-fill"}`} />
          {error || aviso}
        </div>
      )}

      <div className="citizen-settings__grid">
        <section className="citizen-settings__card citizen-settings__profile">
          <header className="citizen-settings__card-head">
            <span className="citizen-settings__card-icon">
              <i className="bi bi-person-vcard" />
            </span>
            <div>
              <h2>Tu información</h2>
              <p>Estos datos identifican tu cuenta en Wolert.</p>
            </div>
            {!editando && (
              <button
                type="button"
                className="citizen-settings__edit"
                onClick={() => {
                  setEditando(true);
                  setError("");
                  setAviso("");
                }}
              >
                <i className="bi bi-pencil" /> Editar
              </button>
            )}
          </header>

          <div className="citizen-settings__identity">
            <span className="citizen-settings__avatar">{iniciales || "U"}</span>
            <div>
              <strong>{nombre}</strong>
              <small>{usuario.correo || "Correo sin registrar"}</small>
            </div>
            <span className="citizen-settings__role">Ciudadano</span>
          </div>

          <form onSubmit={guardarPerfil}>
            <div className="citizen-settings__fields">
              {CAMPOS.map(([key, label, type, requerido]) => (
                <label key={key}>
                  <span>
                    {label}
                    {requerido && <b> *</b>}
                  </span>
                  <input
                    type={type}
                    value={form[key] || ""}
                    disabled={!editando || guardando}
                    required={Boolean(requerido)}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, [key]: event.target.value }))
                    }
                  />
                </label>
              ))}
            </div>

            <div className="citizen-settings__readonly">
              <span>
                <small>Documento</small>
                <b>{usuario.cedula || "No disponible"}</b>
              </span>
              <span>
                <small>Barrio</small>
                <b>{usuario.barrioNombre || "No asignado"}</b>
              </span>
            </div>

            {editando && (
              <div className="citizen-settings__form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setForm(camposIniciales(usuario));
                    setEditando(false);
                    setError("");
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}>
                  <i className="bi bi-check2" /> {guardando ? "Guardando…" : "Guardar perfil"}
                </button>
              </div>
            )}
          </form>
        </section>

        <div className="citizen-settings__side">
          <section className="citizen-settings__card">
            <header className="citizen-settings__card-head">
              <span className="citizen-settings__card-icon green">
                <i className="bi bi-bell" />
              </span>
              <div>
                <h2>Avisos</h2>
                <p>Elige qué notificaciones aparecen en tu bandeja y en la campana.</p>
              </div>
            </header>

            <div className="citizen-settings__options">
              <div className="citizen-settings__option">
                <div>
                  <b>Notificaciones en mi dispositivo</b>
                  <small>
                    Recibe alertas en un radio de 500 metros de tu
                    ultima ubicaci&oacute;n autorizada, incluso con
                    la pagina cerrada si el navegador lo permite.
                  </small>
                </div>
                <Switch
                  id="pref-push"
                  checked={pushActivo}
                  disabled={pushProcesando}
                  label={pushProcesando ? "..." : pushActivo ? "Si" : "No"}
                  onChange={cambiarPush}
                />
              </div>
              <div className="citizen-settings__option">
                <div>
                  <b>Avisos de la comunidad</b>
                  <small>Alertas cercanas reportadas por tus vecinos.</small>
                </div>
                <Switch
                  id="pref-comunidad"
                  checked={preferencias.avisosComunidad}
                  label={preferencias.avisosComunidad ? "Sí" : "No"}
                  onChange={(value) => cambiarPreferencia("avisosComunidad", value)}
                />
              </div>
              <div className="citizen-settings__option">
                <div>
                  <b>Actualizaciones de mis alertas</b>
                  <small>Cambios de estado y atención de tus reportes.</small>
                </div>
                <Switch
                  id="pref-mis-alertas"
                  checked={preferencias.avisosMisAlertas}
                  label={preferencias.avisosMisAlertas ? "Sí" : "No"}
                  onChange={(value) => cambiarPreferencia("avisosMisAlertas", value)}
                />
              </div>
            </div>

            <p className="citizen-settings__hint">
              <i className="bi bi-info-circle" /> Estos ajustes controlan lo que ves en WolertApp en este dispositivo.
            </p>
          </section>

          <section className="citizen-settings__card">
            <header className="citizen-settings__card-head">
              <span className="citizen-settings__card-icon violet">
                <i className="bi bi-universal-access" />
              </span>
              <div>
                <h2>Comodidad visual</h2>
                <p>Ajusta la densidad de las pantallas.</p>
              </div>
            </header>
            <div className="citizen-settings__option">
              <div>
                <b>Modo compacto</b>
                <small>Reduce espacios para mostrar más contenido a la vez.</small>
              </div>
              <Switch
                id="pref-compacto"
                checked={preferencias.modoCompacto}
                label={preferencias.modoCompacto ? "Sí" : "No"}
                onChange={(value) => cambiarPreferencia("modoCompacto", value)}
              />
            </div>
          </section>

          <section className="citizen-settings__card">
            <header className="citizen-settings__card-head">
              <span className="citizen-settings__card-icon amber">
                <i className="bi bi-shield-lock" />
              </span>
              <div>
                <h2>Contraseña</h2>
                <p>Usa una contraseña única de al menos 8 caracteres.</p>
              </div>
            </header>

            <form className="citizen-settings__password" onSubmit={guardarContrasena}>
              <label>
                Contraseña actual
                <input
                  type="password"
                  autoComplete="current-password"
                  value={passActual}
                  onChange={(event) => setPassActual(event.target.value)}
                />
              </label>
              <label>
                Nueva contraseña
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={passNueva}
                  onChange={(event) => setPassNueva(event.target.value)}
                />
              </label>
              <label>
                Confirma la nueva contraseña
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={passConfirmar}
                  onChange={(event) => setPassConfirmar(event.target.value)}
                />
              </label>

              {passError && (
                <p className="citizen-settings__form-error" role="alert">
                  {passError}
                </p>
              )}
              {passAviso && (
                <p className="citizen-settings__form-success" role="status">
                  {passAviso}
                </p>
              )}

              <button type="submit" disabled={cambiandoPass}>
                <i className="bi bi-key" /> {cambiandoPass ? "Actualizando…" : "Actualizar contraseña"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
