import { useState } from 'react';
import Layout from '../../Components/transito/Layout';

const DATOS = [
  { label: 'Grupo', valor: 'Grupo 1' },
  { label: 'Zona', valor: 'Zona Norte' },
  { label: 'Cédula', valor: 'CC 1065.234.812' },
  { label: 'Correo', valor: 'jorge.ramirez@transito.gov.co' },
  { label: 'Usuario', valor: 'jramirez' },
];

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
  const [form, setForm] = useState({ actual: '', nueva: '', confirmar: '' });
  const [mensaje, setMensaje] = useState(null);

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const guardar = (e) => {
    e.preventDefault();
    if (form.nueva !== form.confirmar) {
      setMensaje({ ok: false, txt: 'La nueva contraseña y su confirmación no coinciden.' });
      return;
    }
    setMensaje({ ok: true, txt: 'Contraseña actualizada.' });
    setForm({ actual: '', nueva: '', confirmar: '' });
  };

  return (
    <Layout rol="agente" titulo="Configuración" activo="configuracion" busqueda={{ placeholder: 'Buscar...' }}>

      <div className="mb-4">
        <h1 className="section-title-dash">Configuración</h1>
        <p className="section-text-dash mb-0">Tu perfil, tu seguridad y tus preferencias de notificación.</p>
      </div>

      {/* perfil: mitad azul arriba, datos en blanco abajo */}
      <div className="perfil-hero-dash mb-4">
        <div className="perfil-hero-top-dash">
          <div className="perfil-hero-avatar-dash">JR</div>
          <div>
            <div className="perfil-hero-eyebrow-dash">Agente de Tránsito</div>
            <h2 className="perfil-hero-nombre-dash">Jorge Ramírez</h2>
          </div>
        </div>

        <div className="perfil-hero-body-dash">
          <div className="perfil-hero-datos-dash">
            {DATOS.map((d) => (
              <div key={d.label} className="perfil-hero-dato-dash">
                <span>{d.label}</span>
                <strong>{d.valor}</strong>
              </div>
            ))}
          </div>

          <p className="perfil-hero-nota-dash">
            <i className="bi bi-info-circle me-1"></i>
            ¿Algún dato incorrecto? Repórtalo a tu Director de Tránsito, él es quien puede actualizarlo.
          </p>
        </div>
      </div>

      {/* notificaciones */}
      <div className="panel-card-dash mb-3">
        <h2 className="panel-title-dash">Notificaciones</h2>
        <Fila titulo="Sonido al recibir un caso" texto="Suena una alerta cuando le asignan un caso nuevo a tu grupo.">
          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" role="switch" defaultChecked /></div>
        </Fila>
        <Fila titulo="Vibración" texto="Vibra el celular junto con la alerta de caso nuevo.">
          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" role="switch" defaultChecked /></div>
        </Fila>
      </div>

      {/* seguridad */}
      <div className="panel-card-dash mb-3">
        <h2 className="panel-title-dash">Cambiar contraseña</h2>
        <p className="config-text-dash mb-3">Última actualización hace 2 meses.</p>

        <form className="form-perfil-dash" onSubmit={guardar}>
          <div className="form-group-dash">
            <label htmlFor="passActual">Contraseña actual</label>
            <input type="password" id="passActual" className="form-control" value={form.actual} onChange={cambiar('actual')} required />
          </div>
          <div className="form-group-dash">
            <label htmlFor="passNueva">Nueva contraseña</label>
            <input type="password" id="passNueva" className="form-control" value={form.nueva} onChange={cambiar('nueva')} required />
          </div>
          <div className="form-group-dash">
            <label htmlFor="passConfirmar">Confirmar nueva contraseña</label>
            <input type="password" id="passConfirmar" className="form-control" value={form.confirmar} onChange={cambiar('confirmar')} required />
          </div>
          {mensaje && (
            <p className={`small mb-3 ${mensaje.ok ? 'text-success' : 'text-danger'}`}>{mensaje.txt}</p>
          )}
          <button type="submit" className="btn-primary-dash">Guardar cambios</button>
        </form>
      </div>

      {/* cuenta */}
      <div className="panel-card-dash">
        <h2 className="panel-title-dash">Cuenta</h2>
        <Fila titulo="Cerrar sesión" texto="Sal de tu cuenta en este dispositivo.">
          <button className="btn-secundario-dash">Cerrar sesión</button>
        </Fila>
      </div>
    </Layout>
  );
}