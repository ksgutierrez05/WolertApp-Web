import Sidebar from './Sidebar';
import TopBar from './TopBar';

function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <Sidebar />
      </aside>
      <div className="admin-layout__content">
        <header className="admin-layout__header">
          <TopBar />
        </header>
        <main className="admin-layout__main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;