import Layout from '../../Components/transito/Layout';

function Fila({ titulo, texto, children }) {
  return (
    <div className="config-row-dash">
      <div>
        <div className="config-label-dash">{titulo}</div>
        <div className="config-text-dash">{texto}</div>
      </div>
      {children}
    </div>
  );
}

export default function Configuracion() {
  return (
    <Layout rol="central" titulo="Configuración" activo="configuracion"
      busqueda={{ placeholder: 'Buscar por caso, barrio o agente...' }}>

      <div className="mb-4">
        <h1 className="section-title-dash">Configuración</h1>
        <p className="section-text-dash mb-0">Preferencias de notificaciones y del turno de despacho.</p>
      </div>

      <div className="panel-card-dash mb-3">
        <h2 className="panel-title-dash">Notificaciones</h2>
        <Fila titulo="Sonido al recibir un caso nuevo" texto="Reproduce una alerta sonora cada vez que llega un reporte sin asignar.">
          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" role="switch" defaultChecked /></div>
        </Fila>
        <Fila titulo="Aviso de espera crítica" texto="Notifica cuando un caso lleva más de 10 minutos sin ser asignado.">
          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" role="switch" defaultChecked /></div>
        </Fila>
      </div>

      <div className="panel-card-dash mb-3">
        <h2 className="panel-title-dash">Turno de despacho</h2>
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="config-field-label-dash">Horario del turno</label>
            <select className="form-select" defaultValue="2:00 p.m. – 10:00 p.m.">
              <option>6:00 a.m. – 2:00 p.m.</option>
              <option>2:00 p.m. – 10:00 p.m.</option>
              <option>10:00 p.m. – 6:00 a.m.</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="config-field-label-dash">Reasignar si el agente no responde en</label>
            <select className="form-select" defaultValue="5 minutos">
              <option>3 minutos</option>
              <option>5 minutos</option>
              <option>10 minutos</option>
            </select>
          </div>
          <div className="col-md-4">
            <div className="form-check form-switch d-flex align-items-center gap-2">
              <input className="form-check-input" type="checkbox" role="switch" defaultChecked />
              <label className="config-label-dash mb-0">Reasignación automática</label>
            </div>
          </div>
        </div>
      </div>

      <div className="panel-card-dash">
        <h2 className="panel-title-dash">Cuenta</h2>
        <Fila titulo="Contraseña" texto="Última actualización hace 3 meses.">
          <button className="btn-secundario-dash">Cambiar contraseña</button>
        </Fila>
        <Fila titulo="Sesiones activas" texto="Cierra el acceso desde otros dispositivos conectados a tu cuenta.">
          <button className="btn-secundario-dash">Cerrar otras sesiones</button>
        </Fila>
      </div>
    </Layout>
  );
}