
import { Link, useNavigate } from "react-router-dom";

const BASE = "/transito/central";

const MENU = [
  {
    seccion: "General",
    items: [
      {
        id: "panel",
        label: "Principal",
        href: `${BASE}/panel`,
        icon: "bi-house",
      },
    ],
  },
  {
    seccion: "Operación",
    items: [
      {
        id: "asignar",
        label: "Casos sin asignar",
        href: `${BASE}/asignar`,
        icon: "bi-inboxes",
      },
      {
        id: "atencion",
        label: "Atención de tránsito",
        href: `${BASE}/atencion`,
        icon: "bi-car-front-fill",
      },
      {
        id: "agentes",
        label: "Agentes",
        href: `${BASE}/agentes`,
        icon: "bi-people",
      },
      {
        id: "historial",
        label: "Historial",
        href: `${BASE}/historial`,
        icon: "bi-clock-history",
      },
    ],
  },
  {
    seccion: "Gestión",
    items: [
      {
        id: "reportes",
        label: "Informes",
        href: `${BASE}/reportes`,
        icon: "bi-file-earmark-text",
      },
      {
        id: "configuracion",
        label: "Configuración",
        href: `${BASE}/configuracion`,
        icon: "bi-gear",
      },
    ],
  },
];

export default function Sidebar({ activo }) {
  const navigate = useNavigate();

  const cerrarSesion = (e) => {
    e.preventDefault();

    ["token", "usuario", "rol", "idUsuario", "username"].forEach(
      (clave) => {
        localStorage.removeItem(clave);
        sessionStorage.removeItem(clave);
      }
    );

    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar-dash" id="sidebarDash">
      <div className="d-flex align-items-center brand-dash">
        <span className="brand-icon-dash">
          <img
            src="/img/secretaria transito.png"
            alt="Logo Tránsito"
            className="brand-logo-img-dash"
          />
        </span>

        <span className="brand-name-dash">
          <span className="d-block">Central de</span>
          <span className="d-block">Despacho</span>
        </span>
      </div>

      {MENU.map((sec) => (
        <div key={sec.seccion}>
          <p className="glabel-dash">{sec.seccion}</p>

          <nav className="nav flex-column menu-dash">
            {sec.items.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={item.id === activo ? "active" : ""}
              >
                <span className="ic-dash">
                  <i className={`bi ${item.icon}`} />
                </span>
                <span className="lbl-dash">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      ))}

      <div className="flex-grow-1" />

      <a
        href="/login"
        className="logout-dash"
        onClick={cerrarSesion}
      >
        <span className="ic-dash">
          <i className="bi bi-box-arrow-left" />
        </span>
        <span className="lbl-dash">Cerrar sesión</span>
      </a>
    </aside>
  );
}
