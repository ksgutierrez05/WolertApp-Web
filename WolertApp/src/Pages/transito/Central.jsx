import { Routes, Route, Navigate } from 'react-router-dom';
import '../../css/transito/central-transito/panel-principal.css';
import '../../css/transito/central-transito/panel-casos.css';
import '../../css/transito/central-transito/panel-agentes.css';
import '../../css/transito/central-transito/panel-historial.css';
import '../../css/transito/central-transito/panel-reportes.css';
import '../../css/transito/central-transito/panel-configuracion.css';
import Panel from './central/PanelPrincipal';
import Casos from './central/Casos';
import Agentes from './central/Agentes';
import Historial from './central/Historial';
import Reportes from './central/Reportes';
import Configuracion from './central/Configuracion';

export default function Central() {
  return (
    <Routes>
      <Route index element={<Navigate to="panel" replace />} />
      <Route path="panel" element={<Panel />} />
      <Route path="asignar" element={<Casos />} />
      <Route path="agentes" element={<Agentes />} />
      <Route path="historial" element={<Historial />} />
      <Route path="reportes" element={<Reportes />} />
      <Route path="configuracion" element={<Configuracion />} />
    </Routes>
  );
}