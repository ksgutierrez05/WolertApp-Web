import { useState } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/admin/barrios.css';

const COMUNAS_INICIALES = [
  { id: 1, nombre: 'Comuna 1', color: '#1f3a8a' },
  { id: 2, nombre: 'Comuna 2', color: '#5c4033' },
  { id: 3, nombre: 'Comuna 3', color: '#374151' },
  { id: 4, nombre: 'Comuna 4', color: '#166534' },
  { id: 5, nombre: 'Comuna 5', color: '#1d4ed8' },
  { id: 6, nombre: 'Comuna 6', color: '#14532d' },
];

const BARRIOS_INICIALES = [
  { id: 1, nombre: 'Los Fundadores', idComuna: 1 },
  { id: 2, nombre: 'Cañaguate', idComuna: 1 },
  { id: 3, nombre: 'Centro', idComuna: 2 },
  { id: 4, nombre: 'La Nevada', idComuna: 2 },
  { id: 5, nombre: 'El Prado', idComuna: 3 },
  { id: 6, nombre: 'San Joaquín', idComuna: 4 },
  { id: 7, nombre: 'Villa del Rosario', idComuna: 5 },
  { id: 8, nombre: 'Casimiro Raul Maestre', idComuna: 6 },
];

export default function Barrios() {
  const [barrios, setBarrios] = useState(BARRIOS_INICIALES);
  const [comunas] = useState(COMUNAS_INICIALES);
  const [buscar, setBuscar] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [comuna, setComuna] = useState('');

  const buscarComunaPorId = (id) => comunas.find((c) => c.id === Number(id));

  const filtrados = barrios.filter((b) => b.nombre.toLowerCase().includes(buscar.trim().toLowerCase()));

  const comunasConBarrio = new Set(barrios.map((b) => b.idComuna)).size;

  const eliminar = (id) => {
    setBarrios((prev) => prev.filter((b) => b.id !== id));
  };

  const guardar = (e) => {
    e.preventDefault();
    const nuevoId = barrios.length > 0 ? Math.max(...barrios.map((b) => b.id)) + 1 : 1;
    setBarrios((prev) => [...prev, { id: nuevoId, nombre, idComuna: Number(comuna) }]);
    setModalAbierto(false);
    setNombre('');
    setComuna('');
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setNombre('');
    setComuna('');
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h1 className="hero-title-dash" style={{ color: 'var(--ink)', fontSize: '26px' }}>Gestión de Barrios</h1>
          <p className="hero-text-dash" style={{ color: 'var(--muted)' }}>Administra los barrios dentro de cada comuna</p>
        </div>
        <button type="button" className="btn btn-cv-azul d-inline-flex align-items-center gap-2 px-3 py-2" style={{ borderRadius: '12px', fontSize: '13.5px', fontWeight: '700' }} onClick={() => setModalAbierto(true)}>
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
            <a href="#" className="kpi-label-dash" style={{ marginTop: '2px', color: 'var(--color-amber)', fontWeight: '700', textDecoration: 'underline' }}>Ver módulo Comunas</a>
          </div>
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
          {filtrados.length === 0 ? (
            <div className="tabla-barrios-vacio">No se encontraron barrios.</div>
          ) : (
            filtrados.map((b) => {
              const comunaObj = buscarComunaPorId(b.idComuna);
              const nombreComuna = comunaObj ? comunaObj.nombre : 'Sin comuna';
              const colorComuna = comunaObj ? comunaObj.color : '#98a2b3';
              return (
                <div key={b.id} className="tabla-barrios-fila">
                  <div className="barrio-nombre-dash">{b.nombre.toUpperCase()}</div>
                  <div>
                    <span className="barrio-comuna-badge-dash" style={{ backgroundColor: colorComuna }}>{nombreComuna}</span>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn-accion-dash btn-eliminar-barrio" title="Eliminar" onClick={() => eliminar(b.id)}>
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </div>
              );
            })
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
                      <h5 className="modal-title-dash">Nuevo barrio</h5>
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
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-footer-dash">
                    <button type="button" className="btn btn-cancelar-dash" onClick={cerrarModal}>Cancelar</button>
                    <button type="submit" className="btn btn-cv-azul px-4" style={{ borderRadius: '12px', fontWeight: '700' }}>Registrar barrio</button>
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