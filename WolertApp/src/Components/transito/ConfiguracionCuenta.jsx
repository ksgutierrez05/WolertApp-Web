import { useEffect, useState } from "react";
import { editarUsuario, obtenerUsuarioPorId } from "../../Services/UsuariosAPI";
import { obtenerSesionTransito } from "../../Services/transitoApi";

const CAMPOS = [
  ["primerNombre", "Primer nombre", "text", true],
  ["segundoNombre", "Segundo nombre", "text", false],
  ["primerApellido", "Primer apellido", "text", true],
  ["segundoApellido", "Segundo apellido", "text", false],
  ["correo", "Correo electrónico", "email", true],
  ["telefono", "Teléfono", "tel", false],
  ["username", "Usuario", "text", true],
];

const leerCampo = (usuario, campo) => usuario?.[campo] ?? usuario?.[campo[0].toUpperCase() + campo.slice(1)] ?? "";
const aFormulario = (usuario) => Object.fromEntries(CAMPOS.map(([campo]) => [campo, leerCampo(usuario, campo)]));

export default function ConfiguracionCuenta() {
  const sesion = obtenerSesionTransito();
  const idUsuario = sesion.idUsuario || localStorage.getItem("idUsuario");
  const [usuario, setUsuario] = useState(null);
  const [formulario, setFormulario] = useState({});
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let vigente = true;
    if (!idUsuario) {
      setError("No encontramos una sesión activa.");
      setCargando(false);
      return () => { vigente = false; };
    }
    obtenerUsuarioPorId(idUsuario)
      .then((datos) => {
        if (!vigente) return;
        setUsuario(datos);
        setFormulario(aFormulario(datos));
      })
      .catch((err) => vigente && setError(err.message || "No se pudo cargar tu perfil."))
      .finally(() => vigente && setCargando(false));
    return () => { vigente = false; };
  }, [idUsuario]);

  async function guardarPerfil(event) {
    event.preventDefault();
    setError(""); setAviso("");
    if (!formulario.primerNombre?.trim() || !formulario.primerApellido?.trim() || !formulario.correo?.trim() || !formulario.username?.trim()) {
      setError("Nombre, apellido, correo y usuario son obligatorios.");
      return;
    }
    const textoONulo = (valor) => String(valor || "").trim() || null;
    try {
      setGuardando(true);
      await editarUsuario(idUsuario, {
        cedula: leerCampo(usuario, "cedula") || null,
        barrioId: usuario.barrioId ?? usuario.idBarrio ?? usuario.BarrioId ?? null,
        primerNombre: formulario.primerNombre.trim(),
        segundoNombre: textoONulo(formulario.segundoNombre),
        primerApellido: formulario.primerApellido.trim(),
        segundoApellido: textoONulo(formulario.segundoApellido),
        correo: formulario.correo.trim(),
        telefono: textoONulo(formulario.telefono),
        username: formulario.username.trim(),
        calle: usuario.calle ?? usuario.Calle ?? null,
        carrera: usuario.carrera ?? usuario.Carrera ?? null,
        etapa: usuario.etapa ?? usuario.Etapa ?? null,
        manzana: usuario.manzana ?? usuario.Manzana ?? null,
        casa: usuario.casa ?? usuario.Casa ?? null,
      });
      const actualizado = await obtenerUsuarioPorId(idUsuario);
      setUsuario(actualizado); setFormulario(aFormulario(actualizado)); setEditando(false);
      localStorage.setItem("username", leerCampo(actualizado, "username"));
      setAviso("Tu perfil se actualizó en WolertApp.");
    } catch (err) {
      setError(err.message || "No se pudieron guardar los cambios en tu perfil.");
    } finally { setGuardando(false); }
  }

  return (
    <section className="card-panel-dash transito-config-perfil">
      <div className="info-card-header-dash">
        <div><h2 className="panel-title-dash mb-1">Tu información</h2><p className="config-text-dash mb-0">Estos datos se leen y actualizan en tu cuenta de WolertApp.</p></div>
        {usuario && !editando && <button type="button" className="btn-editar-info-dash" onClick={() => { setEditando(true); setError(""); setAviso(""); }}><i className="bi bi-pencil" /> Editar</button>}
      </div>
      {cargando && <div className="alert alert-info" role="status">Cargando perfil...</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {aviso && <div className="alert alert-success" role="status">{aviso}</div>}
      {usuario && <form onSubmit={guardarPerfil}>
        <div className="row g-3">
          {CAMPOS.map(([campo, etiqueta, tipo, requerido]) => <div className="col-md-6" key={campo}>
            <label className="config-field-label-dash" htmlFor={`perfil-transito-${campo}`}>{etiqueta}{requerido ? " *" : ""}</label>
            <input id={`perfil-transito-${campo}`} className="form-control" type={tipo} required={requerido} disabled={!editando || guardando} value={formulario[campo] || ""} onChange={(event) => setFormulario((actual) => ({ ...actual, [campo]: event.target.value }))} />
          </div>)}
          <div className="col-md-6"><label className="config-field-label-dash">Documento</label><div className="form-control bg-light">{leerCampo(usuario, "cedula") || "No disponible"}</div></div>
        </div>
        {editando && <div className="d-flex justify-content-end gap-2 mt-3">
          <button type="button" className="btn-secundario-dash" disabled={guardando} onClick={() => { setFormulario(aFormulario(usuario)); setEditando(false); setError(""); }}>Cancelar</button>
          <button type="submit" className="btn-asignar-dash" disabled={guardando}>{guardando ? "Guardando..." : "Guardar perfil"}</button>
        </div>}
      </form>}
    </section>
  );
}
