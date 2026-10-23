import { useEffect, useState } from 'react';
import Layout from '../../Components/transito/Layout';
export default function Configuracion() {
  const [oscuro, setOscuro] = useState(false);


  useEffect(() => { document.body.classList.toggle('tema-oscuro', oscuro); }, [oscuro]);

  return (
    <Layout titulo="Configuración de Tránsito" activo="configuracion"
      busqueda={{ placeholder: 'Buscar por caso, barrio o agente...' }}>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="section-title-dash">Configuración</h1>
          <p className="section-text-dash mb-0">Ajusta los datos generales, notificaciones y seguridad del módulo de Tránsito.</p>
        </div>
        <button className="btn btn-primary rounded-pill fw-bold btn-nuevo-dash">
          <i className="bi bi-check-lg me-2"></i>Guardar cambios
        </button>
      </div>

      <div className="table-card-dash mb-4">
        <div className="d-flex gap-2 tabs-dash mb-4">
          <button className="tab-dash active-dash">General</button>
          <button className="tab-dash">Notificaciones</button>
          <button className="tab-dash">Seguridad</button>
          <button className="tab-dash">Apariencia</button>
        </div>
        <div className="row g-4">
          <div className="col-md-6">
            <label className="form-label-dash">Nombre de la secretaría</label>
            <input type="text" className="form-control input-dash" defaultValue="Secretaría de Tránsito" />
          </div>
          <div className="col-md-6">
            <label className="form-label-dash">Correo de contacto</label>
            <input type="email" className="form-control input-dash" defaultValue="transito@wolertapp.gov.co" />
          </div>
          <div className="col-md-6">
            <label className="form-label-dash">Teléfono de atención</label>
            <input type="text" className="form-control input-dash" defaultValue="(605) 000 0000" />
          </div>
          <div className="col-md-6">
            <label className="form-label-dash">Zona horaria</label>
            <select className="form-select input-dash" defaultValue="America/Bogota">
              <option value="America/Bogota">América/Bogotá (GMT-5)</option>
              <option value="America/Mexico_City">América/Ciudad de México (GMT-6)</option>
            </select>
          </div>
        </div>
      </div>

      {/* notificaciones */}
      <div className="table-card-dash mb-4">
        <h2 className="subsection-title-dash mb-3">Notificaciones</h2>
        <div className="setting-row-dash">
          <div>
            <p className="setting-name-dash">Casos críticos</p>
            <p className="setting-desc-dash mb-0">Recibe una alerta cuando se registre un caso de prioridad alta.</p>
          </div>
          <div className="form-check form-switch"><input className="form-check-input switch-dash" type="checkbox" defaultChecked /></div>
        </div>
        <div className="setting-row-dash">
          <div>
            <p className="setting-name-dash">Resumen diario</p>
            <p className="setting-desc-dash mb-0">Envía un correo con el resumen de actividad al final del día.</p>
          </div>
          <div className="form-check form-switch"><input className="form-check-input switch-dash" type="checkbox" defaultChecked /></div>
        </div>
        <div className="setting-row-dash border-0">
          <div>
            <p className="setting-name-dash">Nuevos agentes registrados</p>
            <p className="setting-desc-dash mb-0">Notifica cuando se asigna un agente a una zona.</p>
          </div>
          <div className="form-check form-switch"><input className="form-check-input switch-dash" type="checkbox" /></div>
        </div>
      </div>

      {/* seguridad */}
      <div className="table-card-dash mb-4">
        <h2 className="subsection-title-dash mb-3">Seguridad</h2>
        <div className="row g-4">
          <div className="col-md-6">
            <label className="form-label-dash">Contraseña actual</label>
            <input type="password" className="form-control input-dash" placeholder="••••••••" />
          </div>
          <div className="col-md-6">
            <label className="form-label-dash">Nueva contraseña</label>
            <input type="password" className="form-control input-dash" placeholder="••••••••" />
          </div>
        </div>
        <div className="setting-row-dash border-0 mt-4 pt-0">
          <div>
            <p className="setting-name-dash">Verificación en dos pasos</p>
            <p className="setting-desc-dash mb-0">Solicita un código adicional al iniciar sesión.</p>
          </div>
          <div className="form-check form-switch"><input className="form-check-input switch-dash" type="checkbox" /></div>
        </div>
      </div>

    
      <div className="table-card-dash">
        <h2 className="subsection-title-dash mb-3">Apariencia</h2>
        <div className="setting-row-dash border-0">
          <div>
            <p className="setting-name-dash">Tema oscuro</p>
            <p className="setting-desc-dash mb-0">Cambia la apariencia del panel a modo oscuro.</p>
          </div>
          <div className="form-check form-switch">
            <input className="form-check-input switch-dash" type="checkbox" id="temaOscuroSwitch"
              checked={oscuro} onChange={(e) => setOscuro(e.target.checked)} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

