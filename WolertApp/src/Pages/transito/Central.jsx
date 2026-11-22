import { Routes, Route, Navigate } from "react-router-dom";

import Panel from "../central-transito/PanelPrincipal";
import Casos from "../central-transito/Casos";
import Agentes from "../central-transito/Agentes";
import Historial from "../central-transito/Historial";
import Reportes from "../central-transito/Reportes";
import Configuracion from "../central-transito/Configuracion";
import AtencionTransito from "../central-transito/AtencionTransito";

export default function Central() {
  return (
    <Routes>
      <Route index element={<Navigate to="panel" replace />} />
      <Route path="panel" element={<Panel />} />
      <Route path="asignar" element={<Casos />} />
      <Route path="atencion" element={<AtencionTransito />} />
      <Route path="agentes" element={<Agentes />} />
      <Route path="historial" element={<Historial />} />
      <Route path="reportes" element={<Reportes />} />
      <Route path="configuracion" element={<Configuracion />} />
    </Routes>
  );
}
