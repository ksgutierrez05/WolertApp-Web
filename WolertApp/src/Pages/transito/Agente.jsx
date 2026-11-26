import "../../css/transito/agente-transito/responsive-agente.css";
import MapaTransito from "../agentes-transito/MapaTransito";

import { Routes, Route, Navigate } from 'react-router-dom';

import Panel from '../agentes-transito/PanelPrincipal';
import Grupo from '../agentes-transito/Grupo';
import Historial from '../agentes-transito/Historial';
import Configuracion from '../agentes-transito/Configuracion';

export default function Agente() {
  return (
    <Routes>
      <Route index element={<Navigate to="panel" replace />} />
      <Route path="panel" element={<Panel />} />
      <Route path="mapa" element={<MapaTransito />} />
      <Route path="grupo" element={<Grupo />} />
      <Route path="historial" element={<Historial />} />
      <Route path="configuracion" element={<Configuracion />} />
    </Routes>
  );
}

