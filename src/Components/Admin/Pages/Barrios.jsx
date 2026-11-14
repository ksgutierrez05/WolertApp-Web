import { useState, useEffect } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/admin/barrios.css';
import { Link } from 'react-router-dom';
import { ListarBarrios, CrearBarrio, EditarBarrio, EliminarBarrio } from '../../../Service/BarriosAPI';
import { ListarComunas } from '../../../Service/ComunasAPI';

const COLORES = ['#1f3a8a', '#5c4033', '#374151', '#166534', '#1d4ed8', '#14532d'];

function colorPorId(id) {
  return COLORES[id % COLORES.length];
}

export default function Barrios() {
  const [barrios, setBarrios] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [buscar, setBuscar] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const [nombre, setNombre] = useState('');
  const [comuna, setComuna] = useState('');

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError('');
      const datosBarrios = await ListarBarrios();
      const datosComunas = await ListarComunas();
      setBarrios(datosBarrios);
      setComunas(datosComunas);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const filtrados = barrios.filter((b) =>
    b.nombre.toLowerCase().includes(buscar.trim().toLowerCase())
  );

  const comunasConBarrio = new Set(barrios.map((b) => b.comunaId)).size;

  const esEdicion = idEnEdicion !== null;

  const abrirCrear = () => {
    setIdEnEdicion(null);
    setNombre('');
    setComuna('');
    setModalAbierto(true);
  };

  const abrirEditar = (id) => {
    const b = barrios.find((x) => x.idBarrio === id);
    if (!b) return;
    setIdEnEdicion(id);
    setNombre(b.nombre);
    setComuna(String(b.comunaId));
    setModalAbierto(true);
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este barrio?')) return;
    try {
      await EliminarBarrio(id);
      await cargarDatos();
    } catch (e) {
      alert(e.message);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setIdEnEdicion(null);
    setNombre('');
    setComuna('');
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      const cuerpo = { nombre, comunaId: Number(comuna) };
      if (esEdicion) {
        await EditarBarrio(idEnEdicion, cuerpo);
      } else {
        await CrearBarrio(cuerpo);
      }
      await cargarDatos();
      cerrarModal();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h1 className="hero-title-dash" style={{ color: 'var(--ink)', fontSize: '26px' }}>Gestión de Barrios</h1>
          <p className="hero-text-dash" style={{ color: 'var(--muted)' }}>Administra los barrios dentro de cada comuna</p>
        </div>
        <button type="button" className="btn btn-cv-azul d-inline-flex align-items-center gap-2 px-3 py-2" style={{ borderRadius: '12px', fontSize: '13.5px', fontWeight: '700' }} onClick={abrirCrear}>
          <i className="bi bi-plus-lg" /> Nuevo barrio
        </button>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="kpi-dash kpi-blue-dash">
            <i className="bi bi-house kpi-icon-dash" />
            <div className="kpi-num-dash" id="kpi-total-barrios">{barrios.length}</div>
            <div className="kpi-label-dash">Total barrios</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Registrados en el sistema</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-dash kpi-green-dash">
            <i className="bi bi-check-circle kpi-icon-dash" />
            <div className="kpi-num-dash" id="kpi-barrios-activos">{barrios.length}</div>
            <div className="kpi-label-dash">Barrios activos</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>En el sistema</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-dash kpi-amber-dash">
            <i className="bi bi-map kpi-icon-dash" />
            <div className="kpi-num-dash" id="kpi-comunas-cubiertas">{comunasConBarrio}</div>
            <div className="kpi-label-dash">Comunas cubiertas</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Con barrios registrados</div>
            <Link to="/admin/comunas" className="kpi-label-dash" style={{ marginTop: '2px', color: 'var(--color-amber)', fontWeight: '700', textDecoration: 'underline' }}> Ver módulo Comunas</Link>          </div>
        </div>
      </div>

      <div className="input-group search-dash mb-3">
        <span className="input-group-text bg-white border-0"><i className="bi bi-search" /></span>
        <input type="text" id="input-buscar-barrio" className="form-control border-0" placeholder="Buscar por nombre de barrio..." value={buscar} onChange={(e) => setBuscar(e.target.value)} />
      </div>

      <div className="card-panel-dash">
        <div className="tabla-barrios-header">
          <span>NOMBRE</span>
          <span>COMUNA</span>
          <span className="text-end">ACCIONES</span>
        </div>
        <div id="lista-barrios">
          {cargando ? (
            <div className="tabla-barrios-vacio">Cargando...</div>
          ) : error ? (
            <div className="tabla-barrios-vacio">{error}</div>
          ) : filtrados.length === 0 ? (
            <div className="tabla-barrios-vacio">No se encontraron barrios.</div>
          ) : (
            filtrados.map((b) => (
              <div key={b.idBarrio} className="tabla-barrios-fila">
                <div className="barrio-nombre-dash">{b.nombre.toUpperCase()}</div>
                <div>
                  <span className="barrio-comuna-badge-dash" style={{ backgroundColor: colorPorId(b.comunaId) }}>{b.comunaNombre}</span>
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn-accion-dash btn-editar-barrio" title="Editar" onClick={() => abrirEditar(b.idBarrio)}>
                    <i className="bi bi-pencil" />
                  </button>
                  <button type="button" className="btn-accion-dash btn-eliminar-barrio" title="Eliminar" onClick={() => eliminar(b.idBarrio)}>
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modalAbierto && (
        <>
          <div className="modal-backdrop" onClick={cerrarModal} />
          <div className="modal" role="dialog" style={{ display: 'block' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content modal-dash">
                <form id="form-barrio" onSubmit={guardar}>
                  <div className="modal-header-dash d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="modal-title-dash">{esEdicion ? 'Editar barrio' : 'Nuevo barrio'}</h5>
                      <div className="modal-subtitle-dash">Registra un barrio y asígnalo a una comuna</div>
                    </div>
                    <button type="button" className="btn-close-dash" onClick={cerrarModal}>
                      <i className="bi bi-x-lg" />
                    </button>
                  </div>
                  <div className="modal-body">
                    <label className="label-col-dash mb-1">Nombre del barrio</label>
                    <input type="text" id="nombre-barrio" className="form-control input-dash mb-3" placeholder="Ej: Los Fundadores" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    <label className="label-col-dash mb-1">Comuna</label>
                    <select id="comuna-barrio" className="form-select input-dash" required value={comuna} onChange={(e) => setComuna(e.target.value)}>
                      <option value="" disabled>Seleccionar comuna *</option>
                      {comunas.map((c) => (
                        <option key={c.idComuna} value={c.idComuna}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-footer-dash">
                    <button type="button" className="btn btn-cancelar-dash" onClick={cerrarModal}>Cancelar</button>
                    <button type="submit" className="btn btn-cv-azul px-4" style={{ borderRadius: '12px', fontWeight: '700' }}>{esEdicion ? 'Guardar cambios' : 'Registrar barrio'}</button>
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