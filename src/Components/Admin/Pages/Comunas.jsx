import { useState } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/admin/comunas.css';

function iniciales(nombre) {
  const partes = nombre.trim().split(' ');
  return (partes[0][0] + (partes[1] || '')).toUpperCase();
}

const COMUNAS_INICIALES = [
  { id: 1, nombre: 'Comuna 1', color: '#1f3a8a' },
  { id: 2, nombre: 'Comuna 2', color: '#5c4033' },
  { id: 3, nombre: 'Comuna 3', color: '#374151' },
  { id: 4, nombre: 'Comuna 4', color: '#166534' },
  { id: 5, nombre: 'Comuna 5', color: '#1d4ed8' },
  { id: 6, nombre: 'Comuna 6', color: '#14532d' },
];

export default function Comunas() {
  const [comunas, setComunas] = useState(COMUNAS_INICIALES);
  const [buscar, setBuscar] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [verAbierto, setVerAbierto] = useState(false);
  const [comunaVer, setComunaVer] = useState(null);
  const [idEnEdicion, setIdEnEdicion] = useState(null);
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('#1f3a8a');

  const filtradas = comunas.filter((c) => c.nombre.toLowerCase().includes(buscar.trim().toLowerCase()));

  const abrirCrear = () => {
    setIdEnEdicion(null);
    setNombre('');
    setColor('#1f3a8a');
    setModalAbierto(true);
  };

  const abrirEditar = (id) => {
    const c = comunas.find((x) => x.id === id);
    if (!c) return;
    setIdEnEdicion(id);
    setNombre(c.nombre);
    setColor(c.color);
    setModalAbierto(true);
  };

  const abrirVer = (id) => {
    const c = comunas.find((x) => x.id === id);
    if (!c) return;
    setComunaVer(c);
    setVerAbierto(true);
  };

  const eliminar = (id) => {
    setComunas((prev) => prev.filter((c) => c.id !== id));
  };

  const guardar = (e) => {
    e.preventDefault();
    if (idEnEdicion) {
      setComunas((prev) => prev.map((c) => (c.id === idEnEdicion ? { ...c, nombre, color } : c)));
    } else {
      const nuevoId = comunas.length > 0 ? Math.max(...comunas.map((c) => c.id)) + 1 : 1;
      setComunas((prev) => [...prev, { id: nuevoId, nombre, color }]);
    }
    setModalAbierto(false);
    setIdEnEdicion(null);
    setNombre('');
    setColor('#1f3a8a');
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setIdEnEdicion(null);
    setNombre('');
    setColor('#1f3a8a');
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
            <i className="bi bi-check-circle kpi-icon-dash" />
            <div className="kpi-num-dash" id="kpi-comunas-activas">{comunas.length}</div>
            <div className="kpi-label-dash">Comunas activas</div>
            <div className="kpi-label-dash" style={{ marginTop: '2px' }}>En el sistema</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="kpi-dash kpi-red-dash">
            <i className="bi bi-exclamation-triangle kpi-icon-dash" />
            <div className="kpi-num-dash" style={{ fontSize: '20px' }}>—</div>
            <div className="kpi-label-dash">Alertas por zona</div>
            <a href="alertas.html" className="kpi-label-dash" style={{ marginTop: '2px', color: 'var(--color-danger)', fontWeight: '700', textDecoration: 'underline' }}>Ver módulo Alertas</a>
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
          {filtradas.length === 0 ? (
            <div className="tabla-comunas-vacio">No se encontraron comunas.</div>
          ) : (
            filtradas.map((c) => (
              <div key={c.id} className="tabla-comunas-fila">
                <div className="d-flex align-items-center gap-3">
                  <div className="comuna-avatar-dash" style={{ backgroundColor: c.color }}>
                    {iniciales(c.nombre)}
                  </div>
                  <div>
                    <div className="comuna-nombre-dash">{c.nombre.toUpperCase()}</div>
                    <div className="comuna-sub-dash">División territorial</div>
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn-accion-dash btn-ver-dash" title="Ver" onClick={() => abrirVer(c.id)}>
                    <i className="bi bi-eye" />
                  </button>
                  <button type="button" className="btn-accion-dash btn-editar-dash" title="Editar" onClick={() => abrirEditar(c.id)}>
                    <i className="bi bi-pencil" />
                  </button>
                  <button type="button" className="btn-accion-dash btn-eliminar-dash" title="Eliminar" onClick={() => eliminar(c.id)}>
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
                    <label className="label-col-dash mb-1">Color identificador</label>
                    <input type="color" id="color-comuna" className="form-control form-control-color mb-3" value={color} onChange={(e) => setColor(e.target.value)} />
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
                    <span className="etiqueta-detalle-dash">Color identificador</span>
                    <span className="valor-detalle-dash d-flex align-items-center gap-2">
                      <span id="ver-comuna-color-muestra" style={{ width: '16px', height: '16px', borderRadius: '50%', display: 'inline-block', backgroundColor: comunaVer.color }} />
                      <span id="ver-comuna-color-texto">{comunaVer.color}</span>
                    </span>
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