import { useEffect, useState } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/admin/configuracion.css';

const CLAVE_CONFIG = 'wolertapp_config_admin';
const configPorDefecto = {
  nombre: 'ADMIN SISTEMA',
  correo: 'admin@wolertapp.com',
  telefono: '3000000000',
  usuario: 'admin',
};

export default function Configuracion() {
  const [editando, setEditando] = useState(false);
  const [prefNotificaciones, setPrefNotificaciones] = useState(true);
  const [prefSonido, setPrefSonido] = useState(true);
  const [prefCompacto, setPrefCompacto] = useState(false);
  const [seguridadAbierta, setSeguridadAbierta] = useState(false);

  const [form, setForm] = useState({ ...configPorDefecto });
  const [guardado, setGuardado] = useState({ ...configPorDefecto });

  useEffect(() => {
    const guardadoRaw = localStorage.getItem(CLAVE_CONFIG);
    const config = guardadoRaw ? JSON.parse(guardadoRaw) : configPorDefecto;
    setForm({ ...config });
    setGuardado({ ...config });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem(CLAVE_CONFIG, JSON.stringify(form));
    setGuardado({ ...form });
    setEditando(false);
    alert('Cambios guardados correctamente.');
  };

  const handleCancelar = () => {
    setForm({ ...guardado });
    setEditando(false);
  };

  return (
    <div className="container-fluid">
      <div className="config-banner-dash mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="config-avatar-grande-dash"><i className="bi bi-person-fill" /></div>
          <div>
            <div className="config-banner-nombre-dash" id="perfil-nombre">{guardado.nombre}</div>
            <div className="config-banner-estado-dash">
              <span className="dot-online-dash" /> Sistema activo · Administrador
            </div>
          </div>
        </div>
        <i className="bi bi-shield-check config-banner-icono-dash" />
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card-panel-dash">
            <div className="info-card-header-dash">
              <h3 className="section-title-dash">Información personal y operativa</h3>
              <button type="button" className="btn-editar-info-dash" id="btn-toggle-edicion" onClick={() => setEditando(true)}>
                <i className="bi bi-pencil" /> Editar
              </button>
            </div>
            <form id="form-configuracion" className={editando ? 'editando' : ''} onSubmit={handleSubmit}>
              <div className="info-fila-dash">
                <span className="info-fila-label-dash">Nombre completo</span>
                {editando ? (
                  <input type="text" id="config-nombre" className="form-control input-dash input-edicion-dash" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                ) : (
                  <span className="info-fila-valor-dash" data-view="nombre">{form.nombre}</span>
                )}
              </div>
              <div className="info-fila-dash">
                <span className="info-fila-label-dash">Correo electrónico</span>
                {editando ? (
                  <input type="email" id="config-correo" className="form-control input-dash input-edicion-dash" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
                ) : (
                  <span className="info-fila-valor-dash" data-view="correo">{form.correo}</span>
                )}
              </div>
              <div className="info-fila-dash">
                <span className="info-fila-label-dash">Teléfono</span>
                {editando ? (
                  <input type="tel" id="config-telefono" className="form-control input-dash input-edicion-dash" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                ) : (
                  <span className="info-fila-valor-dash" data-view="telefono">{form.telefono}</span>
                )}
              </div>
              <div className="info-fila-dash">
                <span className="info-fila-label-dash">Usuario</span>
                {editando ? (
                  <input type="text" id="config-usuario" className="form-control input-dash input-edicion-dash" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} />
                ) : (
                  <span className="info-fila-valor-dash" data-view="usuario">{form.usuario}</span>
                )}
              </div>
              <div className="info-fila-dash" style={{ borderBottom: 'none' }}>
                <span className="info-fila-label-dash">Estado</span>
                <span className="badge-dash badge-green-dash">ACTIVO</span>
              </div>
              <div className="config-footer-dash d-flex justify-content-end gap-2" id="acciones-edicion-dash" style={{ display: editando ? 'flex' : 'none' }}>
                <button type="button" className="btn btn-cancelar-dash" id="btn-cancelar-config" onClick={handleCancelar}>Cancelar</button>
                <button type="submit" className="btn btn-cv-azul px-4" style={{ borderRadius: '12px', fontWeight: '700' }}>Guardar cambios</button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card-panel-dash mb-3">
            <div className="info-card-header-dash">
              <h3 className="section-title-dash">Configuración</h3>
            </div>
            <div className="toggle-fila-dash">
              <div>
                <div className="toggle-titulo-dash">Notificaciones</div>
                <div className="toggle-sub-dash">Recibir avisos de alertas del sistema</div>
              </div>
              <label className="switch-dash">
                <input type="checkbox" id="pref-notificaciones" checked={prefNotificaciones} onChange={(e) => setPrefNotificaciones(e.target.checked)} />
                <span className="switch-slider-dash" />
              </label>
            </div>
            <div className="toggle-fila-dash">
              <div>
                <div className="toggle-titulo-dash">Sonido</div>
                <div className="toggle-sub-dash">Reproducir sonido al recibir una alerta</div>
              </div>
              <label className="switch-dash">
                <input type="checkbox" id="pref-sonido" checked={prefSonido} onChange={(e) => setPrefSonido(e.target.checked)} />
                <span className="switch-slider-dash" />
              </label>
            </div>
            <div className="toggle-fila-dash" style={{ borderBottom: 'none' }}>
              <div>
                <div className="toggle-titulo-dash">Modo compacto</div>
                <div className="toggle-sub-dash">Reduce el espaciado de las tablas</div>
              </div>
              <label className="switch-dash">
                <input type="checkbox" id="pref-compacto" checked={prefCompacto} onChange={(e) => setPrefCompacto(e.target.checked)} />
                <span className="switch-slider-dash" />
              </label>
            </div>
          </div>

          <div className="card-panel-dash">
            <div className="info-card-header-dash">
              <h3 className="section-title-dash">Cuenta</h3>
            </div>
            <div className="cuenta-fila-dash" id="fila-seguridad" onClick={() => setSeguridadAbierta(!seguridadAbierta)}>
              <div className="cuenta-fila-icono-dash cuenta-icono-azul-dash"><i className="bi bi-shield-lock-fill" /></div>
              <div className="flex-grow-1"><div className="toggle-titulo-dash">Seguridad</div></div>
              <i className="bi bi-chevron-right" />
            </div>
            <div className="cuenta-fila-dash cuenta-fila-danger-dash" id="fila-cerrar-sesion" style={{ borderBottom: 'none' }}>
              <div className="cuenta-fila-icono-dash cuenta-icono-rojo-dash"><i className="bi bi-box-arrow-right" /></div>
              <div className="flex-grow-1"><div className="toggle-titulo-dash" style={{ color: 'var(--color-danger)' }}>Cerrar sesión</div></div>
              <i className="bi bi-chevron-right" />
            </div>
          </div>

          <div className={`card-panel-dash mt-3 ${seguridadAbierta ? '' : 'd-none'}`} id="panel-seguridad">
            <div className="info-card-header-dash">
              <h3 className="section-title-dash">Cambiar contraseña</h3>
            </div>
            <div className="p-3">
              <label className="config-label-dash">Contraseña actual</label>
              <input type="password" id="config-pass-actual" className="form-control input-dash mb-3" placeholder="••••••••" />
              <label className="config-label-dash">Nueva contraseña</label>
              <input type="password" id="config-pass-nueva" className="form-control input-dash mb-3" placeholder="••••••••" />
              <button type="button" className="btn btn-cv-azul w-100" id="btn-cambiar-pass" style={{ borderRadius: '12px', fontWeight: '700' }}>Actualizar contraseña</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}