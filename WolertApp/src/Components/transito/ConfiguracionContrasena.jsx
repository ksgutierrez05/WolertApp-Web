import { useState } from 'react';
import { cambiarPassword } from '../../Services/UsuariosAPI';
import { obtenerSesionTransito } from '../../Services/transitoApi';

export default function ConfiguracionContrasena({ embedded = false }) {
  const idUsuario = obtenerSesionTransito().idUsuario || Number(localStorage.getItem('idUsuario'));
  const [abierta, setAbierta] = useState(embedded);
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar(event) {
    event.preventDefault();
    setError('');
    setAviso('');

    if (!idUsuario) {
      setError('No encontramos una sesión activa. Vuelve a iniciar sesión.');
      return;
    }
    if (!actual || !nueva || !confirmacion) {
      setError('Completa los tres campos.');
      return;
    }
    if (nueva.length < 8) {
      setError('Usa al menos 8 caracteres para la nueva contraseña.');
      return;
    }
    if (nueva !== confirmacion) {
      setError('La confirmación no coincide con la nueva contraseña.');
      return;
    }
    if (actual === nueva) {
      setError('Elige una contraseña distinta a la actual.');
      return;
    }

    try {
      setGuardando(true);
      await cambiarPassword(idUsuario, actual, nueva);
      setActual('');
      setNueva('');
      setConfirmacion('');
      setAviso('Contraseña actualizada correctamente.');
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setGuardando(false);
    }
  }

  const formulario = (
    <form className="admin-config-security-inline transito-password-form" onSubmit={guardar}>
      <div className="admin-config-security-title">
        <i className="bi bi-shield-lock" aria-hidden="true" />
        <span>Cambiar contraseña<small>Confirma tu contraseña actual y crea una nueva de al menos 8 caracteres.</small></span>
      </div>
      <label className="config-label-dash" htmlFor={`transito-pass-actual-${idUsuario}`}>Contraseña actual</label>
      <input id={`transito-pass-actual-${idUsuario}`} className="form-control input-dash" type="password" autoComplete="current-password" value={actual} onChange={(event) => setActual(event.target.value)} disabled={guardando} />
      <label className="config-label-dash" htmlFor={`transito-pass-nueva-${idUsuario}`}>Nueva contraseña</label>
      <input id={`transito-pass-nueva-${idUsuario}`} className="form-control input-dash" type="password" autoComplete="new-password" minLength={8} value={nueva} onChange={(event) => setNueva(event.target.value)} disabled={guardando} />
      <label className="config-label-dash" htmlFor={`transito-pass-confirmar-${idUsuario}`}>Confirmar nueva contraseña</label>
      <input id={`transito-pass-confirmar-${idUsuario}`} className="form-control input-dash" type="password" autoComplete="new-password" minLength={8} value={confirmacion} onChange={(event) => setConfirmacion(event.target.value)} disabled={guardando} />
      {error && <div className="text-danger" role="alert">{error}</div>}
      {aviso && <div className="text-success" role="status">{aviso}</div>}
      <button type="submit" className="btn btn-cv-azul" disabled={guardando}>{guardando ? 'Actualizando...' : 'Actualizar contraseña'}</button>
    </form>
  );

  if (embedded) return formulario;

  return (
    <section className="card-panel-dash transito-config-seguridad">
      <div className="admin-config-account-inline">
        <div className="admin-config-inline-heading">
          <h2>Cuenta</h2>
          <span>Seguridad y acceso</span>
        </div>
        <button type="button" className="cuenta-fila-dash" aria-expanded={abierta} onClick={() => setAbierta((valor) => !valor)}>
          <span className="cuenta-fila-icono-dash cuenta-icono-azul-dash"><i className="bi bi-shield-lock-fill" /></span>
          <span className="flex-grow-1"><span className="toggle-titulo-dash">Cambiar contraseña</span></span>
          <i className={`bi ${abierta ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
        </button>
        {abierta && formulario}
      </div>
    </section>
  );
}
