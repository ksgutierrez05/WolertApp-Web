import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

// Iniciales que se muestran en el avatar. Cámbialas por las del usuario logueado.
const INICIALES = 'PT';

function Layout() {
  const [busqueda, setBusqueda] = useState('');

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
            <Topbar
              placeholder="Buscar alerta, atención o unidad…"
              valor={busqueda}
              onCambio={setBusqueda}
              iniciales={INICIALES}
            />

            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}

export default Layout;