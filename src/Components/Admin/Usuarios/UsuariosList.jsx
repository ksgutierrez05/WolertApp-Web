import { useState, useMemo, useEffect } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/admin/usuarios.css';
import '../../../css/admin/AdminLayout.css';
import {
  listaUsuarios,
  obtenerUsuarioPorId,
  crearUsuarioPersonal,
  editarUsuario,
  eliminarUsuario,
  listaRoles,
} from '../../../Service/UsuariosAPI.js';

// Las llaves son los nombres de rol EXACTOS que devuelve el backend (Rol.Nombre)
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

const badgeRol = {
  Admin: 'badge-blue-dash',
  AdminPolicia: 'badge-blue-dash',
  DirectorTransito: 'badge-purple-dash',
  Policia: 'badge-gray-dash',
  CentralPolicia: 'badge-gray-dash',
  AgenteTransito: 'badge-teal-dash',
  CentralTransito: 'badge-teal-dash',
  Ciudadano: 'badge-gray-dash',
};

const claseEstado = {
  activo: 'status-active-dash', inactivo: 'status-inactive-dash', suspendido: 'status-suspended-dash',
};

const nombreEstado = { activo: 'Activo', inactivo: 'Inactivo', suspendido: 'Suspendido' };

// Mismo mapa que "Permitidos" en UsuariosController.cs (quién puede crear a quién).
// El backend es quien manda: esto solo evita mostrar opciones que darían 403.
const PERMITIDOS = {
  Admin: ['Admin', 'AdminPolicia', 'DirectorTransito'],
  AdminPolicia: ['Policia', 'CentralPolicia'],
  DirectorTransito: ['AgenteTransito', 'CentralTransito'],
};

const PALETA = ['#1f5fa8', '#1f9d5b', '#7c4fd1', '#c81e2c', '#c9821c', '#0a2f5c'];
const colorPorId = (id) => PALETA[(Number(id) || 0) % PALETA.length];

const FORM_VACIO = {
  primerNombre: '', segundoNombre: '', primerApellido: '', segundoApellido: '',
  cedula: '', telefono: '', correo: '', username: '', password: '', rolId: '',
};

// Los inputs de "datos personales" se generan desde este arreglo
const CAMPOS_PERSONALES = [
  { name: 'primerNombre', label: 'Primer Nombre *', required: true },
  { name: 'segundoNombre', label: 'Segundo Nombre' },
  { name: 'primerApellido', label: 'Primer Apellido *', required: true },
  { name: 'segundoApellido', label: 'Segundo Apellido' },
  { name: 'cedula', label: 'Cédula *', required: true },
  { name: 'telefono', label: 'Teléfono', type: 'tel' },
];

function iniciales(nombre = '') {
  const p = nombre.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return '?';
  return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
}

export default function UsuariosList() {
  // Datos de la sesión (los guarda login() en UsuariosAPI.js)
  const rolActual = localStorage.getItem('rol');
  const idActual = localStorage.getItem('idUsuario');

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorLista, setErrorLista] = useState('');

  const [buscar, setBuscar] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroRol, setFiltroRol] = useState('');

  const [modalForm, setModalForm] = useState(false);
  const [modalVer, setModalVer] = useState(null);
  const [editId, setEditId] = useState(null);
  const [detalleEdit, setDetalleEdit] = useState(null); // datos completos del usuario que se edita
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);

  // Un solo manejador para todos los inputs: cada uno lleva name="campo"
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setErrorLista('');
      const datosUsuarios = await listaUsuarios();
      setUsuarios(datosUsuarios);
    } catch (error) {
      setErrorLista(error.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
    listaRoles().then(setRoles).catch(() => setRoles([]));
  }, []);

  // Solo los roles que el rol actual puede crear
  const rolesDisponibles = useMemo(
    () => roles.filter((r) => (PERMITIDOS[rolActual] || []).includes(r.nombre)),
    [roles, rolActual]
  );

  const puedeCrear = !!PERMITIDOS[rolActual];
  // Admin edita a cualquiera; los demás solo a sí mismos (igual que PutUsuario)
  const puedeEditar = (u) => rolActual === 'Admin' || String(u.idUsuario) === idActual;
  // Solo Admin desactiva, y no su propia cuenta
  const puedeDesactivar = (u) =>
    rolActual === 'Admin' && String(u.idUsuario) !== idActual && (u.estado || '').toLowerCase() === 'activo';

  const desactivar = async (id) => {
    if (!window.confirm('¿Seguro que quieres desactivar este usuario?')) return;
    try {
      await eliminarUsuario(id); // el backend lo marca como "inactivo"
      await cargarUsuarios();
    } catch (error) {
      alert(error.message);
    }
  };

  const filtrados = useMemo(() => usuarios.filter((u) => {
    const texto = buscar.trim().toLowerCase();
    const coincideTexto = !texto
      || (u.nombreCompleto || '').toLowerCase().includes(texto)
      || (u.username || '').toLowerCase().includes(texto)
      || (u.cedula || '').toLowerCase().includes(texto);
    const coincideEstado = !filtroEstado || (u.estado || '').toLowerCase() === filtroEstado;
    const coincideRol = !filtroRol || u.rolNombre === filtroRol;
    return coincideTexto && coincideEstado && coincideRol;
  }), [usuarios, buscar, filtroEstado, filtroRol]);

  const resetForm = () => {
    setEditId(null);
    setDetalleEdit(null);
    setError('');
    setForm(FORM_VACIO);
  };

  const cerrarForm = () => { setModalForm(false); resetForm(); };

  const abrirNuevo = () => { resetForm(); setModalForm(true); };

  const abrirEditar = async (id) => {
    try {
      const u = await obtenerUsuarioPorId(id);
      setEditId(id);
      setDetalleEdit(u);
      setForm({
        primerNombre: u.primerNombre || '',
        segundoNombre: u.segundoNombre || '',
        primerApellido: u.primerApellido || '',
        segundoApellido: u.segundoApellido || '',
        cedula: u.cedula || '',
        telefono: u.telefono || '',
        correo: u.correo || '',
        username: u.username || '',
        password: '',
        rolId: '',
      });
      setError('');
      setModalForm(true);
    } catch (error) {
      alert(error.message);
    }
  };

  const abrirVer = async (id) => {
    try {
      setModalVer(await obtenerUsuarioPorId(id));
    } catch (error) {
      alert(error.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!editId && !form.rolId) { setError('Debes seleccionar un rol.'); return; }

    const base = {
      cedula: form.cedula.trim(),
      primerNombre: form.primerNombre.trim(),
      segundoNombre: form.segundoNombre.trim() || null,
      primerApellido: form.primerApellido.trim(),
      segundoApellido: form.segundoApellido.trim() || null,
      correo: form.correo.trim(),
      telefono: form.telefono.trim() || null,
      username: form.username.trim(),
    };

    try {
      setGuardando(true);
      if (editId) {
        // PUT reemplaza TODOS los campos: reenviamos dirección y barrio tal como
        // vinieron del GET para no borrarlos.
        const { calle, carrera, etapa, manzana, casa, barrioId } = detalleEdit;
        await editarUsuario(editId, { ...base, calle, carrera, etapa, manzana, casa, barrioId });
      } else {
        await crearUsuarioPersonal({ ...base, password: form.password, rolId: Number(form.rolId) });
      }
      cerrarForm();
      await cargarUsuarios();
    } catch (err) {
      setError(err.message); // mensaje del backend: 409 duplicado, 403 jerarquía, etc.
    } finally {
      setGuardando(false);
    }
  };

  const total = usuarios.length;
  const activos = usuarios.filter((u) => (u.estado || '').toLowerCase() === 'activo').length;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h1 className="hero-title-dash" style={{ color: '#64748b', fontSize: '26px' }}>Gestión de Usuarios</h1>
          <p className="hero-text-dash" style={{ color: '#94a3b8' }}>Administra los usuarios registrados en el sistema</p>
        </div>
        {puedeCrear && (
          <button type="button" className="btn btn-cv-azul d-inline-flex align-items-center gap-2 px-3 py-2" style={{ borderRadius: '12px', fontSize: '13.5px', fontWeight: '700' }} onClick={abrirNuevo}>
            <i className="bi bi-plus-lg" /> Nuevo usuario
          </button>
        )}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <div className="kpi-dash kpi-blue-dash">
            <i className="bi bi-people kpi-icon-dash" />
            <div className="kpi-num-dash">{total}</div>
            <div className="kpi-label-dash">Total registrados</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Total en el sistema</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="kpi-dash kpi-green-dash">
            <i className="bi bi-check-circle kpi-icon-dash" />
            <div className="kpi-num-dash">{activos}</div>
            <div className="kpi-label-dash">Usuarios activos</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Con acceso al sistema</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="kpi-dash kpi-red-dash">
            <i className="bi bi-exclamation-triangle kpi-icon-dash" />
            <div className="kpi-num-dash">{total - activos}</div>
            <div className="kpi-label-dash">Inactivos / Suspendidos</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Requieren revisión</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="kpi-dash kpi-purple-dash">
            <i className="bi bi-shield-lock kpi-icon-dash" />
            <div className="kpi-num-dash">{roles.length || Object.keys(nombreRol).length}</div>
            <div className="kpi-label-dash">Roles configurados</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Según la jerarquía del sistema</div>
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
              {Object.entries(nombreRol).map(([clave, etiqueta]) => (
                <option key={clave} value={clave}>{etiqueta}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card-panel-dash p-3">
        {errorLista && <div className="text-danger small mb-2">{errorLista}</div>}
        <div className="table-responsive">
          <table className="tabla-usuarios-dash">
            <thead>
              <tr>
                <th>Usuario</th><th>Correo electrónico</th><th>Rol</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr><td colSpan={5}>Cargando usuarios...</td></tr>
              )}
              {!cargando && !errorLista && filtrados.length === 0 && (
                <tr><td colSpan={5}>No hay usuarios que mostrar.</td></tr>
              )}
              {!cargando && filtrados.map((u) => (
                <tr key={u.idUsuario}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar-usuario-dash" style={{ backgroundColor: colorPorId(u.idUsuario) }}>{iniciales(u.nombreCompleto)}</div>
                      <div>
                        <div className="usuario-nombre-dash">{(u.nombreCompleto || '').toUpperCase()}</div>
                        <div className="usuario-arroba-dash">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.correo || '—'}</td>
                  <td><span className={`badge-dash ${badgeRol[u.rolNombre] || 'badge-gray-dash'}`}>{(nombreRol[u.rolNombre] || u.rolNombre || 'Desconocido').toUpperCase()}</span></td>
                  <td>
                    <span className={`status-dot-dash ${claseEstado[u.estado?.toLowerCase()] || 'status-inactive-dash'}`}>
                      <span className="dot" />{(nombreEstado[u.estado?.toLowerCase()] || u.estado || '—').toUpperCase()}
                    </span>
                  </td>
                    <td>
                    <div className="d-flex gap-2">
                      <button className="action-btn-dash action-view-dash" title="Ver detalle" onClick={() => abrirVer(u.idUsuario)}><i className="bi bi-eye" /></button>
                      <button className="action-btn-dash action-edit-dash" title="Editar" onClick={() => abrirEditar(u.idUsuario)}><i className="bi bi-pencil" /></button>
                      <button className="action-btn-dash action-delete-dash" title="Desactivar" onClick={() => desactivar(u.idUsuario)}><i className="bi bi-trash" /></button>
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
          <div className="modal-backdrop" onClick={cerrarForm} />
          <div className="modal" role="dialog" style={{ display: 'block' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content modal-dash">
                <form onSubmit={submit}>
                  <div className="modal-header-dash d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="modal-title-dash">{editId ? 'Editar usuario' : 'Nuevo usuario'}</h5>
                      <div className="modal-subtitle-dash">{editId ? 'Actualiza los datos del usuario' : 'Registra un usuario y asígnale un rol'}</div>
                    </div>
                    <button type="button" className="btn-close-dash" onClick={cerrarForm}><i className="bi bi-x-lg" /></button>
                  </div>
                  <div className="modal-body">
                    <div className="seccion-titulo-dash">DATOS PERSONALES</div>
                    <div className="row g-2 mb-2">
                      {CAMPOS_PERSONALES.map((c) => (
                        <div className="col-6" key={c.name}>
                          <input type={c.type || 'text'} className="form-control input-dash" name={c.name}
                            required={c.required} placeholder={c.label} value={form[c.name]} onChange={handleChange} />
                        </div>
                      ))}
                    </div>
                    <div className="mb-3">
                      <input type="email" className="form-control input-dash" name="correo" required placeholder="Correo *" value={form.correo} onChange={handleChange} />
                    </div>

                    <div className="seccion-titulo-dash">CUENTA</div>
                    <div className="mb-2">
                      <input type="text" className="form-control input-dash" name="username" required placeholder="Username *" value={form.username} onChange={handleChange} />
                    </div>
                    {!editId && (
                      <div className="mb-3">
                        <input type="password" className="form-control input-dash" name="password" required placeholder="Contraseña *" value={form.password} onChange={handleChange} />
                      </div>
                    )}

                    <div className="seccion-titulo-dash">ROL</div>
                    {editId ? (
                      <div className="small text-muted mb-1">
                        Rol actual: {nombreRol[detalleEdit?.rolNombre] || detalleEdit?.rolNombre}. El rol y la contraseña no se cambian desde esta pantalla.
                      </div>
                    ) : (
                      <div className="mb-1">
                        <select className="form-select input-dash" name="rolId" required value={form.rolId} onChange={handleChange}>
                          <option value="" disabled>Seleccionar Rol *</option>
                          {rolesDisponibles.map((r) => (
                            <option key={r.idRol} value={r.idRol}>{nombreRol[r.nombre] || r.nombre}</option>
                          ))}
                        </select>
                        {rolesDisponibles.length === 0 && (
                          <div className="small text-muted mt-1">No hay roles disponibles para tu perfil.</div>
                        )}
                      </div>
                    )}
                    {error && <div className="text-danger small mt-2">{error}</div>}
                  </div>
                  <div className="modal-footer-dash">
                    <button type="button" className="btn btn-cancelar-dash" onClick={cerrarForm}>Cancelar</button>
                    <button type="submit" disabled={guardando} className="btn btn-cv-azul px-4" style={{ borderRadius: '12px', fontWeight: '700' }}>
                      {guardando ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear Usuario'}
                    </button>
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
                    <h5 className="modal-title-dash">
                      {[modalVer.primerNombre, modalVer.segundoNombre, modalVer.primerApellido, modalVer.segundoApellido].filter(Boolean).join(' ')}
                    </h5>
                    <div className="modal-subtitle-dash">@{modalVer.username}</div>
                  </div>
                  <button type="button" className="btn-close-dash" onClick={() => setModalVer(null)}><i className="bi bi-x-lg" /></button>
                </div>
                <div className="modal-body">
                  <div className="fila-detalle-dash"><span className="etiqueta-detalle-dash">Cédula</span><span className="valor-detalle-dash">{modalVer.cedula}</span></div>
                  <div className="fila-detalle-dash"><span className="etiqueta-detalle-dash">Correo</span><span className="valor-detalle-dash">{modalVer.correo || '—'}</span></div>
                  <div className="fila-detalle-dash"><span className="etiqueta-detalle-dash">Teléfono</span><span className="valor-detalle-dash">{modalVer.telefono || '—'}</span></div>
                  <div className="fila-detalle-dash"><span className="etiqueta-detalle-dash">Barrio</span><span className="valor-detalle-dash">{modalVer.barrioNombre || '—'}</span></div>
                  <div className="fila-detalle-dash"><span className="etiqueta-detalle-dash">Rol</span><span className="valor-detalle-dash">{nombreRol[modalVer.rolNombre] || modalVer.rolNombre || 'Desconocido'}</span></div>
                  <div className="fila-detalle-dash" style={{ borderBottom: 'none' }}><span className="etiqueta-detalle-dash">Estado</span><span className="valor-detalle-dash">{nombreEstado[(modalVer.estado || '').toLowerCase()] || modalVer.estado}</span></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}