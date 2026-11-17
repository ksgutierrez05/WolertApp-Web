import { Routes, Route, Navigate } from 'react-router-dom';
import Panel from './agente/PanelPrincipal';
import Grupo from './agente/Grupo';
import Historial from './agente/Historial';
import Configuracion from './agente/Configuracion';

export default function Agente() {
  return (
    <Routes>
      <Route index element={<Navigate to="panel" replace />} />
      <Route path="panel" element={<Panel />} />
      <Route path="grupo" element={<Grupo />} />
      <Route path="historial" element={<Historial />} />
      <Route path="configuracion" element={<Configuracion />} />
    </Routes>
  );
}