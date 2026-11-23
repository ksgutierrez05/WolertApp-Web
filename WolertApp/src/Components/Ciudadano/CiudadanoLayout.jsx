import { useEffect, useState } from 'react';
import CiudadanoSidebar from './CiudadanoSidebar';
import '../../css/admin/AdminLayout.css';
import '../../css/ciudadano/CiudadanoLayout.css';
import '../../css/ciudadano/identidad-ciudadano.css';

export default function CiudadanoLayout({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const peek = collapsed && hovered && !mobileOpen;
  const sidebarCollapsed = collapsed && !hovered && !mobileOpen;

  useEffect(() => {
    const cerrarConEscape = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    const cerrarAlCambiarAEscritorio = () => {
      if (window.matchMedia('(min-width: 769px)').matches) setMobileOpen(false);
    };

    window.addEventListener('keydown', cerrarConEscape);
    window.addEventListener('resize', cerrarAlCambiarAEscritorio);
    return () => {
      window.removeEventListener('keydown', cerrarConEscape);
      window.removeEventListener('resize', cerrarAlCambiarAEscritorio);
    };
  }, []);

  return (
    <div className="admin-layout ciudadano-shell rol-ciudadano">
      <button
        type="button"
        className="ciudadano-mobile-menu"
        aria-label={mobileOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
        aria-expanded={mobileOpen}
        aria-controls="ciudadano-sidebar"
        onClick={() => setMobileOpen((abierto) => !abierto)}
      >
        <i className={`bi ${mobileOpen ? 'bi-x-lg' : 'bi-list'}`} />
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="ciudadano-mobile-backdrop"
          aria-label="Cerrar menú de navegación"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`admin-layout__sidebar-slot ${collapsed ? 'collapsed' : ''} ${peek ? 'peek' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <aside
          id="ciudadano-sidebar"
          className={`admin-layout__sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${peek ? 'peek' : ''}`}
        >
          <CiudadanoSidebar
            collapsed={sidebarCollapsed}
            onNavigate={() => setMobileOpen(false)}
          />
        </aside>
      </div>

      <div className="admin-layout__content">
        <main className={`admin-layout__main ${collapsed ? 'main-collapsed' : ''}`}>{children}</main>
      </div>
    </div>
  );
}
