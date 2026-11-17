
import { useEffect, useMemo, useState } from 'react';
import Topbar from '../../Components/Administrador-policia/Topbar';
import { ListarPolicias } from '../../Services/AdminPoliciaApi';

import '../../css/Policia/administrador-policia/css/policias.css';

function Policias() {
  const [policias, setPolicias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [unidad, setUnidad] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    ListarPolicias()
      .then(datos => {
        if (activo) setPolicias(datos);
      })
      .catch(err => {
        if (activo) setError(err.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const unidades = useMemo(() => {
    const mapa = new Map();

    policias.forEach(p => {
      if (p.idUnidad != null) {
        mapa.set(String(p.idUnidad), p.nombreUnidad);
      }
    });

    return [...mapa.entries()];
  }, [policias]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return policias.filter(p => {
      const coincideTexto = [
        p.nombreUsuario,
        p.cedula,
        p.placa,
        p.rango
      ].some(valor =>
        String(valor ?? '').toLowerCase().includes(texto)
      );

      const coincideEstado =
        !estado ||
        String(p.estado ?? '').toUpperCase() === estado;

      const coincideUnidad =
        !unidad || String(p.idUnidad) === unidad;

      return coincideTexto && coincideEstado && coincideUnidad;
    });
  }, [policias, busqueda, estado, unidad]);

  return (
    <>
      <Topbar
        iniciales="AP"
        placeholder="Buscar policía, cédula o placa..."
        valor={busqueda}
        onCambio={setBusqueda}
      />

      <div className="header-vista-dash mb-4">
        <div>
          <h1>Policías</h1>
          <p>
            Consulta el personal policial y su asignación a unidades.
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card-panel-dash p-3">
            <span>Total de policías</span>
            <h2>{cargando ? '...' : error ? '—' : policias.length}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card-panel-dash p-3">
            <span>Disponibles</span>
            <h2>
              {cargando || error
                ? '—'
                : policias.filter(
                    p => String(p.estado).toUpperCase() === 'DISPONIBLE'
                  ).length}
            </h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card-panel-dash p-3">
            <span>Unidades con policías</span>
            <h2>{cargando || error ? '—' : unidades.length}</h2>
          </div>
        </div>
      </div>

      <div className="panel-filtros-policias mb-4">
        <div className="panel-filtros-header">
          <div className="panel-filtros-icono">
            <i className="bi bi-funnel" />
          </div>
          <div>
            <h3>Filtros de policías</h3>
            <p>Busca y organiza el personal policial</p>
          </div>
        </div>

        <div className="panel-filtros-body">
          <div className="buscador-unidades">
            <label htmlFor="buscarPolicia">
              Buscar policía
            </label>
            <div className="buscador-unidades-input">
              <i className="bi bi-search" />
              <input
                id="buscarPolicia"
                type="text"
                placeholder="Nombre, cédula o placa..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="filtros-unidades-selects">
            <div className="filtro-unidad-card">
              <label htmlFor="filtroEstadoPolicia">
                Estado del policía
              </label>
              <select
                id="filtroEstadoPolicia"
                className="form-select"
                value={estado}
                onChange={e => setEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                {[...new Set(
                  policias.map(p => p.estado).filter(Boolean)
                )].map(e => (
                  <option key={e} value={String(e).toUpperCase()}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-unidad-card">
              <label htmlFor="filtroUnidadPolicia">
                Unidad policial
              </label>
              <select
                id="filtroUnidadPolicia"
                className="form-select"
                value={unidad}
                onChange={e => setUnidad(e.target.value)}
              >
                <option value="">Todas las unidades</option>
                {unidades.map(([id, nombre]) => (
                  <option key={id} value={id}>
                    {nombre || `Unidad #${id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {cargando && <p role="status">Cargando policías...</p>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card-panel-dash mb-4">
        <div className="tabla-header-dash">
          <span className="flex-grow-1">Policía</span>
          <span style={{ width: '110px' }}>Placa</span>
          <span style={{ width: '130px' }}>Rango</span>
          <span style={{ width: '150px' }}>Unidad</span>
          <span style={{ width: '150px' }}>Estado</span>
        </div>

        <div className="table-responsive">
          <table className="tabla-dash">
            <tbody>
              {!cargando && !error && filtrados.map(p => (
                <tr key={p.idUsuario}>
                  <td>
                    <strong>{p.nombreUsuario || 'Sin nombre'}</strong>
                    <div>
                      <small>{p.cedula || 'Sin cédula'}</small>
                    </div>
                  </td>
                  <td>{p.placa || '—'}</td>
                  <td>{p.rango || '—'}</td>
                  <td>{p.nombreUnidad || 'Sin unidad'}</td>
                  <td>{p.estado || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!cargando && !error && filtrados.length === 0 && (
          <div className="tabla-vacio-dash p-4 text-center">
            No se encontraron policías con esos filtros.
          </div>
        )}
      </div>
    </>
  );
}

export default Policias;
