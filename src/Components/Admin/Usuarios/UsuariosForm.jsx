import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/admin/usuarios.css';
import { crearUsuarioPersonal, listaRoles } from '../../../Service/UsuariosAPI.js';

// Mismo mapa que "Permitidos" en UsuariosController.cs (quién puede crear a quién).
// El backend es quien manda: esto solo evita mostrar opciones que darían 403.
const PERMITIDOS = {
  Admin: ['Admin', 'AdminPolicia', 'DirectorTransito'],
  AdminPolicia: ['Policia', 'CentralPolicia'],
  DirectorTransito: ['AgenteTransito', 'CentralTransito'],
};

const nombreRol = {
  Admin: 'Admin',
  AdminPolicia: 'Admin. Policía',
  DirectorTransito: 'Director Tránsito',
  Policia: 'Policía',
  CentralPolicia: 'Central Policial',
  AgenteTransito: 'Agente Tránsito',
  CentralTransito: 'Cent. Tránsito',
  Ciudadano: 'Ciudadano',
};

const FORM_VACIO = {
  primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
  cedula: '', telefono: '', correo: '', username: '', password: '', rolId: '',
};

export default function UsuariosForm() {
  const navigate = useNavigate();
  const rolActual = localStorage.getItem('rol');

  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    listaRoles().then(setRoles).catch((e) => setError(e.message));
  }, []);

  // Solo los roles que el rol de quien inició sesión puede crear
  const rolesDisponibles = useMemo(
    () => roles.filter((r) => (PERMITIDOS[rolActual] || []).includes(r.nombre)),
    [roles, rolActual]
  );

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.rolId) { setError('Debes seleccionar un rol.'); return; }

    try {
      setGuardando(true);
      await crearUsuarioPersonal({
        cedula: form.cedula.trim(),
        primerNombre: form.primerNombre.trim(),
        segundoNombre: form.segundoNombre.trim() || null,
        primerApellido: form.primerApellido.trim(),
        segundoApellido: form.segundoApellido.trim() || null,
        correo: form.correo.trim(),
        telefono: form.telefono.trim() || null,
        username: form.username.trim(),
        password: form.password,
        rolId: Number(form.rolId),
      });
      navigate('/admin/usuarios');
    } catch (err) {
      setError(err.message); // mensaje del backend: 409 duplicado, 403 jerarquía, 401 sesión, etc.
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="container-fluid">
      <h1 className="hero-title-dash" style={{ color: '#64748b', fontSize: '26px' }}>Nuevo usuario</h1>
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
          <div className="mb-2"><input type="email" className="form-control input-dash" required placeholder="Correo *" value={form.correo} onChange={(e) => set('correo', e.target.value)} /></div>
          <div className="mb-2"><input className="form-control input-dash" required placeholder="Username *" value={form.username} onChange={(e) => set('username', e.target.value)} /></div>
          <div className="mb-2"><input type="password" className="form-control input-dash" required placeholder="Contraseña *" value={form.password} onChange={(e) => set('password', e.target.value)} /></div>
          <div className="mb-2">
            <select className="form-select input-dash" required value={form.rolId} onChange={(e) => set('rolId', e.target.value)}>
              <option value="" disabled>Seleccionar Rol *</option>
              {rolesDisponibles.map((r) => (
                <option key={r.idRol} value={r.idRol}>{nombreRol[r.nombre] || r.nombre}</option>
              ))}
            </select>
            {rolesDisponibles.length === 0 && (
              <div className="small text-muted mt-1">No hay roles disponibles para tu perfil.</div>
            )}
          </div>
          {error && <div className="text-danger small mt-2">{error}</div>}
          <button type="submit" disabled={guardando} className="btn btn-cv-azul px-4 mt-3" style={{ borderRadius: '12px', fontWeight: '700' }}>
            {guardando ? 'Guardando...' : 'Crear Usuario'}
          </button>
        </form>
      </div>
    </div>
  );
}