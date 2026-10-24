import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './Components/Central-policia/Layout';
import CentroOperaciones from './Pages/Central-Policia/Centro-Operaciones';
import Alertas from './Pages/Central-Policia/Alertas';
import Asignaciones from './Pages/Central-Policia/Asignaciones';
import AtencionAlertas from './Pages/Central-policia/Atencion-Alertas';



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


      </Route>
    </Routes>
  );
}

export default App;