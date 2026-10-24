import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './Components/Central-policia/Layout';
import CentroOperaciones from './Pages/Central-Policia/Centro-Operaciones';
import Alertas from './Pages/Central-Policia/Alertas';
import Asignaciones from './Pages/Central-Policia/Asignaciones';
import AtencionAlertas from './Pages/Central-Policia/Atencion-Alertas';
import Unidades from './Pages/Central-Policia/Unidades';
import Historial from './Pages/Central-Policia/Historial';
import Reportes from './Pages/Central-Policia/Reportes';
import Notificaciones from './Pages/Central-Policia/Notificaciones';
import Configuracion from './Pages/Central-Policia/Configuracion';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/Central-Policia" replace />}
      />

      <Route path="/Central-Policia" element={<Layout />}>
        <Route index element={<CentroOperaciones />} />
        <Route path="Alertas" element={<Alertas />} />
        <Route path="Asignaciones" element={<Asignaciones />} />
        <Route path="AtencionAlertas" element={<AtencionAlertas />} />
        <Route path="Unidades" element={<Unidades />} />
        <Route path="Historial" element={<Historial />} />
        <Route path="Reportes" element={<Reportes />} />
        <Route path="Notificaciones" element={<Notificaciones />} />
        <Route path="Configuracion" element={<Configuracion />} />
      </Route>
    </Routes>
  );
}

export default App;