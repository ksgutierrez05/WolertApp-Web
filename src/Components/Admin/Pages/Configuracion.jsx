import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/admin/configuracion.css';
import {
  logOut,
  obtenerUsuarioPorId,
  editarUsuario,
  cambiarPassword,
} from '../../../Service/UsuariosAPI.js';

const nombreRol = {
  Admin: 'Administrador',
  AdminPolicia: 'Admin. Policía',
  DirectorTransito: 'Director Tránsito',
  Policia: 'Policía',
  CentralPolicia: 'Central Policial',
  AgenteTransito: 'Agente Tránsito',
  CentralTransito: 'Cent. Tránsito',
  Ciudadano: 'Ciudadano',
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
];

const aForm = (u = {}) => ({
  primerNombre: u.primerNombre || '',
  segundoNombre: u.segundoNombre || '',
  primerApellido: u.primerApellido || '',
  segundoApellido: u.segundoApellido || '',
  correo: u.correo || '',
  telefono: u.telefono || '',
  username: u.username || '',
});

const PREFS_POR_DEFECTO = { notificaciones: true, sonido: true, compacto: false };

export default function Configuracion() {
  const navigate = useNavigate();
  const idActual = localStorage.getItem('idUsuario');
  const CLAVE_PREFS = `wolertapp_prefs_${idActual}`;

  // Perfil
  const [detalle, setDetalle] = useState(null); // datos completos que vienen de la API
  const [form, setForm] = useState(aForm());
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Preferencias (se guardan por usuario en este navegador)
  const [prefs, setPrefs] = useState(() => {
    try {
      return { ...PREFS_POR_DEFECTO, ...JSON.parse(localStorage.getItem(CLAVE_PREFS)) };
    } catch {
      return PREFS_POR_DEFECTO;
    }
  });

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

  // Guardar preferencias y aplicar modo compacto
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_PREFS, JSON.stringify(prefs));
    } catch { /* si el navegador bloquea el almacenamiento, se ignora */ }
    document.body.classList.toggle('modo-compacto', prefs.compacto);
  }, [prefs, CLAVE_PREFS]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!form.primerNombre.trim() || !form.primerApellido.trim() || !form.correo.trim() || !form.username.trim()) {
      setError('Primer nombre, primer apellido, correo y usuario son obligatorios.');
      return;
    }

    // El PUT reemplaza TODOS los campos: reenviamos cédula y dirección tal como vinieron del GET
    const { cedula, calle, carrera, etapa, manzana, casa, barrioId } = detalle;

    try {
      setGuardando(true);
      await editarUsuario(idActual, {
        cedula, calle, carrera, etapa, manzana, casa, barrioId,
        primerNombre: form.primerNombre.trim(),
        segundoNombre: form.segundoNombre.trim() || null,
        primerApellido: form.primerApellido.trim(),
        segundoApellido: form.segundoApellido.trim() || null,
        correo: form.correo.trim(),
        telefono: form.telefono.trim() || null,
        username: form.username.trim(),
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

  return (
    <div className="container-fluid">
      <div className="config-banner-dash mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="config-avatar-grande-dash"><i className="bi bi-person-fill" /></div>
          <div>
            <div className="config-banner-nombre-dash" id="perfil-nombre">
              {(detalle.nombreCompleto || detalle.username || '').toUpperCase()}
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
              <h3 className="section-title-dash">Información personal y operativa</h3>
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
                  <span className="info-fila-label-dash">{c.label}</span>
                  {editando ? (
                    <input
                      type={c.type}
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
          <div className="card-panel-dash mb-3">
            <div className="info-card-header-dash">
              <h3 className="section-title-dash">Configuración</h3>
            </div>
            <div className="toggle-fila-dash">
              <div>
                <div className="toggle-titulo-dash">Notificaciones</div>
                <div className="toggle-sub-dash">Recibir avisos de alertas del sistema</div>
              </div>
              <label className="switch-dash">
                <input
                  type="checkbox"
                  id="pref-notificaciones"
                  checked={prefs.notificaciones}
                  onChange={(e) => setPrefs({ ...prefs, notificaciones: e.target.checked })}
                />
                <span className="switch-slider-dash" />
              </label>
            </div>
            <div className="toggle-fila-dash">
              <div>
                <div className="toggle-titulo-dash">Sonido</div>
                <div className="toggle-sub-dash">Reproducir sonido al recibir una alerta</div>
              </div>
              <label className="switch-dash">
                <input
                  type="checkbox"
                  id="pref-sonido"
                  checked={prefs.sonido}
                  onChange={(e) => setPrefs({ ...prefs, sonido: e.target.checked })}
                />
                <span className="switch-slider-dash" />
              </label>
            </div>
            <div className="toggle-fila-dash" style={{ borderBottom: 'none' }}>
              <div>
                <div className="toggle-titulo-dash">Modo compacto</div>
                <div className="toggle-sub-dash">Reduce el espaciado de las tablas</div>
              </div>
              <label className="switch-dash">
                <input
                  type="checkbox"
                  id="pref-compacto"
                  checked={prefs.compacto}
                  onChange={(e) => setPrefs({ ...prefs, compacto: e.target.checked })}
                />
                <span className="switch-slider-dash" />
              </label>
            </div>
          </div>

          <div className="card-panel-dash">
            <div className="info-card-header-dash">
              <h3 className="section-title-dash">Cuenta</h3>
            </div>
            <div className="cuenta-fila-dash" id="fila-seguridad" onClick={() => setSeguridadAbierta(!seguridadAbierta)}>
              <div className="cuenta-fila-icono-dash cuenta-icono-azul-dash"><i className="bi bi-shield-lock-fill" /></div>
              <div className="flex-grow-1"><div className="toggle-titulo-dash">Seguridad</div></div>
              <i className={`bi ${seguridadAbierta ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
            </div>
            <div
              className="cuenta-fila-dash cuenta-fila-danger-dash"
              id="fila-cerrar-sesion"
              style={{ borderBottom: 'none', cursor: 'pointer' }}
              onClick={cerrarSesion}
            >
              <div className="cuenta-fila-icono-dash cuenta-icono-rojo-dash"><i className="bi bi-box-arrow-right" /></div>
              <div className="flex-grow-1"><div className="toggle-titulo-dash" style={{ color: 'var(--color-danger)' }}>Cerrar sesión</div></div>
              <i className="bi bi-chevron-right" />
            </div>
          </div>

          <div className={`card-panel-dash mt-3 ${seguridadAbierta ? '' : 'd-none'}`} id="panel-seguridad">
            <div className="info-card-header-dash">
              <h3 className="section-title-dash">Cambiar contraseña</h3>
            </div>
            <div className="p-3">
              <label className="config-label-dash">Contraseña actual</label>
              <input
                type="password"
                id="config-pass-actual"
                className="form-control input-dash mb-3"
                placeholder="••••••••"
                autoComplete="current-password"
                value={passActual}
                onChange={(e) => setPassActual(e.target.value)}
              />
              <label className="config-label-dash">Nueva contraseña</label>
              <input
                type="password"
                id="config-pass-nueva"
                className="form-control input-dash mb-3"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                value={passNueva}
                onChange={(e) => setPassNueva(e.target.value)}
              />
              <label className="config-label-dash">Confirmar nueva contraseña</label>
              <input
                type="password"
                id="config-pass-confirmar"
                className="form-control input-dash mb-3"
                placeholder="••••••••"
                autoComplete="new-password"
                value={passConfirmar}
                onChange={(e) => setPassConfirmar(e.target.value)}
              />
              {errorPass && <div className="text-danger small mb-2" role="alert">{errorPass}</div>}
              {mensajePass && <div className="text-success small mb-2" role="status">{mensajePass}</div>}
              <button
                type="button"
                className="btn btn-cv-azul w-100"
                id="btn-cambiar-pass"
                style={{ borderRadius: '12px', fontWeight: '700' }}
                onClick={handleCambiarPassword}
                disabled={cambiandoPass}
              >
                {cambiandoPass ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}