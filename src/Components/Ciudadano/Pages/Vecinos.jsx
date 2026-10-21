import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/ciudadano/panel-vecinos.css';

const vecinos = [
  { id: 1, nombre: 'Laura Peña', distancia: '80 m', estado: 'Conectada' },
  { id: 2, nombre: 'Diego Torres', distancia: '140 m', estado: 'Conectado' },
  { id: 3, nombre: 'Ravi Kumar', distancia: '210 m', estado: 'Sin conexión' },
  { id: 4, nombre: 'Marta Correa', distancia: '260 m', estado: 'Conectada' },
];

export default function Vecinos() {
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title-dash"><i className="bi bi-people"></i> Mis Vecinos</h1>
        <div className="d-flex align-items-center gap-3">
          <button className="btn icon-btn-dash rounded-circle border-0 bg-white">
            <i className="bi bi-search"></i>
          </button>
          <div className="avatar-dash">JC</div>
        </div>
      </div>

      <div className="card-panel-dash p-0">
        <div id="listaVecinos">
          {vecinos.map((v) => (
            <div key={v.id} className="vecino-row-usu p-3 border-bottom d-flex justify-content-between align-items-center">
              <div className="vecino-info-usu">
                <span className="nombre-usu">{v.nombre}</span>
                <span className="distancia-usu ms-2"><i className="bi bi-geo-alt"></i> {v.distancia}</span>
              </div>
              <span className={`estado-mini-usu ${v.estado === 'Sin conexión' ? 'estado-gris-usu' : 'estado-verde-usu'}`}>{v.estado}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}