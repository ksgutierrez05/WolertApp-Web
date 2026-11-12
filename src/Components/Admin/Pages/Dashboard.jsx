import { useEffect, useState } from 'react';
import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/admin/dashboard-admin.css';
import {Link} from 'react-router-dom';
import {listaUsuarios, obtenerUsuarioPorId} from '../../../Service/UsuariosAPI.js';

export default function Dashboard() {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [buscar, setBuscar] = useState('');
  const [totalUsuarios, setTotalUsuarios] = useState(null);
  const [perfil, setPerfil] = useState({ nombre: '', correo: '' });

  useEffect(() => {
    const tick = () => {
      const ahora = new Date();
      setFecha(ahora.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }));
      setHora(ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
  listaUsuarios()
    .then((datos) => setTotalUsuarios(datos.length))
    .catch(() => setTotalUsuarios(0));
  }, []); 

  useEffect(() => {
    const id = localStorage.getItem('idUsuario');
    if (!id) return;
    obtenerUsuarioPorId(id).then((usuario) => {
      setPerfil({
        nombre: usuario.nombre,
        correo: usuario.correo
      });
    });
  }, []);

  const h = new Date().getHours();
  const saludo = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';

  const kpis = [
    { color: 'kpi-blue-dash', icon: 'bi-people', num: totalUsuarios !== null ? totalUsuarios.toString() : '0', label: 'Usuarios registrados', sub: 'Total en el sistema' },
    { color: 'kpi-red-dash', icon: 'bi-bell', num: '16', label: 'Alertas activas', sub: 'En este momento' },
    { color: 'kpi-amber-dash', icon: 'bi-graph-up', num: '15', label: 'Incidentes', sub: 'Pendientes de atención' },
    { color: 'kpi-green-dash', icon: 'bi-check-circle', num: '33', label: 'Resueltos', sub: 'Total histórico' },
  ];

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