import { useState, useEffect } from 'react';
import '../../css/global.css';
import '../../css/temas.css';
import '../../css/ciudadano/listados-unificados.css';
import '../../css/ciudadano/panel-vecinos.css';
import { listarVecinos } from '../../Services/UsuariosAPI.js';

export default function Vecinos() {
  const [vecinos, setVecinos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    listarVecinos()
      .then((datos) => {
        if (activo) setVecinos(datos);
      })
      .catch((err) => {
        if (activo) setError(err.message || 'No se pudieron cargar tus vecinos.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => { activo = false; };
  }, []);

  const iniciales = (localStorage.getItem('username') || '').slice(0, 2).toUpperCase();

  return (
    <div className="container-fluid ciudadano-listado ciudadano-vecinos">
      <header className="ciudadano-page-heading">
        <div>
          <h1>Mis vecinos</h1>
          <p>Conoce a las personas registradas en tu barrio y fortalece tu comunidad.</p>
        </div>
      </header>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="kpi-dash kpi-blue-dash">
            <i className="bi bi-people kpi-icon-dash" />
            <div className="kpi-num-dash">{cargando ? '—' : vecinos.length}</div>
            <div className="kpi-label-dash">Vecinos registrados</div>
            <div className="kpi-label-dash ciudadano-kpi-sub">En tu comunidad</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="kpi-dash kpi-green-dash">
            <i className="bi bi-geo-alt kpi-icon-dash" />
            <div className="kpi-num-dash">{cargando ? '—' : new Set(vecinos.map((v) => v.barrioNombre).filter(Boolean)).size}</div>
            <div className="kpi-label-dash">Barrios representados</div>
            <div className="kpi-label-dash ciudadano-kpi-sub">Según los registros</div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="kpi-dash kpi-purple-dash">
            <i className="bi bi-person-check kpi-icon-dash" />
            <div className="kpi-num-dash">{cargando ? '—' : vecinos.filter((v) => v.nombre).length}</div>
            <div className="kpi-label-dash">Perfiles identificados</div>
            <div className="kpi-label-dash ciudadano-kpi-sub">Con nombre registrado</div>
          </div>
        </div>
      </div>

      <div className="card-panel-dash ciudadano-table-panel p-0">
        <div id="listaVecinos">
          {cargando && (
            <p className="text-center text-muted small m-4">Cargando tus vecinos...</p>
          )}

          {!cargando && error && (
            <p className="text-center small m-4" role="alert" style={{ color: '#b42318' }}>{error}</p>
          )}

          {!cargando && !error && vecinos.length === 0 && (
            <p className="text-center text-muted small m-4">
              Aún no hay otros vecinos registrados en tu barrio.
            </p>
          )}

          {vecinos.map((v) => (
            <div
              key={v.idUsuario}
              className="vecino-row-usu p-3 border-bottom d-flex justify-content-between align-items-center"
            >
              <div className="vecino-info-usu">
                <span className="nombre-usu">{v.nombre}</span>
                {v.barrioNombre && (
                  <span className="distancia-usu ms-2">
                    <i className="bi bi-geo-alt"></i> {v.barrioNombre}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
