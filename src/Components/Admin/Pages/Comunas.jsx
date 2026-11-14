import { useState, useEffect } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/admin/comunas.css';
import { Link } from 'react-router-dom';
import { ListarComunas, CrearComuna, EditarComuna, EliminarComuna } from '../../../Service/ComunasAPI';

const COLORES = ['#1f3a8a', '#5c4033', '#374151', '#166534', '#1d4ed8', '#14532d'];

function iniciales(nombre) {
  const partes = nombre.trim().split(' ');
  return (partes[0][0] + (partes[1] || '')).toUpperCase();
}

function colorPorId(id) {
  return COLORES[id % COLORES.length];
}

export default function Comunas() {
  const [comunas, setComunas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [buscar, setBuscar] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [verAbierto, setVerAbierto] = useState(false);
  const [comunaVer, setComunaVer] = useState(null);
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const [nombre, setNombre] = useState('');

  const cargarComunas = async () => {
    try {
      setCargando(true);
      setError('');
      const datos = await ListarComunas();
      setComunas(datos);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarComunas();
  }, []);

  const filtradas = comunas.filter((c) =>
    c.nombre.toLowerCase().includes(buscar.trim().toLowerCase())
  );

  const totalBarrios = comunas.reduce((suma, c) => suma + (c.totalBarrios || 0), 0);

  const abrirCrear = () => {
    setIdEnEdicion(null);
    setNombre('');
    setModalAbierto(true);
  };

  const abrirEditar = (id) => {
    const c = comunas.find((x) => x.idComuna === id);
    if (!c) return;
    setIdEnEdicion(id);
    setNombre(c.nombre);
    setModalAbierto(true);
  };

  const abrirVer = (id) => {
    const c = comunas.find((x) => x.idComuna === id);
    if (!c) return;
    setComunaVer(c);
    setVerAbierto(true);
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta comuna?')) return;
    try {
      await EliminarComuna(id);
      await cargarComunas();
    } catch (e) {
      alert(e.message);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setIdEnEdicion(null);
    setNombre('');
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (idEnEdicion !== null) {
        await EditarComuna(idEnEdicion, { idComuna: idEnEdicion, nombre });
      } else {
        await CrearComuna({ nombre });
      }
      await cargarComunas();
      cerrarModal();
    } catch (err) {
      alert(err.message);
    }
  };

  const esEdicion = idEnEdicion !== null;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h1 className="hero-title-dash" style={{ color: 'var(--ink)', fontSize: '26px' }}>Gestión de Comunas</h1>
          <p className="hero-text-dash" style={{ color: 'var(--muted)' }}>Administra las divisiones territoriales del sistema</p>
        </div>
        <button type="button" className="btn btn-cv-azul d-inline-flex align-items-center gap-2 px-3 py-2" style={{ borderRadius: '12px', fontSize: '13.5px', fontWeight: '700' }} onClick={abrirCrear}>
          <i className="bi bi-plus-lg" /> Nueva comuna
        </button>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="kpi-dash kpi-blue-dash">
            <i className="bi bi-map kpi-icon-dash" />
            <div className="kpi-num-dash" id="kpi-total-comunas">{comunas.length}</div>
            <div className="kpi-label-dash">Total comunas</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>Divisiones registradas</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-dash kpi-green-dash">
            <i className="bi bi-houses kpi-icon-dash" />
            <div className="kpi-num-dash" id="kpi-total-barrios">{totalBarrios}</div>
            <div className="kpi-label-dash">Total barrios</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>En todas las comunas</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-dash kpi-red-dash">
            <i className="bi bi-exclamation-triangle kpi-icon-dash" />
            <div className="kpi-num-dash" style={{ fontSize: '20px' }}>—</div>
            <div className="kpi-label-dash">Alertas por zona</div>
            <Link to="/admin/alertas" className="kpi-label-dash" style={{ marginTop: '2px', color: 'var(--color-danger)', fontWeight: '700', textDecoration: 'underline' }}>Ver módulo Alertas</Link>          
  </div>
        </div>
      </div>

      <div className="input-group search-dash search-dash-comunas mb-3">
        <span className="input-group-text bg-white border-0"><i className="bi bi-search" /></span>
        <input type="text" id="input-buscar-comuna" className="form-control border-0" placeholder="Buscar por nombre de comuna..." value={buscar} onChange={(e) => setBuscar(e.target.value)} />
      </div>

      <div className="card-panel-dash">
        <div className="tabla-comunas-header">
          <span>NOMBRE</span>
          <span className="text-end">ACCIONES</span>
        </div>
        <div id="lista-comunas">
          {cargando ? (
            <div className="tabla-comunas-vacio">Cargando...</div>
          ) : error ? (
            <div className="tabla-comunas-vacio">{error}</div>
          ) : filtradas.length === 0 ? (
            <div className="tabla-comunas-vacio">No se encontraron comunas.</div>
          ) : (
            filtradas.map((c) => (
              <div key={c.idComuna} className="tabla-comunas-fila">
                <div className="d-flex align-items-center gap-3">
                  <div className="comuna-avatar-dash" style={{ backgroundColor: colorPorId(c.idComuna) }}>
                    {iniciales(c.nombre)}
                  </div>
                  <div>
                    <div className="comuna-nombre-dash">{c.nombre.toUpperCase()}</div>
                    <div className="comuna-sub-dash">{c.totalBarrios} barrios</div>
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn-accion-dash btn-ver-dash" title="Ver" onClick={() => abrirVer(c.idComuna)}>
                    <i className="bi bi-eye" />
                  </button>
                  <button type="button" className="btn-accion-dash btn-editar-dash" title="Editar" onClick={() => abrirEditar(c.idComuna)}>
                    <i className="bi bi-pencil" />
                  </button>
                  <button type="button" className="btn-accion-dash btn-eliminar-dash" title="Eliminar" onClick={() => eliminar(c.idComuna)}>
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
              <div className="modal-content" style={{ borderRadius: '18px', border: 'none' }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title section-title-dash">{esEdicion ? 'Editar comuna' : 'Nueva comuna'}</h5>
                  <button type="button" className="btn-close" onClick={cerrarModal} />
                </div>
                <div className="modal-body">
                  <form id="form-comuna" onSubmit={guardar}>
                    <label className="label-col-dash mb-1">Nombre de la comuna</label>
                    <input type="text" id="nombre-comuna" className="form-control mb-3" placeholder="Ej: Comuna 7" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
                    <button type="submit" className="btn btn-cv-azul w-100" style={{ borderRadius: '12px', fontWeight: '700' }}>{esEdicion ? 'Guardar cambios' : 'Registrar comuna'}</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {verAbierto && comunaVer && (
        <>
          <div className="modal-backdrop" onClick={() => setVerAbierto(false)} />
          <div className="modal" role="dialog" style={{ display: 'block' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ borderRadius: '18px', border: 'none' }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title section-title-dash" id="ver-comuna-nombre">{comunaVer.nombre}</h5>
                  <button type="button" className="btn-close" onClick={() => setVerAbierto(false)} />
                </div>
                <div className="modal-body">
                  <div className="fila-detalle-dash"><span className="etiqueta-detalle-dash">Tipo</span><span className="valor-detalle-dash">División territorial</span></div>
                  <div className="fila-detalle-dash" style={{ borderBottom: 'none' }}>
                    <span className="etiqueta-detalle-dash">Total de barrios</span>
                    <span className="valor-detalle-dash">{comunaVer.totalBarrios}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}