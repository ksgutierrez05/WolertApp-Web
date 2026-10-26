import { useState } from 'react';
import CiudadanoSidebar from './CiudadanoSidebar';
import '../../css/ciudadano/CiudadanoLayout.css';
import '../../css/admin/AdminLayout.css';

export default function CiudadanoLayout({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);
  const peek = collapsed && hovered;

  return (
    <div className="admin-layout">
      <div
        className={`admin-layout__sidebar-slot ${collapsed ? 'collapsed' : ''} ${peek ? 'peek' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <aside className={`admin-layout__sidebar ${collapsed ? 'collapsed' : ''} ${peek ? 'peek' : ''}`}>
          <CiudadanoSidebar collapsed={collapsed && !hovered} />
        </aside>
      </div>

      <div className="admin-layout__content">
        <main className="admin-layout__main">{children}</main>
      </div>
    </div>
  );
}