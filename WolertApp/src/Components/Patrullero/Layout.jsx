
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { FeedbackProvider } from '../Feedback/FeedbackProvider';
import '../../css/Policia/Patrullero/css/patrullero-refinements.css';

function Layout() {
  const [busqueda, setBusqueda] = useState('');

  const usuario = localStorage.getItem('usuario') || 'Patrullero';

  const iniciales = usuario
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(palabra => palabra.charAt(0).toUpperCase())
    .join('');

  useEffect(() => {
    document.body.classList.add('rol-policia');
    document.body.classList.add('rol-patrullero-activo');

    return () => {
      document.body.classList.remove('rol-policia');
      document.body.classList.remove('rol-patrullero-activo');
    };
  }, []);


  return (
    <FeedbackProvider>
      <div className="rol-patrullero">
      <Sidebar />

      <div id="wrapperDash">
        <main className="main-dash">
          <div className="container-fluid">
            <Topbar
              placeholder="Buscar alerta, atención o unidad…"
              valor={busqueda}
              onCambio={setBusqueda}
              iniciales={iniciales}
            />

            <Outlet />
          </div>
        </main>
      </div>
      </div>
    </FeedbackProvider>
  );
}

export default Layout;
