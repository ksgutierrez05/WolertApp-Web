import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import PanelPrincipal from '../src/Pages/director-transito/PanelPrincipal';
// import Casos from '../src/pages/director-transito/Casos';
// import Agentes from '../src/Pages/director-transito/Agentes';
// import Semaforos from '../src/Pages/director-transito/Semaforos';
// import Reportes from '../src/Pages/director-transito/Reportes';
// import Catalogo from '../src/Pages/director-transito/Catalogo';
// import Configuracion from '../src/Pages/director-transito/Configuracion';

// import CentralPanel from './Pages/central-transito/PanelPrincipal';
// import CentralCasos from './Pages/central-transito/Casos';
// import CentralAgentes from './Pages/central-transito/Agentes';
// import CentralHistorial from './Pages/central-transito/Historial';
// import CentralInforme from './Pages/central-transito/Reportes';
// import CentralConfiguracion from './Pages/central-transito/Configuracion';

import AgentePanel from './Pages/agentes-transito/PanelPrincipal';
import AgenteGrupo from './Pages/agentes-transito/Grupo';
import AgenteHistorial from './Pages/agentes-transito/Historial';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Navigate to="/transito/director/panel" replace />} />
        <Route path="/transito/director/panel" element={<PanelPrincipal />} />
        <Route path="/transito/director/casos" element={<Casos />} />
        <Route path="/transito/director/agentes" element={<Agentes />} />
        <Route path="/transito/director/semaforos" element={<Semaforos />} />
        <Route path="/transito/director/reportes" element={<Reportes />} />
        <Route path="/transito/director/catalogo" element={<Catalogo />} />
        <Route path="/transito/director/configuracion" element={<Configuracion />} /> */}
        
        {/* <Route path="/" element={<Navigate to="/transito/central/panel" replace/>} />
        <Route path="/transito/central/panel" element={<CentralPanel />} />
        <Route path="/transito/central/asignar" element={<CentralCasos />} />
        <Route path="/transito/central/agentes" element={<CentralAgentes />} />
        <Route path="/transito/central/historial" element={<CentralHistorial />} />
        <Route path="/transito/central/reportes" element={<CentralInforme />} />
        <Route path="/transito/central/configuracion" element={<CentralConfiguracion />} /> */}
        
        <Route path="/" element={<Navigate to="/transito/agente/panel" replace/>} />
        <Route path="/transito/agente/panel" element={<AgentePanel />} />
        <Route path="/transito/agente/grupo" element={<AgenteGrupo />} />
        <Route path="/transito/agente/historial" element={<AgenteHistorial />} />
      
      </Routes>
    </BrowserRouter>
  );
}