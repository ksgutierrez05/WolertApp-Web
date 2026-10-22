import { NavLink, useNavigate } from 'react-router-dom';
import logoPolicia from '../../../public/img/logopolicia.png';


const ICONOS_POLICIA = {
  centrooperaciones: 'bi-house',
  alertas: 'bi-exclamation-triangle',
  alarmas: 'bi-megaphone',
  tiposalertas: 'bi-list-check',
  policias: 'bi-person-badge',
  unidades: 'bi-car-front',
  historial: 'bi-clock-history',
  estadisticas: 'bi-bar-chart-line',
  reportes: 'bi-file-earmark-bar-graph',
  notificaciones: 'bi-bell',
  configuracion: 'bi-sliders',
  logout: 'bi-box-arrow-right',
};

const RAIZ = '/Administrador-Policia';

const MENU_POLICIA = [
  {
    seccion: 'General',
    items: [
      { id: 'centrooperaciones', label: 'Centro de Operaciones', to: RAIZ, end: true, icon: ICONOS_POLICIA.centrooperaciones },
    ],
  },
  {
    seccion: 'Operación',
    items: [
      { id: 'alertas', label: 'Alertas', to: `${RAIZ}/Alertas`, icon: ICONOS_POLICIA.alertas },
      { id: 'alarmas', label: 'Alarmas', to: `${RAIZ}/Alarmas`, icon: ICONOS_POLICIA.alarmas },
      { id: 'tiposalertas', label: 'Tipos de Alertas', to: `${RAIZ}/Tipos-Alertas`, icon: ICONOS_POLICIA.tiposalertas },
      { id: 'unidades', label: 'Unidades', to: `${RAIZ}/Unidades`, icon: ICONOS_POLICIA.unidades },
      { id: 'policias', label: 'Policías', to: `${RAIZ}/Policias`, icon: ICONOS_POLICIA.policias },
    ],
  },
  {
    seccion: 'Gestión',
    items: [
      { id: 'historial', label: 'Historial', to: `${RAIZ}/Historial`, icon: ICONOS_POLICIA.historial },
      { id: 'estadisticas', label: 'Estadísticas', to: `${RAIZ}/Estadisticas`, icon: ICONOS_POLICIA.estadisticas },
      { id: 'reportes', label: 'Reportes', to: `${RAIZ}/Reportes`, icon: ICONOS_POLICIA.reportes },
      { id: 'notificaciones', label: 'Notificaciones', to: `${RAIZ}/Notificaciones`, icon: ICONOS_POLICIA.notificaciones },
      { id: 'configuracion', label: 'Configuración', to: `${RAIZ}/Configuracion`, icon: ICONOS_POLICIA.configuracion },
    ],
  },
];

function SidebarPolicia() {
  const navigate = useNavigate();

  function cerrarSesion(evento) {
    evento.preventDefault();
    if (!window.confirm('¿Seguro que deseas cerrar sesión?')) return;
    navigate('/');
  }

  return (
    <aside className="sidebar-dash" id="sidebarDash">
      <div className="d-flex align-items-center brand-dash">
        <span className="brand-icon-dash brand-icon-dash--logo">
          <img src={logoPolicia} alt="Policía Nacional" />
        </span>
        <span className="brand-text-dash">
          <span className="brand-name-dash">WolertApp</span>
          <span className="brand-role-dash">Administrador Policía</span>
        </span>
      </div>

      {MENU_POLICIA.map((sec) => (
        <div key={sec.seccion}>
          <p className="glabel-dash">{sec.seccion}</p>
          <nav className="nav flex-column menu-dash">
            {sec.items.map((item) => (
              <NavLink key={item.id} to={item.to} end={item.end}>
                <span className="ic-dash"><i className={`bi ${item.icon}`}></i></span>
                <span className="lbl-dash">{item.label}</span>
                {item.badge && <span className="nav-badge-dash">{item.badge}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      ))}

      <div className="flex-grow-1"></div>

      <a href="#" id="logoutDash" className="logout-dash" onClick={cerrarSesion}>
        <span className="ic-dash"><i className={`bi ${ICONOS_POLICIA.logout}`}></i></span>
        <span className="lbl-dash">Cerrar sesión</span>
      </a>
    </aside>
  );
}

export default SidebarPolicia;