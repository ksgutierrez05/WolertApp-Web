import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './Components/Patrullero/Layout';
import CentroOperaciones from './Pages/Patrullero/Centro-Operaciones';
import Alertas from './Pages/Patrullero/Alertas';
import Asignaciones from './Pages/Patrullero/Asignaciones';
import Unidad from './Pages/Patrullero/Unidad';
import Notificaciones from './Pages/Patrullero/Notificaciones';
import Configuracion from './Pages/Patrullero/Configuracion';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/Patrullero" replace />}
      />

      <Route path="/Patrullero" element={<Layout />}>
        <Route index element={<CentroOperaciones />} />
        <Route path="Alertas" element={<Alertas />} />
        <Route path="Asignaciones" element={<Asignaciones />} />
        <Route path="Unidad" element={<Unidad />} />
        <Route path="Notificaciones" element={<Notificaciones />} />
        <Route path="Configuracion" element={<Configuracion />} />

      </Route>
    </Routes>
  );
}

export default App;