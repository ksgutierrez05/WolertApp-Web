import PoliciaBottomNav from "../Policia/PoliciaBottomNav";

import { NavLink, useNavigate } from "react-router-dom";
import { useFeedback } from "../Feedback/useFeedback";

const RAIZ = "/Patrullero";

const MENU_PATRULLERO = [
  {
    seccion: "General",
    items: [
      {
        id: "centro",
        label: "Centro de operaciones",
        to: RAIZ,
        end: true,
        icon: "bi-house",
      },
    ],
  },
  {
    seccion: "Operación",
    items: [
      {
        id: "alertas",
        label: "Mis alertas",
        to: `${RAIZ}/Alertas`,
        icon: "bi-exclamation-triangle",
      },
      {
        id: "asignaciones",
        label: "Mis asignaciones",
        to: `${RAIZ}/Asignaciones`,
        icon: "bi-clipboard-check",
      },
      {
        id: "unidad",
        label: "Mi unidad",
        to: `${RAIZ}/Unidad`,
        icon: "bi-people",
      },
    ],
  },
  {
    seccion: "Cuenta",
    items: [
      {
        id: "notificaciones",
        label: "Notificaciones",
        to: `${RAIZ}/Notificaciones`,
        icon: "bi-bell",
      },
      {
        id: "configuracion",
        label: "Configuración",
        to: `${RAIZ}/Configuracion`,
        icon: "bi-sliders",
      },
    ],
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const { confirm } = useFeedback();

  // Cerrar sesión directamente, sin confirmación
  function cerrarSesion(evento) {
    evento.preventDefault();
    confirm({
      title: "¿Cerrar sesión?",
      description: "Confirma que deseas salir de tu sesión de Patrullero.",
      confirmLabel: "Cerrar sesión",
      tone: "warning",
      onConfirm: () => {
        try {
          ["token", "usuario", "rol", "idUsuario", "username"].forEach((clave) => {
            localStorage.removeItem(clave);
          });
          sessionStorage.clear();
        } catch (error) {
          console.warn("No se pudo limpiar el almacenamiento", error);
        }
        navigate("/", { replace: true });
      },
    });
  }

  return (
    <>
    <aside className="sidebar-dash" id="sidebarDash">
      {/* LOGO Y NOMBRE */}
      <div className="d-flex align-items-center brand-dash">
        <span className="brand-icon-dash brand-icon-dash--logo">
          <img
            src="/img/logopolicia.png"
            alt="Policía Nacional"
          />
        </span>

        <span className="brand-text-dash">
          <span className="brand-name-dash">
            WolertApp
          </span>

          <span className="brand-role-dash">
            Patrullero
          </span>
        </span>
      </div>

      {/* MENÚ DE NAVEGACIÓN */}
      {MENU_PATRULLERO.map((seccion) => (
        <div key={seccion.seccion}>
          <p className="glabel-dash">
            {seccion.seccion}
          </p>

          <nav className="nav flex-column menu-dash">
            {seccion.items.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.end}
                title={item.label}
              >
                <span className="ic-dash">
                  <i
                    className={`bi ${item.icon}`}
                    aria-hidden="true"
                  />
                </span>

                <span className="lbl-dash">
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      ))}

      <div className="flex-grow-1" />

      {/* CERRAR SESIÓN - DISEÑO ORIGINAL */}
      <a
        href="/"
        id="logoutDash"
        className="logout-dash"
        onClick={cerrarSesion}
      >
        <span className="ic-dash">
          <i
            className="bi bi-box-arrow-right"
            aria-hidden="true"
          />
        </span>

        <span className="lbl-dash">
          Cerrar sesión
        </span>
      </a>
    </aside>

    <PoliciaBottomNav
        rol="patrullero"
        menu={MENU_PATRULLERO}
        cerrarSesion={cerrarSesion}
    />
    </>
  );
}

export default Sidebar;
