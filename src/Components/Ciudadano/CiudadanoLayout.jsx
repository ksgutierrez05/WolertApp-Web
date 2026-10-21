import CiudadanoSidebar from './CiudadanoSidebar';
import './CiudadanoLayout.css';

export default function CiudadanoLayout({ children }) {
  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar" style={{ width: '260px' }}>
        <CiudadanoSidebar />
      </aside>
      <div className="admin-layout__content">
        <main className="admin-layout__main">{children}</main>
      </div>
    </div>
  );
}