import { useState, useMemo } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/admin/usuarios.css';
import '../../../css/admin/AdminLayout.css';

const CLAVE = 'wolertapp_usuarios';
const ejemplos = [
  { nombre: 'Sofia Barliza Gutierrez', username: 'Sofia123', cedula: '4444555666', correo: 'sofia@gmail.com', telefono: '5555777444', rol: 'ciudadano', estado: 'activo', color: '#1f5fa8' },
  { nombre: 'Yamil David Bustillo Contreras', username: 'Yamil123', cedula: '1055200333', correo: 'yamil@gmail.com', telefono: '3157859745', rol: 'ciudadano', estado: 'activo', color: '#1f5fa8' },
  { nombre: 'Laura Sofia Daza Leon', username: 'lauf', cedula: '444', correo: 'lau@gmail.com', telefono: '555', rol: 'ciudadano', estado: 'activo', color: '#c81e2c' },
  { nombre: 'Margarita Daza Jimenez', username: 'Margarita123', cedula: '8888999777', correo: 'margarita@gmail.com', telefono: '4552214463', rol: 'ciudadano', estado: 'activo', color: '#1f5fa8' },
  { nombre: 'Hernando Luis Garcia', username: 'hernan01', cedula: '55112236', correo: 'hernan01@gmail.com', telefono: '4445558552', rol: 'policia', estado: 'activo', color: '#1f9d5b' },
  { nombre: 'Luis Garcia Daza', username: 'luisgd', cedula: '9988776655', correo: 'luisgd@gmail.com', telefono: '3011112233', rol: 'admin', estado: 'activo', color: '#7c4fd1' },
];

function cargar() {
  try {
    const d = localStorage.getItem(CLAVE);
    if (d) return JSON.parse(d);
  } catch (e) {}
  localStorage.setItem(CLAVE, JSON.stringify(ejemplos));
  return [...ejemplos];
}

const nombreRol = { admin: 'Administrador', policia: 'Policía', ciudadano: 'Ciudadano' };
const badgeRol = { admin: 'badge-blue-dash', policia: 'badge-gray-dash', ciudadano: 'badge-green-dash' };
const claseEstado = { activo: 'status-active-dash', inactivo: 'status-inactive-dash', suspendido: 'status-inactive-dash' };
const nombreEstado = { activo: 'Activo', inactivo: 'Inactivo', suspendido: 'Suspendido' };

function iniciales(nombre) {
  const p = nombre.trim().split(/\s+/);
  return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
}
function colorAleatorio() {
  const paleta = ['#1f5fa8', '#1f9d5b', '#7c4fd1', '#c81e2c', '#c9821c', '#0a2f5c'];
  return paleta[Math.floor(Math.random() * paleta.length)];
}

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState(() => cargar());
  const [buscar, setBuscar] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [modalForm, setModalForm] = useState(false);
  const [modalVer, setModalVer] = useState(null);
  const [editUsername, setEditUsername] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
    cedula: '', telefono: '', correo: '', username: '', password: '', rol: '',
  });

  const guardar = (lista) => localStorage.setItem(CLAVE, JSON.stringify(lista));

  const filtrados = useMemo(() => usuarios.filter((u) => {
    const texto = buscar.trim().toLowerCase();
    const coincideTexto = !texto || u.nombre.toLowerCase().includes(texto) || u.username.toLowerCase().includes(texto) || u.cedula.toLowerCase().includes(texto);
    const coincideEstado = !filtroEstado || u.estado === filtroEstado;
    const coincideRol = !filtroRol || u.rol === filtroRol;
    return coincideTexto && coincideEstado && coincideRol;
  }), [usuarios, buscar, filtroEstado, filtroRol]);

  const resetForm = () => {
    setEditUsername(null);
    setError('');
    setForm({ primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '', cedula: '', telefono: '', correo: '', username: '', password: '', rol: '' });
  };

  const abrirNuevo = () => { resetForm(); setModalForm(true); };
  const abrirEditar = (username) => {
    const u = usuarios.find((x) => x.username === username);
    if (!u) return;
    setEditUsername(username);
    const partes = u.nombre.split(' ');
    setForm({
      primerNombre: partes[0] || '',
      segundoNombre: partes.length === 4 ? partes[1] : '',
      primerApellido: partes.length === 4 ? partes[2] : (partes[1] || ''),
      segundoApellido: partes.length === 4 ? partes[3] : (partes[2] || ''),
      cedula: u.cedula, telefono: u.telefono || '', correo: u.correo || '',
      username: u.username, password: u.password || '', rol: u.rol,
    });
    setError('');
    setModalForm(true);
  };
  const abrirVer = (username) => {
    const u = usuarios.find((x) => x.username === username);
    if (u) setModalVer(u);
  };
  const eliminar = (username) => {
    if (!confirm('¿Seguro que deseas eliminar este usuario? Esta acción no se puede deshacer.')) return;
    const nueva = usuarios.filter((u) => u.username !== username);
    setUsuarios(nueva); guardar(nueva);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.rol) { setError('Debes seleccionar un rol.'); return; }
    const existe = usuarios.some((u) => u.username !== editUsername && (u.username.toLowerCase() === form.username.toLowerCase() || u.cedula === form.cedula));
    if (existe) { setError('Ya existe un usuario con ese username o cédula.'); return; }
    setError('');
    const nombreCompleto = [form.primerNombre, form.segundoNombre, form.primerApellido, form.segundoApellido].filter(Boolean).join(' ');
    let nueva = [...usuarios];
    if (editUsername) {
      const idx = nueva.findIndex((u) => u.username === editUsername);
      if (idx >= 0) {
        nueva[idx] = { ...nueva[idx], nombre: nombreCompleto, username: form.username, password: form.password, cedula: form.cedula, correo: form.correo, telefono: form.telefono, rol: form.rol };
      }
    } else {
      nueva.push({ nombre: nombreCompleto, username: form.username, password: form.password, cedula: form.cedula, correo: form.correo, telefono: form.telefono, rol: form.rol, estado: 'activo', color: colorAleatorio() });
    }
    setUsuarios(nueva); guardar(nueva);
    setModalForm(false); resetForm();
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h1 className="hero-title-dash" style={{ color: 'var(--ink)', fontSize: '26px' }}>Gestión de Usuarios</h1>
          <p className="hero-text-dash" style={{ color: 'var(--muted)' }}>Administra los usuarios registrados en el sistema</p>
        </div>
        <button type="button" className="btn btn-cv-azul d-inline-flex align-items-center gap-2 px-3 py-2" style={{ borderRadius: '12px', fontSize: '13.5px', fontWeight: '700' }} onClick={abrirNuevo}>
          <i className="bi bi-plus-lg" /> Nuevo usuario
        </button>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <div className="kpi-dash kpi-blue-dash">
            <i className="bi bi-people kpi-icon-dash" />
            <div className="kpi-num-dash">{usuarios.length}</div>
            <div className="kpi-label-dash">Total registrados</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Total en el sistema</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="kpi-dash kpi-green-dash">
            <i className="bi bi-check-circle kpi-icon-dash" />
            <div className="kpi-num-dash">{usuarios.filter((u) => u.estado === 'activo').length}</div>
            <div className="kpi-label-dash">Usuarios activos</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>+18 este mes</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="kpi-dash kpi-red-dash">
            <i className="bi bi-exclamation-triangle kpi-icon-dash" />
            <div className="kpi-num-dash">{usuarios.filter((u) => u.estado !== 'activo').length}</div>
            <div className="kpi-label-dash">Inactivos / Suspendidos</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Requieren revisión</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="kpi-dash kpi-purple-dash">
            <i className="bi bi-shield-lock kpi-icon-dash" />
            <div className="kpi-num-dash">4</div>
            <div className="kpi-label-dash">Roles configurados</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Admin · Policía · Usuario</div>
          </div>
        </div>
      </div>

      <div className="card-panel-dash p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-lg-5">
            <div className="search-dash d-flex align-items-center bg-white">
              <span className="input-group-text bg-white border-0"><i className="bi bi-search" /></span>
              <input type="text" className="form-control border-0" placeholder="Buscar por nombre, cédula o username..." value={buscar} onChange={(e) => setBuscar(e.target.value)} />
            </div>
          </div>
          <div className="col-lg-2 col-6">
            <select className="filtro-select-dash form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Estado: Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>
          <div className="col-lg-2 col-6">
            <select className="filtro-select-dash form-select" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
              <option value="">Rol: Todos</option>
              <option value="admin">Administrador</option>
              <option value="policia">Policía</option>
              <option value="ciudadano">Ciudadano</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-panel-dash p-3">
        <div className="table-responsive">
          <table className="tabla-usuarios-dash">
            <thead>
              <tr>
                <th>Usuario</th><th>Identificación</th><th>Correo electrónico</th><th>Teléfono</th><th>Rol</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => (
                <tr key={u.username}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar-usuario-dash" style={{ backgroundColor: u.color }}>{iniciales(u.nombre)}</div>
                      <div>
                        <div className="usuario-nombre-dash">{u.nombre.toUpperCase()}</div>
                        <div className="usuario-arroba-dash">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.cedula}</td>
                  <td>{u.correo || '—'}</td>
                  <td>{u.telefono || '—'}</td>
                  <td><span className={`badge-dash ${badgeRol[u.rol]}`}>{nombreRol[u.rol].toUpperCase()}</span></td>
                  <td>
                    <span className={`status-dot-dash ${claseEstado[u.estado]}`}>
                      <span className="dot" />{nombreEstado[u.estado].toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button className="action-btn-dash action-view-dash" title="Ver detalle" onClick={() => abrirVer(u.username)}><i className="bi bi-eye" /></button>
                      <button className="action-btn-dash action-edit-dash" title="Editar" onClick={() => abrirEditar(u.username)}><i className="bi bi-pencil" /></button>
                      <button className="action-btn-dash action-delete-dash" title="Eliminar" onClick={() => eliminar(u.username)}><i className="bi bi-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal form */}
      {modalForm && (
        <>
          <div className="modal-backdrop" onClick={() => { setModalForm(false); resetForm(); }} />
          <div className="modal" role="dialog" style={{ display: 'block' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content modal-dash">
                <form onSubmit={submit}>
                  <div className="modal-header-dash d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="modal-title-dash">{editUsername ? 'Editar usuario' : 'Nuevo usuario'}</h5>
                      <div className="modal-subtitle-dash">Registra un usuario y asígnale un rol</div>
                    </div>
                    <button type="button" className="btn-close-dash" onClick={() => { setModalForm(false); resetForm(); }}><i className="bi bi-x-lg" /></button>
                  </div>
                  <div className="modal-body">
                    <div className="seccion-titulo-dash">DATOS PERSONALES</div>
                    <div className="row g-2 mb-2">
                      <div className="col-6"><input type="text" className="form-control input-dash" required placeholder="Primer Nombre *" value={form.primerNombre} onChange={(e) => setForm({ ...form, primerNombre: e.target.value })} /></div>
                      <div className="col-6"><input type="text" className="form-control input-dash" placeholder="Segundo Nombre" value={form.segundoNombre} onChange={(e) => setForm({ ...form, segundoNombre: e.target.value })} /></div>
                    </div>
                    <div className="row g-2 mb-2">
                      <div className="col-6"><input type="text" className="form-control input-dash" required placeholder="Primer Apellido *" value={form.primerApellido} onChange={(e) => setForm({ ...form, primerApellido: e.target.value })} /></div>
                      <div className="col-6"><input type="text" className="form-control input-dash" placeholder="Segundo Apellido" value={form.segundoApellido} onChange={(e) => setForm({ ...form, segundoApellido: e.target.value })} /></div>
                    </div>
                    <div className="row g-2 mb-2">
                      <div className="col-6"><input type="text" className="form-control input-dash" required placeholder="Cédula *" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} /></div>
                      <div className="col-6"><input type="tel" className="form-control input-dash" placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
                    </div>
                    <div className="mb-3"><input type="email" className="form-control input-dash" placeholder="Correo" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} /></div>
                    <div className="seccion-titulo-dash">CUENTA</div>
                    <div className="mb-2"><input type="text" className="form-control input-dash" required placeholder="Username *" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
                    <div className="mb-3"><input type="password" className="form-control input-dash" required={!editUsername} placeholder="Contraseña *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                    <div className="seccion-titulo-dash">ROL</div>
                    <div className="mb-1">
                      <select className="form-select input-dash" required value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                        <option value="" disabled>Seleccionar Rol *</option>
                        <option value="ciudadano">Ciudadano</option>
                        <option value="policia">Policía</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    {error && <div className="text-danger small mt-2">{error}</div>}
                  </div>
                  <div className="modal-footer-dash">
                    <button type="button" className="btn btn-cancelar-dash" onClick={() => { setModalForm(false); resetForm(); }}>Cancelar</button>
                    <button type="submit" className="btn btn-cv-azul px-4" style={{ borderRadius: '12px', fontWeight: '700' }}>{editUsername ? 'Guardar cambios' : 'Crear Usuario'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal ver */}
      {modalVer && (
        <>
          <div className="modal-backdrop" onClick={() => setModalVer(null)} />
          <div className="modal" role="dialog" style={{ display: 'block' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content modal-dash">
                <div className="modal-header-dash d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="modal-title-dash">{modalVer.nombre}</h5>
                    <div className="modal-subtitle-dash">@{modalVer.username}</div>
                  </div>
                  <button type="button" className="btn-close-dash" onClick={() => setModalVer(null)}><i className="bi bi-x-lg" /></button>
                </div>
                <div className="modal-body">
                  <div className="fila-detalle-dash"><span className="etiqueta-detalle-dash">Cédula</span><span className="valor-detalle-dash">{modalVer.cedula}</span></div>
                  <div className="fila-detalle-dash"><span className="etiqueta-detalle-dash">Correo</span><span className="valor-detalle-dash">{modalVer.correo || '—'}</span></div>
                  <div className="fila-detalle-dash"><span className="etiqueta-detalle-dash">Teléfono</span><span className="valor-detalle-dash">{modalVer.telefono || '—'}</span></div>
                  <div className="fila-detalle-dash"><span className="etiqueta-detalle-dash">Rol</span><span className="valor-detalle-dash">{nombreRol[modalVer.rol]}</span></div>
                  <div className="fila-detalle-dash" style={{ borderBottom: 'none' }}><span className="etiqueta-detalle-dash">Estado</span><span className="valor-detalle-dash">{nombreEstado[modalVer.estado]}</span></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}