import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/global.css';
import '../../css/temas.css';
import '../../css/admin/configuracion.css'; // mismos estilos que el panel del admin
import {
  logOut,
  obtenerUsuarioPorId,
  editarUsuario,
  cambiarPassword,
} from '../../Services/UsuariosAPI.js';
import { guardarPreferenciasAdmin, obtenerPreferenciasAdmin } from '../../Services/PreferenciasAdmin';

const nombreRol = {
  ADMIN: 'Administrador',
  ADMIN_POLICIA: 'Admin. Policía',
  ADMIN_TRANSITO: 'Admin. Tránsito',
  POLICIA: 'Policía',
  CENTRAL_POLICIA: 'Central Policial',
  AGENTE_TRANSITO: 'Agente Tránsito',
  CENTRAL_TRANSITO: 'Cent. Tránsito',
  CIUDADANO: 'Ciudadano',
};

// Campos editables del perfil (se generan desde este arreglo)
const CAMPOS = [
  { name: 'primerNombre', label: 'Primer nombre', type: 'text' },
  { name: 'segundoNombre', label: 'Segundo nombre', type: 'text' },
  { name: 'primerApellido', label: 'Primer apellido', type: 'text' },
  { name: 'segundoApellido', label: 'Segundo apellido', type: 'text' },
  { name: 'correo', label: 'Correo electrónico', type: 'email' },
  { name: 'telefono', label: 'Teléfono', type: 'tel' },
  { name: 'username', label: 'Usuario', type: 'text' },
  { name: 'calle', label: 'Calle', type: 'text' },
  { name: 'carrera', label: 'Carrera', type: 'text' },
  { name: 'etapa', label: 'Etapa', type: 'text' },
  { name: 'manzana', label: 'Manzana', type: 'text' },
  { name: 'casa', label: 'Casa', type: 'text' },
];

const aForm = (u = {}) => ({
  primerNombre: u.primerNombre || '',
  segundoNombre: u.segundoNombre || '',
  primerApellido: u.primerApellido || '',
  segundoApellido: u.segundoApellido || '',
  correo: u.correo || '',
  telefono: u.telefono || '',
  username: u.username || '',
  calle: u.calle || '',
  carrera: u.carrera || '',
  etapa: u.etapa || '',
  manzana: u.manzana || '',
  casa: u.casa || '',
});

export default function Configuracion() {
  const navigate = useNavigate();
  const idActual = localStorage.getItem('idUsuario');

  // Perfil
  const [detalle, setDetalle] = useState(null); // datos completos que vienen de la API
  const [form, setForm] = useState(aForm());
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Preferencias (se guardan por usuario en este navegador)
  const [prefs, setPrefs] = useState(() => obtenerPreferenciasAdmin());

  // Seguridad
  const [seguridadAbierta, setSeguridadAbierta] = useState(false);
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passConfirmar, setPassConfirmar] = useState('');
  const [errorPass, setErrorPass] = useState('');
  const [mensajePass, setMensajePass] = useState('');
  const [cambiandoPass, setCambiandoPass] = useState(false);

  // Cargar el usuario real
  useEffect(() => {
    if (!idActual) {
      setError('No hay una sesión activa.');
      setCargando(false);
      return;
    }
    obtenerUsuarioPorId(idActual)
      .then((u) => {
        setDetalle(u);
        setForm(aForm(u));
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [idActual]);

  // Aplicar el modo compacto; las preferencias se guardan al cambiar cada opción.
  useEffect(() => {
    document.body.classList.toggle('modo-compacto', prefs.compacto);
  }, [prefs.compacto]);

  const cambiarPreferencia = (clave, valor) => {
    const actualizadas = guardarPreferenciasAdmin({ ...prefs, [clave]: valor });
    setPrefs(actualizadas);
    setMensaje('Preferencia guardada en este navegador.');
    setError('');
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!form.primerNombre.trim() || !form.primerApellido.trim() || !form.correo.trim() || !form.username.trim()) {
      setError('Primer nombre, primer apellido, correo y usuario son obligatorios.');
      return;
    }

    // Protección: el PUT reemplaza el barrio. Si la API no lo devolvió, guardar lo borraría.
    const barrioId = detalle.barrioId ?? detalle.idBarrio;
    if (barrioId === undefined || barrioId === null) {
      setError('No se puede guardar todavía: la API no está devolviendo tu barrio y se perdería. Falta actualizar el backend.');
      return;
    }

    // El PUT reemplaza TODOS los campos: reenviamos cédula y barrio tal como vinieron del GET
    const { cedula } = detalle;
    const textoONulo = (v) => v.trim() || null;

    try {
      setGuardando(true);
      await editarUsuario(idActual, {
        cedula,
        barrioId,
        primerNombre: form.primerNombre.trim(),
        segundoNombre: textoONulo(form.segundoNombre),
        primerApellido: form.primerApellido.trim(),
        segundoApellido: textoONulo(form.segundoApellido),
        correo: form.correo.trim(),
        telefono: textoONulo(form.telefono),
        username: form.username.trim(),
        calle: textoONulo(form.calle),
        carrera: textoONulo(form.carrera),
        etapa: textoONulo(form.etapa),
        manzana: textoONulo(form.manzana),
        casa: textoONulo(form.casa),
      });

      const actualizado = await obtenerUsuarioPorId(idActual);
      setDetalle(actualizado);
      setForm(aForm(actualizado));
      localStorage.setItem('username', actualizado.username);
      setEditando(false);
      setMensaje('Cambios guardados correctamente.');
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setForm(aForm(detalle));
    setError('');
    setEditando(false);
  };

  const handleCambiarPassword = async () => {
    setErrorPass('');
    setMensajePass('');

    if (!passActual || !passNueva || !passConfirmar) {
      setErrorPass('Completa los tres campos.');
      return;
    }
    if (passNueva.length < 8) {
      setErrorPass('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (passNueva !== passConfirmar) {
      setErrorPass('La confirmación no coincide con la nueva contraseña.');
      return;
    }
    if (passNueva === passActual) {
      setErrorPass('La nueva contraseña debe ser distinta a la actual.');
      return;
    }

    try {
      setCambiandoPass(true);
      await cambiarPassword(idActual, passActual, passNueva);
      setPassActual('');
      setPassNueva('');
      setPassConfirmar('');
      setMensajePass('Contraseña actualizada correctamente.');
    } catch (err) {
      setErrorPass(err.message);
    } finally {
      setCambiandoPass(false);
    }
  };

  const cerrarSesion = () => {
    if (!window.confirm('¿Seguro que quieres cerrar sesión?')) return;
    document.body.classList.remove('modo-compacto');
    logOut();
    navigate('/login', { replace: true });
  };

  if (cargando) {
    return <div className="container-fluid"><p className="p-3">Cargando configuración...</p></div>;
  }

  if (!detalle) {
    return (
      <div className="container-fluid">
        <div className="text-danger p-3">{error || 'No se pudo cargar tu perfil.'}</div>
      </div>
    );
  }

  const estado = (detalle.estado || '').toLowerCase();
  const claseEstado = estado === 'activo' ? 'badge-green-dash' : 'badge-gray-dash';

  // La API de "un usuario" no trae el nombre completo armado: se arma aquí
  const nombreBanner =
    [detalle.primerNombre, detalle.primerApellido].filter(Boolean).join(' ') || detalle.username || '';

  return (
    <div className="container-fluid admin-config-page">
      <header className="admin-config-hero">
        <div><span><i className="bi bi-sliders" /> CUENTA Y PREFERENCIAS</span><h1>Configuración</h1><p>Actualiza tu perfil, personaliza el dashboard y protege el acceso a tu cuenta.</p></div>
        <div className="admin-config-hero__badge"><i className="bi bi-shield-check" /> Ajustes de tu cuenta</div>
      </header>
      <div className="config-banner-dash mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="config-avatar-grande-dash"><i className="bi bi-person-fill" /></div>
          <div>
            <div className="config-banner-nombre-dash" id="perfil-nombre">
              {nombreBanner.toUpperCase()}
            </div>
            <div className="config-banner-estado-dash">
              <span className="dot-online-dash" /> {estado === 'activo' ? 'Cuenta activa' : 'Cuenta ' + (estado || 'sin estado')} · {nombreRol[detalle.rolNombre] || detalle.rolNombre}
            </div>
          </div>
        </div>
        <i className="bi bi-shield-check config-banner-icono-dash" />
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card-panel-dash">
            <div className="info-card-header-dash">
              <h3 className="section-title-dash">Información personal</h3>
              {!editando && (
                <button
                  type="button"
                  className="btn-editar-info-dash"
                  id="btn-toggle-edicion"
                  onClick={() => { setMensaje(''); setEditando(true); }}
                >
                  <i className="bi bi-pencil" /> Editar
                </button>
              )}
            </div>

            <form id="form-configuracion" className={editando ? 'editando' : ''} onSubmit={handleSubmit}>
              {CAMPOS.map((c) => (
                <div className="info-fila-dash" key={c.name}>
                  {editando ? (
                    <label className="info-fila-label-dash" htmlFor={`config-${c.name}`}>
                      {c.label}
                    </label>
                  ) : (
                    <span className="info-fila-label-dash">{c.label}</span>
                  )}
                  {editando ? (
                    <input
                      type={c.type}
                      id={`config-${c.name}`}
                      name={c.name}
                      className="form-control input-dash input-edicion-dash"
                      value={form[c.name]}
                      onChange={handleChange}
                    />
                  ) : (
                    <span className="info-fila-valor-dash">{form[c.name] || '—'}</span>
                  )}
                </div>
              ))}

              {/* Campos que no se editan desde aquí */}
              <div className="info-fila-dash">
                <span className="info-fila-label-dash">Barrio</span>
                <span className="info-fila-valor-dash">{detalle.barrioNombre || '—'}</span>
              </div>
              <div className="info-fila-dash">
                <span className="info-fila-label-dash">Cédula</span>
                <span className="info-fila-valor-dash">{detalle.cedula || '—'}</span>
              </div>
              <div className="info-fila-dash">
                <span className="info-fila-label-dash">Rol</span>
                <span className="info-fila-valor-dash">{nombreRol[detalle.rolNombre] || detalle.rolNombre || '—'}</span>
              </div>
              <div className="info-fila-dash" style={{ borderBottom: 'none' }}>
                <span className="info-fila-label-dash">Estado</span>
                <span className={`badge-dash ${claseEstado}`}>{(detalle.estado || '—').toUpperCase()}</span>
              </div>

              {error && <div className="text-danger small px-3 pb-2">{error}</div>}
              {mensaje && <div className="text-success small px-3 pb-2" role="status">{mensaje}</div>}

              <div
                className="config-footer-dash d-flex justify-content-end gap-2"
                id="acciones-edicion-dash"
                style={{ display: editando ? 'flex' : 'none' }}
              >
                <button type="button" className="btn btn-cancelar-dash" id="btn-cancelar-config" onClick={handleCancelar} disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-cv-azul px-4" style={{ borderRadius: '12px', fontWeight: '700' }} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-5">
          <section className="card-panel-dash admin-config-preferences">
            <div className="info-card-header-dash">
              <div>
                <h3 className="section-title-dash">Preferencias y cuenta</h3>
                <p className="admin-config-help">Personaliza el panel y administra el acceso a tu cuenta.</p>
              </div>
            </div>
            <div className="toggle-fila-dash">
              <div><div className="toggle-titulo-dash">Avisos en la campana</div><div className="toggle-sub-dash">Muestra el contador y la vista previa de las notificaciones recibidas.</div></div>
              <label className="switch-dash" aria-label="Mostrar notificaciones en la campana"><input type="checkbox" id="pref-notificaciones" checked={prefs.mostrarCampana} onChange={(e) => cambiarPreferencia('mostrarCampana', e.target.checked)} /><span className="switch-slider-dash" /></label>
            </div>
            <div className="toggle-fila-dash" style={{ borderBottom: 'none' }}>
              <div><div className="toggle-titulo-dash">Modo compacto</div><div className="toggle-sub-dash">Reduce el espacio entre paneles para mostrar más información en pantalla.</div></div>
              <label className="switch-dash" aria-label="Activar modo compacto"><input type="checkbox" id="pref-compacto" checked={prefs.compacto} onChange={(e) => cambiarPreferencia('compacto', e.target.checked)} /><span className="switch-slider-dash" /></label>
            </div>
            <p className="admin-config-pref-note"><i className="bi bi-info-circle" /> Las preferencias se guardan en este navegador para tu cuenta.</p>

            <div className="admin-config-account-inline">
              <div className="admin-config-inline-heading">
                <h3>Cuenta</h3>
                <span>Seguridad y acceso</span>
              </div>
            <button
              type="button"
              className="cuenta-fila-dash"
              id="fila-seguridad"
              aria-expanded={seguridadAbierta}
              aria-controls="panel-seguridad"
              onClick={() => setSeguridadAbierta(!seguridadAbierta)}
            >
              <span className="cuenta-fila-icono-dash cuenta-icono-azul-dash"><i className="bi bi-shield-lock-fill" /></span>
              <span className="flex-grow-1"><span className="toggle-titulo-dash">Seguridad</span></span>
              <i className={`bi ${seguridadAbierta ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
            </button>
              <div
                className="admin-config-security-inline"
                id="panel-seguridad"
                hidden={!seguridadAbierta}
              >
                <div className="admin-config-security-title">
                  <i className="bi bi-shield-lock" />
                  <span>Cambiar contraseña<small>Usa una contraseña nueva de al menos 8 caracteres.</small></span>
                </div>
                <label className="config-label-dash" htmlFor="config-pass-actual">Contraseña actual</label>
                <input
                  type="password"
                  id="config-pass-actual"
                  className="form-control input-dash"
                  placeholder="Contraseña actual"
                  autoComplete="current-password"
                  value={passActual}
                  onChange={(e) => setPassActual(e.target.value)}
                />
                <label className="config-label-dash" htmlFor="config-pass-nueva">Nueva contraseña</label>
                <input
                  type="password"
                  id="config-pass-nueva"
                  className="form-control input-dash"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  value={passNueva}
                  onChange={(e) => setPassNueva(e.target.value)}
                />
                <label className="config-label-dash" htmlFor="config-pass-confirmar">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  id="config-pass-confirmar"
                  className="form-control input-dash"
                  placeholder="Repite la nueva contraseña"
                  autoComplete="new-password"
                  value={passConfirmar}
                  onChange={(e) => setPassConfirmar(e.target.value)}
                />
                {errorPass && <div className="text-danger small" role="alert">{errorPass}</div>}
                {mensajePass && <div className="text-success small" role="status">{mensajePass}</div>}
                <button
                  type="button"
                  className="btn btn-cv-azul w-100"
                  id="btn-cambiar-pass"
                  onClick={handleCambiarPassword}
                  disabled={cambiandoPass}
                >
                  {cambiandoPass ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </div>
            <button
              type="button"
              className="cuenta-fila-dash cuenta-fila-danger-dash"
              id="fila-cerrar-sesion"
              onClick={cerrarSesion}
            >
              <span className="cuenta-fila-icono-dash cuenta-icono-rojo-dash"><i className="bi bi-box-arrow-right" /></span>
              <span className="flex-grow-1"><span className="toggle-titulo-dash" style={{ color: 'var(--color-danger)' }}>Cerrar sesión</span></span>
              <i className="bi bi-chevron-right" />
            </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
