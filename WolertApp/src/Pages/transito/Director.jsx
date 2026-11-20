import { Routes, Route, Navigate } from 'react-router-dom';
import '../../css/transito/director-transito/panel-principal.css';
import '../../css/transito/director-transito/panel-casos.css';
import '../../css/transito/director-transito/panel-agentes.css';
import '../../css/transito/director-transito/panel-semaforos.css';
import '../../css/transito/director-transito/panel-reportes.css';
import '../../css/transito/director-transito/panel-catalogo.css';
import '../../css/transito/director-transito/panel-configuracion.css';
import Panel from './director/PanelPrincipal';
import Casos from './director/Casos';
import Agentes from './director/Agentes';
import Semaforos from './director/Semaforos';
import Reportes from './director/Reportes';
import Catalogo from './director/Catalogo';
import Configuracion from './director/Configuracion';

export default function Director() {
  return (
    <Routes>
      <Route index element={<Navigate to="panel" replace />} />
      <Route path="panel" element={<Panel />} />
      <Route path="casos" element={<Casos />} />
      <Route path="agentes" element={<Agentes />} />
      <Route path="semaforos" element={<Semaforos />} />
      <Route path="reportes" element={<Reportes />} />
      <Route path="catalogo" element={<Catalogo />} />
      <Route path="configuracion" element={<Configuracion />} />
    </Routes>
  );
}
