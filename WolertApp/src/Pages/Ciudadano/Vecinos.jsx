import { useState, useEffect } from 'react';
import '../../css/global.css';
import '../../css/temas.css';
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
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title-dash"><i className="bi bi-people"></i> Mis Vecinos</h1>
        <div className="d-flex align-items-center gap-3">
          <button className="btn icon-btn-dash rounded-circle border-0 bg-white">
            <i className="bi bi-search"></i>
          </button>
          <div className="avatar-dash">{iniciales}</div>
        </div>
      </div>

      <div className="card-panel-dash p-0">
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
