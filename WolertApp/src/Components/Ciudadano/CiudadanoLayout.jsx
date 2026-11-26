import { useState } from 'react';
import CiudadanoSidebar from './CiudadanoSidebar';
import CiudadanoBottomNav from './CiudadanoBottomNav';
import '../../css/admin/AdminLayout.css';
import '../../css/ciudadano/CiudadanoLayout.css';
import '../../css/ciudadano/identidad-ciudadano.css';

export default function CiudadanoLayout({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);
  const peek = collapsed && hovered;
  const sidebarCollapsed = collapsed && !hovered;

  return (
    <div className="admin-layout ciudadano-shell rol-ciudadano">
      <div
        className={`admin-layout__sidebar-slot ${collapsed ? 'collapsed' : ''} ${peek ? 'peek' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <aside
          id="ciudadano-sidebar"
          className={`admin-layout__sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${peek ? 'peek' : ''}`}
        >
          <CiudadanoSidebar collapsed={sidebarCollapsed} />
        </aside>
      </div>

      <div className="admin-layout__content">
        <main className={`admin-layout__main ${collapsed ? 'main-collapsed' : ''}`}>
          {children}
        </main>
      </div>
      <CiudadanoBottomNav />
    </div>
  );
}
