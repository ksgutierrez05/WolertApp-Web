
import { Link, useNavigate } from "react-router-dom";

export default function Sidebar({ activo }) {
  const navigate = useNavigate();

  const cerrarSesion = (e) => {
    e.preventDefault();

    // Eliminar datos de autenticación
    ["token", "usuario", "rol"].forEach((clave) => {
      localStorage.removeItem(clave);
      sessionStorage.removeItem(clave);
    });

    // Redirigir al login
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
          <span className="d-block">Secretaria de</span>
          <span className="d-block">Tránsito</span>
        </span>
      </div>

      <p className="glabel-dash">General</p>

      <nav className="nav flex-column menu-dash">
        <Link
          to="/transito/director/panel"
          className={activo === "panel" ? "active" : ""}
        >
          <span className="ic-dash">
            <i className="bi bi-house" />
          </span>
          <span className="lbl-dash">Principal</span>
        </Link>
      </nav>

      <p className="glabel-dash">Operación</p>

      <nav className="nav flex-column menu-dash">
        <Link
          to="/transito/director/agentes"
          className={activo === "agentes" ? "active" : ""}
        >
          <span className="ic-dash">
            <i className="bi bi-briefcase" />
          </span>
          <span className="lbl-dash">Agentes</span>
        </Link>

        <Link
          to="/transito/director/unidades"
          className={activo === "unidades" ? "active" : ""}
        >
          <span className="ic-dash">
            <i className="bi bi-car-front" />
          </span>
          <span className="lbl-dash">Unidades de Tránsito</span>
        </Link>

        <Link
          to="/transito/director/casos"
          className={activo === "casos" ? "active" : ""}
        >
          <span className="ic-dash">
            <i className="bi bi-file-earmark-text" />
          </span>
          <span className="lbl-dash">Casos</span>
        </Link>

        {/*
        <Link
          to="/transito/director/catalogo"
          className={activo === "catalogo" ? "active" : ""}
        >
          <span className="ic-dash">
            <i className="bi bi-book" />
          </span>
          <span className="lbl-dash">Catálogo</span>
        </Link>
        */}

        <Link
          to="/transito/director/semaforos"
          className={activo === "semaforos" ? "active" : ""}
        >
          <span className="ic-dash">
            <i className="bi bi-stoplights" />
          </span>
          <span className="lbl-dash">Semáforos</span>
        </Link>

        <a
          href="#"
          className={activo === "mapa" ? "active" : ""}
        >
          <span className="ic-dash">
            <i className="bi bi-geo-alt" />
          </span>
          <span className="lbl-dash">Mapa</span>
        </a>
      </nav>

      <p className="glabel-dash">Gestión</p>

      <nav className="nav flex-column menu-dash">
        <Link
          to="/transito/director/reportes"
          className={activo === "reportes" ? "active" : ""}
        >
          <span className="ic-dash">
            <i className="bi bi-bar-chart-line" />
          </span>
          <span className="lbl-dash">Reportes</span>
        </Link>

        <Link
          to="/transito/director/configuracion"
          className={activo === "configuracion" ? "active" : ""}
        >
          <span className="ic-dash">
            <i className="bi bi-gear" />
          </span>
          <span className="lbl-dash">Configuración</span>
        </Link>
      </nav>

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
