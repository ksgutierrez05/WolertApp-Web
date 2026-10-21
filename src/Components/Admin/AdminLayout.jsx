import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './Topbar';
import './AdminLayout.css';

const MOBILE = '(max-width: 768px)';

function AdminLayout({ children }) {
  const { pathname } = useLocation();

  // En escritorio inicia abierto (false), en móvil inicia colapsado (true)
  const [collapsed, setCollapsed] = useState(true);
  // Cursor encima del sidebar (solo cuando está colapsado en escritorio)
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE);
    const onChange = (e) => {
      setCollapsed(e.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Al navegar de ruta en móvil, cerrar el sidebar
  useEffect(() => {
    if (window.matchMedia(MOBILE).matches) {
      setCollapsed(true);
    }
  }, [pathname]);

  // Peek solo aplica en escritorio cuando está colapsado y con hover
  const peek = collapsed && hovered;

  return (
    <div className="admin-layout">
      {/* Backdrop para cerrar el menú en móvil al hacer clic fuera */}
      {!collapsed && (
        <div
          className="admin-layout__backdrop"
          onClick={() => setCollapsed(true)}
        />
      )}

      <div
        className={`admin-layout__sidebar-slot ${collapsed ? 'collapsed' : ''} ${peek ? 'peek' : ''}`}
        onMouseEnter={() => {
          if (!window.matchMedia(MOBILE).matches) setHovered(true);
        }}
        onMouseLeave={() => setHovered(false)}
      >
        <aside className={`admin-layout__sidebar ${collapsed ? 'collapsed' : ''} ${peek ? 'peek' : ''}`}>
          <Sidebar collapsed={collapsed && !hovered} />
        </aside>
      </div>

      <div className="admin-layout__content">
        <header className="admin-layout__header">
          <TopBar onToggleSidebar={() => setCollapsed((c) => !c)} />
        </header>
        <main className="admin-layout__main">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;