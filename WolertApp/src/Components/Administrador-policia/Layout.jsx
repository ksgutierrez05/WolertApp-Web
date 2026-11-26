import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { FeedbackProvider } from '../Feedback/FeedbackProvider';
import '../../css/Policia/ver-detalles.css';
import SidebarPolicia from '../Administrador-policia/Sidebar';
import '../../css/admin/modales-claro.css';

function Layout() {
  useEffect(() => {
    document.body.classList.add('rol-policia');
    return () => document.body.classList.remove('rol-policia');
  }, []);

  return (
    <FeedbackProvider>
      <>
        <SidebarPolicia />
        <div id="wrapperDash">
          <main className="main-dash">
            <div className="container-fluid">
              <Outlet />
            </div>
          </main>
        </div>
      </>
    </FeedbackProvider>
  );
}

export default Layout;
