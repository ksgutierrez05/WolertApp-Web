import { useState } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/ciudadano/panel-configuracion.css';

export default function Configuracion() {
  const [nombre, setNombre] = useState('Juan Carlos Pérez');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [alertaVecino, setAlertaVecino] = useState(true);
  const [cambioEstado, setCambioEstado] = useState(true);
  const [correo, setCorreo] = useState(false);
  const [mostrarNombre, setMostrarNombre] = useState(true);
  const [anonimo, setAnonimo] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const guardar = () => {
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const Toggle = ({ checked, onChange }) => (
    <div className="form-check form-switch">
      <input className="form-check-input" type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title-dash"><i className="bi bi-gear"></i> Configuración</h1>
        <div className="d-flex align-items-center gap-3">
          <button className="btn icon-btn-dash rounded-circle border-0 bg-white">
            <i className="bi bi-search"></i>
          </button>
          <div className="avatar-dash">JC</div>
        </div>
      </div>

      <div className="card-panel-dash p-0">
        <div className="config-section-dash">
          <p className="config-section-title-dash">Mi perfil</p>
          <p className="config-section-sub-dash">Esta información se muestra a tus vecinos cuando reportas una alerta.</p>

          <div className="config-avatar-row-dash">
            <span className="config-avatar-dash" id="configAvatar">JC</span>
            <div>
              <p className="config-avatar-name-dash mb-0" id="configAvatarNombre">{nombre}</p>
              <p className="config-avatar-role-dash mb-0">Rol: Ciudadano</p>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="config-field-label-dash">Nombre completo</label>
              <input type="text" id="inputNombre" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="config-field-label-dash">Correo electrónico</label>
              <input type="email" id="inputEmail" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="config-field-label-dash">Teléfono</label>
              <input type="text" id="inputTelefono" className="form-control" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="config-field-label-dash">Dirección</label>
              <input type="text" id="inputDireccion" className="form-control" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="config-section-dash">
          <p className="config-section-title-dash">Notificaciones</p>
          <p className="config-section-sub-dash">Elige cuándo quieres que te avisemos.</p>

          <div className="config-toggle-row-dash">
            <div className="config-toggle-text-dash">
              <b>Alertas de vecinos</b>
              <span>Cuando un vecino reporta una alerta cerca de ti.</span>
            </div>
            <Toggle checked={alertaVecino} onChange={setAlertaVecino} />
          </div>

          <div className="config-toggle-row-dash">
            <div className="config-toggle-text-dash">
              <b>Cambios de estado</b>
              <span>Cuando una alerta que tú reportaste cambia de estado.</span>
            </div>
            <Toggle checked={cambioEstado} onChange={setCambioEstado} />
          </div>

          <div className="config-toggle-row-dash">
            <div className="config-toggle-text-dash">
              <b>Notificaciones por correo</b>
              <span>Recibir un resumen también en tu correo electrónico.</span>
            </div>
            <Toggle checked={correo} onChange={setCorreo} />
          </div>
        </div>

        <div className="config-section-dash">
          <p className="config-section-title-dash">Privacidad</p>
          <p className="config-section-sub-dash">Controla qué ven tus vecinos sobre ti.</p>

          <div className="config-toggle-row-dash">
            <div className="config-toggle-text-dash">
              <b>Mostrar mi nombre a vecinos</b>
              <span>Si lo desactivas, tus reportes se verán como "Vecino verificado".</span>
            </div>
            <Toggle checked={mostrarNombre} onChange={setMostrarNombre} />
          </div>

          <div className="config-toggle-row-dash">
            <div className="config-toggle-text-dash">
              <b>Reportar de forma anónima por defecto</b>
              <span>Tus nuevas alertas se enviarán sin tu nombre, salvo que lo cambies al reportar.</span>
            </div>
            <Toggle checked={anonimo} onChange={setAnonimo} />
          </div>
        </div>

        <div className="config-section-dash">
          <p className="config-section-title-dash">Cuenta</p>
          <p className="config-section-sub-dash">Seguridad y sesión.</p>

          <div className="config-danger-row-dash">
            <div className="config-toggle-text-dash">
              <b>Contraseña</b>
              <span>Última actualización hace 3 meses.</span>
            </div>
            <button className="btn btn-cv-azul btn-sm">Cambiar contraseña</button>
          </div>
        </div>

        <div className="config-actions-dash">
          {guardado && (
            <span className="config-guardado-msg-dash">
              <i className="bi bi-check-circle"></i> Cambios guardados
            </span>
          )}
          <button className="btn btn-outline-secondary btn-sm" onClick={() => { setNombre('Juan Carlos Pérez'); setEmail(''); setTelefono(''); setDireccion(''); }}>
            Restaurar valores
          </button>
          <button className="btn btn-cv-azul" onClick={guardar}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}