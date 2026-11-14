import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/admin/dashboard-admin.css';
import { listaUsuarios, listaRoles } from '../../../Service/UsuariosAPI.js';

// Roles que define la jerarquía del sistema (se usa si la API de roles no responde)
const TOTAL_ROLES_POR_DEFECTO = 8;

export default function Dashboard() {
  const [usuarios, setUsuarios] = useState(null); // null = todavía cargando
  const [roles, setRoles] = useState(null);

  useEffect(() => {
    listaUsuarios()
      .then(setUsuarios)
      .catch((err) => {
        console.error('Error cargando usuarios:', err);
        setUsuarios([]);
      });

    listaRoles()
      .then(setRoles)
      .catch((err) => {
        console.error('Error cargando roles:', err);
        setRoles([]);
      });
  }, []);

  const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  const h = new Date().getHours();
  const saludo = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';

  // Números reales calculados a partir de la lista de usuarios
  const cargando = usuarios === null;
  const total = usuarios?.length ?? 0;
  const activos = usuarios?.filter((u) => (u.estado || '').toLowerCase() === 'activo').length ?? 0;
  const inactivos = total - activos;
  const totalRoles = roles && roles.length > 0 ? roles.length : TOTAL_ROLES_POR_DEFECTO;

  const kpis = [
    { color: 'kpi-blue-dash', icon: 'bi-people', num: cargando ? '...' : String(total), label: 'Usuarios registrados', sub: 'Total en el sistema' },
    { color: 'kpi-green-dash', icon: 'bi-person-check', num: cargando ? '...' : String(activos), label: 'Usuarios activos', sub: 'Con acceso al sistema' },
    { color: 'kpi-amber-dash', icon: 'bi-person-exclamation', num: cargando ? '...' : String(inactivos), label: 'Inactivos / Suspendidos', sub: 'Requieren revisión' },
    { color: 'kpi-purple-dash', icon: 'bi-shield-lock', num: String(totalRoles), label: 'Roles configurados', sub: 'Según la jerarquía del sistema' },
  ];

  // Datos de ejemplo: pasarán a ser reales cuando exista la tabla de reportes de alerta
  const alertasRecientes = [
    { icon: 'bi-exclamation-triangle', color: 'var(--color-danger)', dotColor: null, title: 'HOMICIDIO en CASIMIRO RAUL MAESTRE', sub: 'Reportado por KATHERINE GUTIERREZ' },
    { icon: 'bi-shield-exclamation', color: 'var(--color-blue)', dotColor: 'var(--color-blue)', title: 'ROBO en CENTRO', sub: 'Reportado por SOFIA BARLIZA' },
    { icon: 'bi-shield-exclamation', color: 'var(--color-green)', dotColor: 'var(--color-green)', title: 'ROBO en CENTRO', sub: 'Reportado por SOFIA BARLIZA' },
  ];

  const actividad = [
    { bg: '#fcf0da', icon: 'bi-bell-fill', color: 'var(--color-amber)', title: 'HOMICIDIO — CASIMIRO RAUL MAESTRE', sub: '2026-06-13' },
    { bg: '#e8f0fb', icon: 'bi-bell-fill', color: 'var(--color-blue)', title: 'ROBO — CENTRO', sub: '2026-06-10' },
    { bg: '#e3f8ec', icon: 'bi-bell-fill', color: 'var(--color-green)', title: 'ROBO — CENTRO', sub: '2026-06-10' },
  ];

  return (
    <div className="container-fluid">
      <div
        className="hero-dash hero-admin-adm mb-3"
        style={{ '--hero-img': 'url("/img/Hero-admin.jpg")' }}
      >
        <div className="eyebrow-dash">
          <i className="bi bi-shield-check" /> Panel de control · {fecha}
        </div>
        <h1 className="hero-title-dash">{saludo}, administrador</h1>
        <p className="hero-text-dash">Panel de control y monitoreo del sistema</p>
        <i className="bi bi-shield-check hero-icon-dash" style={{ fontSize: '90px' }} />
      </div>

      <div className="row g-3 mb-3">
        {kpis.map((k) => (
          <div key={k.label} className="col-md-3">
            <div className={`kpi-dash ${k.color}`}>
              <i className={`bi ${k.icon} kpi-icon-dash`} />
              <div className="kpi-num-dash">{k.num}</div>
              <div className="kpi-label-dash">{k.label}</div>
              <div className="kpi-label-dash" style={{ marginTop: '2px' }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card-panel-dash p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                <div className="side-cta-icon-dash" style={{ background: '#fce8e9', width: '32px', height: '32px' }}>
                  <i className="bi bi-bell-fill" style={{ color: 'var(--color-danger)', fontSize: '14px' }} />
                </div>
                <h3 className="section-title-dash">Alertas recientes</h3>
              </div>
              <Link to="/admin/alertas" className="see-all-dash">Ver todas <i className="bi bi-chevron-right" /></Link>
            </div>
            {alertasRecientes.map((a, i) => (
              <div key={i} className="border-top pt-2 pb-2 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span className="dot-danger-dash" style={a.dotColor ? { background: a.dotColor } : undefined} />
                  <div className="icon-btn-dash d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                    <i className={`bi ${a.icon}`} style={{ color: a.color }} />
                  </div>
                  <div>
                    <div className="info-title-dash">{a.title}</div>
                    <div className="info-sub-dash">{a.sub}</div>
                  </div>
                </div>
                <i className="bi bi-chevron-right" style={{ color: 'var(--subtle)' }} />
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-6">
          <div className="card-panel-dash p-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="side-cta-icon-dash" style={{ background: '#e8f0fb', width: '32px', height: '32px' }}>
                <i className="bi bi-clock-history" style={{ color: 'var(--color-blue)', fontSize: '14px' }} />
              </div>
              <h3 className="section-title-dash">Actividad reciente</h3>
            </div>
            {actividad.map((a, i) => (
              <div key={i} className="border-top pt-2 pb-2 d-flex align-items-center gap-2">
                <div className="icon-btn-dash d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', background: a.bg }}>
                  <i className={`bi ${a.icon}`} style={{ color: a.color }} />
                </div>
                <div>
                  <div className="info-title-dash">{a.title}</div>
                  <div className="info-sub-dash">{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}