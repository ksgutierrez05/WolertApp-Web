import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/admin/usuarios.css';

const CLAVE = 'wolertapp_usuarios';

export default function UsuariosForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '', cedula: '', telefono: '', correo: '', username: '', password: '', rol: '' });
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!form.rol) { setError('Debes seleccionar un rol.'); return; }
    let lista = [];
    try { lista = JSON.parse(localStorage.getItem(CLAVE) || '[]'); } catch (e) { lista = []; }
    const existe = lista.some((u) => u.username.toLowerCase() === form.username.toLowerCase() || u.cedula === form.cedula);
    if (existe) { setError('Ya existe un usuario con ese username o cédula.'); return; }
    const nombreCompleto = [form.primerNombre, form.segundoNombre, form.primerApellido, form.segundoApellido].filter(Boolean).join(' ');
    const paleta = ['#1f5fa8', '#1f9d5b', '#7c4fd1', '#c81e2c', '#c9821c', '#0a2f5c'];
    lista.push({ nombre: nombreCompleto, username: form.username, password: form.password, cedula: form.cedula, correo: form.correo, telefono: form.telefono, rol: form.rol, estado: 'activo', color: paleta[Math.floor(Math.random() * paleta.length)] });
    localStorage.setItem(CLAVE, JSON.stringify(lista));
    navigate('/admin/usuarios');
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="container-fluid">
      <h1 className="hero-title-dash" style={{ color: 'var(--ink)', fontSize: '26px' }}>Nuevo usuario</h1>
      <div className="card-panel-dash p-3">
        <form onSubmit={submit}>
          <div className="row g-2 mb-2">
            <div className="col-6"><input className="form-control input-dash" required placeholder="Primer Nombre *" value={form.primerNombre} onChange={(e) => set('primerNombre', e.target.value)} /></div>
            <div className="col-6"><input className="form-control input-dash" placeholder="Segundo Nombre" value={form.segundoNombre} onChange={(e) => set('segundoNombre', e.target.value)} /></div>
          </div>
          <div className="row g-2 mb-2">
            <div className="col-6"><input className="form-control input-dash" required placeholder="Primer Apellido *" value={form.primerApellido} onChange={(e) => set('primerApellido', e.target.value)} /></div>
            <div className="col-6"><input className="form-control input-dash" placeholder="Segundo Apellido" value={form.segundoApellido} onChange={(e) => set('segundoApellido', e.target.value)} /></div>
          </div>
          <div className="row g-2 mb-2">
            <div className="col-6"><input className="form-control input-dash" required placeholder="Cédula *" value={form.cedula} onChange={(e) => set('cedula', e.target.value)} /></div>
            <div className="col-6"><input type="tel" className="form-control input-dash" placeholder="Teléfono" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} /></div>
          </div>
          <div className="mb-2"><input type="email" className="form-control input-dash" placeholder="Correo" value={form.correo} onChange={(e) => set('correo', e.target.value)} /></div>
          <div className="mb-2"><input className="form-control input-dash" required placeholder="Username *" value={form.username} onChange={(e) => set('username', e.target.value)} /></div>
          <div className="mb-2"><input type="password" className="form-control input-dash" required placeholder="Contraseña *" value={form.password} onChange={(e) => set('password', e.target.value)} /></div>
          <div className="mb-2">
            <select className="form-select input-dash" required value={form.rol} onChange={(e) => set('rol', e.target.value)}>
              <option value="" disabled>Seleccionar Rol *</option>
              <option value="ciudadano">Ciudadano</option>
              <option value="policia">Policía</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {error && <div className="text-danger small mt-2">{error}</div>}
          <button type="submit" className="btn btn-cv-azul px-4 mt-3" style={{ borderRadius: '12px', fontWeight: '700' }}>Crear Usuario</button>
        </form>
      </div>
    </div>
  );
}