
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  useEffect(() => {
    document.body.classList.add('rol-policia');

    return () => {
      document.body.classList.remove('rol-policia');
    };
  }, []);

  return (
    <>
      <Sidebar />

      <div id="wrapperDash">
        <main className="main-dash">
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}

export default Layout;
