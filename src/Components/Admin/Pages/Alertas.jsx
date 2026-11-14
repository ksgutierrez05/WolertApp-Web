import { useEffect, useMemo, useState } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/admin/usuarios.css'; // estilos del modal y los botones de acción
import '../../../css/admin/alertas.css';
import {
  listaAlertas,
  crearAlerta,
  editarAlerta,
  eliminarAlerta,
} from '../../../Service/AlertasAPI.js';

const PRIORIDADES = [
  { valor: 'alta', etiqueta: 'Alta' },
  { valor: 'media', etiqueta: 'Media' },
  { valor: 'baja', etiqueta: 'Baja' },
];

// Se reutilizan las clases de badge que ya existen en alertas.css
const prioridadBadgeClase = {
  alta: 'alerta-badge-pendiente-dash',
  media: 'alerta-badge-asignada-dash',
  baja: 'alerta-badge-resuelta-dash',
};

const prioridadEtiqueta = { alta: 'Alta', media: 'Media', baja: 'Baja' };

const FORM_VACIO = { nombre: '', prioridad: 'media' };

// Los errores de AlertasAPI.js llegan como "Error al crear la alerta: <detalle del servidor>".
// Un 401/403 llega con el cuerpo vacío, así que el mensaje termina en ":" y se le agrega una pista.
const mensajeAmigable = (err) => {
  const msg = (err?.message || '').trim();
  if (msg.endsWith(':')) {
    return `${msg} verifica que tu sesión siga activa y que tengas rol Admin.`;
  }
  return msg;
};

export default function Alertas() {
  const rolActual = localStorage.getItem('rol');
  const esAdmin = rolActual === 'Admin'; // solo Admin crea, edita y elimina (igual que el backend)

  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorLista, setErrorLista] = useState('');

  const [buscar, setBuscar] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  const [modalForm, setModalForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarTipos = async () => {
    try {
      setCargando(true);
      setErrorLista('');
      setTipos(await listaAlertas());
    } catch (err) {
      setErrorLista(mensajeAmigable(err));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTipos();
  }, []);

  const filtrados = useMemo(() => tipos.filter((t) => {
    const texto = buscar.trim().toLowerCase();
    const coincideTexto = !texto || (t.nombre || '').toLowerCase().includes(texto);
    const coincidePrioridad = !filtroPrioridad || (t.prioridad || '').toLowerCase() === filtroPrioridad;
    return coincideTexto && coincidePrioridad;
  }), [tipos, buscar, filtroPrioridad]);

  const contar = (p) => tipos.filter((t) => (t.prioridad || '').toLowerCase() === p).length;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const cerrarForm = () => {
    setModalForm(false);
    setEditId(null);
    setForm(FORM_VACIO);
    setError('');
  };

  const abrirNuevo = () => {
    setEditId(null);
    setForm(FORM_VACIO);
    setError('');
    setModalForm(true);
  };

  const abrirEditar = (t) => {
    setEditId(t.idTipoAlerta);
    setForm({ nombre: t.nombre || '', prioridad: (t.prioridad || 'media').toLowerCase() });
    setError('');
    setModalForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    const datos = { nombre: form.nombre.trim(), prioridad: form.prioridad };
    if (!datos.nombre) {
      setError('El nombre es obligatorio.');
      return;
    }

    try {
      setGuardando(true);
      if (editId) {
        await editarAlerta(editId, datos);
      } else {
        await crearAlerta(datos);
      }
      cerrarForm();
      await cargarTipos();
    } catch (err) {
      setError(mensajeAmigable(err)); // 409 nombre repetido, 401/403 sesión o permisos, etc.
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (t) => {
    if (!window.confirm(`¿Seguro que quieres eliminar el tipo de alerta "${t.nombre}"?`)) return;
    try {
      await eliminarAlerta(t.idTipoAlerta);
      await cargarTipos();
    } catch (err) {
      alert(mensajeAmigable(err));
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h1 className="hero-title-dash" style={{ color: 'var(--ink)', fontSize: '26px' }}>Gestión de Alertas</h1>
          <p className="hero-text-dash" style={{ color: 'var(--muted)' }}>Catálogo de alertas que la comunidad puede reportar</p>
        </div>
        {esAdmin && (
          <button
            type="button"
            className="btn btn-cv-azul d-inline-flex align-items-center gap-2 px-3 py-2"
            style={{ borderRadius: '12px', fontSize: '13.5px', fontWeight: '700' }}
            onClick={abrirNuevo}
          >
            <i className="bi bi-plus-lg" /> Nuevo tipo
          </button>
        )}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="kpi-dash kpi-red-dash">
            <i className="bi bi-exclamation-octagon kpi-icon-dash" />
            <div className="kpi-num-dash">{cargando ? '...' : contar('alta')}</div>
            <div className="kpi-label-dash">Prioridad alta</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Atención inmediata</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-dash kpi-amber-dash">
            <i className="bi bi-exclamation-triangle kpi-icon-dash" />
            <div className="kpi-num-dash">{cargando ? '...' : contar('media')}</div>
            <div className="kpi-label-dash">Prioridad media</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Atención programada</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-dash kpi-green-dash">
            <i className="bi bi-info-circle kpi-icon-dash" />
            <div className="kpi-num-dash">{cargando ? '...' : contar('baja')}</div>
            <div className="kpi-label-dash">Prioridad baja</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Seguimiento</div>
          </div>
        </div>
      </div>

      <div className="card-panel-dash p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-lg-8">
            <div className="search-dash d-flex align-items-center bg-white">
              <span className="input-group-text bg-white border-0"><i className="bi bi-search" /></span>
              <input
                type="text"
                id="buscador-alertas"
                className="form-control border-0"
                placeholder="Buscar por nombre del tipo de alerta..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
              />
            </div>
          </div>
          <div className="col-lg-4">
            <select
              id="filtro-prioridad-alerta"
              className="filtro-select-dash form-select"
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
            >
              <option value="">Prioridad: Todas</option>
              {PRIORIDADES.map((p) => (
                <option key={p.valor} value={p.valor}>{p.etiqueta}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card-panel-dash">
        {errorLista && <div className="text-danger small p-3">{errorLista}</div>}
        <div className="table-responsive">
          <table className="tabla-alertas-dash" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th>Tipo de alerta</th>
                <th>Prioridad</th>
                {esAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr><td colSpan={esAdmin ? 3 : 2}>Cargando tipos de alerta...</td></tr>
              )}

              {!cargando && !errorLista && filtrados.length === 0 && (
                <tr>
                  <td colSpan={esAdmin ? 3 : 2}>
                    <div className="alertas-vacio-dash">
                      <i className="bi bi-inboxes" />
                      <p>
                        {tipos.length === 0
                          ? 'Aún no hay tipos de alerta registrados.'
                          : 'No se encontraron tipos de alerta con esos filtros.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!cargando && filtrados.map((t) => {
                const prioridad = (t.prioridad || '').toLowerCase();
                const esAlta = prioridad === 'alta';
                return (
                  <tr key={t.idTipoAlerta}>
                    <td>
                      <div className="alerta-tipo-celda-dash">
                        <div className={`alerta-tipo-icono-dash ${esAlta ? 'alerta-tipo-icono-grave-dash' : 'alerta-tipo-icono-moderado-dash'}`}>
                          <i className={`bi ${esAlta ? 'bi-exclamation-octagon-fill' : 'bi-exclamation-triangle-fill'}`} />
                        </div>
                        <span className="alerta-tipo-texto-dash">{(t.nombre || '').toUpperCase()}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`alerta-badge-dash ${prioridadBadgeClase[prioridad] || 'alerta-badge-asignada-dash'}`}>
                        <span className="dot" />{prioridadEtiqueta[prioridad] || t.prioridad || '—'}
                      </span>
                    </td>
                    {esAdmin && (
                      <td>
                        <div className="d-flex gap-2">
                          <button className="action-btn-dash action-edit-dash" title="Editar" onClick={() => abrirEditar(t)}>
                            <i className="bi bi-pencil" />
                          </button>
                          <button className="action-btn-dash action-delete-dash" title="Eliminar" onClick={() => eliminar(t)}>
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear / editar */}
      {modalForm && (
        <>
          <div className="modal-backdrop" onClick={cerrarForm} />
          <div className="modal" role="dialog" style={{ display: 'block' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content modal-dash">
                <form onSubmit={submit}>
                  <div className="modal-header-dash d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="modal-title-dash">{editId ? 'Editar tipo de alerta' : 'Nuevo tipo de alerta'}</h5>
                      <div className="modal-subtitle-dash">
                        {editId ? 'Actualiza el nombre o la prioridad' : 'Define el nombre y la prioridad de atención'}
                      </div>
                    </div>
                    <button type="button" className="btn-close-dash" onClick={cerrarForm}><i className="bi bi-x-lg" /></button>
                  </div>

                  <div className="modal-body">
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control input-dash"
                        name="nombre"
                        required
                        maxLength={50}
                        placeholder="Nombre * (ej. Robo, Incendio)"
                        value={form.nombre}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-1">
                      <select className="form-select input-dash" name="prioridad" required value={form.prioridad} onChange={handleChange}>
                        {PRIORIDADES.map((p) => (
                          <option key={p.valor} value={p.valor}>Prioridad {p.etiqueta.toLowerCase()}</option>
                        ))}
                      </select>
                    </div>
                    {error && <div className="text-danger small mt-2">{error}</div>}
                  </div>

                  <div className="modal-footer-dash">
                    <button type="button" className="btn btn-cancelar-dash" onClick={cerrarForm}>Cancelar</button>
                    <button type="submit" disabled={guardando} className="btn btn-cv-azul px-4" style={{ borderRadius: '12px', fontWeight: '700' }}>
                      {guardando ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear tipo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}